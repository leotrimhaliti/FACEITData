import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Text } from './Themed';

interface WebSidebarProps {
  /** Optional callback when a search is submitted */
  onSearch?: (query: string) => void;
}

/**
 * Web-only sidebar component with modern styling, search, and navigation.
 */
export function WebSidebar({ onSearch }: WebSidebarProps): React.ReactNode {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const router = useRouter();

  // Only render on web platform
  if (Platform.OS !== 'web') {
    return null;
  }

  const handleSearch = (): void => {
    const trimmed = searchQuery.trim();
    if (trimmed) {
      if (onSearch) {
        onSearch(trimmed);
      } else {
        router.push(`/player/${trimmed}`);
      }
      setSearchQuery('');
    }
  };

  const handleKeyPress = (e: any): void => {
    if (e.nativeEvent.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <View style={styles.sidebar}>
      {/* Logo/Brand */}
      <View style={styles.brandSection}>
        <View style={styles.logoContainer}>
          <Ionicons name="game-controller" size={24} color={Colors.dark.faceitOrange} />
          <Text style={styles.brandText}>FACEIT Data</Text>
        </View>
        <Text style={styles.brandSubtext}>CS2 Statistics Tracker</Text>
      </View>

      {/* Search Section */}
      <View style={styles.section}>
        <View style={[
          styles.searchContainer,
          isSearchFocused && styles.searchContainerFocused
        ]}>
          <Ionicons 
            name="search" 
            size={18} 
            color={isSearchFocused ? Colors.dark.faceitOrange : Colors.dark.textMuted} 
          />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search player..."
            placeholderTextColor={Colors.dark.textMuted}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            onKeyPress={handleKeyPress}
            onSubmitEditing={handleSearch}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')} style={styles.clearButton}>
              <Ionicons name="close-circle" size={18} color={Colors.dark.textMuted} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Navigation Links */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Navigation</Text>
        <NavItem 
          icon="home-outline" 
          label="Home" 
          onPress={() => router.push('/')} 
        />
        <NavItem 
          icon="heart-outline" 
          label="Favorites" 
          onPress={() => router.push('/favorites')} 
        />
      </View>

      {/* Quick Stats Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Tips</Text>
        <View style={styles.tipCard}>
          <Ionicons name="bulb-outline" size={16} color={Colors.dark.faceitOrange} />
          <Text style={styles.tipText}>
            Search for any FACEIT player to view their CS2 statistics, match history, and performance metrics.
          </Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Powered by FACEIT Data API</Text>
        <View style={styles.footerLinks}>
          <Text style={styles.footerLink}>About</Text>
          <Text style={styles.footerDivider}>•</Text>
          <Text style={styles.footerLink}>Privacy</Text>
        </View>
      </View>
    </View>
  );
}

interface NavItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  badge?: number;
}

function NavItem({ icon, label, onPress, badge }: NavItemProps): React.ReactNode {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Pressable
      style={[styles.navItem, isHovered && styles.navItemHovered]}
      onPress={onPress}
      onHoverIn={() => setIsHovered(true)}
      onHoverOut={() => setIsHovered(false)}
    >
      <Ionicons 
        name={icon} 
        size={20} 
        color={isHovered ? Colors.dark.faceitOrange : Colors.dark.textSecondary} 
      />
      <Text style={[styles.navLabel, isHovered && styles.navLabelHovered]}>
        {label}
      </Text>
      {badge !== undefined && badge > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: 280,
    borderRightWidth: 1,
    borderRightColor: Colors.dark.border,
    backgroundColor: 'rgba(18, 18, 18, 0.95)',
    paddingTop: 24,
    paddingBottom: 16,
    paddingHorizontal: 16,
    display: 'flex',
    flexDirection: 'column',
  },
  brandSection: {
    marginBottom: 32,
    paddingHorizontal: 4,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  brandText: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.dark.text,
    letterSpacing: -0.5,
  },
  brandSubtext: {
    fontSize: 12,
    color: Colors.dark.textMuted,
    marginLeft: 34,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.dark.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'transparent',
    gap: 10,
  },
  searchContainerFocused: {
    borderColor: Colors.dark.faceitOrange,
    backgroundColor: 'rgba(255, 85, 0, 0.05)',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.dark.text,
    outlineStyle: 'none',
  } as any,
  clearButton: {
    padding: 2,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 4,
    gap: 12,
  },
  navItemHovered: {
    backgroundColor: 'rgba(255, 85, 0, 0.1)',
  },
  navLabel: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    fontWeight: '500',
    flex: 1,
  },
  navLabelHovered: {
    color: Colors.dark.text,
  },
  badge: {
    backgroundColor: Colors.dark.faceitOrange,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },
  tipCard: {
    backgroundColor: 'rgba(255, 85, 0, 0.08)',
    borderRadius: 10,
    padding: 14,
    flexDirection: 'row',
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 85, 0, 0.15)',
  },
  tipText: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
    lineHeight: 18,
    flex: 1,
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
  },
  footerText: {
    fontSize: 11,
    color: Colors.dark.textMuted,
    textAlign: 'center',
    marginBottom: 8,
  },
  footerLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  footerLink: {
    fontSize: 11,
    color: Colors.dark.textSecondary,
  },
  footerDivider: {
    fontSize: 11,
    color: Colors.dark.textMuted,
  },
});
