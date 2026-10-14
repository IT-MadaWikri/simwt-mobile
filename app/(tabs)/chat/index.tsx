/**
 * Daftar percakapan — tata letak mengikuti WhatsApp.
 *
 * Mita (asisten AI) dipin di baris teratas dengan rupa khusus — cincin
 * gradien di sekeliling avatarnya — meniru penempatan Meta AI di WhatsApp.
 * Kontak lain adalah sesama pengguna; sebelum server chat (WebSocket) hidup,
 * percakapannya tersimpan lokal dan pesan keluar berstatus jam pasir.
 */
import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors, { brand } from '../../../constants/Colors';
import Spacing, { Shadows } from '../../../constants/Spacing';
import Typography, { fonts } from '../../../constants/Typography';
import { gs } from '../../../constants/GlobalStyles';
import { useAuth } from '../../../src/contexts/AuthContext';
import { chatService } from '../../../src/services/chatService';
import { jalankanSetelahTransisi } from '../../../src/utils/useSetelahTransisi';
import { RingkasanChat } from '../../../src/types/chat';

/** "14.32" untuk hari ini, "Kemarin", atau "10/08" untuk yang lebih lama. */
function labelWaktu(waktu: number | null): string {
  if (!waktu) return '';
  const tanggal = new Date(waktu);
  const sekarang = new Date();
  const awalHariIni = new Date(sekarang.getFullYear(), sekarang.getMonth(), sekarang.getDate());

  if (tanggal >= awalHariIni) {
    return tanggal.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  }
  if (tanggal >= new Date(awalHariIni.getTime() - 86400000)) {
    return 'Kemarin';
  }
  return tanggal.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit' });
}

function inisial(nama: string): string {
  return nama
    .split(' ')
    .slice(0, 2)
    .map((kata) => kata[0] ?? '')
    .join('')
    .toUpperCase();
}

export default function DaftarChatScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const [daftar, setDaftar] = useState<RingkasanChat[]>([]);
  const [cari, setCari] = useState('');

  // Muat ulang tiap kali layar kembali fokus, supaya cuplikan pesan terakhir
  // langsung segar sepulang dari ruang chat — TAPI setelah animasi
  // perpindahan selesai, agar keduanya tidak berebut thread JS.
  useFocusEffect(
    useCallback(() => {
      let aktif = true;
      const batal = jalankanSetelahTransisi(() => {
        // Kontak dimuat lebih dulu supaya nama percakapan yang tersimpan bisa
        // diterjemahkan; keduanya di-cache di modul jadi murah dipanggil ulang.
        chatService
          .muatKontakPengguna(user?.id ?? 0)
          .catch(() => undefined)
          .then(() => chatService.ringkasan(user?.id ?? 'tamu'))
          .then((hasil) => {
            if (aktif) setDaftar(hasil);
          });
      });
      return () => {
        aktif = false;
        batal();
      };
    }, [user?.id])
  );

  const tersaring = cari
    ? daftar.filter((baris) =>
        baris.kontak.nama.toLowerCase().includes(cari.toLowerCase())
      )
    : daftar;

  const renderBaris = ({ item }: { item: RingkasanChat }) => {
    const { kontak } = item;

    const avatar = kontak.ai ? (
      // Cincin gradien ala Meta AI: avatar dibungkus gradien brand tipis.
      <LinearGradient
        colors={[brand[400], brand[600], brand[800]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.avatarRing}
      >
        <View style={[styles.avatar, { backgroundColor: Colors.white }]}>
          <MaterialCommunityIcons name="creation" size={24} color={brand[600]} />
        </View>
      </LinearGradient>
    ) : (
      <View style={[styles.avatar, { backgroundColor: brand[100] }]}>
        <Text style={styles.avatarInisial}>{inisial(kontak.nama)}</Text>
      </View>
    );

    return (
      <TouchableOpacity
        style={styles.baris}
        activeOpacity={0.7}
        onPress={() => router.push(`/(tabs)/chat/${kontak.id}` as any)}
      >
        {avatar}

        <View style={[gs.flex1, { marginLeft: Spacing.md }]}>
          <View style={gs.rowBetween}>
            <View style={[gs.row, gs.gapXs]}>
              <Text style={styles.nama} numberOfLines={1}>
                {kontak.nama}
              </Text>
              {kontak.ai && (
                <View style={[gs.badge, gs.badgeBrand, styles.badgeAi]}>
                  <Text style={[gs.badgeText, gs.badgeTextBrand, { fontSize: 9 }]}>AI</Text>
                </View>
              )}
            </View>
            <Text style={gs.caption}>{labelWaktu(item.waktu)}</Text>
          </View>

          <View style={[gs.rowBetween, { marginTop: 2 }]}>
            <Text style={[gs.bodySm, gs.flex1]} numberOfLines={1}>
              {item.cuplikan}
            </Text>
            {item.belumDibaca > 0 && (
              <View style={styles.unread}>
                <Text style={styles.unreadTeks}>{item.belumDibaca}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[gs.screenPlain, { paddingTop: insets.top }]}>
      {/* Bilah judul: tombol kembali ke beranda + nama besar. Tab bar
          disembunyikan di seluruh tumpukan chat, jadi tanpa tombol ini
          pengguna tidak punya jalan pulang. */}
      <View style={[gs.row, styles.kepala]}>
        <TouchableOpacity
          onPress={() => router.push('/(tabs)' as any)}
          style={styles.tombolKembali}
          accessibilityLabel="Kembali ke beranda"
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={brand[700]} />
        </TouchableOpacity>
        <Text style={[styles.judul, gs.flex1]}>Chat</Text>
      </View>

      {/* Pencarian pil. */}
      <View style={[gs.containerX, { marginBottom: Spacing.sm }]}>
        <View style={[gs.searchBar, { paddingVertical: Spacing.xs }]}>
          <MaterialCommunityIcons name="magnify" size={20} color={Colors.textTertiary} />
          <TextInput
            style={gs.fieldInner}
            placeholder="Cari kontak..."
            placeholderTextColor={Colors.placeholder}
            value={cari}
            onChangeText={setCari}
          />
        </View>
      </View>

      <FlatList
        data={tersaring}
        keyExtractor={(item) => item.kontak.id}
        renderItem={renderBaris}
        contentContainerStyle={{ paddingBottom: Spacing.xxxl }}
        ItemSeparatorComponent={() => <View style={styles.pemisah} />}
        ListEmptyComponent={
          <Text style={[gs.emptyText, { marginTop: Spacing.xxl }]}>
            Belum ada percakapan. Mulai lewat tombol Chat Baru.
          </Text>
        }
      />

      {/* Tombol chat baru mengambang — pola WhatsApp. */}
      <TouchableOpacity
        style={[styles.fab, { bottom: insets.bottom + Spacing.xl }]}
        activeOpacity={0.85}
        onPress={() => router.push('/(tabs)/chat/baru' as any)}
        accessibilityLabel="Mulai chat baru"
      >
        <MaterialCommunityIcons name="message-plus-outline" size={24} color={Colors.white} />
      </TouchableOpacity>
    </View>
  );
}

const AVATAR = 50;

const styles = {
  kepala: {
    paddingHorizontal: Spacing.screenPadding,
    // Ruang napas ekstra di bawah status bar — tanpa ini judul terasa
    // menempel ke tepi atas layar.
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
  },
  tombolKembali: {
    padding: Spacing.xs,
    marginLeft: -Spacing.xs,
  },
  judul: {
    fontFamily: fonts.bold,
    fontSize: Typography.sizes.xxl,
    color: brand[700],
  },
  baris: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: Spacing.screenPadding,
    paddingVertical: Spacing.md,
  },
  avatarRing: {
    width: AVATAR + 6,
    height: AVATAR + 6,
    borderRadius: (AVATAR + 6) / 2,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    // Kompensasi supaya baris ber-cincin sejajar dengan baris biasa.
    marginLeft: -3,
    marginRight: -3,
  },
  avatar: {
    width: AVATAR,
    height: AVATAR,
    borderRadius: AVATAR / 2,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  avatarInisial: {
    fontFamily: fonts.semibold,
    fontSize: Typography.sizes.lg,
    color: brand[700],
  },
  nama: {
    fontFamily: fonts.semibold,
    fontSize: Typography.sizes.lg,
    color: Colors.textPrimary,
  },
  badgeAi: {
    paddingVertical: 1,
    paddingHorizontal: Spacing.sm,
  },
  pemisah: {
    height: 1,
    backgroundColor: Colors.borderSubtle,
    marginLeft: Spacing.screenPadding + AVATAR + Spacing.md,
  },
  unread: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: brand[500],
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingHorizontal: 5,
    marginLeft: Spacing.sm,
  },
  unreadTeks: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    color: Colors.white,
  },
  fab: {
    position: 'absolute' as const,
    right: Spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: brand[600],
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    ...Shadows.brand,
  },
};
