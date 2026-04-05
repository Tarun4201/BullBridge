/**
 * Bull Bridge — Login Screen
 * Dark themed with gradient, email/password + Google sign-in
 */

import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ThemeColors, getGradients } from '../../constants/colors';
import { useTheme } from '../../theme/ThemeProvider';
import { Typography, Spacing, BorderRadius } from '../../constants/theme';
import { useAuthStore } from '../../stores/authStore';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';

WebBrowser.maybeCompleteAuthSession();

const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const Gradients = getGradients(theme);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, googleLogin, isLoading } = useAuthStore();
  const [googleStatus, setGoogleStatus] = useState<string | null>(null);

  // PLACEHOLDER: Replace this with your actual Android Client ID from Google Cloud Console
  const GOOGLE_ANDROID_CLIENT_ID = 'YOUR_ANDROID_CLIENT_ID_HERE.apps.googleusercontent.com';

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: GOOGLE_ANDROID_CLIENT_ID,
    // Add webClientId or iosClientId if deploying to those platforms
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      if (authentication?.accessToken) {
        fetchUserInfo(authentication.accessToken);
      }
    } else if (response?.type === 'error') {
      setGoogleStatus('Google Sign In failed. Try again.');
    }
  }, [response]);

  const fetchUserInfo = async (token: string) => {
    try {
      const res = await fetch('https://www.googleapis.com/userinfo/v2/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const user = await res.json();
      
      const success = await googleLogin(user.name, user.email, user.picture);
      if (success) {
        router.replace('/(tabs)');
      }
    } catch (error) {
      setGoogleStatus('Failed to retrieve user data.');
    }
  };

  const handleLogin = async () => {
    if (!email || !password) return;
    const success = await login(email, password);
    if (success) {
      router.replace('/(tabs)');
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleStatus(null);
    if (!request) {
       setGoogleStatus('Google authentication is loading or not configured.');
       return;
    }
    await promptAsync();
  };

  return (
    <LinearGradient colors={[theme.background, theme.surface, theme.background]} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        {/* Neural Network Background Dots */}
        <View style={styles.dotsContainer}>
          {Array.from({ length: 20 }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  left: Math.random() * width,
                  top: Math.random() * 300,
                  opacity: 0.1 + Math.random() * 0.2,
                  width: 2 + Math.random() * 3,
                  height: 2 + Math.random() * 3,
                },
              ]}
            />
          ))}
        </View>

        {/* Logo Section */}
        <View style={styles.logoSection}>
          <View style={styles.logoContainer}>
            <LinearGradient
              colors={[...Gradients.primary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.logoGradient}
            >
              <Ionicons name="trending-up" size={36} color={theme.textInverse} />
            </LinearGradient>
          </View>
          <Text style={styles.appName}>BullBridge</Text>
          <Text style={styles.tagline}>AI-Powered Stock Intelligence</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color={theme.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email address"
              placeholderTextColor={theme.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color={theme.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={theme.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={theme.textMuted} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleLogin} disabled={isLoading} activeOpacity={0.85}>
            <LinearGradient
              colors={[...Gradients.primary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.loginButton}
            >
              {isLoading ? (
                <ActivityIndicator color={theme.textInverse} />
              ) : (
                <Text style={styles.loginButtonText}>Sign In</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social Login */}
          <TouchableOpacity style={styles.socialButton} onPress={handleGoogleLogin} activeOpacity={0.8} disabled={isLoading || !request}>
            {isLoading ? <ActivityIndicator color={theme.textPrimary} /> : (
              <>
                <Ionicons name="logo-google" size={22} color={theme.textPrimary} />
                <Text style={styles.socialButtonText}>Google</Text>
              </>
            )}
          </TouchableOpacity>

          {googleStatus && (
            <Text style={{ color: theme.warning, textAlign: 'center', marginTop: Spacing.xs, fontSize: Typography.sm }}>
              {googleStatus}
            </Text>
          )}

          {/* Sign Up Link */}
          <View style={styles.signUpRow}>
            <Text style={styles.signUpText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
              <Text style={styles.signUpLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

function getStyles(theme: ThemeColors) {
  return StyleSheet.create({
    container: { flex: 1 },
    content: { flex: 1, justifyContent: 'center', paddingHorizontal: Spacing.xl },
    dotsContainer: { position: 'absolute', top: 0, left: 0, right: 0, height: 300 },
    dot: { position: 'absolute', borderRadius: 999, backgroundColor: theme.primary },
    logoSection: { alignItems: 'center', marginBottom: Spacing['2xl'] },
    logoContainer: { marginBottom: Spacing.md },
    logoGradient: {
      width: 72, height: 72, borderRadius: BorderRadius.xl,
      alignItems: 'center', justifyContent: 'center',
    },
    appName: {
      fontSize: Typography['4xl'], fontWeight: Typography.extrabold,
      color: theme.textPrimary, letterSpacing: 1,
    },
    tagline: {
      fontSize: Typography.base, color: theme.textSecondary,
      marginTop: Spacing.xs,
    },
    form: { gap: Spacing.base },
    inputContainer: {
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: theme.surface, borderRadius: BorderRadius.lg,
      borderWidth: 1, borderColor: theme.border,
      paddingHorizontal: Spacing.base, height: 56,
    },
    inputIcon: { marginRight: Spacing.md },
    input: {
      flex: 1, color: theme.textPrimary, fontSize: Typography.md,
    },
    eyeIcon: { padding: Spacing.xs },
    forgotPassword: { alignSelf: 'flex-end' },
    forgotPasswordText: { color: theme.primary, fontSize: Typography.sm },
    loginButton: {
      height: 56, borderRadius: BorderRadius.lg,
      alignItems: 'center', justifyContent: 'center',
      marginTop: Spacing.sm,
    },
    loginButtonText: {
      color: theme.textInverse, fontSize: Typography.lg,
      fontWeight: Typography.bold,
    },
    divider: {
      flexDirection: 'row', alignItems: 'center',
      marginVertical: Spacing.sm,
    },
    dividerLine: { flex: 1, height: 1, backgroundColor: theme.border },
    dividerText: {
      color: theme.textMuted, fontSize: Typography.sm,
      marginHorizontal: Spacing.md,
    },
    socialButton: {
      height: 52, borderRadius: BorderRadius.lg,
      backgroundColor: theme.surface, borderWidth: 1,
      borderColor: theme.border, flexDirection: 'row',
      alignItems: 'center', justifyContent: 'center', gap: Spacing.sm,
    },
    socialButtonText: {
      color: theme.textPrimary, fontSize: Typography.md,
      fontWeight: Typography.semibold,
    },
    signUpRow: {
      flexDirection: 'row', justifyContent: 'center',
      marginTop: Spacing.md,
    },
    signUpText: { color: theme.textSecondary, fontSize: Typography.base },
    signUpLink: {
      color: theme.primary, fontSize: Typography.base,
      fontWeight: Typography.semibold,
    },
  });
}
