import React, { useMemo } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { ThemeColors } from '../../constants/colors';
import { useTheme } from '../../theme/ThemeProvider';

interface TradingViewWidgetProps {
  ticker: string;
  width?: number | string;
  height?: number | string;
}

export function TradingViewWidget({ ticker, width = '100%', height = 300 }: TradingViewWidgetProps) {
  const { theme, isDark } = useTheme();
  
  // Format ticker for Indian exchanges. If it doesn't already have an exchange prefix,
  // we default to BSE (TradingView format: BSE:RELIANCE or NSE:RELIANCE).
  const symbol = useMemo(() => {
    if (ticker === '^NSEI' || ticker === 'NSEI') return 'NSE:NIFTY1!';
    if (ticker === '^BSESN' || ticker === 'BSESN') return 'BSE:SENSEX';
    if (ticker === '^NSEBANK' || ticker === 'NSEBANK') return 'NSE:BANKNIFTY1!';

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
    </View>
  );
}

