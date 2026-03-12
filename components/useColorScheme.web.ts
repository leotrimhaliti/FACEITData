import { useEffect, useState } from 'react';

type ColorScheme = 'light' | 'dark';

/**
 * Detects the system color scheme preference on web using the
 * `prefers-color-scheme` media query.
 *
 * This replaces the default static implementation to properly
 * detect and respond to system theme changes.
 *
 * @returns The current color scheme ('light' or 'dark')
 */
export function useColorScheme(): ColorScheme {
  const [scheme, setScheme] = useState<ColorScheme>(() => {
    // SSR safety: check if window exists
    if (typeof window === 'undefined') {
      return 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  });

  useEffect(() => {
    // SSR safety: ensure we're in browser environment
    if (typeof window === 'undefined') {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (event: MediaQueryListEvent): void => {
      setScheme(event.matches ? 'dark' : 'light');
    };

    // Modern browsers support addEventListener on MediaQueryList
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return scheme;
}
