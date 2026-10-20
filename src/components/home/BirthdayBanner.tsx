/**
 * BirthdayBanner — banner karyawan berulang tahun + bottom sheet daftarnya.
 *
 * Pola bottom sheet-nya tetap ala Gojek (muncul dari bawah, header berwarna
 * brand); warna, font, dan sudutnya mengikuti karir-mwt.
 */
import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from '../common/Icon';
import BottomSheet from '../common/BottomSheet';
import Avatar from '../common/Avatar';
import Button from '../common/Button';
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

        <TouchableOpacity style={styles.ucapan} activeOpacity={0.7}>
          <Icon name="chat-outline" size={16} color={brand[700]} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <>
      <View style={styles.banner}>
        <View style={styles.kartu}>
          <View style={styles.teks}>
            <Text style={styles.bannerTitle} numberOfLines={2}>
              Hari ini {birthdays.length} karyawan berulang tahun 🎉
            </Text>
            <Button label="Lihat" onPress={() => setSheetTerbuka(true)} />
          </View>
        </View>
        <Image source={require('../../../assets/images/maskot-ulang-tahun.png')} style={styles.maskot} resizeMode="contain" />
      </View>

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
    marginTop: 40,
    marginBottom: Spacing.lg,
  },
  kartu: {
    minHeight: 112,
    justifyContent: 'center',
    backgroundColor: palet.krem,
    borderRadius: Spacing.radius.xl,
    ...Spacing.curve,
    padding: Spacing.lg,
  },
  teks: {
    alignItems: 'flex-start',
    gap: Spacing.md,
    paddingRight: 118,
  },
  maskot: {
    position: 'absolute',
    right: Spacing.sm,
    bottom: 0,
    width: 110,
    height: 150,
  },
  bannerTitle: {
    fontFamily: fonts.bold,
    fontSize: 12,
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
    fontSize: 12,
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
