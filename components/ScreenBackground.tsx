import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, ViewProps } from 'react-native';
import { useThemeColor } from './Themed';

export function ScreenBackground({ children, style, ...props }: ViewProps) {
    const backgroundColor = useThemeColor({}, 'background');

    return (
        <LinearGradient
            colors={[backgroundColor, '#1a1a1a']}
            style={[styles.container, style]}
            {...props}
        >
            {children}
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
