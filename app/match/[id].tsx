import { ScreenBackground } from '@/components/ScreenBackground';
import { Text, View } from '@/components/Themed';
import { Colors } from '@/constants/Colors';
import { FaceitService } from '@/services/faceit';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet } from 'react-native';

export default function MatchDetailsScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [match, setMatch] = useState<any>(null);
    const [matchStats, setMatchStats] = useState<any>(null);
    const [playerCountries, setPlayerCountries] = useState<Map<string, string>>(new Map());

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
                setError('Match not found. It may have been deleted or the ID is incorrect.');
                setLoading(false);
                return;
            }

            setMatch(matchData);
            setMatchStats(statsData);
        } catch (err: any) {
            console.error('[MatchDetailsScreen] Error loading match:', err);
            if (err.message?.includes('404') || err.message?.includes('not found')) {
                setError('Match not found. It may have been deleted or the ID is incorrect.');
            } else if (err.message?.includes('network') || err.message?.includes('Network')) {
                setError('Network error. Please check your connection and try again.');
            } else {
                setError('Failed to load match details. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    // Fetch player details to get countries
    useEffect(() => {
        const fetchPlayerDetails = async () => {
            if (!match || !matchStats) return;

            // Get players from the stats object as that's who we display
            const roundStats = matchStats.rounds?.[0];
            const t1 = roundStats?.teams?.find((t: any) => t.team_id === match.teams?.faction1?.faction_id)?.players || [];
            const t2 = roundStats?.teams?.find((t: any) => t.team_id === match.teams?.faction2?.faction_id)?.players || [];

            const allPlayers = [...t1, ...t2];

            const countryMap = new Map<string, string>();

            // Create a list of promises to fetch details for each player
            const promises = allPlayers.map(async (p: any) => {
                if (p.player_id) {
                    try {
                        const details = await FaceitService.getPlayerById(p.player_id);
                        if (details && details.country) {
                            countryMap.set(p.player_id, details.country.toLowerCase());
                        }
                    } catch (err) {
                        console.error(`Failed to fetch country for player ${p.player_id}:`, err);
                    }
                }
            });

            await Promise.all(promises);
            setPlayerCountries(countryMap);
        };

        if (match && matchStats) {
            fetchPlayerDetails();
        }
    }, [match, matchStats]);

    if (loading) {
        return (
            <ScreenBackground style={styles.loadingContainer}>
                <Stack.Screen options={{ title: 'Match Room', headerBackTitle: 'Back', headerStyle: { backgroundColor: '#121212' }, headerTintColor: '#fff' }} />
                <ActivityIndicator size="large" color={Colors.dark.tint} />
            </ScreenBackground>
        );
    }

    if (error || !match || !matchStats) {
        return (
            <ScreenBackground style={styles.errorContainer}>
                <Stack.Screen options={{ title: 'Match Room', headerBackTitle: 'Back', headerStyle: { backgroundColor: '#121212' }, headerTintColor: '#fff' }} />
                <Ionicons name="alert-circle-outline" size={64} color="#666" />
                <Text style={styles.errorTitle}>Match Not Found</Text>
                <Text style={styles.errorText}>
                    {error || 'We couldn\'t find this match. It may have been deleted or the link is incorrect.'}
                </Text>
                <Pressable style={styles.retryButton} onPress={loadData}>
                    <Text style={styles.retryButtonText}>Try Again</Text>
                </Pressable>
                <Pressable style={styles.backButton} onPress={() => router.back()}>
                    <Text style={styles.backButtonText}>Go Back</Text>
                </Pressable>
            </ScreenBackground>
        );
    }

    // Parse Match Data
    const team1 = match.teams?.faction1;
    const team2 = match.teams?.faction2;
    const score = match.results?.score;
    const winner = match.results?.winner;

    // Parse Stats Data (Assuming single map/round for now)
    const roundStats = matchStats.rounds?.[0];
    let team1Stats = roundStats?.teams?.find((t: any) => t.team_id === team1.faction_id)?.players || [];
    let team2Stats = roundStats?.teams?.find((t: any) => t.team_id === team2.faction_id)?.players || [];

    // Sort by K/D Ratio descending
    team1Stats = [...team1Stats].sort((a: any, b: any) => parseFloat(b.player_stats['K/D Ratio']) - parseFloat(a.player_stats['K/D Ratio']));
    team2Stats = [...team2Stats].sort((a: any, b: any) => parseFloat(b.player_stats['K/D Ratio']) - parseFloat(a.player_stats['K/D Ratio']));

    const renderPlayerRow = (player: any, isTeam1: boolean) => {
        const stats = player.player_stats;
        const kills = parseInt(stats['Kills']);
        const deaths = parseInt(stats['Deaths']);
        const kdDiff = kills - deaths;
        const kdRatio = parseFloat(stats['K/D Ratio']);
        const hsPercentage = stats['Headshots %'] || '0';

        const country = playerCountries.get(player.player_id);

        return (
            <View key={player.player_id} style={styles.row}>
                <View style={styles.playerCell}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        {country && (
                            <Image
                                source={{ uri: `https://flagcdn.com/w40/${country}.png` }}
                                style={{ width: 16, height: 12, marginRight: 6, borderRadius: 2 }}
                            />
                        )}
                        <Text style={styles.playerName} numberOfLines={1}>{player.nickname}</Text>
                    </View>
                </View>
                <View style={styles.statCell}><Text style={styles.statText}>{kills}-{deaths}</Text></View>
                <View style={styles.statCell}>
                    <Text style={[styles.statText, { color: kdDiff > 0 ? Colors.dark.winGreen : (kdDiff < 0 ? Colors.dark.lossRed : '#fff') }]}>
                        {kdDiff > 0 ? '+' : ''}{kdDiff}
                    </Text>
                </View>
                <View style={styles.statCell}><Text style={styles.statText}>{stats['ADR'] || '-'}</Text></View>
                <View style={styles.statCell}><Text style={styles.statText}>{hsPercentage}%</Text></View>
                <View style={styles.statCell}>
                    <Text style={[styles.statText, { color: kdRatio >= 1 ? Colors.dark.winGreen : Colors.dark.lossRed }]}>
                        {kdRatio.toFixed(2)}
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <ScreenBackground>
            <Stack.Screen options={{ title: 'Match Room', headerBackTitle: 'Back', headerStyle: { backgroundColor: '#121212' }, headerTintColor: '#fff' }} />
            <ScrollView contentContainerStyle={styles.content}>

                {/* Header Section */}
                <View style={styles.header}>
                    <View style={styles.teamHeader}>
                        <Image source={{ uri: team1.avatar || 'https://assets.faceit-cdn.net/avatars/defaults/user.png' }} style={styles.teamLogo} />
                        <Text style={styles.teamName}>{team1.name}</Text>
                        <Text style={[styles.bigScore, { color: winner === 'faction1' ? Colors.dark.winGreen : Colors.dark.lossRed }]}>
                            {score.faction1}
                        </Text>
                    </View>

                    <View style={styles.matchInfo}>
                        <Text style={styles.time} numberOfLines={1}>{new Date(match.started_at * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                        <Text style={styles.date}>{new Date(match.started_at * 1000).toLocaleDateString()}</Text>
                        <View style={styles.statusBadge}>
                            <Text style={styles.statusText}>Match over</Text>
                        </View>
                    </View>

                    <View style={styles.teamHeader}>
                        <Image source={{ uri: team2.avatar || 'https://assets.faceit-cdn.net/avatars/defaults/user.png' }} style={styles.teamLogo} />
                        <Text style={styles.teamName}>{team2.name}</Text>
                        <Text style={[styles.bigScore, { color: winner === 'faction2' ? Colors.dark.winGreen : Colors.dark.lossRed }]}>
                            {score.faction2}
                        </Text>
                    </View>
                </View>

                {/* Map Info */}
                <View style={styles.mapContainer}>
                    <Text style={styles.mapLabel}>Map</Text>
                    <Text style={styles.mapName}>{match.voting?.map?.pick?.[0] || 'Unknown'}</Text>
                </View>

                {/* Scoreboard Team 1 */}
                <View style={styles.scoreboard}>
                    <View style={styles.tableHeader}>
                        <View style={styles.playerCell}><Text style={styles.headerText}>{team1.name}</Text></View>
                        <View style={styles.statCell}><Text style={styles.headerText}>K-D</Text></View>
                        <View style={styles.statCell}><Text style={styles.headerText}>+/-</Text></View>
                        <View style={styles.statCell}><Text style={styles.headerText}>ADR</Text></View>
                        <View style={styles.statCell}><Text style={styles.headerText}>HS %</Text></View>
                        <View style={styles.statCell}><Text style={styles.headerText}>K/D</Text></View>
                    </View>
                    {team1Stats.map((p: any) => renderPlayerRow(p, true))}
                </View>

                {/* Scoreboard Team 2 */}
                <View style={styles.scoreboard}>
                    <View style={styles.tableHeader}>
                        <View style={styles.playerCell}><Text style={styles.headerText}>{team2.name}</Text></View>
                        <View style={styles.statCell}><Text style={styles.headerText}>K-D</Text></View>
                        <View style={styles.statCell}><Text style={styles.headerText}>+/-</Text></View>
                        <View style={styles.statCell}><Text style={styles.headerText}>ADR</Text></View>
                        <View style={styles.statCell}><Text style={styles.headerText}>HS %</Text></View>
                        <View style={styles.statCell}><Text style={styles.headerText}>K/D</Text></View>
                    </View>
                    {team2Stats.map((p: any) => renderPlayerRow(p, false))}
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
    },
    errorText: {
        fontSize: 16,
        color: '#888',
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
        color: '#888',
        fontSize: 16,
    },
    content: {
        padding: 16,
        paddingBottom: 40,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        // backgroundColor: '#1E1E1E', // Removed
        paddingVertical: 10,
        marginBottom: 20,
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
        backgroundColor: '#333',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    teamName: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 4,
        height: 36, // Fixed height for alignment
        textAlignVertical: 'center',
    },
    bigScore: {
        fontSize: 28,
        fontWeight: 'bold',
        marginTop: 4,
    },
    matchInfo: {
        alignItems: 'center',
        marginTop: 12,
        flex: 1, // Increased from 0.6 to give more space
        paddingHorizontal: 4,
    },
    time: {
        fontSize: 20, // Slightly larger for better readability
        fontWeight: '800',
        color: '#fff',
        marginBottom: 4,
        includeFontPadding: false,
        textAlign: 'center',
    },
    date: {
        fontSize: 11,
        color: '#888',
        marginBottom: 8,
        fontWeight: '500',
    },
    statusBadge: {
        // Removed background for a cleaner look, just text
        marginTop: 2,
    },
    statusText: {
        color: '#FF5500',
        fontWeight: 'bold',
        fontSize: 12,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    mapContainer: {
        // backgroundColor: '#1E1E1E', // Removed
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        paddingVertical: 12,
        marginBottom: 24,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    mapLabel: {
        color: '#888',
        fontSize: 14,
        fontWeight: '500',
    },
    mapName: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    scoreboard: {
        // backgroundColor: '#1E1E1E', // Removed
        marginBottom: 24,
    },
    tableHeader: {
        flexDirection: 'row',
        paddingVertical: 8,
        paddingHorizontal: 4,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
        marginBottom: 4,
    },
    headerText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#666',
        textAlign: 'center',
        textTransform: 'uppercase',
    },
    row: {
        flexDirection: 'row',
        paddingVertical: 10,
        paddingHorizontal: 4,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
        alignItems: 'center',
    },
    playerCell: {
        flex: 3,
        justifyContent: 'center',
    },
    playerName: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 13,
    },
    statCell: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statText: {
        color: '#ddd',
        fontSize: 12,
        fontWeight: '500',
        fontVariant: ['tabular-nums'], // Aligns numbers better
    },
});
