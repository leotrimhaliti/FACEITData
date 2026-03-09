import { Colors } from '@/constants/Colors';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from './Themed';

interface StatCardProps {
    label: string;
    value: string | number;
    subValue?: string;
    color?: string;
}

export function StatCard({ label, value, subValue, color }: StatCardProps) {
    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>
            <Text style={[styles.value, color ? { color } : undefined]}>{value}</Text>
            {subValue && <Text style={styles.subValue}>{subValue}</Text>}
            <View style={styles.barContainer}>
                <View style={[styles.bar, { backgroundColor: color || Colors.dark.faceitOrange, width: '60%' }]} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 15,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 8,
        minWidth: 100,
        flex: 1,
        margin: 5,
    },
    label: {
        fontSize: 12,
        color: '#888',
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    value: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    subValue: {
        fontSize: 10,
        color: '#666',
        marginTop: 2,
    },
    barContainer: {
        height: 3,
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginTop: 8,
        borderRadius: 1.5,
    },
    bar: {
        height: '100%',
        borderRadius: 1.5,
    },
});
