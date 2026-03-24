import { ScreenBackground } from '@/components/ScreenBackground';
import { Text } from '@/components/Themed';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { Link, Stack } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

export default function NotFoundScreen() {
  return (
    <ScreenBackground style={styles.container}>
      <Stack.Screen options={{ title: '404 | FACEITData', headerShown: false }} />
      <View style={styles.card}>
        <Ionicons name="compass-outline" size={72} color={Colors.dark.faceitOrange} />
        <Text style={styles.code}>404</Text>
        <Text style={styles.title}>Page Not Found</Text>
        <Text style={styles.subtitle}>This page doesn't exist. Head back to the homepage to search for a player.</Text>
        <Link href="/" asChild>
          <Pressable style={styles.button}>
            <Ionicons name="search-outline" size={18} color="#fff" />
            <Text style={styles.buttonText}>Search a Player</Text>
          </Pressable>
        </Link>
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: Colors.dark.cardBackground,
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    maxWidth: 440,
    width: '100%',
  },
  code: {
    fontSize: 72,
    fontWeight: '900',
    color: Colors.dark.faceitOrange,
    marginTop: 12,
    letterSpacing: -4,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.dark.text,
    marginTop: 4,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
    maxWidth: 300,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.dark.faceitOrange,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
});
