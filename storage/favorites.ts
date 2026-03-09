import AsyncStorage from '@react-native-async-storage/async-storage';

const FAVORITES_KEY = '@faceitstats_favorites';

export interface FavoriteMatch {
    match_id: string;
    game_mode: string;
    map: string;
    score: string;
    result: 'WIN' | 'LOSE';
    date: string;
    kills: number;
    deaths: number;
    kd: number;
}

/**
 * Get all favorited matches
 */
export async function getFavorites(): Promise<FavoriteMatch[]> {
    try {
        const favoritesJson = await AsyncStorage.getItem(FAVORITES_KEY);
        if (!favoritesJson) {
            return [];
        }
        return JSON.parse(favoritesJson);
    } catch (error) {
        console.error('Error getting favorites:', error);
        return [];
    }
}

/**
 * Add a match to favorites
 */
export async function addFavorite(match: FavoriteMatch): Promise<void> {
    try {
        const favorites = await getFavorites();

        // Check if already favorited
        const exists = favorites.some(fav => fav.match_id === match.match_id);
        if (exists) {
            return;
        }

        // Add to beginning of array (most recent first)
        favorites.unshift(match);

        await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    } catch (error) {
        console.error('Error adding favorite:', error);
        throw error;
    }
}

/**
 * Remove a match from favorites
 */
export async function removeFavorite(matchId: string): Promise<void> {
    try {
        const favorites = await getFavorites();
        const filtered = favorites.filter(fav => fav.match_id !== matchId);

        await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(filtered));
    } catch (error) {
        console.error('Error removing favorite:', error);
        throw error;
    }
}

/**
 * Check if a match is favorited
 */
export async function isFavorite(matchId: string): Promise<boolean> {
    try {
        const favorites = await getFavorites();
        return favorites.some(fav => fav.match_id === matchId);
    } catch (error) {
        console.error('Error checking favorite:', error);
        return false;
    }
}
