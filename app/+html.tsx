import { ScrollViewStyleReset } from 'expo-router/html';

// This file is web-only and used to configure the root HTML for every
// web page during static rendering.
// The contents of this function only run in Node.js environments and
// do not have access to the DOM or browser APIs.
export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        
        <title>FACEITData | Track CS2 Stats & ELO</title>
        <meta name="description" content="Search for any player to track their FACEIT CS2 statistics, ELO progression, win rate, and match history. Clean mode UI." />
        <meta name="keywords" content="faceit, cs2, stats, elo, tracker, match history, counter-strike 2" />
        <meta name="theme-color" content="#121212" />
        
        {/* Open Graph / Facebook / Discord */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://faceitdata.com/" />
        <meta property="og:title" content="FACEITData | Track CS2 Stats & ELO" />
        <meta property="og:description" content="Search for any player to track their FACEIT CS2 statistics, ELO progression, and match history." />
        <meta property="og:image" content="https://faceitdata.com/favicon.png" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://faceitdata.com/" />
        <meta property="twitter:title" content="FACEITData | Track CS2 Stats & ELO" />
        <meta property="twitter:description" content="Search for any player to track their FACEIT CS2 statistics, ELO progression, and match history." />
        <meta property="twitter:image" content="https://faceitdata.com/favicon.png" />

        <link rel="icon" type="image/png" href="/favicon.png" />
        <link rel="canonical" href="https://faceitdata.com/" />
        <link rel="manifest" href="/manifest.json" />

        {/* 
          Disable body scrolling on web. This makes ScrollView components work closer to how they do on native. 
          However, body scrolling is often nice to have for mobile web. If you want to enable it, remove this line.
        */}
        <ScrollViewStyleReset />

        {/* Using raw CSS styles as an escape-hatch to ensure the background color never flickers in dark-mode. */}
        <style dangerouslySetInnerHTML={{ __html: responsiveBackground }} />
        {/* Add any additional <head> elements that you want globally available on web... */}
      </head>
      <body>{children}</body>
    </html>
  );
}

const responsiveBackground = `
body {
  background-color: #fff;
}
@media (prefers-color-scheme: dark) {
  body {
    background-color: #000;
  }
}`;
