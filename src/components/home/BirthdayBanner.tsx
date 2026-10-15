/**
 * BirthdayBanner — banner karyawan berulang tahun + bottom sheet daftarnya.
 *
 * Pola bottom sheet-nya tetap ala Gojek (muncul dari bawah, header berwarna
 * brand); warna, font, dan sudutnya mengikuti karir-mwt.
 */
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from '../common/Icon';
import BottomSheet from '../common/BottomSheet';
import Avatar from '../common/Avatar';
import { LinearGradient } from 'expo-linear-gradient';
import Colors, { brand, palet } from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { fonts } from '../../../constants/Typography';
import { gs } from '../../../constants/GlobalStyles';
import { Employee, karyawanService } from '../../services/karyawanService';

export default function BirthdayBanner() {
  const [birthdays, setBirthdays] = useState<Employee[]>([]);
  const [sheetTerbuka, setSheetTerbuka] = useState(false);

  useEffect(() => {
    const fetchBirthdays = async () => {
      const data = await karyawanService.getBirthdaysToday();
      setBirthdays(data);
    };
    fetchBirthdays();
  }, []);

  if (birthdays.length === 0) return null;

  const calculateAge = (dob: string | undefined) => {
    if (!dob) return 0;
    const birthDate = new Date(dob);
    const today = new Date();
    return today.getFullYear() - birthDate.getFullYear();
  };

  const renderEmployee = ({ item }: { item: Employee }) => {
    const age = calculateAge(item.tanggal_lahir);
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
            {jabatanText} · {age} tahun
          </Text>
        </View>

        <TouchableOpacity style={styles.ucapan} activeOpacity={0.7}>
          <Icon name="chat-outline" size={16} color={brand[700]} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <>
      <TouchableOpacity style={styles.banner} activeOpacity={0.9} onPress={() => setSheetTerbuka(true)}>
        <LinearGradient
          colors={[palet.hijau, palet.teal, palet.navy]}
          locations={[0, 0.25, 0.7]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.bannerIsi}
        >
          <View style={styles.bannerIcon}>
            <Icon name="gift" size={18} color={Colors.white} />
          </View>

          <View style={gs.flex1}>
            <Text style={styles.bannerTitle} numberOfLines={1}>
              Karyawan Berulang Tahun
            </Text>
            <Text style={styles.bannerSubtitle} numberOfLines={1}>
              Hari ini ada{' '}
              <Text style={styles.bannerCount}>{birthdays.length}</Text> karyawan berulang tahun 🎉
            </Text>
          </View>

          <View style={styles.bannerTombol}>
            <Text style={styles.bannerTombolText}>Lihat</Text>
          </View>
        </LinearGradient>
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
  banner: {
    marginHorizontal: Spacing.screenPadding,
    marginBottom: Spacing.lg,
    borderRadius: Spacing.radius.xl,
    ...Spacing.curve,
    overflow: 'hidden',
  },
  bannerIsi: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
  },
  bannerIcon: {
    width: 36,
    height: 36,
    borderRadius: Spacing.radius.full,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerTitle: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: Colors.white,
  },
  bannerSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  bannerCount: {
    fontFamily: fonts.bold,
    color: palet.mint,
  },
  bannerTombol: {
    backgroundColor: Colors.white,
    borderRadius: Spacing.radius.full,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  bannerTombolText: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: palet.navy,
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
    fontSize: 13,
    color: Colors.textPrimary,
  },
  meta: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  ucapan: {
    width: 36,
    height: 36,
    borderRadius: Spacing.radius.full,
    backgroundColor: brand[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
});
