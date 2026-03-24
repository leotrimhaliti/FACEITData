import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Image, Linking, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { ScreenBackground } from '@/components/ScreenBackground';
import { Text } from '@/components/Themed';
import { Colors } from '@/constants/Colors';
import { useResponsive } from '@/hooks/useResponsive';
import { Ionicons } from '@expo/vector-icons';

// Animated scroll indicator component
function ScrollIndicator({ onPress }: { onPress?: () => void }) {
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const bounce = Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 8,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    bounce.start();
    return () => bounce.stop();
  }, [bounceAnim]);

  return (
    <Pressable style={styles.scrollIndicator} onPress={onPress}>
      <Text style={styles.scrollIndicatorText}>Get the mobile app</Text>
      <Animated.View 
        style={[
          styles.scrollArrowContainer,
          { transform: [{ translateY: bounceAnim }] }
        ]}
      >
        <Ionicons name="chevron-down" size={24} color={Colors.dark.faceitOrange} />
      </Animated.View>
    </Pressable>
  );
}

export default function TabOneScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [clickedStore, setClickedStore] = useState<'apple' | 'google' | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const router = useRouter();
  const { isDesktop, isTablet, isMobile, height } = useResponsive();
  const isWeb = Platform.OS === 'web';

  // Set page title on web
  useEffect(() => {
    if (isWeb && typeof document !== 'undefined') {
      document.title = 'FACEITData - Your CS2 Stats, Clean Mode';
    }
  }, [isWeb]);

  const handleSearch = () => {
    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery) return;
    router.push(`/player/${trimmedQuery}`);
  };

  const handleKeyPress = (e: any) => {
    if (e.nativeEvent.key === 'Enter') {
      handleSearch();
    }
  };

  const handleStorePress = (store: 'apple' | 'google') => {
    setClickedStore(store);
    // Reset after 3 seconds
    setTimeout(() => setClickedStore(null), 3000);
  };

  const scrollToPromo = () => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ 
        y: typeof window !== 'undefined' ? window.innerHeight : 800, 
        animated: true 
      });
    }
  };

  // Web version with scrollable content
  if (isWeb) {
    return (
      <ScreenBackground style={styles.container}>
        <ScrollView 
          ref={scrollViewRef}
          style={styles.scrollView} 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Search Section */}
          <View style={[
            styles.searchSection, 
            isMobile && styles.searchSectionMobile,
            isDesktop && styles.searchSectionDesktop
          ]}>
            {/* Logo */}
            <View style={[styles.logoSection, isDesktop && styles.logoSectionDesktop]}>
              <Image
                source={require('../../assets/images/logo.png')}
                style={[
                  styles.logo, 
                  isMobile && styles.logoMobile,
                  isDesktop && styles.logoDesktop
                ]}
                resizeMode="contain"
              />
            </View>

            {/* Main Content */}
            <View style={[styles.mainSection, isDesktop && styles.mainSectionDesktop]}>
              <Text style={[
                styles.title, 
                isMobile && styles.titleMobile,
                isDesktop && styles.titleDesktop
              ]}>
                Track Your{' '}
                <Text style={styles.highlightText}>FACEIT</Text>
                {' '}Stats
              </Text>
              
              <Text style={[
                styles.subtitle, 
                isMobile && styles.subtitleMobile,
                isDesktop && styles.subtitleDesktop
              ]}>
                Search for any player to view their CS2 statistics, match history, and performance metrics.
              </Text>

              {/* Search Box */}
              <View style={[
                styles.searchContainer,
                isMobile && styles.searchContainerMobile,
                (isDesktop || isTablet) && styles.searchContainerDesktop,
                isSearchFocused && styles.searchContainerFocused,
              ]}>
                <Ionicons 
                  name="search" 
                  size={isMobile ? 18 : 22} 
                  color={isSearchFocused ? Colors.dark.faceitOrange : Colors.dark.textMuted} 
                />
                <TextInput
                  style={[
                    styles.searchInput, 
                    styles.searchInputWeb,
                    isMobile && styles.searchInputMobile
                  ]}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder={isMobile ? "FACEIT username..." : "Enter FACEIT username..."}
                  placeholderTextColor={Colors.dark.textMuted}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  onKeyPress={handleKeyPress}
                  onSubmitEditing={handleSearch}
                  returnKeyType="search"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {searchQuery.length > 0 && (
                  <Pressable 
                    onPress={() => setSearchQuery('')} 
                    style={styles.clearButton}
                  >
                    <Ionicons name="close-circle" size={isMobile ? 18 : 20} color={Colors.dark.textMuted} />
                  </Pressable>
                )}
                <Pressable 
                  style={[
                    styles.searchButton, 
                    isMobile && styles.searchButtonMobile,
                    !searchQuery.trim() && styles.searchButtonDisabled
                  ]} 
                  onPress={handleSearch}
                  disabled={!searchQuery.trim()}
                >
                  {isMobile ? (
                    <Ionicons name="arrow-forward" size={18} color="#fff" />
                  ) : (
                    <>
                      <Text style={styles.searchButtonText}>Search</Text>
                      <Ionicons name="arrow-forward" size={18} color="#fff" />
                    </>
                  )}
                </Pressable>
              </View>
            </View>

            {/* Scroll Indicator - Desktop only */}
            {!isMobile && <ScrollIndicator onPress={scrollToPromo} />}
          </View>

          {/* Promotional Section */}
          <View style={[
            styles.promoSection,
            isMobile && styles.promoSectionMobile,
            isDesktop && styles.promoSectionDesktop
          ]}>
              <View style={[
                styles.promoContainer,
                isMobile && styles.promoContainerMobile,
                isDesktop && styles.promoContainerDesktop
              ]}>
                {/* Promo Content */}
                <View style={[
                  styles.promoContent,
                  isMobile && styles.promoContentMobile,
                  isDesktop && styles.promoContentDesktop
                ]}>
                  <Text style={[
                    styles.promoTitle,
                    isMobile && styles.promoTitleMobile,
                    isDesktop && styles.promoTitleDesktop
                  ]}>
                    Your <Text style={styles.highlightText}>FACEIT</Text> data,{'\n'}
                    <Text style={styles.cleanText}>Clean</Text> mode.
                  </Text>
                  <Text style={[
                    styles.promoTagline,
                    isMobile && styles.promoTaglineMobile,
                    isDesktop && styles.promoTaglineDesktop
                  ]}>
                    Track your ELO, analyze match history, and monitor your performance. All your Counter-Strike 2 statistics in one sleek mobile app.
                  </Text>

                  {/* Store Buttons */}
                  <View style={[styles.storeButtons, !isDesktop && styles.storeButtonsMobile]}>
                    <Pressable 
                      style={[
                        styles.storeBtn,
                        isMobile && styles.storeBtnMobile,
                        clickedStore === 'apple' && styles.storeBtnClicked
                      ]} 
                      onPress={() => handleStorePress('apple')}
                    >
                      <Ionicons name="logo-apple" size={28} color={Colors.dark.text} />
                      <View style={styles.storeBtnText}>
                        {clickedStore === 'apple' ? (
                          <>
                            <Text style={styles.storeBtnSmall}>Stay tuned!</Text>
                            <Text style={[styles.storeBtnMain, styles.comingSoonText]}>Coming Soon</Text>
                          </>
                        ) : (
                          <>
                            <Text style={styles.storeBtnSmall}>Download on the</Text>
                            <Text style={styles.storeBtnMain}>App Store</Text>
                          </>
                        )}
                      </View>
                    </Pressable>
                    <Pressable 
                      style={[
                        styles.storeBtn,
                        isMobile && styles.storeBtnMobile,
                        clickedStore === 'google' && styles.storeBtnClicked
                      ]} 
                      onPress={() => handleStorePress('google')}
                    >
                      <Ionicons name="logo-google-playstore" size={28} color={Colors.dark.text} />
                      <View style={styles.storeBtnText}>
                        {clickedStore === 'google' ? (
                          <>
                            <Text style={styles.storeBtnSmall}>Stay tuned!</Text>
                            <Text style={[styles.storeBtnMain, styles.comingSoonText]}>Coming Soon</Text>
                          </>
                        ) : (
                          <>
                            <Text style={styles.storeBtnSmall}>Get it on</Text>
                            <Text style={styles.storeBtnMain}>Google Play</Text>
                          </>
                        )}
                      </View>
                    </Pressable>
                  </View>

                  {/* Features */}
                  <View style={[styles.features, !isDesktop && styles.featuresMobile]}>
                    <View style={[styles.featureItem, isMobile && styles.featureItemMobile]}>
                      <View style={[styles.featureIcon, isMobile && styles.featureIconMobile]}>
                        <Ionicons name="bar-chart-outline" size={18} color={Colors.dark.faceitOrange} />
                      </View>
                      <Text style={[styles.featureText, isMobile && styles.featureTextMobile]}>Live Stats</Text>
                    </View>
                    <View style={[styles.featureItem, isMobile && styles.featureItemMobile]}>
                      <View style={[styles.featureIcon, isMobile && styles.featureIconMobile]}>
                        <Ionicons name="time-outline" size={18} color={Colors.dark.faceitOrange} />
                      </View>
                      <Text style={[styles.featureText, isMobile && styles.featureTextMobile]}>Match History</Text>
                    </View>
                    <View style={[styles.featureItem, isMobile && styles.featureItemMobile]}>
                      <View style={[styles.featureIcon, isMobile && styles.featureIconMobile]}>
                        <Ionicons name="heart-outline" size={18} color={Colors.dark.faceitOrange} />
                      </View>
                      <Text style={[styles.featureText, isMobile && styles.featureTextMobile]}>Favorites</Text>
                    </View>
                  </View>
                </View>

                {/* Phone Mockup - Desktop Only */}
                {isDesktop && (
                  <View style={styles.mockupContainer}>
                    <View style={styles.phoneMockup}>
                      <View style={styles.phoneNotch} />
                      <View style={styles.phoneScreen}>
                        {/* App Header */}
                        <View style={styles.appHeader}>
                          <Image
                            source={require('../../assets/images/faceitimg.jpeg')}
                            style={styles.appAvatar}
                          />
                          <View style={styles.appUserInfo}>
                            <Text style={styles.appUsername}>leo</Text>
                            <View style={styles.appLevel}>
                              <View style={styles.levelBadge}>
                                <Text style={styles.levelBadgeText}>Level 10</Text>
                              </View>
                              <Text style={styles.eloText}>2,847 ELO</Text>
                            </View>
                          </View>
                        </View>

                        {/* Stats Row */}
                        <View style={styles.appStats}>
                          <View style={styles.statCard}>
                            <Text style={styles.statValue}>1.34</Text>
                            <Text style={styles.statLabel}>K/D Ratio</Text>
                          </View>
                          <View style={styles.statCard}>
                            <Text style={styles.statValue}>58%</Text>
                            <Text style={styles.statLabel}>Win Rate</Text>
                          </View>
                          <View style={styles.statCard}>
                            <Text style={styles.statValue}>1,247</Text>
                            <Text style={styles.statLabel}>Matches</Text>
                          </View>
                        </View>

                        {/* Recent Matches */}
                        <Text style={styles.matchesTitle}>Recent Matches</Text>
                        <View style={[styles.appMatch, styles.appMatchWin]}>
                          <View style={styles.matchMap}>
                            <Text style={styles.matchMapName}>de_mirage</Text>
                            <Text style={styles.matchMode}>5v5 Premium</Text>
                          </View>
                          <View style={styles.matchResult}>
                            <Text style={[styles.matchResultText, styles.winText]}>WIN</Text>
                            <Text style={styles.matchScore}>16-12</Text>
                          </View>
                          <View style={styles.matchKd}>
                            <Text style={[styles.matchKdValue, styles.winText]}>1.45</Text>
                            <Text style={styles.matchKdLabel}>K/D</Text>
                          </View>
                        </View>
                        <View style={[styles.appMatch, styles.appMatchLoss]}>
                          <View style={styles.matchMap}>
                            <Text style={styles.matchMapName}>de_inferno</Text>
                            <Text style={styles.matchMode}>5v5 Premium</Text>
                          </View>
                          <View style={styles.matchResult}>
                            <Text style={[styles.matchResultText, styles.lossText]}>LOSS</Text>
                            <Text style={styles.matchScore}>13-16</Text>
                          </View>
                          <View style={styles.matchKd}>
                            <Text style={[styles.matchKdValue, styles.lossText]}>0.87</Text>
                            <Text style={styles.matchKdLabel}>K/D</Text>
                          </View>
                        </View>
                        <View style={[styles.appMatch, styles.appMatchWin]}>
                          <View style={styles.matchMap}>
                            <Text style={styles.matchMapName}>de_anubis</Text>
                            <Text style={styles.matchMode}>5v5 Premium</Text>
                          </View>
                          <View style={styles.matchResult}>
                            <Text style={[styles.matchResultText, styles.winText]}>WIN</Text>
                            <Text style={styles.matchScore}>16-9</Text>
                          </View>
                          <View style={styles.matchKd}>
                            <Text style={[styles.matchKdValue, styles.winText]}>1.92</Text>
                            <Text style={styles.matchKdLabel}>K/D</Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  </View>
                )}
              </View>
            </View>

          {/* Footer */}
          <View style={[styles.webFooter, isMobile && styles.webFooterMobile]}>
            <Pressable 
              style={[styles.supportButton, isMobile && styles.supportButtonMobile]}
              onPress={() => Linking.openURL('https://ko-fi.com/leotrimhaliti')}
            >
              <Ionicons name="heart" size={isMobile ? 14 : 16} color={Colors.dark.faceitOrange} />
              <Text style={[styles.supportButtonText, isMobile && styles.supportButtonTextMobile]}>Support the Developer</Text>
            </Pressable>
            <Text style={[styles.footerText, isMobile && styles.footerTextMobile]}>
              Made with love for the FACEIT community
            </Text>
          </View>
        </ScrollView>
      </ScreenBackground>
    );
  }

  // Mobile version (unchanged)
  return (
    <ScreenBackground style={styles.container}>
      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoSection}>
          <Image
            source={require('../../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Main Content */}
        <View style={styles.mainSection}>
          <Text style={styles.title}>
            Track Your{' '}
            <Text style={styles.highlightText}>FACEIT</Text>
            {' '}Stats
          </Text>
          
          <Text style={styles.subtitle}>
            Search for any player to view their CS2 statistics, match history, and performance metrics.
          </Text>

          {/* Search Box */}
          <View style={[
            styles.searchContainer,
            isSearchFocused && styles.searchContainerFocused,
          ]}>
            <Ionicons 
              name="search" 
              size={22} 
              color={isSearchFocused ? Colors.dark.faceitOrange : Colors.dark.textMuted} 
            />
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Enter FACEIT username..."
              placeholderTextColor={Colors.dark.textMuted}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              onKeyPress={handleKeyPress}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <Pressable 
                onPress={() => setSearchQuery('')} 
                style={styles.clearButton}
              >
                <Ionicons name="close-circle" size={20} color={Colors.dark.textMuted} />
              </Pressable>
            )}
            <Pressable 
              style={[styles.searchButton, !searchQuery.trim() && styles.searchButtonDisabled]} 
              onPress={handleSearch}
              disabled={!searchQuery.trim()}
            >
              <Text style={styles.searchButtonText}>Search</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </Pressable>
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
  contentDesktop: {
    maxWidth: 800,
    alignSelf: 'center',
    width: '100%',
    paddingHorizontal: 40,
  },
  // Web scroll styles
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  // Search section
  searchSection: {
    minHeight: '100dvh' as any,
    justifyContent: 'center',
    padding: 20,
    paddingBottom: 120, // Push content up to account for scroll indicator
  },
  searchSectionMobile: {
    minHeight: '100dvh' as any,
    padding: 16,
    paddingVertical: 20,
    justifyContent: 'center',
  },
  searchSectionDesktop: {
    maxWidth: 800,
    alignSelf: 'center',
    width: '100%',
    paddingHorizontal: 40,
    paddingBottom: 140,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoSectionDesktop: {
    marginBottom: 40,
  },
  logo: {
    width: 280,
    height: 80,
  },
  logoMobile: {
    width: 200,
    height: 60,
  },
  logoDesktop: {
    width: 400,
    height: 100,
  },
  mainSection: {
    alignItems: 'center',
  },
  mainSectionDesktop: {
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.dark.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  titleMobile: {
    fontSize: 20,
    marginBottom: 10,
  },
  titleDesktop: {
    fontSize: 42,
    marginBottom: 16,
    letterSpacing: -1,
  },
  highlightText: {
    color: Colors.dark.faceitOrange,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
    maxWidth: 400,
  },
  subtitleMobile: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 24,
    maxWidth: 300,
    paddingHorizontal: 8,
  },
  subtitleDesktop: {
    fontSize: 18,
    lineHeight: 28,
    maxWidth: 600,
    marginBottom: 40,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.cardBackground,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    width: '100%',
    maxWidth: 500,
    borderWidth: 2,
    borderColor: 'transparent',
    gap: 12,
  },
  searchContainerMobile: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 8,
    borderRadius: 10,
  },
  searchContainerDesktop: {
    maxWidth: 600,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 16,
  },
  searchContainerFocused: {
    borderColor: Colors.dark.faceitOrange,
    backgroundColor: 'rgba(255, 85, 0, 0.05)',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.dark.text,
    paddingVertical: 8,
  },
  searchInputMobile: {
    fontSize: 14,
    paddingVertical: 6,
  },
  searchInputWeb: {
    outlineStyle: 'none',
  } as any,
  clearButton: {
    padding: 4,
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.dark.faceitOrange,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  searchButtonMobile: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },
  searchButtonDisabled: {
    opacity: 0.5,
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  tipsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 32,
    marginTop: 48,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tipText: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
  },
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: Colors.dark.textMuted,
  },
  // Scroll indicator styles
  scrollIndicator: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  scrollIndicatorText: {
    fontSize: 13,
    color: Colors.dark.textMuted,
    marginBottom: 8,
    fontWeight: '500',
  },
  scrollArrowContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 85, 0, 0.3)',
    backgroundColor: 'rgba(255, 85, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Promotional section styles
  promoSection: {
    minHeight: '100vh' as any,
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#1F1F1F',
  },
  promoSectionMobile: {
    minHeight: 'auto' as any,
    paddingVertical: 40,
    paddingHorizontal: 16,
  },
  promoSectionDesktop: {
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  promoContainer: {
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
  },
  promoContainerMobile: {
    maxWidth: 420,
  },
  promoContainerDesktop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 80,
  },
  promoContent: {
    flex: 1,
    maxWidth: 520,
    alignItems: 'center',
  },
  promoContentMobile: {
    maxWidth: 420,
    alignSelf: 'center',
  },
  promoContentDesktop: {
    alignItems: 'flex-start',
  },
  promoTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.dark.text,
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: -1,
    lineHeight: 40,
  },
  promoTitleMobile: {
    fontSize: 24,
    lineHeight: 32,
    marginBottom: 16,
  },
  promoTitleDesktop: {
    fontSize: 48,
    textAlign: 'left',
    lineHeight: 56,
    letterSpacing: -2,
  },
  cleanText: {
    color: '#67a8f4',
  },
  promoTagline: {
    fontSize: 16,
    color: Colors.dark.textMuted,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 26,
  },
  promoTaglineMobile: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  promoTaglineDesktop: {
    fontSize: 18,
    textAlign: 'left',
    lineHeight: 28,
    marginBottom: 40,
  },
  storeButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  storeButtonsMobile: {
    flexDirection: 'column',
    width: '100%',
    alignItems: 'center',
    gap: 12,
  },
  storeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: '#1F1F1F',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 14,
  },
  storeBtnMobile: {
    width: 220,
    paddingVertical: 12,
    paddingHorizontal: 20,
    gap: 12,
    borderRadius: 12,
    justifyContent: 'center',
  },
  storeBtnText: {
    alignItems: 'flex-start',
  },
  storeBtnSmall: {
    fontSize: 10,
    color: Colors.dark.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '500',
  },
  storeBtnMain: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.text,
    marginTop: 2,
  },
  storeBtnClicked: {
    borderColor: Colors.dark.faceitOrange,
    backgroundColor: 'rgba(255, 85, 0, 0.1)',
  },
  comingSoonText: {
    color: Colors.dark.faceitOrange,
  },
  features: {
    flexDirection: 'row',
    gap: 24,
    marginTop: 32,
    paddingTop: 32,
    borderTopWidth: 1,
    borderTopColor: '#1F1F1F',
  },
  featuresMobile: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginTop: 24,
    paddingTop: 24,
    flexWrap: 'wrap',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  featureItemMobile: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 6,
    minWidth: 80,
  },
  featureIcon: {
    width: 36,
    height: 36,
    backgroundColor: 'rgba(255, 85, 0, 0.1)',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureIconMobile: {
    width: 40,
    height: 40,
    borderRadius: 12,
  },
  featureText: {
    fontSize: 13,
    color: Colors.dark.textMuted,
    fontWeight: '500',
  },
  featureTextMobile: {
    fontSize: 11,
    textAlign: 'center',
  },
  // Phone mockup styles
  mockupContainer: {
    flexShrink: 0,
  },
  phoneMockup: {
    width: 280,
    height: 580,
    backgroundColor: '#1a1a1a',
    borderRadius: 40,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 50 },
    shadowOpacity: 0.5,
    shadowRadius: 100,
    position: 'relative',
  },
  phoneNotch: {
    position: 'absolute',
    top: 16,
    left: '50%',
    marginLeft: -40,
    width: 80,
    height: 24,
    backgroundColor: '#000',
    borderRadius: 20,
    zIndex: 20,
  },
  phoneScreen: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    borderRadius: 30,
    overflow: 'hidden',
  },
  appHeader: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 16,
    paddingTop: 50,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  appAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: Colors.dark.faceitOrange,
  },
  appUserInfo: {
    flex: 1,
  },
  appUsername: {
    fontWeight: '700',
    fontSize: 16,
    color: Colors.dark.text,
    marginBottom: 4,
  },
  appLevel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  levelBadge: {
    backgroundColor: Colors.dark.faceitOrange,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  levelBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },
  eloText: {
    fontSize: 12,
    color: Colors.dark.textMuted,
  },
  appStats: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#141414',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1F1F1F',
  },
  statValue: {
    fontFamily: 'monospace',
    fontSize: 18,
    fontWeight: '700',
    color: Colors.dark.faceitOrange,
  },
  statLabel: {
    fontSize: 9,
    color: Colors.dark.textMuted,
    textTransform: 'uppercase',
    marginTop: 4,
    letterSpacing: 0.5,
  },
  matchesTitle: {
    fontSize: 12,
    color: Colors.dark.textMuted,
    paddingHorizontal: 16,
    marginBottom: 8,
    fontWeight: '600',
  },
  appMatch: {
    marginHorizontal: 12,
    marginBottom: 8,
    backgroundColor: '#141414',
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 3,
  },
  appMatchWin: {
    borderLeftColor: Colors.dark.winGreen,
  },
  appMatchLoss: {
    borderLeftColor: Colors.dark.lossRed,
  },
  matchMap: {
    flex: 1,
  },
  matchMapName: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.dark.text,
  },
  matchMode: {
    fontSize: 9,
    color: Colors.dark.textMuted,
    textTransform: 'uppercase',
  },
  matchResult: {
    alignItems: 'center',
    minWidth: 50,
  },
  matchResultText: {
    fontSize: 10,
    fontWeight: '800',
  },
  winText: {
    color: Colors.dark.winGreen,
  },
  lossText: {
    color: Colors.dark.lossRed,
  },
  matchScore: {
    fontSize: 10,
    color: Colors.dark.textMuted,
  },
  matchKd: {
    alignItems: 'flex-end',
    minWidth: 45,
  },
  matchKdValue: {
    fontFamily: 'monospace',
    fontSize: 12,
    fontWeight: '700',
  },
  matchKdLabel: {
    fontSize: 8,
    color: Colors.dark.textMuted,
  },
  webFooter: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 16,
  },
  webFooterMobile: {
    paddingVertical: 30,
    gap: 12,
  },
  supportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 85, 0, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 85, 0, 0.3)',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 100,
  },
  supportButtonMobile: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    gap: 6,
  },
  supportButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark.text,
  },
  supportButtonTextMobile: {
    fontSize: 13,
  },
  footerTextMobile: {
    fontSize: 11,
  },
});
