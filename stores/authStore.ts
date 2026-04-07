/**
 * Bull Bridge — Auth Store (Zustand)
 * Manages user session, login, SEBI disclaimer acknowledgment
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasAcknowledgedDisclaimer: boolean;
  hasCompletedOnboarding: boolean;
  registeredUsers: any[]; // Works as our local "server" database 

  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  signUp: (name: string, email: string, password: string) => Promise<boolean>;
  googleLogin: (name: string, email: string, photoUrl: string) => Promise<boolean>;
  logout: () => void;
  acknowledgeDisclaimer: () => void;
  completeOnboarding: () => void;
  updateProfile: (updates: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      hasAcknowledgedDisclaimer: false,
      hasCompletedOnboarding: false,
      registeredUsers: [],

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 600));
        
        const state = get();
        // Check local "server" database
        const foundUser = state.registeredUsers.find(
          (u) => u.email === email && u.password === password
        );
        
        if (foundUser) {
          set({
            user: foundUser.profile,
            isAuthenticated: true,
            isLoading: false,
          });
          return true;
        } else {
          set({ isLoading: false });
          alert("Invalid email or password!");
          return false;
        }
      },

      signUp: async (name: string, email: string, password: string) => {
        set({ isLoading: true });
        
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const state = get();
        
        // Check if email already exists
        if (state.registeredUsers.some(u => u.email === email)) {
          set({ isLoading: false });
          alert("Email already registered! Please sign in.");
          return false;
        }
        
        // Create user profile
        const newUserProfile: User = {
          id: Date.now().toString(),
          name,
          email,
          experienceLevel: 'Beginner',
          sectors: [],
          joinedDate: new Date().toISOString().split('T')[0],
          hasAcknowledgedDisclaimer: state.hasAcknowledgedDisclaimer
        };

        // Save to our "database"
        set({
          registeredUsers: [
            ...state.registeredUsers,
            { email, password, profile: newUserProfile }
          ],
          isLoading: false,
        });
        
        alert("Account created successfully! Please sign in.");
        return true;
      },

      googleLogin: async (name: string, email: string, photoUrl: string) => {
        set({ isLoading: true });
        
        const state = get();
        let userProfile: User;
        
        // Check if this Google email is already registered locally
        const existingUser = state.registeredUsers.find(u => u.email === email);
        let updatedDatabase = state.registeredUsers;

        if (existingUser) {
          userProfile = { 
            ...existingUser.profile,
            name: name, // always update to latest Google name/avatar
            avatar: photoUrl || existingUser.profile.avatar 
          };
          // Update database entry
          updatedDatabase = state.registeredUsers.map(u => 
            u.email === email ? { ...u, profile: userProfile } : u
          );
        } else {
          // Completely new Google user
          userProfile = {
            id: 'google-' + Date.now().toString(),
            name,
            email,
            experienceLevel: 'Beginner',
            sectors: [],
            joinedDate: new Date().toISOString().split('T')[0],
            avatar: photoUrl,
            hasAcknowledgedDisclaimer: state.hasAcknowledgedDisclaimer
          };
          updatedDatabase = [...state.registeredUsers, { email, password: 'GOOGLE_OAUTH_NO_PASSWORD', profile: userProfile }];
        }

        set({
          user: userProfile,
          isAuthenticated: true,
          registeredUsers: updatedDatabase,
          isLoading: false,
        });
        return true;
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          // We don't clear hasCompletedOnboarding so they don't see intro screens again
        });
      },

      acknowledgeDisclaimer: () => {
        set((state) => ({
          hasAcknowledgedDisclaimer: true,
          user: state.user ? { ...state.user, hasAcknowledgedDisclaimer: true } : null,
        }));
      },

      completeOnboarding: () => {
        set({ hasCompletedOnboarding: true });
      },

      updateProfile: (updates) => {
        set((state) => {
          if (!state.user) return state;
          
          const updatedUser = { ...state.user, ...updates };
          
          // Also update our database
          const updatedDb = state.registeredUsers.map(u => 
            u.email === updatedUser.email ? { ...u, profile: updatedUser } : u
          );
          
          return {
            user: updatedUser,
            registeredUsers: updatedDb
          };
        });
      },
    }),
    {
      name: 'bullbridge-auth-storage', 
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ 
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        hasAcknowledgedDisclaimer: state.hasAcknowledgedDisclaimer,
        hasCompletedOnboarding: state.hasCompletedOnboarding,
        registeredUsers: state.registeredUsers // Crucial: saves the registered accounts persistently!
      }),
    }
  )
);
