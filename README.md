---

## 📈 BullBridge

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

*   **Node.js**: Version 20 or higher.
*   **npm or yarn**: To manage dependencies.
*   **Android Studio / Xcode**: For running on emulators (optional).
*   **Expo Go App**: Download from the App Store or Google Play Store (recommended for quick viewing).

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/your-username/bullbridge.git
    cd bullbridge
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

### 📱 How to View the App

There are three main ways to view and interact with **BullBridge**:

#### 1. Using Expo Go (Simplest & Recommended)
This is the fastest way to see the app on your own physical phone without needing a full development environment.
1.  Ensure your phone and computer are on the **same Wi-Fi network**.
2.  Start the development server:
    ```bash
    npx expo start
    ```
3.  A **QR Code** will appear in your terminal.
4.  Open the **Expo Go** app on your phone and scan the QR code.
5.  Wait a moment for the JavaScript bundle to load, and you're in!

#### 2. Using an Emulator (Android/iOS)
If you have **Android Studio** or **Xcode** installed:
1.  Start the development server:
    ```bash
    npx expo start
    ```
2.  Press **`a`** to open the Android Emulator.
3.  Press **`i`** to open the iOS Simulator (Mac only).

#### 3. Development Build
For deep native testing, you can trigger a local build:
```bash
npm run android
# OR
npm run ios
```

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

> [!CAUTION]
> **Disclaimer**: All AI predictions and targets within this app are for **educational purposes only**. This application is not a registered SEBI financial advisor. Always conduct your own research before making real market trades.

---
