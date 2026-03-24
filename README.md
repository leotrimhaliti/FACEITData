# FACEITData

A FACEIT CS2 player statistics tracker built with Expo (React Native) featuring a full responsive web experience deployed at [faceitdata.com](https://faceitdata.com).

## Features

- 🔍 Search any FACEIT player by username
- 📊 View lifetime stats: K/D, Win Rate, Headshot %, Matches
- 📈 ELO progression tracker with next level indicator
- 🗂 Full match history with map, score, and K/D per game
- 🌑 Clean dark mode UI designed for mobile and desktop
- 📱 Available on iOS and Android (coming soon)

## Tech Stack

- **Framework**: Expo (React Native SDK)
- **Routing**: Expo Router (shared Mobile/Web)
- **Styling**: React Native StyleSheet + NativeWind responsive hooks
- **API**: FACEIT Data API v4
- **Deployment**: Netlify (web) / EAS Build (mobile)

## Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Set up your environment
Create a `.env` file in the root directory:
```
EXPO_PUBLIC_FACEIT_API_KEY=your_api_key_here
```
Get your free API key at [developers.faceit.com](https://developers.faceit.com).

### 3. Run locally
```bash
# Mobile
npx expo start

# Web
npm run web
```

### 4. Deploy to production (Web)
```bash
npm run build:web
```
The output will be in the `dist/` folder. The included `netlify.toml` handles build settings automatically.

## Environment Variables

| Key | Description |
|---|---|
| `EXPO_PUBLIC_FACEIT_API_KEY` | Your FACEIT Data API key (required) |

> ⚠️ **Never commit your `.env` file.** It is already included in `.gitignore`.

## Contributing

Pull requests are welcome! For major changes, open an issue first to discuss what you'd like to change.

## License

MIT
