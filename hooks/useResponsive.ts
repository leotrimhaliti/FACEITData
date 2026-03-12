import { useWindowDimensions } from 'react-native';

/**
 * Responsive breakpoints for web and mobile layouts.
 * Based on common device widths.
 */
export const BREAKPOINTS = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
  wide: 1440,
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;

export interface ResponsiveInfo {
  /** True when viewport width is below tablet breakpoint (< 768px) */
  isMobile: boolean;
  /** True when viewport is between tablet and desktop (768px - 1023px) */
  isTablet: boolean;
  /** True when viewport width is at or above desktop breakpoint (>= 1024px) */
  isDesktop: boolean;
  /** True when viewport width is at or above wide breakpoint (>= 1440px) */
  isWide: boolean;
  /** Current viewport width in pixels */
  width: number;
  /** Current viewport height in pixels */
  height: number;
  /** Current breakpoint name */
  breakpoint: Breakpoint;
}

/**
 * Hook to detect responsive breakpoints and viewport dimensions.
 * Uses React Native's useWindowDimensions which works on both native and web.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { isDesktop, isMobile } = useResponsive();
 *
 *   if (isDesktop) {
 *     return <DesktopLayout />;
 *   }
 *   return <MobileLayout />;
 * }
 * ```
 */
export function useResponsive(): ResponsiveInfo {
  const { width, height } = useWindowDimensions();

  const isMobile = width < BREAKPOINTS.tablet;
  const isTablet = width >= BREAKPOINTS.tablet && width < BREAKPOINTS.desktop;
  const isDesktop = width >= BREAKPOINTS.desktop;
  const isWide = width >= BREAKPOINTS.wide;

  const breakpoint: Breakpoint = isWide
    ? 'wide'
    : isDesktop
      ? 'desktop'
      : isTablet
        ? 'tablet'
        : 'mobile';

  return {
    isMobile,
    isTablet,
    isDesktop,
    isWide,
    width,
    height,
    breakpoint,
  };
}
