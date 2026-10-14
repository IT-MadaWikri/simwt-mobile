import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors, { brand, slate } from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { useAuth } from '../../../src/contexts/AuthContext';
import api from '../../../src/services/api';
import { fonts } from '../../../constants/Typography';
import { dialog } from '../../../src/components/common/AppDialog';
import { inputReset } from '../../../constants/GlobalStyles';
import BrandSpinner from '../../../src/components/common/BrandSpinner';

export default function BuatKaizenScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    tema: '',
    nama_pelaksana: user?.nama_lengkap || user?.name || '',
    nik_nama_pelaksana: '',
    disarankan_oleh: '',
    nomor_whatsapp: user?.phone || '',
    email: user?.email || '',
    detail_sebelum: '',
    detail_sesudah: '',
  });

  const handleChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.tema || !formData.nama_pelaksana) {
      dialog.alert('Error', 'Tema dan Nama Pelaksana wajib diisi.');
      return;
    }

    try {
      setLoading(true);
      
      const submitData = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        submitData.append(key, value);
      });

      // Import `api` from our services (need to add import at top if missing)
      // We will assume `api.post` handles it
      const response = await api.post('/kaizen/buat', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });

      if (response.data && response.data.success) {
        await dialog.alert('Sukses', 'Pengajuan Kaizen berhasil dibuat!', 'success');
        router.back();
      } else {
        throw new Error(response.data?.message || 'Gagal mengirim data');
      }

    } catch (error: any) {
      console.error('Submit Kaizen Error:', error);
      dialog.alert(
        'Gagal Mengirim',
        error.response?.data?.message ||
          error.message ||
          'Terjadi kesalahan saat mengirim pengajuan Kaizen.',
        'danger'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + Spacing.xxl }]} showsVerticalScrollIndicator={false}>
        
        <View style={styles.alertBox}>
          <MaterialCommunityIcons name="information" size={20} color={brand[700]} />
          <Text style={styles.alertText}>
            Isi detail inovasi / kaizen Anda di bawah ini. Pastikan informasi sudah benar sebelum mengirim.
          </Text>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Tema Kaizen <Text style={styles.required}>*</Text></Text>
          <TextInput 
            style={styles.input} 
            placeholder="Masukkan tema inovasi Anda" 
            value={formData.tema}
            onChangeText={(val) => handleChange('tema', val)}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Nama Pelaksana <Text style={styles.required}>*</Text></Text>
          <TextInput 
            style={styles.input} 
            placeholder="Nama lengkap pelaksana" 
            value={formData.nama_pelaksana}
            onChangeText={(val) => handleChange('nama_pelaksana', val)}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>NIK Pelaksana</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Nomor Induk Karyawan" 
            keyboardType="numeric"
            value={formData.nik_nama_pelaksana}
            onChangeText={(val) => handleChange('nik_nama_pelaksana', val)}
          />
        </View>

        <View style={styles.rowGroup}>
          <View style={[styles.formGroup, {flex: 1, marginRight: 8}]}>
            <Text style={styles.label}>No. WhatsApp</Text>
            <TextInput 
              style={styles.input} 
              placeholder="0812..." 
              keyboardType="phone-pad"
              value={formData.nomor_whatsapp}
              onChangeText={(val) => handleChange('nomor_whatsapp', val)}
            />
          </View>
          <View style={[styles.formGroup, {flex: 1, marginLeft: 8}]}>
            <Text style={styles.label}>Email</Text>
            <TextInput 
              style={styles.input} 
              placeholder="email@perusahaan.com" 
              keyboardType="email-address"
              value={formData.email}
              onChangeText={(val) => handleChange('email', val)}
            />
          </View>
        </View>

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Kondisi Kaizen</Text>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Kondisi Sebelum</Text>
          <TextInput 
            style={[styles.input, styles.textArea]} 
            placeholder="Jelaskan kondisi sebelum kaizen diterapkan..." 
            multiline
            numberOfLines={4}
            value={formData.detail_sebelum}
            onChangeText={(val) => handleChange('detail_sebelum', val)}
          />
          <TouchableOpacity style={styles.uploadBtn}>
            <MaterialCommunityIcons name="camera-plus-outline" size={20} color={Colors.primary} />
            <Text style={styles.uploadBtnText}>Upload Foto Sebelum</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Kondisi Sesudah</Text>
          <TextInput 
            style={[styles.input, styles.textArea]} 
            placeholder="Jelaskan hasil setelah kaizen diterapkan..." 
            multiline
            numberOfLines={4}
            value={formData.detail_sesudah}
            onChangeText={(val) => handleChange('detail_sesudah', val)}
          />
          <TouchableOpacity style={styles.uploadBtn}>
            <MaterialCommunityIcons name="camera-plus-outline" size={20} color={Colors.primary} />
            <Text style={styles.uploadBtnText}>Upload Foto Sesudah</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* Submit Button */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.submitButton} 
          activeOpacity={0.8}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <BrandSpinner size={22} color={Colors.white} />
          ) : (
            <Text style={styles.submitButtonText}>Kirim Pengajuan Kaizen</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl * 1.5,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderSubtle,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: fonts.bold,
    color: Colors.textPrimary,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  alertBox: {
    flexDirection: 'row',
    backgroundColor: brand[50],
    padding: Spacing.md,
    borderRadius: 8,
    marginBottom: Spacing.xl,
    alignItems: 'flex-start',
  },
  alertText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 12,
    color: brand[700],
    lineHeight: 18,
  },
  formGroup: {
    marginBottom: Spacing.lg,
  },
  rowGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 13,
    fontFamily: fonts.bold,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  required: {
    color: Colors.danger,
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
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingVertical: 8,
  },
  uploadBtnText: {
    marginLeft: 8,
    fontSize: 13,
    fontFamily: fonts.semibold,
    color: Colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderSubtle,
    marginVertical: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: fonts.extrabold,
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
  },
  footer: {
    padding: Spacing.lg,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.borderSubtle,
  },
  submitButton: {
    backgroundColor: brand[600],
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: 'center',
  },
  submitButtonText: {
    color: Colors.white,
    fontSize: 15,
    fontFamily: fonts.bold,
  },
});
