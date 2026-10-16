/**
 * Menu Kaizen — layar pertama tumpukan Kaizen. Dibuka dari ikon Kaizen di
 * beranda; dari sini ke daftar Kaizen milik sendiri atau antrean approval.
 * "Kaizen Saya" ada di `saya.tsx`, jadi tombol kembali di sana otomatis
 * mundur ke menu ini (satu tumpukan), bukan melompat ke beranda.
 */
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '../../../src/components/common/Icon';
import AppBar from '../../../src/components/common/AppBar';
import Colors from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { gs } from '../../../constants/GlobalStyles';

const MENU = [
  {
    icon: 'lightbulb-on-outline',
    label: 'Kaizen saya',
    subtitle: 'Daftar dan pengajuan Kaizen kamu',
    route: '/kaizen/saya',
  },
  {
    icon: 'clipboard-check-outline',
    label: 'Butuh approval',
    subtitle: 'Kaizen yang menunggu keputusanmu',
    route: '/(tabs)/activity?jenis=kaizen',
  },
];

export default function MenuKaizenScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <>
      <AppBar judul="Kaizen" />
      <ScrollView
        style={[gs.screen, { backgroundColor: Colors.white }]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[gs.scrollContent, { paddingBottom: insets.bottom + Spacing.xxl }]}
      >
        <Text style={gs.sectionTitle}>Menu Kaizen</Text>

        {MENU.map((item) => (
          <TouchableOpacity
            key={item.label}
            style={[gs.card, gs.row, gs.gapMd, { marginBottom: Spacing.sm }]}
            activeOpacity={0.7}
            onPress={() => router.push(item.route as any)}
          >
            <View style={[gs.iconTile, { backgroundColor: Colors.serviceAmber }]}>
              <Icon name={item.icon} size={20} color="#b45309" />
            </View>
            <View style={gs.flex1}>
              <Text style={gs.title}>{item.label}</Text>
              <Text style={gs.caption}>{item.subtitle}</Text>
            </View>
            <Icon name="chevron-right" size={22} color={Colors.textTertiary} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </>
  );
}
