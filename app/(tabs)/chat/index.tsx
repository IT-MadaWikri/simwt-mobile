/**
 * Daftar percakapan — judul besar + ikon tulis di kanan, kolom cari outline,
 * baris datar tanpa pemisah (gaya aplikasi chat modern).
 *
 * Mita (asisten AI) dipin di baris teratas dengan rupa khusus — cincin
 * gradien di sekeliling avatarnya. Kontak lain adalah sesama pengguna; sebelum
 * server chat (WebSocket) hidup, percakapannya tersimpan lokal dan pesan
 * keluar berstatus jam pasir.
 */
import LencanaAngka from '../../../src/components/common/LencanaAngka';
import React, { useCallback, useState } from 'react';
import KeadaanKosong from '../../../src/components/common/KeadaanKosong';
import { View, Text, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { Stack, useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '../../../src/components/common/Icon';
import Avatar from '../../../src/components/common/Avatar';
import Colors, { brand } from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import Typography, { fonts, fontsJudul } from '../../../constants/Typography';
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
    const belumDibaca = item.belumDibaca > 0;

    const avatar = kontak.ai ? (
      // Cincin gradien ala Meta AI: avatar dibungkus gradien brand tipis.
      <View style={styles.avatarRing}>
        <View style={styles.avatarAi}>
          <Icon name="creation" size={24} color={brand[600]} />
        </View>
      </View>
    ) : (
      <Avatar nama={kontak.nama} foto={kontak.foto ?? undefined} ukuran={AVATAR} />
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
            <View style={[gs.row, gs.gapXs, gs.flex1]}>
              <Text style={styles.nama} numberOfLines={1}>
                {kontak.nama}
              </Text>
              {kontak.ai && (
                <View style={[gs.badge, gs.badgeBrand, styles.badgeAi]}>
                  <Text style={[gs.badgeText, gs.badgeTextBrand]}>AI</Text>
                </View>
              )}
            </View>
            <Text style={[styles.waktu, belumDibaca && styles.waktuBaru]}>
              {labelWaktu(item.waktu)}
            </Text>
          </View>

          <View style={[gs.rowBetween, { marginTop: 2 }]}>
            <Text style={[gs.bodySm, gs.flex1]} numberOfLines={2}>
              {item.cuplikan}
            </Text>
            {belumDibaca && (
              <LencanaAngka jumlah={item.belumDibaca} warna={brand[500]} style={styles.unread} />
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={gs.screenPlain}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Judul besar + tombol tulis chat baru. */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.lg }]}>
        <Text style={styles.judul}>Chat</Text>
        <TouchableOpacity
          onPress={() => router.push('/(tabs)/chat/baru' as any)}
          style={styles.tombolTulis}
          accessibilityLabel="Mulai chat baru"
        >
          <Icon name="message-plus-outline" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Kolom cari outline. */}
      <View style={[gs.containerX, { marginBottom: Spacing.sm }]}>
        <View style={styles.kolomCari}>
          <Icon name="magnify" size={20} color={Colors.textTertiary} />
          <TextInput
            style={[gs.fieldInner, { paddingVertical: Spacing.sm }]}
            placeholder="Cari kontak"
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
        contentContainerStyle={{ flexGrow: 1, paddingBottom: Spacing.xxxl }}
        ListEmptyComponent={
          <KeadaanKosong pose="sapa" judul="Belum ada percakapan" teks="Mulai lewat tombol tulis di kanan atas." />
        }
      />
    </View>
  );
}

const AVATAR = 52;

const styles = {
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: Spacing.screenPadding,
    paddingBottom: Spacing.md,
  },
  judul: {
    fontFamily: fontsJudul.bold,
    fontSize: Typography.sizes.xxxl,
    color: Colors.textPrimary,
  },
  tombolTulis: {
    padding: Spacing.sm,
  },
  kolomCari: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: Spacing.sm,
    borderRadius: Spacing.radius.full,
    ...Spacing.curve,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.lg,
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
    backgroundColor: brand[500],
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    // Kompensasi supaya baris ber-cincin sejajar dengan baris biasa.
    marginLeft: -3,
    marginRight: -3,
  },
  avatarAi: {
    width: AVATAR,
    height: AVATAR,
    borderRadius: AVATAR / 2,
    backgroundColor: Colors.white,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  nama: {
    fontFamily: fonts.bold,
    fontSize: Typography.sizes.lg,
    color: Colors.textPrimary,
  },
  badgeAi: {
    paddingVertical: 1,
    paddingHorizontal: Spacing.sm,
  },
  waktu: {
    fontFamily: fonts.regular,
    fontSize: Typography.sizes.xs,
    color: Colors.textTertiary,
    marginLeft: Spacing.sm,
  },
  // Waktu pesan yang belum dibaca diwarnai brand, seperti "Now" pada referensi.
  waktuBaru: {
    fontFamily: fonts.bold,
    color: brand[600],
  },
  unread: {
    marginLeft: Spacing.sm,
  },
};
