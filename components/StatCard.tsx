import { Colors } from '@/constants/Colors';
import { useResponsive } from '@/hooks/useResponsive';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { Text } from './Themed';

interface StatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  color?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  /** Progress percentage (0-100) for the bar */
  progress?: number;
  /** Trend indicator: 'up', 'down', or 'neutral' */
  trend?: 'up' | 'down' | 'neutral';
}

export function StatCard({ 
  label, 
  value, 
  subValue, 
  color,
  icon,
  progress = 60,
  trend,
}: StatCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { isDesktop, isMobile } = useResponsive();
  const isWeb = Platform.OS === 'web';

  const accentColor = color || Colors.dark.faceitOrange;

  const getTrendIcon = (): keyof typeof Ionicons.glyphMap | null => {
    if (!trend) return null;
    switch (trend) {
      case 'up': return 'trending-up';
      case 'down': return 'trending-down';
      default: return 'remove';
    }
  };

  const getTrendColor = (): string => {
    if (!trend) return Colors.dark.textMuted;
    switch (trend) {
      case 'up': return Colors.dark.winGreen;
      case 'down': return Colors.dark.lossRed;
      default: return Colors.dark.textMuted;
    }
  };

  const trendIcon = getTrendIcon();

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        isWeb && isMobile && styles.containerMobile,
        isWeb && isDesktop && styles.containerDesktop,
        isWeb && isHovered && styles.containerHovered,
        pressed && styles.containerPressed,
      ]}
      onHoverIn={() => setIsHovered(true)}
      onHoverOut={() => setIsHovered(false)}
    >
      <View style={[styles.header, isWeb && isMobile && styles.headerMobile]}>
        <View style={styles.labelContainer}>
          {icon && (
            <Ionicons 
              name={icon} 
              size={isMobile ? 12 : 14} 
              color={Colors.dark.textMuted} 
              style={styles.icon}
            />
          )}
          <Text style={[styles.label, isWeb && isMobile && styles.labelMobile]}>{label}</Text>
        </View>
        {trendIcon && (
          <Ionicons 
            name={trendIcon} 
            size={16} 
            color={getTrendColor()} 
          />
        )}
      </View>

      <View style={[styles.valueContainer, isWeb && isMobile && styles.valueContainerMobile]}>
        <Text style={[styles.value, isWeb && isMobile && styles.valueMobile, { color: accentColor }]}>{value}</Text>
        {subValue && <Text style={styles.subValue}>{subValue}</Text>}
      </View>

      <View style={styles.barContainer}>
        <View 
          style={[
            styles.bar, 
            { 
              backgroundColor: accentColor, 
              width: `${Math.min(100, Math.max(0, progress))}%`,
            }
          ]} 
        />
      </View>
      
      {/* Glow effect on hover (web only) */}
      {isWeb && isHovered && (
        <View 
          style={[
            styles.glowOverlay,
            { shadowColor: accentColor }
          ]} 
        />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: Colors.dark.cardBackground,
    borderRadius: 12,
    minWidth: 100,
    flex: 1,
    margin: 6,
    borderWidth: 1,
    borderColor: 'transparent',
    position: 'relative',
    overflow: 'hidden',
  },
  containerMobile: {
    padding: 12,
    margin: 4,
    borderRadius: 10,
    minWidth: 80,
  },
  containerDesktop: {
    padding: 24,
    margin: 0,
    minWidth: 'auto',
    maxWidth: 'none',
    cursor: 'pointer',
  } as any,
  containerHovered: {
    borderColor: 'rgba(255, 85, 0, 0.3)',
    backgroundColor: 'rgba(30, 30, 30, 1)',
    transform: [{ scale: 1.02 }],
  },
  containerPressed: {
    opacity: 0.9,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerMobile: {
    marginBottom: 6,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 6,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.dark.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  labelMobile: {
    fontSize: 9,
  },
  valueContainer: {
    marginBottom: 12,
  },
  valueContainerMobile: {
    marginBottom: 8,
  },
  value: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  valueMobile: {
    fontSize: 22,
  },
  subValue: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
    marginTop: 4,
  },
  barContainer: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: 2,
  },
  glowOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    pointerEvents: 'none',
  } as any,
});
