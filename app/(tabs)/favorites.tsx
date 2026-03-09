import { MatchItem } from '@/components/MatchItem';
import { ScreenBackground } from '@/components/ScreenBackground';
import { Text, View } from '@/components/Themed';
import { FavoriteMatch, getFavorites } from '@/storage/favorites';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet } from 'react-native';

export default function FavoritesScreen() {
  const [favorites, setFavorites] = useState<FavoriteMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFavorites = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const favs = await getFavorites();
      setFavorites(favs);
    } catch (err) {
      console.error('Error loading favorites:', err);
      setError('Failed to load favorites. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Reload favorites when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [loadFavorites])
  );

  if (loading) {
    return (
      <ScreenBackground style={styles.container}>
        <ActivityIndicator size="large" color="#FF5500" />
      </ScreenBackground>
    );
  }

  if (error) {
    return (
      <ScreenBackground style={styles.container}>
        <View style={styles.emptyState}>
          <Ionicons name="alert-circle-outline" size={64} color="#666" />
          <Text style={styles.emptyTitle}>Error Loading Favorites</Text>
          <Text style={styles.emptyText}>{error}</Text>
          <Pressable style={styles.retryButton} onPress={loadFavorites}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </Pressable>
        </View>
      </ScreenBackground>
    );
  }

  if (favorites.length === 0) {
    return (
      <ScreenBackground style={styles.container}>
        <View style={styles.emptyState}>
          <Ionicons name="heart-outline" size={64} color="#666" />
          <Text style={styles.emptyTitle}>No Favorites Yet</Text>
          <Text style={styles.emptyText}>
            Tap the heart icon on any match to save it here for quick access.
          </Text>
        </View>
      </ScreenBackground>
    );
  }

  return (
    <ScreenBackground style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.header}>Favorite Matches ({favorites.length})</Text>
        {favorites.map((match, index) => (
          <MatchItem
            key={match.match_id || index}
            {...match}
            onFavoriteChange={loadFavorites}
          />
        ))}
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 20,
    marginBottom: 15,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    fontSize: 16,
    lineHeight: 24,
  },
  retryButton: {
    backgroundColor: '#FF5500',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
