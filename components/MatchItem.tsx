import { Colors } from '@/constants/Colors';
import { useResponsive } from '@/hooks/useResponsive';
import { addFavorite, isFavorite, removeFavorite } from '@/storage/favorites';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { Text } from './Themed';

interface MatchItemProps {
  match_id: string;
  game_mode: string;
  map: string;
  score: string;
  result: 'WIN' | 'LOSE';
  date: string;
  kills: number;
  deaths: number;
  kd: number;
  showFavoriteButton?: boolean;
  onFavoriteChange?: () => void;
  /** Display variant: 'list' for vertical, 'grid' for web grid layout */
  variant?: 'list' | 'grid';
}

export function MatchItem({
  match_id,
  game_mode,
  map,
  score,
  result,
  date,
  kills,
  deaths,
  kd,
  showFavoriteButton = true,
  onFavoriteChange,
  variant = 'list',
}: MatchItemProps) {
  const isWin = result === 'WIN';
  const resultColor = isWin ? Colors.dark.winGreen : Colors.dark.lossRed;
  const [favorited, setFavorited] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { isDesktop, isMobile } = useResponsive();
  const isWeb = Platform.OS === 'web';

  // Use grid variant on desktop web if not explicitly set
  const displayVariant = variant === 'list' && isDesktop && isWeb ? 'grid' : variant;

  useEffect(() => {
    checkFavoriteStatus();
  }, [match_id]);

  const checkFavoriteStatus = async () => {
    const status = await isFavorite(match_id);
    setFavorited(status);
  };

  const toggleFavorite = async (e: any) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      if (favorited) {
        await removeFavorite(match_id);
        setFavorited(false);
      } else {
        await addFavorite({
          match_id,
          game_mode,
          map,
          score,
          result,
          date,
          kills,
          deaths,
          kd
        });
        setFavorited(true);
      }
      onFavoriteChange?.();
    } catch (error) {
      // Silent fail for favorites
    }
  };

  if (displayVariant === 'grid') {
    return (
      <Link href={`/match/${match_id}`} asChild>
        <Pressable
          onHoverIn={() => setIsHovered(true)}
          onHoverOut={() => setIsHovered(false)}
        >
          <View style={[
            styles.gridContainer,
            isWeb && isDesktop && styles.gridContainerDesktop,
            { borderTopColor: resultColor },
            isHovered && styles.gridContainerHovered,
          ]}>
            {/* Header with Map and Result */}
            <View style={styles.gridHeader}>
              <View style={styles.mapBadge}>
                <Ionicons name="map-outline" size={12} color={Colors.dark.textMuted} />
                <Text style={styles.gridMap}>{map}</Text>
              </View>
              <View style={[styles.resultBadge, { backgroundColor: resultColor }]}>
                <Text style={styles.resultBadgeText}>{result}</Text>
              </View>
            </View>

            {/* Score */}
            <Text style={styles.gridScore}>{score}</Text>

            {/* Stats Row */}
            <View style={styles.gridStatsRow}>
              <View style={[styles.gridStat, { alignItems: 'flex-start' }]}>
                <Text style={styles.gridStatLabel}>K/D</Text>
                <Text style={[
                  styles.gridStatValue,
                  { color: kd >= 1 ? Colors.dark.winGreen : Colors.dark.lossRed }
                ]}>
                  {kd.toFixed(2)}
                </Text>
              </View>
              <View style={styles.gridStatDivider} />
              <View style={[styles.gridStat, { alignItems: 'center' }]}>
                <Text style={styles.gridStatLabel}>Kills</Text>
                <Text style={styles.gridStatValue}>{kills}</Text>
              </View>
              <View style={styles.gridStatDivider} />
              <View style={[styles.gridStat, { alignItems: 'flex-end' }]}>
                <Text style={styles.gridStatLabel}>Deaths</Text>
                <Text style={styles.gridStatValue}>{deaths}</Text>
              </View>
            </View>

            {/* Footer */}
            <View style={styles.gridFooter}>
              <Text style={styles.gridDate}>{date.replace('\n', ' • ')}</Text>
              <Text style={styles.gridMode}>{game_mode}</Text>
            </View>

            {/* Favorite Button */}
            {showFavoriteButton && (
              <Pressable
                style={styles.gridFavoriteButton}
                onPress={toggleFavorite}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name={favorited ? 'heart' : 'heart-outline'}
                  size={18}
                  color={favorited ? Colors.dark.faceitOrange : Colors.dark.textMuted}
                />
              </Pressable>
            )}
          </View>
        </Pressable>
      </Link>
    );
  }

  // List variant (default for mobile)
  return (
    <Link href={`/match/${match_id}`} asChild>
      <Pressable
        onHoverIn={() => setIsHovered(true)}
        onHoverOut={() => setIsHovered(false)}
      >
        <View style={[
          styles.container, 
          isWeb && isMobile && styles.containerMobile,
          { borderLeftColor: resultColor },
          isWeb && isHovered && styles.containerHovered,
        ]}>
          <View style={styles.leftSection}>
            <Text style={styles.map} numberOfLines={1}>{map}</Text>
            <Text style={styles.date}>{date.replace(/,\s\d{4}/, '')}</Text>
            <Text style={styles.mode}>{game_mode}</Text>
          </View>

          <View style={styles.centerSection}>
            <Text style={[styles.result, { color: resultColor }]}>{result}</Text>
            <Text style={styles.score}>{score}</Text>
          </View>

          <View style={styles.rightSection}>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>K/D</Text>
              <Text style={[
                styles.statValue, 
                { color: kd >= 1 ? Colors.dark.winGreen : Colors.dark.lossRed }
              ]}>
                {kd.toFixed(2)}
              </Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>K-D</Text>
              <Text style={styles.statValue}>{kills}-{deaths}</Text>
            </View>
          </View>

          {showFavoriteButton && (
            <Pressable
              style={styles.favoriteButton}
              onPress={toggleFavorite}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name={favorited ? 'heart' : 'heart-outline'}
                size={20}
                color={favorited ? Colors.dark.faceitOrange : Colors.dark.icon}
              />
            </Pressable>
          )}
        </View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  // List variant styles
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.dark.cardBackground,
    marginBottom: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    alignItems: 'center',
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  containerMobile: {
    marginHorizontal: 0,
    marginBottom: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderLeftWidth: 3,
  },
  containerHovered: {
    backgroundColor: 'rgba(40, 40, 40, 1)',
    transform: [{ translateX: 4 }],
  },
  leftSection: {
    flex: 1,
    marginRight: 10,
    minWidth: 0,
  },
  map: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.dark.text,
    marginBottom: 2,
  },
  date: {
    fontSize: 11,
    color: Colors.dark.textSecondary,
    marginBottom: 2,
  },
  mode: {
    fontSize: 11,
    color: Colors.dark.textMuted,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  centerSection: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 70,
    marginHorizontal: 5,
  },
  result: {
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  score: {
    fontSize: 13,
    color: Colors.dark.textSecondary,
    fontWeight: '600',
  },
  rightSection: {
    flex: 0.8,
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginLeft: 5,
    minWidth: 72,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.dark.textMuted,
    marginRight: 6,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.dark.text,
    minWidth: 30,
    textAlign: 'right',
  },
  // Mobile-specific overrides applied via isMobile checks if needed
  favoriteButton: {
    marginLeft: 12,
    padding: 4,
  },

  // Grid variant styles
  gridContainer: {
    backgroundColor: Colors.dark.cardBackground,
    borderRadius: 12,
    padding: 16,
    borderTopWidth: 3,
    minWidth: 200,
    flex: 1,
    maxWidth: '25%',
    position: 'relative',
    margin: 8,
  },
  gridContainerDesktop: {
    margin: 0,
    minWidth: 'auto',
    maxWidth: 'none',
  } as any,
  gridContainerHovered: {
    backgroundColor: 'rgba(40, 40, 40, 1)',
    transform: [{ scale: 1.02 }],
  },
  gridHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  mapBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  gridMap: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark.text,
  },
  resultBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  resultBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
  gridScore: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.dark.text,
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -1,
  },
  gridStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 8,
    marginBottom: 12,
  },
  gridStat: {
    alignItems: 'center',
  },
  gridStatLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.dark.textMuted,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  gridStatValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.dark.text,
  },
  gridStatDivider: {
    width: 1,
    height: 24,
    backgroundColor: Colors.dark.border,
  },
  gridFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gridDate: {
    fontSize: 11,
    color: Colors.dark.textSecondary,
  },
  gridMode: {
    fontSize: 10,
    color: Colors.dark.textMuted,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  gridFavoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 4,
  },
});
