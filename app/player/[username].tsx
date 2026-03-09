import { MatchItem } from '@/components/MatchItem';
import { ScreenBackground } from '@/components/ScreenBackground';
import { StatCard } from '@/components/StatCard';
import { Text, View } from '@/components/Themed';
import { Colors } from '@/constants/Colors';
import { FaceitService } from '@/services/faceit';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet } from 'react-native';

export default function PlayerStatsScreen() {
    const { username } = useLocalSearchParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [player, setPlayer] = useState<any>(null);
    const [stats, setStats] = useState<any>(null);
    const [history, setHistory] = useState<any[]>([]);

    useEffect(() => {
        loadData();
    }, [username]);

    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            console.log('[PlayerStatsScreen] Fetching player:', username);

            // 1. Fetch Player ID first
            const playerData = await FaceitService.getPlayer(username as string);

            if (!playerData?.player_id) {
                // This might be reached if getPlayer returns null (though service now throws)
                // or if the response structure is unexpected
                throw new Error('Player not found');
            }

            console.log('[PlayerStatsScreen] Player found:', playerData.player_id);
            setPlayer(playerData);

            // 2. Fetch Stats and History using Player ID
            console.log('[PlayerStatsScreen] Fetching stats and history...');
            const [statsData, historyData] = await Promise.all([
                FaceitService.getStats(playerData.player_id),
                FaceitService.getHistory(playerData.player_id)
            ]);

            console.log('[PlayerStatsScreen] Stats Data:', statsData ? 'Found' : 'Missing');
            console.log('[PlayerStatsScreen] History Items:', historyData?.length);

            setStats(statsData);
            setHistory(historyData || []);
        } catch (err: any) {
            console.error("[PlayerStatsScreen] Error loading data:", err);
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

    if (loading) {
        return (
            <ScreenBackground style={styles.loadingContainer}>
                <Stack.Screen options={{ title: username as string, headerBackTitle: 'Search', headerStyle: { backgroundColor: Colors.dark.background }, headerTintColor: Colors.dark.text }} />
                <ActivityIndicator size="large" color={Colors.dark.tint} />
            </ScreenBackground>
        );
    }

    if (error) {
        return (
            <ScreenBackground style={styles.errorContainer}>
                <Stack.Screen options={{ title: username as string, headerBackTitle: 'Search', headerStyle: { backgroundColor: Colors.dark.background }, headerTintColor: Colors.dark.text }} />
                <Ionicons name="alert-circle-outline" size={64} color={Colors.dark.textMuted} />
                <Text style={styles.errorTitle}>Oops!</Text>
                <Text style={styles.errorText}>{error}</Text>
                <Pressable style={styles.retryButton} onPress={loadData}>
                    <Text style={styles.retryButtonText}>Try Again</Text>
                </Pressable>
                <Pressable style={styles.backButton} onPress={() => router.back()}>
                    <Text style={styles.backButtonText}>Go Back</Text>
                </Pressable>
            </ScreenBackground>
        );
    }

    if (!player) {
        return (
            <ScreenBackground style={styles.errorContainer}>
                <Stack.Screen options={{ title: username as string, headerBackTitle: 'Search', headerStyle: { backgroundColor: Colors.dark.background }, headerTintColor: Colors.dark.text }} />
                <Ionicons name="person-outline" size={64} color={Colors.dark.textMuted} />
                <Text style={styles.errorTitle}>Player Not Found</Text>
                <Text style={styles.errorText}>We couldn't find a player with that username.</Text>
                <Pressable style={styles.backButton} onPress={() => router.back()}>
                    <Text style={styles.backButtonText}>Go Back</Text>
                </Pressable>
            </ScreenBackground>
        );
    }

    return (
        <ScreenBackground>
            <Stack.Screen options={{ title: username as string, headerBackTitle: 'Search', headerStyle: { backgroundColor: Colors.dark.background }, headerTintColor: Colors.dark.text }} />
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Header */}
                <View style={styles.header}>
                    <Image
                        source={{ uri: player?.avatar || 'https://assets.faceit-cdn.net/avatars/defaults/user.png' }}
                        style={styles.avatar}
                    />
                    <View style={styles.playerInfo}>
                        <Text style={styles.nickname}>{player?.nickname || 'Unknown'}</Text>
                        <View style={styles.levelContainer}>
                            <Text style={styles.level}>Level {player?.games?.cs2?.skill_level || 'N/A'}</Text>
                            <Text style={styles.elo}>{player?.games?.cs2?.faceit_elo || '0'} ELO</Text>
                        </View>
                    </View>
                </View>

                {/* Stats Grid */}
                {stats ? (
                    <View style={styles.statsGrid}>
                        <StatCard label="K/D Ratio" value={stats?.["Average K/D Ratio"] || 'N/A'} color={Colors.dark.tint} />
                        <StatCard label="Win Rate" value={stats?.["Win Rate %"] ? `${stats["Win Rate %"]}%` : 'N/A'} />
                        <StatCard label="Matches" value={stats?.["Matches"] || '0'} />
                    </View>
                ) : (
                    <View style={styles.noStatsContainer}>
                        <Text style={styles.noStatsText}>No CS2 stats available for this player</Text>
                    </View>
                )}

                {/* Match History */}
                <View style={styles.historyContainer}>
                    <Text style={styles.sectionTitle}>Recent Matches</Text>
                    {history.length > 0 ? (
                        history.map((match, index) => (
                            <MatchItem key={match.match_id || index} {...match} />
                        ))
                    ) : (
                        <View style={styles.emptyHistoryContainer}>
                            <Ionicons name="game-controller-outline" size={48} color={Colors.dark.textMuted} />
                            <Text style={styles.emptyHistoryText}>No recent matches found</Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </ScreenBackground>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
    scrollContent: {
        paddingBottom: 40,
    },
    header: {
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginRight: 20,
        backgroundColor: Colors.dark.border,
    },
    playerInfo: {
        flex: 1,
    },
    nickname: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 4,
        color: Colors.dark.text,
    },
    levelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    level: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
        backgroundColor: Colors.dark.faceitOrange,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        marginRight: 10,
        overflow: 'hidden',
    },
    elo: {
        fontSize: 16,
        color: Colors.dark.textSecondary,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 10,
    },
    noStatsContainer: {
        padding: 20,
        alignItems: 'center',
    },
    noStatsText: {
        fontSize: 14,
        color: Colors.dark.textSecondary,
        fontStyle: 'italic',
    },
    historyContainer: {
        marginTop: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 20,
        marginBottom: 10,
        color: Colors.dark.textSecondary,
    },
    emptyHistoryContainer: {
        padding: 40,
        alignItems: 'center',
    },
    emptyHistoryText: {
        fontSize: 14,
        color: Colors.dark.textSecondary,
        marginTop: 10,
    },
});
