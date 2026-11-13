/**
 * Edit Pengguna — dua tampilan dalam satu layar. Awalnya daftar data (NIK, Nama,
 * Email, No. WhatsApp, Password) yang tidak langsung berupa isian; ketuk satu
 * baris untuk membuka editor satu field (judul "Ubah …", penjelasan, isian,
 * tombol Simpan yang baru aktif setelah ada perubahan).
 *
 * Email & password beralur ketat (biometrik bila aktif -> OTP ke email saat ini ->
 * isian terbuka -> untuk email, OTP lagi ke email baru): lihat `EditorAman` dan
 * `useUbahAkunAman`; kontrak API-nya di `akunService`.
 *
 * Jabatan, plant, dan departemen tidak ditampilkan: di web hanya admin (izin
 * menu pengguna) yang boleh mengubahnya. Belum ada endpoint ubah profil untuk
 * NIK, nama, dan WhatsApp, jadi "Simpan" di sana baru memberi tahu hal itu.
 */
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, StyleSheet, TouchableOpacity, BackHandler } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppBar from '../../src/components/common/AppBar';
import Avatar from '../../src/components/common/Avatar';
import Button from '../../src/components/common/Button';
import FieldTeks from '../../src/components/common/FieldTeks';
import Icon from '../../src/components/common/Icon';
import { dialog } from '../../src/components/common/AppDialog';
import Colors from '../../constants/Colors';
import Spacing from '../../constants/Spacing';
import { fonts, fontsJudul, ukuranIsi } from '../../constants/Typography';
import { gs } from '../../constants/GlobalStyles';
import { useAuth } from '../../src/contexts/AuthContext';
import FormOtp from '../../src/components/profil/FormOtp';
import { biometric } from '../../src/utils/biometric';
import { useUbahAkunAman, JenisAman } from '../../src/hooks/useUbahAkunAman';

type Kunci = 'nik' | 'nama' | 'email' | 'whatsapp' | 'password';

interface DefinisiField {
  label: string;
  ket: string;
  placeholder: string;
  keyboardType?: 'email-address' | 'phone-pad';
  autoCapitalize?: 'none' | 'words' | 'characters';
}

const FIELD: Record<Kunci, DefinisiField> = {
  nik: { label: 'NIK', ket: 'Gunakan NIK sesuai data kepegawaian agar akun tersambung dengan data karyawan.', placeholder: 'Ketik NIK', autoCapitalize: 'characters' },
  nama: { label: 'Nama Lengkap', ket: 'Gunakan nama asli untuk memudahkan proses verifikasi. Nama ini dapat ditampilkan di beberapa halaman.', placeholder: 'Ketik nama', autoCapitalize: 'words' },
  email: { label: 'Email', ket: 'Email dipakai untuk pemberitahuan dan pemulihan akun.', placeholder: 'nama@email.com', keyboardType: 'email-address', autoCapitalize: 'none' },
  whatsapp: { label: 'No. WhatsApp', ket: 'Nomor aktif yang bisa dihubungi lewat WhatsApp.', placeholder: '08xxxxxxxxxx', keyboardType: 'phone-pad' },
  password: { label: 'Password', ket: 'Masukkan password baru, lalu ulangi untuk memastikan tidak salah ketik.', placeholder: 'Password baru', autoCapitalize: 'none' },
};

const BAGIAN: { judul: string; kunci: Kunci[] }[] = [
  { judul: 'Informasi Kepegawaian', kunci: ['nik', 'nama'] },
  { judul: 'Informasi Kontak', kunci: ['email', 'whatsapp'] },
  { judul: 'Keamanan', kunci: ['password'] },
];

export default function EditProfileScreen() {
  const { user, muatUlangUser } = useAuth();
  const insets = useSafeAreaInsets();

  const nilai: Record<Kunci, string> = {
    nik: user?.nik || '',
    nama: user?.nama_lengkap || user?.name || '',
    email: user?.email || '',
    whatsapp: user?.phone || '',
    password: '',
  };

  const [ubah, setUbah] = useState<Kunci | null>(null);
  const [isian, setIsian] = useState('');

  const buka = async (k: Kunci) => {
    // Email & password: biometrik dulu bila aktif.
    if (k === 'email' || k === 'password') {
      if (await biometric.siapDipakai()) {
        const jenis = (await biometric.namaJenis()).toLowerCase();
        if (!(await biometric.konfirmasi(`Pindai ${jenis} untuk mengubah ${FIELD[k].label.toLowerCase()}`))) return;
      }
    }
    setIsian(nilai[k]);
    setUbah(k);
  };

  // Tombol kembali perangkat menutup editor dulu, bukan langsung keluar layar.
  const aman = ubah === 'email' || ubah === 'password';
  useEffect(() => {
    if (!ubah || aman) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      setUbah(null);
      return true;
    });
    return () => sub.remove();
  }, [ubah, aman]);

  const simpan = () =>
    dialog.alert('Belum Tersedia', 'Perubahan profil belum bisa disimpan dari aplikasi. Hubungi tim IT untuk mengubah data.');

  if (ubah && aman) {
    return (
      <EditorAman
        jenis={ubah as JenisAman}
        emailSaatIni={nilai.email}
        onTutup={() => setUbah(null)}
        onSelesai={async () => {
          try {
            await muatUlangUser();
          } catch {
            // best-effort: perubahan sudah tersimpan di server; profil dimuat ulang saat app dibuka lagi.
          }
          setUbah(null);
          dialog.alert('Berhasil', `${FIELD[ubah].label} berhasil diubah.`, 'success');
        }}
      />
    );
  }

  if (ubah) {
    const f = FIELD[ubah];
    const bisaSimpan = isian.trim() !== '' && isian !== nilai[ubah];

    return (
      <KeyboardAvoidingView
        style={[gs.screen, { backgroundColor: Colors.white }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        <AppBar judul={`Ubah ${f.label.toLowerCase()}`} onKembali={() => setUbah(null)} />

        <ScrollView contentContainerStyle={styles.isi} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Text style={styles.ketEditor}>{f.ket}</Text>
          <FieldTeks
            label={f.label}
            wajib
            nilai={isian}
            onUbah={setIsian}
            placeholder={f.placeholder}
            keyboardType={f.keyboardType}
            autoCapitalize={f.autoCapitalize}
          />
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.sm }]}>
          <Button label="Simpan" onPress={simpan} disabled={!bisaSimpan} style={gs.flex1} />
        </View>
      </KeyboardAvoidingView>
    );
  }

  return (
    <View style={[gs.screen, { backgroundColor: Colors.white }]}>
      <AppBar judul="Edit Pengguna" />

      <ScrollView contentContainerStyle={styles.isi} showsVerticalScrollIndicator={false}>
        <View style={styles.identitas}>
          <Avatar nama={nilai.nama} foto={user?.avatar} ukuran={72} />
        </View>

        {BAGIAN.map((b) => (
          <View key={b.judul} style={styles.bagian}>
            <Text style={styles.judulBagian}>{b.judul}</Text>
            {b.kunci.map((k) => {
              const isi = k === 'password' ? '••••••••' : nilai[k];
              return (
                <TouchableOpacity key={k} style={styles.baris} activeOpacity={0.7} onPress={() => buka(k)}>
                  <Text style={styles.labelBaris}>{FIELD[k].label}</Text>
                  <Text style={[styles.nilaiBaris, !isi && styles.kosong]} numberOfLines={1}>{isi || 'Belum diisi'}</Text>
                  <Icon name="chevron-right" size={18} color={Colors.textTertiary} />
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

/** Editor ketat email/password: tahap & panggilan server di `useUbahAkunAman`, tampilan di sini. */
function EditorAman({ jenis, emailSaatIni, onTutup, onSelesai }: { jenis: JenisAman; emailSaatIni: string; onTutup: () => void; onSelesai: () => void }) {
  const insets = useSafeAreaInsets();
  const h = useUbahAkunAman(jenis, onSelesai);
  const [isian, setIsian] = useState('');
  const [ulangi, setUlangi] = useState('');
  const sandi = jenis === 'password';
  const nama = sandi ? 'password' : 'email';

  const kembali = () => {
    if (!h.mundur()) onTutup();
  };
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      kembali();
      return true;
    });
    return () => sub.remove();
  });

  const otp = h.tahap === 'otp_lama' || h.tahap === 'otp_baru';
  const judul = h.tahap === 'otp_lama' ? 'Verifikasi OTP' : h.tahap === 'otp_baru' ? 'Konfirmasi email baru' : `Ubah ${nama}`;
  const emailValid = /^\S+@\S+\.\S+$/.test(isian.trim()) && isian.trim().toLowerCase() !== emailSaatIni.toLowerCase();

  let isiTahap: React.ReactNode;
  let tombol: React.ReactNode;

  if (otp) {
    isiTahap = (
      <FormOtp
        tujuan={h.tahap === 'otp_baru' ? h.emailBaru : emailSaatIni}
        kode={h.kode}
        onUbahKode={h.setKode}
        galat={h.galat}
        sisaDetik={h.sisaDetik}
        memuat={h.memuat}
        onKirimUlang={h.kirimUlang}
      />
    );
    tombol = (
      <Button
        label={h.tahap === 'otp_baru' ? 'Konfirmasi' : 'Verifikasi'}
        onPress={h.tahap === 'otp_baru' ? h.simpanEmail : h.verifikasiOtpLama}
        disabled={h.kode.length !== 6}
        loading={h.memuat}
        style={gs.flex1}
      />
    );
  } else if (h.tahap === 'terbuka') {
    isiTahap = (
      <>
        <Text style={styles.ketEditor}>
          {sandi ? 'Verifikasi berhasil. Masukkan password baru, lalu ulangi untuk memastikan tidak salah ketik.' : 'Verifikasi berhasil. Masukkan email baru; kami akan mengirim kode OTP ke email tersebut untuk konfirmasi.'}
        </Text>
        <FieldTeks
          label={sandi ? 'Password Baru' : 'Email Baru'}
          wajib
          nilai={isian}
          onUbah={setIsian}
          rahasia={sandi}
          keyboardType={sandi ? undefined : 'email-address'}
          autoCapitalize="none"
          placeholder={sandi ? 'Password baru' : 'nama@email.com'}
        />
        {sandi ? (
          <FieldTeks
            label="Ulangi Password"
            wajib
            nilai={ulangi}
            onUbah={setUlangi}
            rahasia
            autoCapitalize="none"
            placeholder="Ulangi password"
            galat={ulangi && isian !== ulangi ? 'Password tidak sama' : undefined}
          />
        ) : null}
        {h.galat ? <Text style={styles.galat}>{h.galat}</Text> : null}
      </>
    );
    tombol = (
      <Button
        label="Simpan"
        onPress={() => (sandi ? h.simpanPassword(isian, ulangi) : h.kirimOtpBaru(isian.trim()))}
        disabled={sandi ? !isian || isian !== ulangi : !emailValid}
        loading={h.memuat}
        style={gs.flex1}
      />
    );
  } else {
    isiTahap = (
      <>
        <Text style={styles.ketEditor}>
          Untuk keamanan akun, kami akan mengirim kode OTP ke email Anda saat ini ({emailSaatIni || 'belum diisi'}) sebelum {nama} dapat diubah.
        </Text>
        <FieldTeks label={sandi ? 'Password' : 'Email'} nilai={sandi ? '••••••••' : emailSaatIni} onUbah={() => {}} editable={false} wajib />
        {h.galat ? <Text style={styles.galat}>{h.galat}</Text> : null}
      </>
    );
    tombol = (
      <>
        <Button variant="outline" label={`Ubah ${nama}`} onPress={h.kirimOtpLama} loading={h.memuat} disabled={!emailSaatIni} style={gs.flex1} />
        <Button label="Simpan" disabled style={gs.flex1} />
      </>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[gs.screen, { backgroundColor: Colors.white }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <AppBar judul={judul} onKembali={kembali} />
      <ScrollView contentContainerStyle={styles.isi} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {isiTahap}
      </ScrollView>
      <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.sm }]}>{tombol}</View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  isi: { padding: Spacing.lg, paddingBottom: Spacing.xxl },
  identitas: { alignItems: 'center', marginBottom: Spacing.xl },
  bagian: { marginBottom: Spacing.lg },
  judulBagian: {
    fontSize: ukuranIsi,
    fontFamily: fontsJudul.semibold,
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.xs,
  },
  baris: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderSubtle,
  },
  labelBaris: { width: 110, fontSize: ukuranIsi, fontFamily: fonts.regular, color: Colors.textTertiary },
  nilaiBaris: { flex: 1, fontSize: ukuranIsi, fontFamily: fonts.regular, color: Colors.textPrimary },
  galat: { fontSize: ukuranIsi, fontFamily: fonts.regular, color: Colors.danger, marginTop: Spacing.xs },
  kosong: { color: Colors.placeholder },
  ketEditor: { fontSize: ukuranIsi, fontFamily: fonts.regular, color: Colors.textSecondary, marginBottom: Spacing.lg },
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
