# 📈 BullBridge

**BullBridge** is an AI-powered stock intelligence and portfolio management mobile application built for modern investors. By bridging the gap between traditional market metrics and advanced artificial intelligence, BullBridge delivers a premium, secure, and intuitive trading experience. 

Built beautifully with **React Native (Expo)**, it features interactive TradingView charts, real-time market data indicators, machine-learning powered stock predictions, and seamless OAuth authentication.

---

## ✨ Features

- 🧠 **AI Predictions**: Integrated machine-learning insights (LSTM, XGBoost, and Ensemble models) offering T+1 day target prices and sentiment analysis.
- 📊 **Real-Time Market Tracking**: Live updates for primary indices (Nifty 50, Sensex, Bank Nifty) powered by seamless TradingView continuous future integration.
- 🔐 **Secure Authentication**: Includes robust local session persistence and integrated Google OAuth login configured for Expo's web browsers.
- 📱 **Premium UI/UX**: Features a highly interactive dark-themed interface, fluid native marquee animations (powered by Reanimated), and glassmorphism styling.
- 📰 **Market Sentiment & News**: Built-in news aggregation assigning bullish and bearish sentiment tags intelligently.
- 🔍 **Detailed Stock Analytics**: Dive deep into any Indian stock with dynamic UI views highlighting Pros/Cons, Peer Comparisons, and Financial statements.

## 🛠 Tech Stack

- **Framework**: [React Native](https://reactnative.dev/) & [Expo SDK 55](https://expo.dev/)
- **Navigation**: [Expo Router](https://docs.expo.dev/routing/introduction/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) with Persistent Async Storage 
- **Animations**: [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/)
- **Charting**: Integrated [TradingView](https://www.tradingview.com/) widget architecture
- **Styling**: Context-aware dynamic Theme Provider with structured typography and sizing variables

---

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) (v20+) installed on your machine.
For active Android builds, ensure Android Studio and the Java 21 JDK are configured properly in your workspace.

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/bullbridge.git
   cd bullbridge
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Google OAuth (Optional)**
   Open `app/(auth)/login.tsx` and replace the placeholder `YOUR_ANDROID_CLIENT_ID_HERE` on line 33 with your generated Google Cloud Platform Android Client ID to activate Google login.

### Running the App

Start the Expo Development Server:
```bash
npm run start
```
From here, you can run the app on:
- **iOS Simulator**: Press `i`
- **Android Emulator**: Press `a`
- **Physical Device**: Scan the QR code using the Expo Go app.

---

## 📁 Project Structure

- `/app` - Contains all Expo Router screens (`(tabs)`, `(auth)`, `stock/[ticker].tsx`)
- `/components` - Reusable UI components including the TradingView core widgets
- `/constants` - Theme colors, gradients, layout spacing, and mock data frameworks
- `/stores` - Zustand global state managers (Auth, Stock context, Watchlist, etc.)
- `/types` - Strong TypeScript interfaces governing AI endpoints and market indices schemas

---

## 📜 License & Disclaimers
**BullBridge** was developed primarily as a Hackathon architecture. 
*Disclaimer: All AI predictions and targets within this app are for **educational purposes only**. This application is not a registered SEBI financial advisor. Always conduct your own research before making real market trades.*
