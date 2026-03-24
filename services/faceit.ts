import axios, { AxiosError } from 'axios';
import { z, ZodError } from 'zod';
import { Platform } from 'react-native';

// On web (production), all requests go through the serverless proxy so the
// FACEIT API key is never exposed in the browser bundle.
// On native, we still call the FACEIT API directly using the env var.
const isWeb = Platform.OS === 'web';

const BASE_URL = isWeb
  ? '/api/faceit'                                 // Netlify proxy
  : 'https://open.faceit.com/data/v4';            // Native direct

const buildHeaders = () => {
  if (isWeb) return { 'Accept': 'application/json' }; // key is server-side
  const key = process.env.EXPO_PUBLIC_FACEIT_API_KEY;
  return {
    'Authorization': `Bearer ${key || ''}`,
    'Accept': 'application/json',
  };
};

const api = axios.create({
  baseURL: BASE_URL,
  headers: buildHeaders(),
  timeout: 10000,
});

export class FaceitError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message);
    this.name = 'FaceitError';
  }
}

const handleApiError = (error: unknown) => {
  if (error instanceof ZodError) {
    console.error('Zod Validation Error:', (error as any).errors);
    throw new FaceitError('Data validation failed. API response format changed.', 500);
  }
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    if (axiosError.response) {
      if (axiosError.response.status === 404) {
        throw new FaceitError('Player or resource not found', 404);
      }
      if (axiosError.response.status === 401 || axiosError.response.status === 403) {
        throw new FaceitError('API authorization failed. Check API key.', axiosError.response.status);
      }
      throw new FaceitError(`API Error: ${axiosError.response.statusText}`, axiosError.response.status);
    } else if (axiosError.request) {
      throw new FaceitError('Network error. Please check your connection.', 0);
    }
  }
  throw new FaceitError('An unexpected error occurred');
};

// Schemas
const PlayerSchema = z.object({
  player_id: z.string(),
  nickname: z.string(),
  avatar: z.string().optional(),
  country: z.string(),
  games: z.record(z.string(), z.object({
    faceit_elo: z.number().optional(),
    skill_level: z.number().optional(),
  })).optional(),
}).passthrough();

const StatsSchema = z.object({
  lifetime: z.object({
    "Average K/D Ratio": z.string(),
    "Average Headshots %": z.string(),
    "Win Rate %": z.string(),
    "Matches": z.string(),
  }).passthrough()
}).passthrough();

const HistoryItemSchema = z.object({
  stats: z.object({
    Result: z.string(),
    'Created At': z.string(),
    'Match Id': z.string(),
    'Game Mode': z.string(),
    'Map': z.string(),
    'Score': z.string(),
    'Kills': z.string(),
    'Deaths': z.string(),
    'K/D Ratio': z.string(),
    'K/R Ratio': z.string(),
  }).passthrough()
}).passthrough();

const HistoryResponseSchema = z.object({
  items: z.array(HistoryItemSchema)
}).passthrough();

export const FaceitService = {
  getPlayer: async (username: string) => {
    try {
      const response = await api.get(`/players`, {
        params: { nickname: username }
      });
      return PlayerSchema.parse(response.data);
    } catch (error) {
      handleApiError(error);
    }
  },

  getPlayerById: async (playerId: string) => {
    try {
      const response = await api.get(`/players/${playerId}`);
      return PlayerSchema.parse(response.data);
    } catch (error) {
      handleApiError(error);
    }
  },

  getStats: async (playerId: string) => {
    try {
      const response = await api.get(`/players/${playerId}/stats/cs2`);
      const parsed = StatsSchema.parse(response.data);
      return parsed.lifetime;
    } catch (error) {
      handleApiError(error);
    }
  },

  /**
   * Fetches match history for a player using pagination.
   * The FACEIT API has a max limit of 100 per request.
   */
  getHistory: async (playerId: string, options?: { limit?: number }) => {
    try {
      const allMatches: any[] = [];
      const pageSize = 100;
      let offset = 0;
      let hasMore = true;
      const maxMatches = options?.limit;

      while (hasMore) {
        const response = await api.get(`/players/${playerId}/games/cs2/stats`, {
          params: { limit: pageSize, offset }
        });

        const parsed = HistoryResponseSchema.parse(response.data);
        const items = parsed.items;

        if (items.length === 0) {
          hasMore = false;
        } else {
          allMatches.push(...items);
          offset += pageSize;
          if (maxMatches && allMatches.length >= maxMatches) hasMore = false;
          if (items.length < pageSize) hasMore = false;
        }
      }

      const finalMatches = maxMatches ? allMatches.slice(0, maxMatches) : allMatches;

      return finalMatches.map((item) => {
        const stats = item.stats;
        const isWin = stats.Result === '1';
        const matchDate = new Date(stats['Created At']);
        const dateStr = matchDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const timeStr = matchDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

        return {
          match_id: stats['Match Id'],
          game_mode: stats['Game Mode'],
          map: stats['Map'],
          score: stats['Score'],
          result: isWin ? 'WIN' : 'LOSE',
          date: `${dateStr}\n${timeStr}`,
          kills: parseInt(stats['Kills']),
          deaths: parseInt(stats['Deaths']),
          kd: parseFloat(stats['K/D Ratio']),
          rating: parseFloat(stats['K/R Ratio'])
        };
      });
    } catch (error) {
      console.error('Error fetching history:', error);
      return [];
    }
  },

  getMatch: async (matchId: string) => {
    try {
      const response = await api.get(`/matches/${matchId}`);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  getMatchStats: async (matchId: string) => {
    try {
      const response = await api.get(`/matches/${matchId}/stats`);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  }
};
