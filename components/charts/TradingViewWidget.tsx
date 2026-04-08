import React, { useMemo } from 'react';
import { View, StyleSheet, ActivityIndicator, TouchableOpacity, Text, Linking } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { ThemeColors } from '../../constants/colors';
import { useTheme } from '../../theme/ThemeProvider';

interface TradingViewWidgetProps {
  ticker: string;
  width?: number | string;
  height?: number | string;
  showExternalLink?: boolean;
}

export function TradingViewWidget({ ticker, width = '100%', height = 300, showExternalLink = true }: TradingViewWidgetProps) {
  const { theme, isDark } = useTheme();
  const styles = getStyles(theme);
  
  // Format ticker for Indian exchanges. If it doesn't already have an exchange prefix,
  // we default to BSE (TradingView format: BSE:RELIANCE or NSE:RELIANCE).
  const symbol = useMemo(() => {
    if (ticker === '^NSEI' || ticker === 'NSEI' || ticker === 'NIFTY 50' || ticker === 'NIFTY') return 'NSE:NIFTY1!';
    if (ticker === '^BSESN' || ticker === 'BSESN' || ticker === 'SENSEX') return 'BSE:SENSEX';
    if (ticker === '^NSEBANK' || ticker === 'NSEBANK' || ticker === 'BANK NIFTY' || ticker === 'NIFTY BANK' || ticker === 'BANK') return 'NSE:BANKNIFTY1!';

    let cleanTicker = ticker.replace('.NS', '').replace('.BO', '');
    if (!cleanTicker.includes(':')) {
      // Defaulting to BSE because NSE actively restricts third-party embedding on free widgets
      return `BSE:${cleanTicker}`;
    }
    return cleanTicker;
  }, [ticker]);

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <style>
          body { margin: 0; padding: 0; background-color: ${theme.background}; overflow: hidden; }
          .tradingview-widget-container, #tradingview_chart { height: 100vh; width: 100vw; }
        </style>
      </head>
      <body>
        <div class="tradingview-widget-container">
          <div id="tradingview_chart"></div>
          <script type="text/javascript" src="https://s3.tradingview.com/tv.js"></script>
          <script type="text/javascript">
            new TradingView.widget({
              "autosize": true,
              "symbol": "${symbol}",
              "interval": "D",
              "timezone": "Asia/Kolkata",
              "theme": "${isDark ? 'dark' : 'light'}",
              "style": "1",
              "locale": "in",
              "enable_publishing": false,
              "backgroundColor": "${theme.background}",
              "gridColor": "${theme.border}",
              "hide_top_toolbar": false,
              "hide_legend": false,
              "save_image": false,
              "container_id": "tradingview_chart"
            });
          </script>
        </div>
      </body>
    </html>
  `;

  return (
    <View style={[{ overflow: 'hidden', borderRadius: 12, backgroundColor: theme.background }, { width: width as any, height: height as any }]}>
      <WebView
        key={symbol} // Force re-render when ticker changes
        source={{ html: htmlContent, baseUrl: 'https://www.tradingview.com' }}
        style={{ flex: 1, backgroundColor: theme.background }}
        scrollEnabled={false}
        bounces={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={[StyleSheet.absoluteFillObject, { justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }]}>
            <ActivityIndicator size="small" color={theme.primary} />
          </View>
        )}
      />
      
      {showExternalLink && (
        <TouchableOpacity 
          style={styles.externalLink}
          onPress={() => Linking.openURL(`https://in.tradingview.com/chart/?symbol=${symbol}`)}
        >
          <Ionicons name="open-outline" size={14} color={theme.primary} />
          <Text style={styles.externalLinkText}>Open Full Chart</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = (theme: ThemeColors) => StyleSheet.create({
  externalLink: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  externalLinkText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  }
});
function getStyles(theme: ThemeColors) {
  return StyleSheet.create({
    externalLink: {
      position: 'absolute',
      bottom: 8,
      right: 8,
      backgroundColor: theme.surface,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 6,
      gap: 4,
      borderWidth: 1,
      borderColor: theme.border,
      zIndex: 10,
    },
    externalLinkText: {
      color: theme.primary,
      fontSize: 10,
      fontWeight: 'bold',
    }
  });
}

