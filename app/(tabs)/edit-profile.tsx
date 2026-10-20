/**
 * Edit Pengguna — isian & urutannya sama dengan halaman Edit Pengguna di web
 * (`sim-mwt/resources/views/pengguna/edit.blade.php`): Informasi Kepegawaian
 * (NIK, Nama, Jabatan, Plant), Departemen (+ Sub), Informasi Kontak, Keamanan.
 * Tata letaknya sama dengan Buat Tiket/Kaizen: bagian berjudul di atas latar
 * putih, kolom `FieldTeks`, footer tetap berisi tombol simpan.
 *
 * Jabatan, plant, dan departemen terkunci: di web hanya admin (izin menu
 * pengguna) yang boleh mengubahnya, dan API tidak menyediakan daftar pilihannya
 * untuk akun biasa. Belum ada endpoint ubah profil, jadi "Simpan" baru memberi
 * tahu hal itu (bukan diam seperti tombol mati).
 */
import React, { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppBar from '../../src/components/common/AppBar';
import Avatar from '../../src/components/common/Avatar';
import Button from '../../src/components/common/Button';
import FieldTeks from '../../src/components/common/FieldTeks';
import Icon from '../../src/components/common/Icon';
import { dialog } from '../../src/components/common/AppDialog';
import Colors, { brand } from '../../constants/Colors';
import Spacing from '../../constants/Spacing';
import { fonts } from '../../constants/Typography';
import { gs } from '../../constants/GlobalStyles';
import { useAuth } from '../../src/contexts/AuthContext';

export default function EditProfileScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const [nik, setNik] = useState(user?.nik || '');
  const [nama, setNama] = useState(user?.nama_lengkap || user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [whatsapp, setWhatsapp] = useState(user?.phone || '');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');

  const plant = user?.plant ? `Plant ${user.plant}` : '';

  const simpan = () =>
    dialog.alert('Belum Tersedia', 'Perubahan profil belum bisa disimpan dari aplikasi. Hubungi tim IT untuk mengubah data.');

  return (
    <KeyboardAvoidingView
      style={[gs.screen, { backgroundColor: Colors.white }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <AppBar judul="Edit Pengguna" />

      <ScrollView contentContainerStyle={styles.isi} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.identitas}>
          <Avatar nama={nama} foto={user?.avatar} ukuran={72} />
        </View>

        <Text style={styles.judulBagian}>Informasi Kepegawaian</Text>
        <View style={styles.bagian}>
          <FieldTeks label="NIK" wajib nilai={nik} onUbah={setNik} autoCapitalize="characters" placeholder="Ketik NIK" />
          <FieldTeks label="Nama Lengkap" wajib nilai={nama} onUbah={setNama} autoCapitalize="words" placeholder="Ketik nama" />
          <FieldTeks label="Jabatan" wajib nilai="" onUbah={() => {}} editable={false} placeholder="Diatur oleh admin" />
          <FieldTeks label="Plant / Lokasi" nilai={plant} onUbah={() => {}} editable={false} placeholder="Diatur oleh admin" />
        </View>

        <Text style={styles.judulBagian}>Departemen</Text>
        <View style={styles.bagian}>
          <FieldTeks label="Departemen" wajib nilai={user?.department || ''} onUbah={() => {}} editable={false} placeholder="Diatur oleh admin" />
          <FieldTeks label="Sub Departemen" nilai="" onUbah={() => {}} editable={false} placeholder="Diatur oleh admin" />
          <Text style={styles.ket}>Jabatan, plant, dan departemen hanya bisa diubah oleh admin SIMWT.</Text>
        </View>

        <Text style={styles.judulBagian}>Informasi Kontak</Text>
        <View style={styles.bagian}>
          <FieldTeks label="Email" nilai={email} onUbah={setEmail} keyboardType="email-address" autoCapitalize="none" placeholder="nama@email.com" />
          <FieldTeks label="No. WhatsApp" nilai={whatsapp} onUbah={setWhatsapp} keyboardType="phone-pad" placeholder="08xxxxxxxxxx" />
        </View>

        <Text style={styles.judulBagian}>Keamanan</Text>
        <View style={styles.bagian}>
          <Text style={[styles.ket, styles.ketAtas]}>Kosongkan password jika tidak ingin mengubah password.</Text>
          <FieldTeks label="Password" nilai={password} onUbah={setPassword} rahasia autoCapitalize="none" placeholder="Password baru" />
          <FieldTeks label="Ulangi Password" nilai={passwordConfirm} onUbah={setPasswordConfirm} rahasia autoCapitalize="none" placeholder="Ulangi password" />
        </View>

        {nik ? (
          <View style={styles.info}>
            <Icon name="check-circle" size={18} color={brand[600]} />
            <Text style={[styles.teksInfo, gs.flex1]}>Akun tersambung dengan data karyawan (NIK {nik}).</Text>
          </View>
        ) : null}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.sm }]}>
        <Button label="Simpan" icon="check" onPress={simpan} style={gs.flex1} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  isi: { padding: Spacing.lg, paddingBottom: Spacing.xxl },
  identitas: { alignItems: 'center', marginBottom: Spacing.xl },
  judulBagian: {
    fontSize: 12,
    fontFamily: fonts.semibold,
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  bagian: { marginBottom: Spacing.lg },
  ket: { fontSize: 12, fontFamily: fonts.regular, color: Colors.textTertiary },
  ketAtas: { marginBottom: Spacing.md },
  info: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Spacing.radius.md,
    ...Spacing.curve,
    backgroundColor: brand[50],
  },
  teksInfo: { fontSize: 12, fontFamily: fonts.regular, color: brand[700] },
  footer: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.borderSubtle,
  },
});
