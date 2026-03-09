import { Colors } from '@/constants/Colors';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withTiming,
} from 'react-native-reanimated';

interface AnimatedSplashScreenProps {
    onAnimationFinish: () => void;
}

export function AnimatedSplashScreen({
    onAnimationFinish,
}: AnimatedSplashScreenProps) {
    const opacity = useSharedValue(1);
    const scale = useSharedValue(1);

    useEffect(() => {
        // Start animation sequence
        opacity.value = withDelay(
            2000, // Wait 2 seconds
            withTiming(0, { duration: 1500 }, (finished) => {
                if (finished) {
                    runOnJS(onAnimationFinish)();
                }
            })
        );

        scale.value = withDelay(
            2000,
            withTiming(1.1, { duration: 1500 })
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            opacity: opacity.value,
            transform: [{ scale: scale.value }],
        };
    });

    return (
        <View style={styles.container}>
            <Animated.Image
                source={require('../assets/images/logo.png')}
                style={[styles.logo, animatedStyle]}
                resizeMode="contain"
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: Colors.dark.background,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
    },
    logo: {
        width: 200,
        height: 200,
    },
});
