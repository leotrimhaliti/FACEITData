import { MatchItem } from '@/components/MatchItem';
import { ScreenBackground } from '@/components/ScreenBackground';
import { StatCard } from '@/components/StatCard';
import { Text } from '@/components/Themed';
import { Colors } from '@/constants/Colors';
import { useResponsive } from '@/hooks/useResponsive';
import { FaceitService } from '@/services/faceit';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';

const INITIAL_MATCHES = 20;
const LOAD_MORE_COUNT = 20;

export default function PlayerStatsScreen() {
  const { username } = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [player, setPlayer] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [displayedMatches, setDisplayedMatches] = useState<number>(INITIAL_MATCHES);
  const [totalMatches, setTotalMatches] = useState<number>(0);
  const [allMatchesLoaded, setAllMatchesLoaded] = useState(false);
  const { isDesktop, isMobile } = useResponsive();
  const isWeb = Platform.OS === 'web';

  useEffect(() => {
    loadData();
  }, [username]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    setDisplayedMatches(INITIAL_MATCHES);
    setAllMatchesLoaded(false);
    
    try {
      const playerData = await FaceitService.getPlayer(username as string);

      if (!playerData?.player_id) {
        throw new Error('Player not found');
      }

      setPlayer(playerData);

      // Fetch stats and initial batch of matches
      const [statsData, historyData] = await Promise.all([
        FaceitService.getStats(playerData.player_id),
        FaceitService.getHistory(playerData.player_id, { limit: INITIAL_MATCHES })
      ]);

      setStats(statsData);
      setHistory(historyData || []);
      setTotalMatches(parseInt(statsData?.["Matches"] || '0'));
      
      // Check if we got all matches in initial load
      if ((historyData?.length || 0) < INITIAL_MATCHES) {
        setAllMatchesLoaded(true);
      }
    } catch (err: any) {
      if (err.name === 'FaceitError') {
        setError(err.message);
      } else if (err.message?.includes('404') || err.message?.includes('not found')) {
        setError('Player not found. Please check the username and try again.');
      } else if (err.message?.includes('network') || err.message?.includes('Network')) {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError('Failed to load player data. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadMoreMatches = async () => {
    if (loadingMore || allMatchesLoaded || !player?.player_id) return;

    setLoadingMore(true);
    try {
      const newLimit = displayedMatches + LOAD_MORE_COUNT;
      const historyData = await FaceitService.getHistory(player.player_id, { limit: newLimit });
      
      setHistory(historyData || []);
      setDisplayedMatches(newLimit);
      
      // Check if we've loaded all available matches
      if ((historyData?.length || 0) < newLimit) {
        setAllMatchesLoaded(true);
      }
    } catch (err) {
      // Silently fail for load more - user can retry
    } finally {
      setLoadingMore(false);
    }
  };

  // Calculate remaining matches
  const remainingMatches = Math.max(0, totalMatches - history.length);
  const hasMoreMatches = !allMatchesLoaded && history.length > 0;

  // FACEIT skill level icon URLs from their official CDN
  const getLevelIconUrl = (level: number): string => {
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

  // Loading state
  if (loading) {
    return (
      <ScreenBackground style={styles.loadingContainer}>
        <Stack.Screen options={{ 
          title: username as string, 
          headerBackTitle: 'Search', 
          headerStyle: { backgroundColor: Colors.dark.background }, 
          headerTintColor: Colors.dark.text 
        }} />
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color={Colors.dark.tint} />
          <Text style={styles.loadingText}>Loading player data...</Text>
        </View>
      </ScreenBackground>
    );
  }

  // Error state
  if (error) {
    return (
      <ScreenBackground style={styles.errorContainer}>
        <Stack.Screen options={{ 
          title: username as string, 
          headerBackTitle: 'Search', 
          headerStyle: { backgroundColor: Colors.dark.background }, 
          headerTintColor: Colors.dark.text 
        }} />
        <View style={styles.errorCard}>
          <Ionicons name="alert-circle-outline" size={64} color={Colors.dark.lossRed} />
          <Text style={styles.errorTitle}>Oops!</Text>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable style={styles.retryButton} onPress={loadData}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </Pressable>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </Pressable>
        </View>
      </ScreenBackground>
    );
  }

  // Not found state
  if (!player) {
    return (
      <ScreenBackground style={styles.errorContainer}>
        <Stack.Screen options={{ 
          title: username as string, 
          headerBackTitle: 'Search', 
          headerStyle: { backgroundColor: Colors.dark.background }, 
          headerTintColor: Colors.dark.text 
        }} />
        <View style={styles.errorCard}>
          <Ionicons name="person-outline" size={64} color={Colors.dark.textMuted} />
          <Text style={styles.errorTitle}>Player Not Found</Text>
          <Text style={styles.errorText}>We couldn't find a player with that username.</Text>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </Pressable>
        </View>
      </ScreenBackground>
    );
  }

  // Calculate progress for stats
  const kdRatio = parseFloat(stats?.["Average K/D Ratio"] || '0');
  const winRate = parseFloat(stats?.["Win Rate %"] || '0');

  // Main content
  const mainContent = (
    <ScrollView 
      contentContainerStyle={[
        styles.scrollContent,
        isWeb && isMobile && styles.scrollContentMobile,
        isWeb && isDesktop && styles.scrollContentDesktop,
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Player Header Card */}
      <View style={[
        styles.headerCard, 
        isWeb && isMobile && styles.headerCardMobile,
        isWeb && isDesktop && styles.headerCardDesktop
      ]}>
        <View style={[styles.headerContent, isWeb && isMobile && styles.headerContentMobile]}>
          <Image
            source={{ uri: player?.avatar || 'https://assets.faceit-cdn.net/avatars/defaults/user.png' }}
            style={[
              styles.avatar, 
              isWeb && isMobile && styles.avatarMobile,
              isWeb && isDesktop && styles.avatarDesktop
            ]}
          />
          <View style={[styles.playerInfo, isWeb && isMobile && styles.playerInfoMobile]}>
            <View style={[styles.nameRow, isWeb && isMobile && styles.nameRowMobile]}>
              <Text style={[
                styles.nickname, 
                isWeb && isMobile && styles.nicknameMobile,
                isWeb && isDesktop && styles.nicknameDesktop
              ]}>
                {player?.nickname || 'Unknown'}
              </Text>
              {player?.country && (
                <Image
                  source={{ uri: `https://flagcdn.com/w40/${player.country.toLowerCase()}.png` }}
                  style={[styles.countryFlag, isWeb && isMobile && styles.countryFlagMobile]}
                />
              )}
            </View>
            <View style={[styles.badgesRow, isWeb && isMobile && styles.badgesRowMobile]}>
              {player?.games?.cs2?.skill_level && (
                <Image
                  source={{ uri: getLevelIconUrl(player.games.cs2.skill_level) }}
                  style={[styles.levelIcon, isWeb && isMobile && styles.levelIconMobile]}
                />
              )}
              <View style={[styles.eloBadge, isWeb && isMobile && styles.eloBadgeMobile]}>
                <Text style={[styles.eloText, isWeb && isMobile && styles.eloTextMobile]}>
                  {player?.games?.cs2?.faceit_elo || '0'} ELO
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Stats Section */}
      {stats ? (
        <View style={[
          styles.statsSection, 
          isWeb && isMobile && styles.statsSectionMobile,
          isWeb && isDesktop && styles.statsSectionDesktop
        ]}>
          <Text style={[styles.sectionTitle, isWeb && isMobile && styles.sectionTitleMobile]}>Statistics</Text>
          <View style={[
            styles.statsGrid,
            isWeb && isMobile && styles.statsGridMobile,
            isWeb && isDesktop && styles.statsGridDesktop,
          ]}>
            <StatCard 
              label="K/D Ratio" 
              value={stats?.["Average K/D Ratio"] || 'N/A'} 
              color={kdRatio >= 1 ? Colors.dark.winGreen : Colors.dark.lossRed}
              icon="skull-outline"
              progress={Math.min(100, kdRatio * 50)}
              trend={kdRatio >= 1.2 ? 'up' : kdRatio < 0.9 ? 'down' : 'neutral'}
            />
            <StatCard 
              label="Win Rate" 
              value={stats?.["Win Rate %"] ? `${stats["Win Rate %"]}%` : 'N/A'}
              color={winRate >= 50 ? Colors.dark.winGreen : Colors.dark.lossRed}
              icon="trophy-outline"
              progress={winRate}
              trend={winRate >= 55 ? 'up' : winRate < 45 ? 'down' : 'neutral'}
            />
            <StatCard 
              label="Headshot %" 
              value={stats?.["Average Headshots %"] ? `${stats["Average Headshots %"]}%` : 'N/A'}
              icon="radio-button-on-outline"
              progress={parseFloat(stats?.["Average Headshots %"] || '0')}
            />
            <StatCard 
              label="Matches" 
              value={stats?.["Matches"] || '0'}
              icon="game-controller-outline"
              progress={Math.min(100, parseInt(stats?.["Matches"] || '0') / 10)}
            />
          </View>
        </View>
      ) : (
        <View style={styles.noStatsContainer}>
          <Ionicons name="stats-chart-outline" size={48} color={Colors.dark.textMuted} />
          <Text style={styles.noStatsText}>No CS2 stats available for this player</Text>
        </View>
      )}

      {/* Match History Section */}
      <View style={[
        styles.historySection, 
        isWeb && isMobile && styles.historySectionMobile,
        isWeb && isDesktop && styles.historySectionDesktop
      ]}>
        <View style={[styles.sectionHeader, isWeb && isMobile && styles.sectionHeaderMobile]}>
          <Text style={[styles.sectionTitle, isWeb && isMobile && styles.sectionTitleMobile]}>Match History</Text>
          {history.length > 0 && (
            <Text style={[styles.matchCount, isWeb && isMobile && styles.matchCountMobile]}>
              Showing {history.length} of {totalMatches} matches
            </Text>
          )}
        </View>
        
        {history.length > 0 ? (
          <>
            <View style={[
              styles.matchGrid,
              isWeb && isMobile && styles.matchGridMobile,
              isWeb && isDesktop && styles.matchGridDesktop,
            ]}>
              {history.map((match, index) => (
                <MatchItem 
                  key={match.match_id || index} 
                  {...match}
                  variant={isWeb && isDesktop ? 'grid' : 'list'}
                />
              ))}
            </View>

            {/* Load More Button */}
            {hasMoreMatches && (
              <View style={styles.loadMoreContainer}>
                <Pressable 
                  style={[styles.loadMoreButton, loadingMore && styles.loadMoreButtonDisabled]}
                  onPress={loadMoreMatches}
                  disabled={loadingMore}
                >
                  {loadingMore ? (
                    <>
                      <ActivityIndicator size="small" color="#fff" />
                      <Text style={styles.loadMoreText}>Loading...</Text>
                    </>
                  ) : (
                    <>
                      <Ionicons name="add-circle-outline" size={20} color="#fff" />
                      <Text style={styles.loadMoreText}>
                        Load More ({remainingMatches > LOAD_MORE_COUNT ? LOAD_MORE_COUNT : remainingMatches} more)
                      </Text>
                    </>
                  )}
                </Pressable>
                {remainingMatches > 0 && (
                  <Text style={styles.remainingText}>
                    {remainingMatches} matches remaining
                  </Text>
                )}
              </View>
            )}

            {/* All loaded indicator */}
            {allMatchesLoaded && history.length > INITIAL_MATCHES && (
              <View style={styles.allLoadedContainer}>
                <Ionicons name="checkmark-circle" size={20} color={Colors.dark.winGreen} />
                <Text style={styles.allLoadedText}>All matches loaded</Text>
              </View>
            )}
          </>
        ) : (
          <View style={styles.emptyHistoryContainer}>
            <Ionicons name="game-controller-outline" size={48} color={Colors.dark.textMuted} />
            <Text style={styles.emptyHistoryText}>No recent matches found</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );

  // Desktop layout (no sidebar, just header with back button)
  if (isWeb && isDesktop) {
    return (
      <View style={styles.desktopLayout}>
        <Stack.Screen options={{ 
          title: `${player?.nickname} - FACEIT Stats`, 
          headerShown: false,
        }} />
        <View style={styles.mainContent}>
          {/* Custom header for desktop */}
          <View style={styles.desktopHeader}>
            <Pressable style={styles.backLink} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={20} color={Colors.dark.textSecondary} />
              <Text style={styles.backLinkText}>Back</Text>
            </Pressable>
            <Text style={styles.desktopTitle}>{player?.nickname}</Text>
            <View style={styles.headerSpacer} />
          </View>
          {mainContent}
        </View>
      </View>
    );
  }

  // Mobile web layout
  if (isWeb && isMobile) {
    return (
      <View style={styles.mobileWebLayout}>
        <Stack.Screen options={{ 
          title: `${player?.nickname}`, 
          headerShown: false,
        }} />
        {/* Custom header for mobile web */}
        <View style={styles.mobileWebHeader}>
          <Pressable style={styles.mobileBackButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={Colors.dark.text} />
          </Pressable>
          <Text style={styles.mobileWebTitle} numberOfLines={1}>{player?.nickname}</Text>
          <View style={styles.mobileHeaderSpacer} />
        </View>
        {mainContent}
      </View>
    );
  }

  // Native mobile layout
  return (
    <ScreenBackground>
      <Stack.Screen options={{ 
        title: username as string, 
        headerBackTitle: 'Search', 
        headerStyle: { backgroundColor: Colors.dark.background }, 
        headerTintColor: Colors.dark.text 
      }} />
      {mainContent}
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  // Layout
  desktopLayout: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: Colors.dark.background,
  },
  mobileWebLayout: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  mainContent: {
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
    backgroundColor: 'rgba(18, 18, 18, 0.8)',
  },
  mobileWebHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
    backgroundColor: Colors.dark.background,
  },
  mobileBackButton: {
    padding: 8,
    marginRight: 4,
  },
  mobileWebTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.text,
  },
  mobileHeaderSpacer: {
    width: 38,
  },
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 8,
    borderRadius: 8,
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
  headerSpacer: {
    width: 80,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    color: Colors.dark.textSecondary,
    fontSize: 14,
  },

  // Error
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorCard: {
    backgroundColor: Colors.dark.cardBackground,
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    maxWidth: 400,
    width: '100%',
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
    lineHeight: 24,
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

  // Scroll content
  scrollContent: {
    paddingBottom: 40,
  },
  scrollContentMobile: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 24,
  },
  scrollContentDesktop: {
    paddingHorizontal: 24,
    paddingTop: 24,
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },

  // Player Header Card
  headerCard: {
    backgroundColor: Colors.dark.cardBackground,
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 16,
    overflow: 'hidden',
  },
  headerCardMobile: {
    marginHorizontal: 0,
    borderRadius: 12,
    marginTop: 0,
  },
  headerCardDesktop: {
    marginHorizontal: 0,
  },
  headerContent: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerContentMobile: {
    padding: 14,
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 20,
    backgroundColor: Colors.dark.border,
    borderWidth: 3,
    borderColor: Colors.dark.faceitOrange,
  },
  avatarMobile: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 14,
    borderWidth: 2,
  },
  avatarDesktop: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
  },
  playerInfo: {
    flex: 1,
  },
  playerInfoMobile: {
    width: '100%',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  nameRowMobile: {
    flexWrap: 'wrap',
    rowGap: 8,
  },
  nickname: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  nicknameMobile: {
    fontSize: 18,
  },
  nicknameDesktop: {
    fontSize: 32,
  },
  countryFlag: {
    width: 28,
    height: 20,
    borderRadius: 3,
  },
  countryFlagMobile: {
    width: 22,
    height: 16,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  badgesRowMobile: {
    gap: 8,
    flexWrap: 'wrap',
  },
  levelIcon: {
    width: 36,
    height: 36,
  },
  levelIconMobile: {
    width: 28,
    height: 28,
  },
  eloBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  eloBadgeMobile: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  eloText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.dark.text,
  },
  eloTextMobile: {
    fontSize: 13,
  },

  // Stats Section
  statsSection: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  statsSectionMobile: {
    marginTop: 16,
    paddingHorizontal: 0,
  },
  statsSectionDesktop: {
    paddingHorizontal: 0,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.dark.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
  },
  sectionTitleMobile: {
    fontSize: 11,
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  statsGridMobile: {
    marginHorizontal: -4,
  },
  statsGridDesktop: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 16,
  } as any,
  noStatsContainer: {
    padding: 40,
    alignItems: 'center',
    backgroundColor: Colors.dark.cardBackground,
    marginHorizontal: 16,
    marginTop: 24,
    borderRadius: 12,
  },
  noStatsText: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    marginTop: 12,
  },

  // Match History Section
  historySection: {
    marginTop: 32,
    paddingHorizontal: 16,
  },
  historySectionMobile: {
    marginTop: 20,
    paddingHorizontal: 0,
  },
  historySectionDesktop: {
    paddingHorizontal: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionHeaderMobile: {
    alignItems: 'flex-start',
    gap: 6,
  },
  matchCount: {
    fontSize: 12,
    color: Colors.dark.textMuted,
  },
  matchCountMobile: {
    fontSize: 10,
  },
  matchGrid: {
    marginHorizontal: -16,
  },
  matchGridMobile: {
    marginHorizontal: 0,
  },
  matchGridDesktop: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 16,
  } as any,
  emptyHistoryContainer: {
    padding: 40,
    alignItems: 'center',
    backgroundColor: Colors.dark.cardBackground,
    marginHorizontal: 16,
    borderRadius: 12,
  },
  emptyHistoryText: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    marginTop: 10,
  },

  // Load More
  loadMoreContainer: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  loadMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.dark.faceitOrange,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 10,
  },
  loadMoreButtonDisabled: {
    opacity: 0.7,
  },
  loadMoreText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  remainingText: {
    marginTop: 10,
    fontSize: 12,
    color: Colors.dark.textMuted,
  },
  allLoadedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 20,
  },
  allLoadedText: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
  },
});
