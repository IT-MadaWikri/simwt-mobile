/**
 * BirthdayBanner — banner karyawan berulang tahun + bottom sheet daftarnya.
 *
 * Pola bottom sheet-nya tetap ala Gojek (muncul dari bawah, header berwarna
 * brand); warna, font, dan sudutnya mengikuti karir-mwt.
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  Image,
  Dimensions,
  Animated,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Colors, { brand } from '../../../constants/Colors';
import Spacing, { Shadows } from '../../../constants/Spacing';
import { fonts } from '../../../constants/Typography';
import { gs, gradients } from '../../../constants/GlobalStyles';
import { Employee, karyawanService } from '../../services/karyawanService';

const { height } = Dimensions.get('window');

export default function BirthdayBanner() {
  const [birthdays, setBirthdays] = useState<Employee[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const slideAnim = useState(new Animated.Value(height))[0];

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

  const formatIndonesianDate = (dateString: string | undefined) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
    ];
    return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const openModal = () => {
    setModalVisible(true);
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      bounciness: 0,
      speed: 14,
    }).start();
  };

  const closeModal = () => {
    Animated.timing(slideAnim, {
      toValue: height,
      duration: 250,
      useNativeDriver: true,
    }).start(() => setModalVisible(false));
  };

  const renderDetail = (icon: string, label: string, value: string) => (
    <View style={styles.detailItem}>
      <View style={[gs.row, gs.gapXs]}>
        <MaterialCommunityIcons name={icon as any} size={14} color={Colors.textTertiary} />
        <Text style={styles.detailLabel}>{label}</Text>
      </View>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );

  const renderEmployee = ({ item }: { item: Employee }) => {
    const age = calculateAge(item.tanggal_lahir);
    const jabatanText =
      typeof item.jabatan === 'string' ? item.jabatan : item.jabatan?.nama || 'Tidak diketahui';

    return (
      <View style={[gs.card, styles.employeeCard]}>
        <View style={[gs.row, gs.gapMd]}>
          {item.foto_profil ? (
            <Image
              source={{
                uri: item.foto_profil.startsWith('http')
                  ? item.foto_profil
                  : `https://mwtpart.co.id/storage/${item.foto_profil}`,
              }}
              style={styles.avatar}
            />
          ) : (
            <View style={[styles.avatar, gs.center, { backgroundColor: brand[600] }]}>
              <MaterialCommunityIcons name="account" size={28} color={Colors.white} />
            </View>
          )}

          <View style={gs.flex1}>
            <Text style={gs.title} numberOfLines={1}>
              {item.nama_lengkap}
            </Text>
            <View style={[gs.badge, gs.badgeBrand, { marginTop: Spacing.xs }]}>
              <MaterialCommunityIcons name="party-popper" size={13} color={brand[700]} />
              <Text style={[gs.badgeText, gs.badgeTextBrand]}>Ulang Tahun ke-{age}</Text>
            </View>
          </View>

          <View style={styles.ageBadge}>
            <Text style={styles.ageBadgeText}>{age}</Text>
            <Text style={styles.ageBadgeUnit}>THN</Text>
          </View>
        </View>

        <View style={gs.divider} />

        <View style={gs.row}>
          <View style={gs.flex1}>
            {renderDetail('badge-account-horizontal-outline', 'NIK', item.nik || '-')}
            {renderDetail(
              'cake-variant-outline',
              'TANGGAL LAHIR',
              formatIndonesianDate(item.tanggal_lahir)
            )}
          </View>
          <View style={gs.flex1}>
            {renderDetail('briefcase-outline', 'JABATAN', jabatanText)}
          </View>
        </View>

        <View style={gs.divider} />

        <TouchableOpacity style={[gs.row, gs.gapSm]} activeOpacity={0.7}>
          <MaterialCommunityIcons name="chat-outline" size={16} color={brand[600]} />
          <Text style={[gs.bodySm, gs.textSemibold, gs.textBrand, gs.flex1]}>Beri ucapan</Text>
          <MaterialCommunityIcons name="chevron-right" size={16} color={brand[600]} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <>
      <TouchableOpacity
        style={[gs.card, gs.row, gs.gapMd, styles.banner]}
        activeOpacity={0.9}
        onPress={openModal}
      >
        <View style={[gs.iconTile, styles.bannerIcon]}>
          <MaterialCommunityIcons name="gift" size={26} color={brand[600]} />
        </View>

        <View style={gs.flex1}>
          <Text style={gs.title}>Karyawan Berulang Tahun</Text>
          <Text style={gs.bodySm}>
            Hari ini ada{' '}
            <Text style={[gs.bodySm, gs.textSemibold, gs.textBrand]}>{birthdays.length}</Text>{' '}
            karyawan berulang tahun 🎉
          </Text>
        </View>

        <MaterialCommunityIcons name="chevron-right" size={24} color={brand[600]} />
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={gs.flex1} activeOpacity={1} onPress={closeModal} />

          <Animated.View style={[styles.bottomSheet, { transform: [{ translateY: slideAnim }] }]}>
            <LinearGradient
              colors={gradients.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.sheetHeader}
            >
              <View style={[gs.row, gs.gapMd]}>
                <View style={styles.sheetHeaderIcon}>
                  <Text style={{ fontSize: 22 }}>🎂</Text>
                </View>

                <View style={gs.flex1}>
                  <Text style={styles.sheetTitle}>Ulang Tahun Hari Ini</Text>
                  <Text style={styles.sheetSubtitle}>
                    {birthdays.length} karyawan sedang merayakan
                  </Text>
                </View>

                <TouchableOpacity onPress={closeModal} style={styles.sheetClose}>
                  <MaterialCommunityIcons name="close" size={18} color={Colors.white} />
                </TouchableOpacity>
              </View>
            </LinearGradient>

            <FlatList
              data={birthdays}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderEmployee}
              contentContainerStyle={styles.listContainer}
              showsVerticalScrollIndicator={false}
            />
          </Animated.View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  banner: {
    marginHorizontal: Spacing.screenPadding,
    marginBottom: Spacing.xl,
  },
  bannerIcon: {
    width: 48,
    height: 48,
    borderRadius: Spacing.radius.full,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(4, 61, 35, 0.55)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: Spacing.radius.xxl,
    borderTopRightRadius: Spacing.radius.xxl,
    maxHeight: '85%',
    minHeight: '50%',
    overflow: 'hidden',
    ...Shadows.raised,
  },
  sheetHeader: {
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  sheetHeaderIcon: {
    width: 44,
    height: 44,
    borderRadius: Spacing.radius.full,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sheetTitle: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: Colors.white,
  },
  sheetSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
  },
  sheetClose: {
    width: 32,
    height: 32,
    borderRadius: Spacing.radius.full,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  listContainer: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl + Spacing.sm,
  },
  employeeCard: {
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: Spacing.radius.full,
    borderWidth: 2,
    borderColor: brand[100],
    backgroundColor: brand[50],
  },
  ageBadge: {
    width: 48,
    height: 48,
    borderRadius: Spacing.radius.full,
    backgroundColor: brand[600],
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.brand,
  },
  ageBadgeText: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: Colors.white,
    lineHeight: 17,
  },
  ageBadgeUnit: {
    fontFamily: fonts.medium,
    fontSize: 8,
    color: 'rgba(255,255,255,0.85)',
    letterSpacing: 0.5,
  },

  detailItem: {
    marginBottom: Spacing.sm,
  },
  detailLabel: {
    fontFamily: fonts.semibold,
    fontSize: 10,
    color: Colors.textTertiary,
    letterSpacing: 0.5,
  },
  detailValue: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: Colors.textPrimary,
    marginTop: 2,
    paddingLeft: 18,
  },
});
