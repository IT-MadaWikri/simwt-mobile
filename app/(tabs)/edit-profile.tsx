import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Switch } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Tabs, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors, { brand, slate } from '../../constants/Colors';
import Spacing from '../../constants/Spacing';
import { useAuth } from '../../src/contexts/AuthContext';
import { fonts } from '../../constants/Typography';
import { inputReset } from '../../constants/GlobalStyles';

export default function EditProfileScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  // Dummy states
  const [nik, setNik] = useState('2862.230628.CKR');
  const [nama, setNama] = useState(user?.name || '');
  const [departemen, setDepartemen] = useState('IT');
  const [jabatan, setJabatan] = useState('KEPALA BAGIAN');
  const [email, setEmail] = useState(user?.email || '');
  const [whatsapp, setWhatsapp] = useState('081223155139');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [useFingerprint, setUseFingerprint] = useState(false);

  const renderInput = (label: string, value: string, onChange: (t: string) => void, required = false, isSecure = false) => (
    <View style={styles.inputWrapper}>
      <Text style={styles.inputLabel}>
        {label} {required && <Text style={{color: Colors.danger}}>*</Text>}
      </Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChange}
        secureTextEntry={isSecure}
        placeholderTextColor={Colors.placeholder}
        placeholder={label}
      />
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
    >
      <Tabs.Screen 
        options={{
          headerRight: () => (
            <TouchableOpacity style={{ marginRight: Spacing.screenPadding }}>
              <Text style={{ color: brand[600], fontFamily: fonts.bold, fontSize: 16 }}>SIMPAN</Text>
            </TouchableOpacity>
          ),
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => router.back()} 
              style={{ marginLeft: Spacing.screenPadding }}
            >
              <MaterialCommunityIcons name="arrow-left" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
          ),
        }} 
      />
      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + Spacing.xxxl }]} showsVerticalScrollIndicator={false}>
        
        {/* INFORMASI KEPEGAWAIAN */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="account-tie-outline" size={20} color={brand[600]} />
            <Text style={styles.sectionTitle}>INFORMASI KEPEGAWAIAN</Text>
          </View>
          <View style={styles.sectionBody}>
            {renderInput('NIK', nik, setNik, true)}
            {renderInput('NAMA LENGKAP', nama, setNama, true)}
            {renderInput('DEPARTEMEN (OPSIONAL)', departemen, setDepartemen)}
            {renderInput('JABATAN (OPSIONAL)', jabatan, setJabatan)}
          </View>
        </View>

        {/* INFORMASI KONTAK */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="email-outline" size={20} color={brand[600]} />
            <Text style={styles.sectionTitle}>INFORMASI KONTAK</Text>
          </View>
          <View style={styles.sectionBody}>
            {renderInput('EMAIL (OPSIONAL)', email, setEmail)}
            {renderInput('NO. WHATSAPP (OPSIONAL)', whatsapp, setWhatsapp)}
          </View>
        </View>

        {/* KEAMANAN */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="shield-lock-outline" size={20} color={brand[600]} />
            <Text style={styles.sectionTitle}>KEAMANAN</Text>
          </View>
          <Text style={styles.helperText}>Kosongkan password jika tidak ingin mengubah password pengguna.</Text>
          <View style={styles.sectionBody}>
            {renderInput('PASSWORD (OPSIONAL)', password, setPassword, false, true)}
            {renderInput('ULANGI PASSWORD (OPSIONAL)', passwordConfirm, setPasswordConfirm, false, true)}
            
            {/* Fingerprint Toggle */}
            <View style={styles.switchContainer}>
              <View style={styles.switchLabelContainer}>
                <MaterialCommunityIcons name="fingerprint" size={20} color={Colors.textPrimary} style={{ marginRight: 8 }} />
                <Text style={styles.switchLabel}>Gunakan Fingerprint untuk Login</Text>
              </View>
              <Switch
                value={useFingerprint}
                onValueChange={setUseFingerprint}
                trackColor={{ false: Colors.border, true: brand[600] }}
                thumbColor={Platform.OS === 'android' ? (useFingerprint ? Colors.white : slate[50]) : ''}
              />
            </View>
          </View>
        </View>

        {/* DATABASE KARYAWAN INFO */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <MaterialCommunityIcons name="check-circle" size={18} color={brand[600]} />
            <Text style={styles.infoTitle}>Akun tersambung dengan data karyawan</Text>
          </View>
          <View style={styles.infoList}>
            <Text style={styles.infoListItem}><Text style={{fontFamily: fonts.bold}}>NIK:</Text> {nik}</Text>
            <Text style={styles.infoListItem}><Text style={{fontFamily: fonts.bold}}>Nama:</Text> {nama}</Text>
            <Text style={styles.infoListItem}><Text style={{fontFamily: fonts.bold}}>Jabatan:</Text> {jabatan}</Text>
          </View>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background, // Background ala Gojek
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: 100, // Space for footer action
  },
  sectionCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.background,
    paddingBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: fonts.extrabold,
    color: Colors.textPrimary,
    marginLeft: 8,
  },
  sectionBody: {
    marginTop: Spacing.sm,
  },
  inputWrapper: {
    marginBottom: Spacing.md,
  },
  inputLabel: {
    fontSize: 12,
    fontFamily: fonts.bold,
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.textPrimary,
    backgroundColor: slate[50],
    ...inputReset,
  },
  helperText: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginBottom: Spacing.md,
    fontStyle: 'italic',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.background,
    paddingTop: 16,
  },
  switchLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchLabel: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontFamily: fonts.semibold,
  },
  infoCard: {
    backgroundColor: brand[50],
    borderRadius: 16,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: brand[100],
    marginBottom: Spacing.xl,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  infoTitle: {
    fontSize: 14,
    fontFamily: fonts.extrabold,
    color: brand[600],
    marginLeft: 8,
  },
  infoList: {
    marginTop: 8,
  },
  infoListItem: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 4,
    marginLeft: 26,
  },
  footerAction: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    padding: Spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? 34 : Spacing.lg,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: Colors.borderSubtle,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 8,
  },
  btnCancel: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    marginRight: Spacing.md,
  },
  btnCancelText: {
    fontSize: 14,
    fontFamily: fonts.bold,
    color: Colors.textSecondary,
  },
  btnSave: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: brand[600],
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
  },
  btnSaveText: {
    fontSize: 14,
    fontFamily: fonts.extrabold,
    color: Colors.white,
    marginLeft: 6,
  },
});
