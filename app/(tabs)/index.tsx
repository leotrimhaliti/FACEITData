import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';

import { ScreenBackground } from '@/components/ScreenBackground';
import { Text } from '@/components/Themed';
import { SearchInput } from '@/components/ui/SearchInput';
import { Colors } from '@/constants/Colors';

export default function TabOneScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearch = () => {
    const trimmedQuery = searchQuery.trim();

    if (!trimmedQuery) {
      // Don't navigate with empty search
      return;
    }

    // Navigate to player stats page
    console.log('Searching for:', trimmedQuery);
    router.push(`/player/${trimmedQuery}`);
  };

  return (
    <ScreenBackground style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Image
            source={require('../../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <View style={styles.centerContent}>
          <Text style={styles.subtitle}>
            Your <Text style={styles.highlightText}>FACEIT</Text> data, <Text style={styles.cleanText}>Clean</Text> mode.
          </Text>

          <View style={styles.searchContainer}>
            <SearchInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSearch={handleSearch}
              placeholder="Enter Faceit Username"
            />
          </View>
        </View>
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  logo: {
    width: 400,
    height: 120,
  },
  centerContent: {
    alignItems: 'center',
    width: '100%',
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 30,
    textAlign: 'center',
  },
  highlightText: {
    color: Colors.dark.tint,
    fontWeight: 'bold',
  },
  cleanText: {
    color: '#4a90e2',
    fontWeight: 'bold',
  },
  searchContainer: {
    width: '100%',
    maxWidth: 400,
  },
});
