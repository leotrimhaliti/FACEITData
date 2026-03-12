import { ScreenBackground } from '@/components/ScreenBackground';
import { Text } from '@/components/Themed';
import { Colors } from '@/constants/Colors';
import { useResponsive } from '@/hooks/useResponsive';
import { FaceitService } from '@/services/faceit';
import { Ionicons } from '@expo/vector-icons';
import * as htmlToImage from 'html-to-image';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Image, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';

export default function MatchDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [match, setMatch] = useState<any>(null);
  const [matchStats, setMatchStats] = useState<any>(null);
  const [playerCountries, setPlayerCountries] = useState<Map<string, string>>(new Map());
  const [playerLevels, setPlayerLevels] = useState<Map<string, number>>(new Map());
  const [capturing, setCapturing] = useState(false);
  const { isDesktop } = useResponsive();
  const isWeb = Platform.OS === 'web';
  const scoreboardRef = useRef<View>(null);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!id) {
        setError('Invalid match ID');
        setLoading(false);
        return;
      }

      const [matchData, statsData] = await Promise.all([
        FaceitService.getMatch(id as string),
        FaceitService.getMatchStats(id as string)
      ]);

      if (!matchData) {
        setError('Match not found.');
        setLoading(false);
        return;
      }

      setMatch(matchData);
      setMatchStats(statsData);
    } catch (err: any) {
      if (err.message?.includes('404') || err.message?.includes('not found')) {
        setError('Match not found.');
      } else if (err.message?.includes('network') || err.message?.includes('Network')) {
        setError('Network error. Please check your connection.');
      } else {
        setError('Failed to load match details.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch player details (country + level)
  useEffect(() => {
    const fetchPlayerDetails = async () => {
      if (!match || !matchStats) return;

      const roundStats = matchStats.rounds?.[0];
      const t1 = roundStats?.teams?.find((t: any) => t.team_id === match.teams?.faction1?.faction_id)?.players || [];
      const t2 = roundStats?.teams?.find((t: any) => t.team_id === match.teams?.faction2?.faction_id)?.players || [];

      const allPlayers = [...t1, ...t2];
      const countryMap = new Map<string, string>();
      const levelMap = new Map<string, number>();

      const promises = allPlayers.map(async (p: any) => {
        if (p.player_id) {
          try {
            const details = await FaceitService.getPlayerById(p.player_id);
            if (details?.country) {
              countryMap.set(p.player_id, details.country.toLowerCase());
            }
            if (details?.games?.cs2?.skill_level) {
              levelMap.set(p.player_id, details.games.cs2.skill_level);
            }
          } catch {
            // Silent fail
          }
        }
      });

      await Promise.all(promises);
      setPlayerCountries(countryMap);
      setPlayerLevels(levelMap);
    };

    if (match && matchStats) {
      fetchPlayerDetails();
    }
  }, [match, matchStats]);

  // Capture scoreboard as PNG
  const captureScoreboard = async () => {
    setCapturing(true);
    try {
      if (isWeb) {
        // For web, find the element by ID
        const element = document.getElementById('scoreboard-capture');
        if (!element) {
          Alert.alert('Error', 'Could not find scoreboard element');
          setCapturing(false);
          return;
        }

        // Use html-to-image with filter to skip external images (CORS issues)
        // External images from FACEIT CDN and flagcdn don't allow cross-origin requests
        const dataUrl = await htmlToImage.toPng(element as HTMLElement, {
          backgroundColor: Colors.dark.background,
          pixelRatio: 2,
          skipFonts: true,
          filter: (node) => {
            // Filter out img elements with external URLs to avoid CORS tainted canvas
            if (node instanceof HTMLImageElement) {
              const src = node.src || '';
              // Skip known external image sources
              if (
                src.includes('faceit-cdn.net') ||
                src.includes('flagcdn.com') ||
                src.includes('support.faceit.com')
              ) {
                return false;
              }
            }
            return true;
          },
        });

        // Create download link
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `match-${id}-scoreboard.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // For mobile, show coming soon
        Alert.alert(
          'Coming Soon',
          'Scoreboard download is currently only available on web.',
          [{ text: 'OK' }]
        );
      }
    } catch (err) {
      console.error('Failed to capture scoreboard:', err);
      Alert.alert('Error', 'Failed to capture scoreboard. Please try again.');
    } finally {
      setCapturing(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <ScreenBackground style={styles.loadingContainer}>
        <Stack.Screen options={{ title: 'Match Room', headerBackTitle: 'Back', headerStyle: { backgroundColor: Colors.dark.background }, headerTintColor: Colors.dark.text }} />
        <ActivityIndicator size="large" color={Colors.dark.tint} />
        <Text style={styles.loadingText}>Loading match...</Text>
      </ScreenBackground>
    );
  }

  // Error state
  if (error || !match || !matchStats) {
    return (
      <ScreenBackground style={styles.errorContainer}>
        <Stack.Screen options={{ title: 'Match Room', headerBackTitle: 'Back', headerStyle: { backgroundColor: Colors.dark.background }, headerTintColor: Colors.dark.text }} />
        <Ionicons name="alert-circle-outline" size={64} color={Colors.dark.textMuted} />
        <Text style={styles.errorTitle}>Match Not Found</Text>
        <Text style={styles.errorText}>{error || 'Could not load this match.'}</Text>
        <Pressable style={styles.retryButton} onPress={loadData}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </Pressable>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </Pressable>
      </ScreenBackground>
    );
  }

  // Parse data
  const team1 = match.teams?.faction1;
  const team2 = match.teams?.faction2;
  const score = match.results?.score;
  const winner = match.results?.winner;
  const mapName = match.voting?.map?.pick?.[0] || 'Unknown';

  const roundStats = matchStats.rounds?.[0];
  let team1Stats = roundStats?.teams?.find((t: any) => t.team_id === team1.faction_id)?.players || [];
  let team2Stats = roundStats?.teams?.find((t: any) => t.team_id === team2.faction_id)?.players || [];

  // Sort by K/D
  team1Stats = [...team1Stats].sort((a: any, b: any) => parseFloat(b.player_stats['K/D Ratio']) - parseFloat(a.player_stats['K/D Ratio']));
  team2Stats = [...team2Stats].sort((a: any, b: any) => parseFloat(b.player_stats['K/D Ratio']) - parseFloat(a.player_stats['K/D Ratio']));

  // FACEIT skill level icon URLs from their official CDN
  const getLevelIconUrl = (level: number): string => {
    // Using FACEIT's official skill level icons from their support CDN
    const levelIcons: Record<number, string> = {
      1: 'https://support.faceit.com/hc/article_attachments/10525200575516',
      2: 'https://support.faceit.com/hc/article_attachments/10525189649308',
      3: 'https://support.faceit.com/hc/article_attachments/10525200576796',
      4: 'https://support.faceit.com/hc/article_attachments/10525185037724',
      5: 'https://support.faceit.com/hc/article_attachments/10525215800860',
      6: 'https://support.faceit.com/hc/article_attachments/10525245409692',
      7: 'https://support.faceit.com/hc/article_attachments/10525185034012',
      8: 'https://support.faceit.com/hc/article_attachments/10525189648796',
      9: 'https://support.faceit.com/hc/article_attachments/10525200576028',
      10: 'https://support.faceit.com/hc/article_attachments/10525189646876',
    };
    return levelIcons[level] || levelIcons[1];
  };

  const renderPlayerRow = (player: any) => {
    const stats = player.player_stats;
    const kills = parseInt(stats['Kills']);
    const deaths = parseInt(stats['Deaths']);
    const kdDiff = kills - deaths;
    const kdRatio = parseFloat(stats['K/D Ratio']);
    const hsPercentage = stats['Headshots %'] || '0';
    const country = playerCountries.get(player.player_id);
    const level = playerLevels.get(player.player_id);

    return (
      <Pressable 
        key={player.player_id} 
        style={styles.row}
        onPress={() => router.push(`/player/${player.nickname}`)}
      >
        <View style={styles.playerCell}>
          <View style={styles.playerInfo}>
            {level && (
              <Image
                source={{ uri: getLevelIconUrl(level) }}
                style={styles.levelIcon}
              />
            )}
            {country && (
              <Image
                source={{ uri: `https://flagcdn.com/w40/${country}.png` }}
                style={styles.countryFlag}
              />
            )}
            <Text style={styles.playerName} numberOfLines={1}>{player.nickname}</Text>
          </View>
        </View>
        <View style={styles.statCell}>
          <Text style={styles.statText}>{kills}-{deaths}</Text>
        </View>
        <View style={styles.statCell}>
          <Text style={[styles.statText, { color: kdDiff > 0 ? Colors.dark.winGreen : (kdDiff < 0 ? Colors.dark.lossRed : Colors.dark.text) }]}>
            {kdDiff > 0 ? '+' : ''}{kdDiff}
          </Text>
        </View>
        <View style={styles.statCell}>
          <Text style={styles.statText}>{stats['ADR'] || '-'}</Text>
        </View>
        <View style={styles.statCell}>
          <Text style={styles.statText}>{hsPercentage}%</Text>
        </View>
        <View style={styles.statCell}>
          <Text style={[styles.statText, { color: kdRatio >= 1 ? Colors.dark.winGreen : Colors.dark.lossRed, fontWeight: '700' }]}>
            {kdRatio.toFixed(2)}
          </Text>
        </View>
      </Pressable>
    );
  };

  const mainContent = (
    <ScrollView contentContainerStyle={[styles.content, isWeb && isDesktop && styles.contentDesktop]}>
      {/* Screenshot Container - includes header and scoreboards */}
      <View 
        id="scoreboard-capture"
        ref={scoreboardRef}
        collapsable={false}
      >
        {/* Match Header */}
        <View style={styles.header}>
          <View style={styles.teamHeader}>
            <Image source={{ uri: team1.avatar || 'https://assets.faceit-cdn.net/avatars/defaults/user.png' }} style={styles.teamLogo} />
            <Text style={styles.teamName} numberOfLines={2}>{team1.name}</Text>
            <Text style={[styles.bigScore, { color: winner === 'faction1' ? Colors.dark.winGreen : Colors.dark.lossRed }]}>
              {score.faction1}
            </Text>
          </View>

          <View style={styles.matchInfo}>
            <Text style={styles.vsText}>VS</Text>
            <View style={styles.mapBadge}>
              <Text style={styles.mapName}>{mapName}</Text>
            </View>
            <Text style={styles.date}>
              {new Date(match.started_at * 1000).toLocaleDateString()}
            </Text>
            <Text style={styles.statusText}>Finished</Text>
          </View>

          <View style={styles.teamHeader}>
            <Image source={{ uri: team2.avatar || 'https://assets.faceit-cdn.net/avatars/defaults/user.png' }} style={styles.teamLogo} />
            <Text style={styles.teamName} numberOfLines={2}>{team2.name}</Text>
            <Text style={[styles.bigScore, { color: winner === 'faction2' ? Colors.dark.winGreen : Colors.dark.lossRed }]}>
              {score.faction2}
            </Text>
          </View>
        </View>

        {/* Scoreboards Container - side by side on desktop */}
        <View style={[styles.scoreboardsWrapper, isWeb && isDesktop && styles.scoreboardsWrapperDesktop]}>
          {/* Team 1 Scoreboard */}
          <View style={[styles.scoreboard, isWeb && isDesktop && styles.scoreboardDesktop]}>
            <View style={[styles.scoreboardHeader, winner === 'faction1' && styles.scoreboardHeaderWinner]}>
              <Text style={styles.scoreboardTeamName}>{team1.name}</Text>
              {winner === 'faction1' && (
                <View style={styles.winnerBadge}>
                  <Ionicons name="trophy" size={12} color="#fff" />
                  <Text style={styles.winnerBadgeText}>WIN</Text>
                </View>
              )}
            </View>
            <View style={styles.tableHeader}>
              <View style={styles.playerCell}><Text style={styles.headerText}>Player</Text></View>
              <View style={styles.statCell}><Text style={styles.headerText}>K-D</Text></View>
              <View style={styles.statCell}><Text style={styles.headerText}>+/-</Text></View>
              <View style={styles.statCell}><Text style={styles.headerText}>ADR</Text></View>
              <View style={styles.statCell}><Text style={styles.headerText}>HS%</Text></View>
              <View style={styles.statCell}><Text style={styles.headerText}>K/D</Text></View>
            </View>
            {team1Stats.map((p: any) => renderPlayerRow(p))}
          </View>

          {/* Team 2 Scoreboard */}
          <View style={[styles.scoreboard, isWeb && isDesktop && styles.scoreboardDesktop]}>
            <View style={[styles.scoreboardHeader, winner === 'faction2' && styles.scoreboardHeaderWinner]}>
              <Text style={styles.scoreboardTeamName}>{team2.name}</Text>
              {winner === 'faction2' && (
                <View style={styles.winnerBadge}>
                  <Ionicons name="trophy" size={12} color="#fff" />
                  <Text style={styles.winnerBadgeText}>WIN</Text>
                </View>
              )}
            </View>
            <View style={styles.tableHeader}>
              <View style={styles.playerCell}><Text style={styles.headerText}>Player</Text></View>
              <View style={styles.statCell}><Text style={styles.headerText}>K-D</Text></View>
              <View style={styles.statCell}><Text style={styles.headerText}>+/-</Text></View>
              <View style={styles.statCell}><Text style={styles.headerText}>ADR</Text></View>
              <View style={styles.statCell}><Text style={styles.headerText}>HS%</Text></View>
              <View style={styles.statCell}><Text style={styles.headerText}>K/D</Text></View>
            </View>
            {team2Stats.map((p: any) => renderPlayerRow(p))}
          </View>
        </View>
      </View>

      {/* Download Button */}
      <View style={styles.downloadContainer}>
        <Pressable 
          style={[styles.downloadButton, capturing && styles.downloadButtonDisabled]} 
          onPress={captureScoreboard}
          disabled={capturing}
        >
          {capturing ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="download-outline" size={18} color="#fff" />
              <Text style={styles.downloadButtonText}>Download Scoreboard</Text>
            </>
          )}
        </Pressable>
      </View>
    </ScrollView>
  );

  // Desktop layout (no sidebar, just header with back button)
  if (isWeb && isDesktop) {
    return (
      <View style={styles.desktopLayout}>
        <Stack.Screen options={{ title: 'Match Room', headerShown: false }} />
        <View style={styles.mainArea}>
          <View style={styles.desktopHeader}>
            <Pressable style={styles.backLink} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={20} color={Colors.dark.textSecondary} />
              <Text style={styles.backLinkText}>Back</Text>
            </Pressable>
            <Text style={styles.desktopTitle}>Match Room</Text>
            <View style={{ width: 80 }} />
          </View>
          {mainContent}
        </View>
      </View>
    );
  }

  // Mobile
  return (
    <ScreenBackground>
      <Stack.Screen options={{ title: 'Match Room', headerBackTitle: 'Back', headerStyle: { backgroundColor: Colors.dark.background }, headerTintColor: Colors.dark.text }} />
      {mainContent}
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  // Desktop layout
  desktopLayout: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: Colors.dark.background,
  },
  mainArea: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  desktopHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backLinkText: {
    color: Colors.dark.textSecondary,
    fontSize: 14,
  },
  desktopTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark.text,
  },

  // Loading/Error
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    color: Colors.dark.textSecondary,
    fontSize: 14,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: Colors.dark.text,
  },
  errorText: {
    fontSize: 16,
    color: Colors.dark.textSecondary,
    textAlign: 'center',
    marginBottom: 30,
  },
  retryButton: {
    backgroundColor: Colors.dark.tint,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    paddingHorizontal: 30,
    paddingVertical: 12,
  },
  backButtonText: {
    color: Colors.dark.textSecondary,
    fontSize: 16,
  },

  // Content
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  contentDesktop: {
    padding: 24,
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },

  // Match Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 16,
    marginBottom: 24,
  },
  teamHeader: {
    alignItems: 'center',
    flex: 1,
  },
  teamLogo: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginBottom: 8,
    backgroundColor: Colors.dark.border,
  },
  teamName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: Colors.dark.text,
    textAlign: 'center',
    marginBottom: 8,
    maxWidth: 100,
  },
  bigScore: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  matchInfo: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  vsText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.textMuted,
    marginBottom: 8,
  },
  mapBadge: {
    backgroundColor: Colors.dark.cardBackground,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginBottom: 8,
  },
  mapName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark.faceitOrange,
  },
  date: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.dark.faceitOrange,
    textTransform: 'uppercase',
  },

  // Download Button
  downloadContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 20,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.dark.faceitOrange,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  downloadButtonDisabled: {
    opacity: 0.7,
  },
  downloadButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },

  // Scoreboards
  scoreboardsWrapper: {
    gap: 24,
  },
  scoreboardsWrapperDesktop: {
    flexDirection: 'row',
    gap: 24,
  },
  scoreboard: {
    backgroundColor: Colors.dark.cardBackground,
    borderRadius: 12,
    overflow: 'hidden',
  },
  scoreboardDesktop: {
    flex: 1,
  },
  scoreboardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  scoreboardHeaderWinner: {
    backgroundColor: 'rgba(40, 167, 69, 0.15)',
  },
  scoreboardTeamName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.dark.text,
  },
  winnerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.dark.winGreen,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  winnerBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  headerText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.dark.textMuted,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
  },
  playerCell: {
    flex: 3,
  },
  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  levelIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  countryFlag: {
    width: 18,
    height: 12,
    marginRight: 8,
    borderRadius: 2,
  },
  playerName: {
    color: Colors.dark.text,
    fontWeight: '600',
    fontSize: 13,
  },
  statCell: {
    flex: 1,
    alignItems: 'center',
  },
  statText: {
    color: Colors.dark.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
});
