/**
 * Bull Bridge — Profile Screen
 * User profile, settings, experience level selector, sector interests
 */

import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  Modal, FlatList, Pressable, TextInput, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ThemeColors, getGradients } from '../../constants/colors';
import { useTheme } from '../../theme/ThemeProvider';
import { Typography, Spacing, BorderRadius } from '../../constants/theme';
import { useAuthStore } from '../../stores/authStore';
import { ExperienceLevel } from '../../types';
import { PermissionHandler } from '../../utils/permissionHandler';

interface MenuItem {
  icon: string;
  label: string;
  color: string;
  trailing?: string;
  onPress: () => void;
}

const EXPERIENCE_LEVELS: ExperienceLevel[] = ['Beginner', 'Intermediate', 'Advanced'];
const ALL_SECTORS = ['IT & Tech', 'Banking', 'Auto', 'Energy', 'Pharma', 'FMCG', 'Metals', 'Real Estate'];

export default function ProfileScreen() {
  const { theme, isDark, toggleTheme } = useTheme();
  const styles = getStyles(theme);
  const Gradients = getGradients(theme);
  const { user, logout, updateProfile } = useAuthStore();
  
  const [showLevelModal, setShowLevelModal] = useState(false);
  const [showSectorModal, setShowSectorModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const handleLogout = () => {
    logout();
    router.replace('/(auth)/login');
  };

  const showSecurityAlert = () => {
    Alert.alert(
      'Security Information',
      'This app is for educational purposes only. Market data and AI predictions are not financial advice.',
      [{ text: 'I Understand' }]
    );
  };

  const menuSections: { title: string; items: MenuItem[] }[] = [
    {
      title: 'Account',
      items: [
        { icon: 'school-outline', label: 'Experience Level', color: theme.primary, trailing: user?.experienceLevel, onPress: () => setShowLevelModal(true) },
        { icon: 'cube-outline', label: 'Sector Interests', color: theme.bullish, trailing: `${user?.sectors?.length || 0} selected`, onPress: () => setShowSectorModal(true) },
        { 
          icon: 'notifications-outline', 
          label: 'Notification Access', 
          color: theme.warning, 
          onPress: async () => {
             const granted = await PermissionHandler.requestNotificationPermission();
             if (granted) alert('Notification access granted!');
          } 
        },
      ],
    },
    {
      title: 'App Settings',
      items: [
        { 
          icon: isDark ? 'sunny-outline' : 'moon-outline', 
          label: isDark ? 'Light Theme' : 'Dark Theme', 
          color: theme.neuralPurple, 
          trailing: isDark ? 'Off' : 'Active',
          onPress: toggleTheme 
        },
        { icon: 'language-outline', label: 'Language', color: theme.info, trailing: 'English', onPress: () => {} },
      ],
    },
    {
      title: 'Support & Legal',
      items: [
        { icon: 'shield-checkmark-outline', label: 'Security', color: theme.primary, onPress: showSecurityAlert },
        { icon: 'document-text-outline', label: 'Privacy Policy', color: theme.textSecondary, onPress: () => router.push('/legal/privacy') },
        { icon: 'information-circle-outline', label: 'Terms of Service', color: theme.textSecondary, onPress: () => router.push('/legal/terms') },
        { icon: 'shield-outline', label: 'SEBI Disclaimer', color: theme.warning, onPress: () => router.push('/legal/disclaimer') },
      ],
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.content} 
        showsVerticalScrollIndicator={false}
      >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      {/* User Card */}
      <View style={styles.userCard}>
        <LinearGradient
          colors={['rgba(0, 212, 255, 0.1)', 'rgba(179, 136, 255, 0.1)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.userCardGradient}
        >
          <TouchableOpacity style={styles.avatar} onPress={() => setShowEditModal(true)}>
            <LinearGradient
              colors={[...Gradients.primary]}
              style={styles.avatarGradient}
            >
              <Text style={styles.avatarText}>
                {user?.name?.charAt(0) || 'A'}
              </Text>
              <View style={styles.editIconBadge}>
                 <Ionicons name="pencil" size={10} color={theme.textInverse} />
              </View>
            </LinearGradient>
          </TouchableOpacity>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.name || 'Demo User'}</Text>
            <Text style={styles.userEmail}>{user?.email || 'demo@bullbridge.app'}</Text>
            <View style={styles.levelBadge}>
              <Ionicons name="school-outline" size={12} color={theme.primary} />
              <Text style={styles.levelText}>{user?.experienceLevel || 'Beginner'}</Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Menu Sections */}
      {menuSections.map((section) => (
        <View key={section.title} style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>{section.title}</Text>
          <View style={styles.menuCard}>
            {section.items.map((item, idx) => (
              <TouchableOpacity
                key={item.label}
                style={[styles.menuItem, idx < section.items.length - 1 && styles.menuItemBorder]}
                activeOpacity={0.7}
                onPress={item.onPress}
              >
                <View style={[styles.menuIconContainer, { backgroundColor: `${item.color}18` }]}>
                  <Ionicons name={item.icon as any} size={18} color={item.color} />
                </View>
                <Text style={styles.menuItemLabel}>{item.label}</Text>
                {item.trailing ? (
                  <Text style={styles.menuItemTrailing}>{item.trailing}</Text>
                ) : (
                  <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}

      {/* Logout */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
        <Ionicons name="log-out-outline" size={20} color={theme.bearish} />
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>

      {/* App info */}
      <View style={styles.appInfo}>
        <Text style={styles.appInfoText}>BullBridge v2.0</Text>
        <Text style={styles.appInfoText}>Data sourced from Yahoo Finance</Text>
      </View>

      {/* Experience Level Modal */}
      <Modal visible={showLevelModal} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setShowLevelModal(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Experience Level</Text>
            {EXPERIENCE_LEVELS.map((level) => (
              <TouchableOpacity
                key={level}
                style={[styles.modalItem, user?.experienceLevel === level && styles.modalItemActive]}
                onPress={() => {
                  updateProfile({ experienceLevel: level });
                  setShowLevelModal(false);
                }}
              >
                <Text style={[styles.modalItemText, user?.experienceLevel === level && styles.modalItemTextActive]}>
                  {level}
                </Text>
                {user?.experienceLevel === level && <Ionicons name="checkmark" size={20} color={theme.primary} />}
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>

      {/* Sector Modal */}
      <Modal visible={showSectorModal} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setShowSectorModal(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Sector Interests</Text>
            <FlatList
              data={ALL_SECTORS}
              keyExtractor={(item) => item}
              renderItem={({ item }) => {
                const isSelected = user?.sectors?.includes(item);
                return (
                  <TouchableOpacity
                    style={[styles.modalItem, isSelected && styles.modalItemActive]}
                    onPress={() => {
                      const currentSectors = user?.sectors || [];
                      const nextSectors = isSelected
                        ? currentSectors.filter((s) => s !== item)
                        : [...currentSectors, item];
                      updateProfile({ sectors: nextSectors });
                    }}
                  >
                    <Text style={[styles.modalItemText, isSelected && styles.modalItemTextActive]}>
                      {item}
                    </Text>
                    <Ionicons 
                      name={isSelected ? 'checkbox' : 'square-outline'} 
                      size={20} 
                      color={isSelected ? theme.primary : theme.textMuted} 
                    />
                  </TouchableOpacity>
                );
              }}
            />
            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setShowSectorModal(false)}>
               <Text style={styles.modalCloseBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
      {/* Profile Edit Modal */}
      <ProfileEditModal 
        visible={showEditModal} 
        onClose={() => setShowEditModal(false)} 
      />
    </ScrollView>
    </View>
  );
}

function ProfileEditModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const { user, updateProfile } = useAuthStore();
  
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('••••••••');

  const handleSave = () => {
    updateProfile({ name, email });
    onClose();
    Alert.alert('Success', 'Profile updated successfully');
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Edit Profile</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter name"
              placeholderTextColor={theme.textMuted}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="Enter email"
              placeholderTextColor={theme.textMuted}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="Enter new password"
              placeholderTextColor={theme.textMuted}
            />
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity style={[styles.modalBtn, { backgroundColor: theme.backgroundTertiary }]} onPress={onClose}>
              <Text style={[styles.modalBtnText, { color: theme.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.modalBtn, { backgroundColor: theme.primary }]} onPress={handleSave}>
              <Text style={[styles.modalBtnText, { color: theme.textInverse }]}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function getStyles(theme: ThemeColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    content: { paddingBottom: 100 },
    header: { paddingHorizontal: Spacing.xl, paddingTop: 60, paddingBottom: Spacing.lg },
    headerTitle: { fontSize: Typography['2xl'], fontWeight: Typography.extrabold, color: theme.textPrimary },
    userCard: {
      marginHorizontal: Spacing.xl, borderRadius: BorderRadius.xl,
      overflow: 'hidden', borderWidth: 1, borderColor: theme.glassBorder,
      marginBottom: Spacing.lg,
    },
    userCardGradient: {
      flexDirection: 'row', alignItems: 'center', padding: Spacing.lg,
    },
    avatar: { marginRight: Spacing.base },
    avatarGradient: {
      width: 56, height: 56, borderRadius: 28,
      alignItems: 'center', justifyContent: 'center', position: 'relative',
    },
    avatarText: { fontSize: Typography.xl, fontWeight: Typography.bold, color: theme.textInverse },
    editIconBadge: {
      position: 'absolute', bottom: -2, right: -2, width: 20, height: 20,
      borderRadius: 10, backgroundColor: theme.primary, alignItems: 'center', justifyContent: 'center',
      borderWidth: 2, borderColor: theme.background,
    },
    userInfo: { flex: 1 },
    userName: { fontSize: Typography.lg, fontWeight: Typography.bold, color: theme.textPrimary },
    userEmail: { fontSize: Typography.sm, color: theme.textSecondary, marginTop: 2 },
    levelBadge: {
      flexDirection: 'row', alignItems: 'center', gap: 4,
      backgroundColor: theme.primaryMuted, paddingHorizontal: 8, paddingVertical: 2,
      borderRadius: BorderRadius.full, alignSelf: 'flex-start', marginTop: 6,
    },
    levelText: { fontSize: Typography.xs, color: theme.primary, fontWeight: Typography.semibold },
    menuSection: { paddingHorizontal: Spacing.xl, marginBottom: Spacing.lg },
    menuSectionTitle: {
      fontSize: Typography.sm, color: theme.textMuted, fontWeight: Typography.semibold,
      textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: Spacing.sm,
    },
    menuCard: {
      backgroundColor: theme.surface, borderRadius: BorderRadius.lg,
      borderWidth: 1, borderColor: theme.border, overflow: 'hidden',
    },
    menuItem: {
      flexDirection: 'row', alignItems: 'center',
      paddingVertical: Spacing.md, paddingHorizontal: Spacing.base,
    },
    menuItemBorder: { borderBottomWidth: 1, borderBottomColor: theme.borderLight },
    menuIconContainer: {
      width: 32, height: 32, borderRadius: 8,
      alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md,
    },
    menuItemLabel: { flex: 1, fontSize: Typography.base, color: theme.textPrimary },
    menuItemTrailing: { fontSize: Typography.sm, color: theme.textMuted, marginRight: 8 },
    logoutButton: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
      gap: Spacing.sm, marginHorizontal: Spacing.xl,
      paddingVertical: Spacing.base, borderRadius: BorderRadius.lg,
      backgroundColor: theme.bearishMuted, borderWidth: 1,
      borderColor: 'rgba(255, 82, 82, 0.3)', marginBottom: Spacing.lg,
    },
    logoutText: { fontSize: Typography.md, color: theme.bearish, fontWeight: Typography.semibold },
    appInfo: { alignItems: 'center', paddingBottom: Spacing.lg, gap: 4 },
    appInfoText: { fontSize: 10, color: theme.textMuted },
    
    // Modal
    modalOverlay: {
      flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center', alignItems: 'center', padding: Spacing.xl,
    },
    modalContent: {
      width: '100%', backgroundColor: theme.surface, borderRadius: BorderRadius.xl,
      padding: Spacing.lg, borderWidth: 1, borderColor: theme.border,
      maxHeight: '80%',
    },
    modalTitle: {
       fontSize: Typography.lg, fontWeight: Typography.bold, color: theme.textPrimary,
       marginBottom: Spacing.lg, textAlign: 'center'
    },
    modalItem: {
       flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
       paddingVertical: Spacing.md, paddingHorizontal: Spacing.base,
       borderRadius: BorderRadius.md, marginBottom: Spacing.xs
    },
    modalItemActive: { backgroundColor: theme.primaryMuted },
    modalItemText: { fontSize: Typography.base, color: theme.textPrimary },
    modalItemTextActive: { color: theme.primary, fontWeight: Typography.bold },
    modalCloseBtn: {
       marginTop: Spacing.lg, backgroundColor: theme.primary,
       paddingVertical: Spacing.md, borderRadius: BorderRadius.lg,
       alignItems: 'center'
    },
    modalCloseBtnText: { color: theme.textInverse, fontWeight: Typography.bold },

    // Input styles
    inputGroup: { marginBottom: Spacing.lg },
    inputLabel: { fontSize: Typography.xs, color: theme.textMuted, fontWeight: Typography.bold, marginBottom: 6, textTransform: 'uppercase' },
    input: {
      backgroundColor: theme.backgroundTertiary, borderRadius: BorderRadius.md,
      paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
      color: theme.textPrimary, fontSize: Typography.base,
      borderWidth: 1, borderColor: theme.border,
    },
    modalActions: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.md },
    modalBtn: { flex: 1, paddingVertical: Spacing.md, borderRadius: BorderRadius.lg, alignItems: 'center' },
    modalBtnText: { fontWeight: Typography.bold, fontSize: Typography.base },
  });
}
