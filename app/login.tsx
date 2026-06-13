/**
 * Login Screen — SIMWT Mobile
 * Modern, Gojek-inspired login with API integration
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '../constants/Colors';
import Spacing from '../constants/Spacing';
import { useAuth } from '../src/contexts/AuthContext';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, error, clearError } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleLogin = async () => {
    let finalUsername = username.trim();
    if (!finalUsername) {
      Alert.alert('Error', 'Username tidak boleh kosong');
      return;
    }
    
    // Automatically add mwt- prefix if it's not superadmin and doesn't already have it
    if (
      finalUsername.toLowerCase() !== 'superadmin' && 
      !finalUsername.toLowerCase().startsWith('mwt-')
    ) {
      finalUsername = `mwt-${finalUsername}`;
    }

    if (!password.trim()) {
      Alert.alert('Error', 'Password tidak boleh kosong');
      return;
    }

    setIsSubmitting(true);
    clearError();

    try {
      await login(finalUsername, password);
      router.replace('/(tabs)');
    } catch (err: any) {
      Alert.alert('Login Gagal', err.message || 'Username atau password salah');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <MaterialCommunityIcons
              name="shield-check"
              size={48}
              color={Colors.white}
            />
          </View>
          <Text style={styles.appName}>SIMWT</Text>
          <Text style={styles.appSubtitle}>Mobile</Text>
          <Text style={styles.companyName}>PT Mada Wikri Tunggal</Text>
        </View>

        {/* Login Form */}
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Masuk ke Akun Anda</Text>
          <Text style={styles.formSubtitle}>
            Gunakan username dan password untuk melanjutkan
          </Text>

          {/* Username Input */}
          <View style={[styles.inputContainer, { paddingLeft: 0, overflow: 'hidden' }]}>
            <View style={styles.prefixBox}>
              <MaterialCommunityIcons name="account-outline" size={20} color={Colors.textSecondary} style={{marginRight: 4}} />
              <Text style={styles.prefixText}>mwt-</Text>
            </View>
            <TextInput
              style={[styles.input, { paddingLeft: Spacing.md }]}
              placeholder="Username"
              placeholderTextColor={Colors.placeholder}
              value={username}
              onChangeText={(text) => {
                setUsername(text);
                clearError();
              }}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
            />
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <MaterialCommunityIcons
              name="lock-outline"
              size={22}
              color={Colors.textTertiary}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={Colors.placeholder}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                clearError();
              }}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
            >
              <MaterialCommunityIcons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={22}
                color={Colors.textTertiary}
              />
            </TouchableOpacity>
          </View>

          {/* Error Message */}
          {error ? (
            <View style={styles.errorContainer}>
              <MaterialCommunityIcons
                name="alert-circle-outline"
                size={16}
                color={Colors.danger}
              />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.loginButton, isSubmitting && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={isSubmitting}
            activeOpacity={0.8}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color={Colors.white} />
            ) : (
              <Text style={styles.loginButtonText}>Masuk</Text>
            )}
          </TouchableOpacity>

          {/* Forgot Password */}
          <TouchableOpacity style={styles.forgotButton}>
            <Text style={styles.forgotText}>Lupa Password?</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>SIMWT Mobile v1.0.0</Text>
          <Text style={styles.footerText}>© 2026 PT Mada Wikri Tunggal</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: 80,
    paddingBottom: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  appName: {
    fontSize: 36,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: 3,
  },
  appSubtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 6,
    marginTop: -2,
  },
  companyName: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 8,
  },
  formContainer: {
    flex: 1,
    backgroundColor: Colors.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: Spacing.xl,
    paddingTop: 40,
    paddingBottom: 40,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  formSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 32,
    lineHeight: 22,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    height: 56,
  },
  inputIcon: {
    marginRight: Spacing.md,
  },
  input: {
    flex: 1,
    height: 56,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  prefixBox: {
    backgroundColor: '#EAECEF',
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    borderRightWidth: 1,
    borderRightColor: '#E0E0E0',
  },
  prefixText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  eyeIcon: {
    padding: Spacing.sm,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    padding: Spacing.md,
    borderRadius: 12,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: '#FFE0E0',
  },
  errorText: {
    marginLeft: Spacing.sm,
    fontSize: 13,
    color: Colors.danger,
    flex: 1,
  },
  loginButton: {
    backgroundColor: '#00AA13',
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.sm,
    shadowColor: '#00AA13',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '800',
  },
  forgotButton: {
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
  forgotText: {
    color: '#00AA13',
    fontSize: 14,
    fontWeight: '700',
  },
  footer: {
    backgroundColor: Colors.white,
    alignItems: 'center',
    paddingBottom: 40,
    paddingTop: 10,
  },
  footerText: {
    fontSize: 12,
    color: Colors.textTertiary,
    lineHeight: 20,
    fontWeight: '500',
  },
});
