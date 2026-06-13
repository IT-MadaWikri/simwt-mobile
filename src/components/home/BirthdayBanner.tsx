import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList, Image, Dimensions, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Colors from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
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
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
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
    }).start(() => {
      setModalVisible(false);
    });
  };

  const renderEmployee = ({ item }: { item: Employee }) => {
    const age = calculateAge(item.tanggal_lahir);
    const jabatanText = typeof item.jabatan === 'string' ? item.jabatan : (item.jabatan?.nama || 'Unknown Role');

    return (
      <View style={styles.employeeCard}>
        {/* Top Section: Avatar, Name, Age Badge */}
        <View style={styles.cardHeader}>
          {item.foto_profil ? (
            <Image 
              source={{ uri: item.foto_profil.startsWith('http') ? item.foto_profil : `https://mwtpart.co.id/storage/${item.foto_profil}` }} 
              style={styles.avatar} 
            />
          ) : (
            <View style={styles.avatarFallback}>
              <MaterialCommunityIcons name="account" size={28} color={Colors.white} />
            </View>
          )}
          
          <View style={styles.headerText}>
            <Text style={styles.employeeName}>{item.nama_lengkap}</Text>
            <View style={styles.turningRow}>
              <MaterialCommunityIcons name="party-popper" size={14} color="#00AA13" style={{ marginRight: 4 }} />
              <Text style={styles.turningText}>Ulang Tahun ke-{age}</Text>
            </View>
          </View>

          <View style={styles.ageBadge}>
            <Text style={styles.ageBadgeText}>{age} THN</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Bottom Section: Details Grid */}
        <View style={styles.detailsGrid}>
          <View style={styles.detailColumn}>
            <View style={styles.detailItem}>
              <View style={styles.detailLabelRow}>
                <MaterialCommunityIcons name="badge-account-horizontal-outline" size={14} color="#4A4A4A" />
                <Text style={styles.detailLabel}>NIK</Text>
              </View>
              <Text style={styles.detailValue}>{item.nik || '-'}</Text>
            </View>

            <View style={styles.detailItem}>
              <View style={styles.detailLabelRow}>
                <MaterialCommunityIcons name="cake-variant-outline" size={14} color="#4A4A4A" />
                <Text style={styles.detailLabel}>TANGGAL LAHIR</Text>
              </View>
              <Text style={styles.detailValue}>{formatIndonesianDate(item.tanggal_lahir)}</Text>
            </View>
          </View>

          <View style={styles.detailColumn}>
            <View style={styles.detailItem}>
              <View style={styles.detailLabelRow}>
                <MaterialCommunityIcons name="briefcase-outline" size={14} color="#4A4A4A" />
                <Text style={styles.detailLabel}>JABATAN</Text>
              </View>
              <Text style={styles.detailValue}>{jabatanText}</Text>
            </View>
          </View>
        </View>

        {/* Beri Ucapan */}
        <View style={styles.ucapanDivider} />
        <TouchableOpacity style={styles.ucapanRow} activeOpacity={0.7}>
          <MaterialCommunityIcons name="chat-outline" size={16} color="#00AA13" />
          <Text style={styles.ucapanText}>Beri ucapan</Text>
          <MaterialCommunityIcons name="chevron-right" size={16} color="#00AA13" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <>
      <TouchableOpacity style={styles.bannerContainer} activeOpacity={0.9} onPress={openModal}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name="gift" size={28} color="#00AA13" />
        </View>
        <View style={styles.bannerTextContainer}>
          <Text style={styles.bannerTitle}>Karyawan Berulang Tahun</Text>
          <Text style={styles.bannerSubtitle}>
            Hari ini ada <Text style={{ fontWeight: 'bold' }}>{birthdays.length}</Text> karyawan berulang tahun 🎉
          </Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={24} color="#00AA13" />
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent={true} animationType="fade" onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalDismissArea} activeOpacity={1} onPress={closeModal} />
          <Animated.View style={[styles.bottomSheet, { transform: [{ translateY: slideAnim }] }]}>
            {/* Gojek-style Green Header */}
            <View style={styles.sheetHeaderWrap}>
              <View style={styles.sheetHeaderRow}>
                <View style={styles.sheetHeaderIconCircle}>
                  <Text style={{ fontSize: 22 }}>🎂</Text>
                </View>
                <View style={styles.sheetHeaderTextContainer}>
                  <Text style={styles.sheetTitle}>Ulang Tahun Hari Ini</Text>
                  <Text style={styles.sheetSubtitle}>{birthdays.length} karyawan sedang merayakan 🎂</Text>
                </View>
                <TouchableOpacity onPress={closeModal} style={styles.closeButtonCircle}>
                  <MaterialCommunityIcons name="close" size={18} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>

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
  /* Banner on Home Screen */
  bannerContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: Spacing.screenPadding,
    borderRadius: 20,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    // Gojek soft shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  iconContainer: {
    backgroundColor: '#E5F6E8', // Light Gojek green background
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  bannerTextContainer: { flex: 1 },
  bannerTitle: { color: '#1C1C1C', fontSize: 16, fontWeight: 'bold', marginBottom: 2 },
  bannerSubtitle: { color: '#68737D', fontSize: 13, lineHeight: 18 },
  
  /* Modal Overlay */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(28, 28, 28, 0.6)',
    justifyContent: 'flex-end',
  },
  modalDismissArea: {
    flex: 1,
  },
  /* Bottom Sheet */
  bottomSheet: {
    backgroundColor: '#F5F6F8',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    minHeight: '50%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
    overflow: 'hidden',
  },
  /* Green Header */
  sheetHeaderWrap: {
    backgroundColor: '#00AA13',
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: Spacing.lg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  sheetHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sheetHeaderIconCircle: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  sheetHeaderTextContainer: {
    flex: 1,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  sheetSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '500',
  },
  closeButtonCircle: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: 40,
  },
  
  /* Premium Employee Card */
  employeeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: '#E5F6E8',
  },
  avatarFallback: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#00AA13',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5F6E8',
  },
  headerText: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  employeeName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1C1C',
    marginBottom: 4,
  },
  turningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E5F6E8', // Light green pill
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  turningText: {
    fontSize: 12,
    color: '#00AA13',
    fontWeight: '600',
  },
  ageBadge: {
    backgroundColor: '#00AA13',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00AA13',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  ageBadgeText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: Spacing.md,
  },
  /* Grid Details */
  detailsGrid: {
    flexDirection: 'row',
  },
  detailColumn: {
    flex: 1,
  },
  detailItem: {
    marginBottom: Spacing.sm,
  },
  detailLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9E9E9E',
    marginLeft: 6,
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 14,
    color: '#1C1C1C',
    fontWeight: '500',
    paddingLeft: 20,
  },
  ucapanDivider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginTop: Spacing.sm,
  },
  ucapanRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Spacing.md,
  },
  ucapanText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#00AA13',
    marginLeft: 8,
  },
});
