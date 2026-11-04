/**
 * BirthdayBanner — banner karyawan berulang tahun + bottom sheet daftarnya.
 *
 * Pola bottom sheet-nya tetap ala Gojek (muncul dari bawah, header berwarna
 * brand); warna, font, dan sudutnya mengikuti karir-mwt.
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Button from '../common/Button';
import KueUlangTahun from './KueUlangTahun';
import BottomSheet from '../common/BottomSheet';
import Avatar from '../common/Avatar';
import PolaMemphis from '../common/PolaMemphis';
import Colors, { palet } from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { fonts, ukuranCatatan, ukuranIsi } from '../../../constants/Typography';
import { gs } from '../../../constants/GlobalStyles';
import type { Employee } from '../../services/karyawanService';

interface BirthdayBannerProps {
  birthdays: Employee[];
  /** Id karyawan yang ucapannya sedang dikirim (tombolnya memutar). */
  idMengirim: number | null;
  sudahDiucapkan: (item: Employee) => boolean;
  onBeriSelamat: (id: number) => void;
}

export default function BirthdayBanner({ birthdays, idMengirim, sudahDiucapkan, onBeriSelamat }: BirthdayBannerProps) {
  const [sheetTerbuka, setSheetTerbuka] = useState(false);

  if (birthdays.length === 0) return null;

  const renderEmployee = ({ item }: { item: Employee }) => {
    const jabatanText =
      typeof item.jabatan === 'string' ? item.jabatan : item.jabatan?.nama || 'Tidak diketahui';

    return (
      <View style={[gs.card, gs.row, gs.gapMd, styles.employeeCard]}>
        <Avatar
          nama={item.nama_lengkap}
          ukuran={40}
          foto={
            item.foto_profil
              ? item.foto_profil.startsWith('http')
                ? item.foto_profil
                : `https://mwtpart.co.id/storage/${item.foto_profil}`
              : undefined
          }
        />

        <View style={gs.flex1}>
          <Text style={styles.nama} numberOfLines={1}>
            {item.nama_lengkap}
          </Text>
          <Text style={styles.meta} numberOfLines={1}>
            {jabatanText} · {item.umur} tahun
          </Text>
        </View>

        {/* Tanpa tombol untuk baris milik sendiri dan karyawan yang belum punya akun. */}
        {!item.diri && item.punya_akun &&
          (sudahDiucapkan(item) ? (
            <Button label="Terkirim" icon="check" variant="muted" disabled />
          ) : (
            <Button
              label="Beri Selamat"
              icon="party-popper"
              variant="outline"
              loading={idMengirim === item.id}
              disabled={idMengirim !== null}
              onPress={() => onBeriSelamat(item.id)}
            />
          ))}
      </View>
    );
  };

  return (
    <>
      <TouchableOpacity style={styles.banner} activeOpacity={0.85} onPress={() => setSheetTerbuka(true)} accessibilityRole="button">
        <View style={styles.kartu}>
          <PolaMemphis variasi={2} />
          <View style={styles.teks}>
            <Text style={styles.bannerTitle} numberOfLines={2}>
              Hari ini {birthdays.length} karyawan berulang tahun 🎉
            </Text>
            <Text style={styles.petunjuk}>Ketuk untuk melihat daftarnya</Text>
          </View>
        </View>
        <View style={styles.ilustrasi} pointerEvents="none">
          <KueUlangTahun ukuran={96} />
        </View>
      </TouchableOpacity>

      <BottomSheet
        visible={sheetTerbuka}
        onClose={() => setSheetTerbuka(false)}
        title="Ulang Tahun Hari Ini 🎂"
        subtitle={`${birthdays.length} karyawan sedang merayakan`}
      >
        <View style={styles.daftar}>
          {birthdays.map((item) => (
            <React.Fragment key={item.id}>{renderEmployee({ item })}</React.Fragment>
          ))}
        </View>
      </BottomSheet>
    </>
  );
}

const styles = StyleSheet.create({
  // Maskot menonjol di atas kartu, jadi pembungkus diberi jarak atas & tidak memotong.
  banner: {
    marginHorizontal: Spacing.screenPadding,
    marginTop: Spacing.xxl - Spacing.xs,
    marginBottom: Spacing.lg,
  },
  kartu: {
    minHeight: 112,
    justifyContent: 'center',
    backgroundColor: palet.krem,
    borderRadius: Spacing.radius.xl,
    ...Spacing.curve,
    overflow: 'hidden',
    padding: Spacing.lg,
  },
  teks: {
    alignItems: 'flex-start',
    gap: Spacing.md,
    paddingRight: 104,
  },
  // Kue di dalam kartu, terpusat vertikal di sisi kanan.
  ilustrasi: {
    position: 'absolute',
    right: Spacing.lg,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  petunjuk: {
    fontFamily: fonts.regular,
    fontSize: ukuranCatatan,
    color: Colors.textSecondary,
  },
  bannerTitle: {
    fontFamily: fonts.bold,
    fontSize: ukuranIsi,
    color: Colors.ink,
  },

  daftar: {
    paddingHorizontal: Spacing.lg,
  },
  employeeCard: {
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  nama: {
    fontFamily: fonts.semibold,
    fontSize: ukuranIsi,
    color: Colors.textPrimary,
  },
  meta: {
    fontFamily: fonts.regular,
    fontSize: ukuranCatatan,
    color: Colors.textSecondary,
  },
});
