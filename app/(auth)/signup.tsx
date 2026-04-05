/**
 * Bull Bridge — Sign Up Screen
 */

import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ThemeColors, getGradients } from '../../constants/colors';
import { useTheme } from '../../theme/ThemeProvider';
import { Typography, Spacing, BorderRadius } from '../../constants/theme';
import { useAuthStore } from '../../stores/authStore';

export default function SignUpScreen() {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const Gradients = getGradients(theme);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const { signUp, isLoading } = useAuthStore();

  const handleSignUp = async () => {
    if (!name || !email || !password || !confirmPassword || !agreedTerms) return;
    if (password !== confirmPassword) return;
    const success = await signUp(name, email, password);
    if (success) {
      router.back(); // Route back to the SignIn page safely
    }
  };

  return (
    <LinearGradient colors={[theme.background, theme.surface, theme.background]} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Back button */}
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
          </TouchableOpacity>

          <View style={styles.headerSection}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Start your AI-powered investing journey</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color={theme.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor={theme.textMuted}
                value={name}
                onChangeText={setName}
              />
            </View>

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
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={theme.textMuted} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="shield-checkmark-outline" size={20} color={theme.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                placeholderTextColor={theme.textMuted}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showPassword}
              />
            </View>

            {/* Password requirements */}
            <View style={styles.requirements}>
              <Text style={[styles.reqText, password.length >= 8 && styles.reqMet]}>
                {password.length >= 8 ? '✓' : '○'} Min 8 characters
              </Text>
              <Text style={[styles.reqText, /[A-Z]/.test(password) && styles.reqMet]}>
                {/[A-Z]/.test(password) ? '✓' : '○'} 1 uppercase letter
              </Text>
              <Text style={[styles.reqText, /[0-9]/.test(password) && styles.reqMet]}>
                {/[0-9]/.test(password) ? '✓' : '○'} 1 number
              </Text>
            </View>

            {/* Terms checkbox */}
            <TouchableOpacity
              style={styles.termsRow}
              onPress={() => setAgreedTerms(!agreedTerms)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, agreedTerms && styles.checkboxChecked]}>
                {agreedTerms && <Ionicons name="checkmark" size={14} color={theme.textInverse} />}
              </View>
              <Text style={styles.termsText}>
                I agree to the <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
                <Text style={styles.termsLink}>Privacy Policy</Text>
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleSignUp} disabled={isLoading} activeOpacity={0.85}>
              <LinearGradient
                colors={[...Gradients.primary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.signUpButton, (!agreedTerms || !name || !email || !password) && styles.buttonDisabled]}
              >
                {isLoading ? (
                  <ActivityIndicator color={theme.textInverse} />
                ) : (
                  <Text style={styles.signUpButtonText}>Create Account</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.loginRow}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.back()}>
                <Text style={styles.loginLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

function getStyles(theme: ThemeColors) {
  return StyleSheet.create({
    container: { flex: 1 },
    content: { paddingHorizontal: Spacing.xl, paddingTop: 60, paddingBottom: 40 },
    backButton: { marginBottom: Spacing.lg },
    headerSection: { marginBottom: Spacing['2xl'] },
    title: {
      fontSize: Typography['3xl'], fontWeight: Typography.extrabold,
      color: theme.textPrimary,
    },
    subtitle: {
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
    input: { flex: 1, color: theme.textPrimary, fontSize: Typography.md },
    requirements: { gap: Spacing.xs },
    reqText: { color: theme.textMuted, fontSize: Typography.sm },
    reqMet: { color: theme.bullish },
    termsRow: {
      flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    },
    checkbox: {
      width: 22, height: 22, borderRadius: 6,
      borderWidth: 2, borderColor: theme.textMuted,
      alignItems: 'center', justifyContent: 'center',
    },
    checkboxChecked: {
      backgroundColor: theme.primary, borderColor: theme.primary,
    },
    termsText: { flex: 1, color: theme.textSecondary, fontSize: Typography.sm },
    termsLink: { color: theme.primary },
    signUpButton: {
      height: 56, borderRadius: BorderRadius.lg,
      alignItems: 'center', justifyContent: 'center',
      marginTop: Spacing.sm,
    },
    buttonDisabled: { opacity: 0.5 },
    signUpButtonText: {
      color: theme.textInverse, fontSize: Typography.lg,
      fontWeight: Typography.bold,
    },
    loginRow: {
      flexDirection: 'row', justifyContent: 'center',
      marginTop: Spacing.md,
    },
    loginText: { color: theme.textSecondary, fontSize: Typography.base },
    loginLink: { color: theme.primary, fontSize: Typography.base, fontWeight: Typography.semibold },
  });
}

