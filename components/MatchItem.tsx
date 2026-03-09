import { Colors } from '@/constants/Colors';
import { addFavorite, isFavorite, removeFavorite } from '@/storage/favorites';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, TouchableOpacity, View } from 'react-native';
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
    onFavoriteChange
}: MatchItemProps) {
    const isWin = result === 'WIN';
    const resultColor = isWin ? Colors.dark.winGreen : Colors.dark.lossRed;
    const [favorited, setFavorited] = useState(false);

    useEffect(() => {
        checkFavoriteStatus();
    }, [match_id]);

    const checkFavoriteStatus = async () => {
        const status = await isFavorite(match_id);
        setFavorited(status);
    };

    const toggleFavorite = async (e: any) => {
        e.preventDefault(); // Prevent navigation when tapping heart

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
            console.error('Error toggling favorite:', error);
        }
    };

    return (
        <Link href={`/match/${match_id}`} asChild>
            <Pressable>
                <View style={[styles.container, { borderLeftColor: resultColor }]}>
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
                            <Text style={styles.statLabel}>K/D Ratio</Text>
                            <Text style={[styles.statValue, { color: kd >= 1 ? Colors.dark.winGreen : Colors.dark.lossRed }]}>{kd.toFixed(2)}</Text>
                        </View>
                        <View style={styles.statRow}>
                            <Text style={styles.statLabel}>K-D</Text>
                            <Text style={styles.statValue}>{kills}-{deaths}</Text>
                        </View>
                    </View>

                    {showFavoriteButton && (
                        <TouchableOpacity
                            style={styles.favoriteButton}
                            onPress={toggleFavorite}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <Ionicons
                                name={favorited ? 'heart' : 'heart-outline'}
                                size={20}
                                color={favorited ? Colors.dark.faceitOrange : Colors.dark.icon}
                            />
                        </TouchableOpacity>
                    )}
                </View>
            </Pressable>
        </Link>
    );
}

const styles = StyleSheet.create({
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
    leftSection: {
        flex: 1,
        marginRight: 10,
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
    favoriteButton: {
        marginLeft: 12,
        padding: 4,
    },
});
