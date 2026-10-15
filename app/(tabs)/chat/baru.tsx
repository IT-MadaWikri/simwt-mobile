/**
 * Chat Baru — pilih lawan bicara dari daftar pengguna SIMWT.
 *
 * Meniru layar "Kontak" WhatsApp: pencarian di atas, daftar bernama dengan
 * avatar inisial, dikelompokkan alfabet lewat header lengket. Memilih satu
 * kontak menandai percakapannya aktif lalu langsung membuka ruang chat.
 */
import React, { useMemo, useState } from 'react';
import AppBar from '../../../src/components/common/AppBar';
import { View, Text, SectionList, TextInput, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import Icon from '../../../src/components/common/Icon';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors, { brand } from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import Typography, { fonts, judulAppBar } from '../../../constants/Typography';
import { gs } from '../../../constants/GlobalStyles';
import { useAuth } from '../../../src/contexts/AuthContext';
import { chatService } from '../../../src/services/chatService';
import { KontakChat } from '../../../src/types/chat';
import { useSetelahTransisi } from '../../../src/utils/useSetelahTransisi';
import { SkeletonDaftar } from '../../../src/components/common/Skeleton';

function inisial(nama: string): string {
  return nama
    .split(' ')
    .slice(0, 2)
    .map((kata) => kata[0] ?? '')
    .join('')
    .toUpperCase();
}

export default function ChatBaruScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const [kontak, setKontak] = useState<KontakChat[]>([]);
  const [memuat, setMemuat] = useState(true);
  const [galat, setGalat] = useState<string | null>(null);
  const [cari, setCari] = useState('');

  useSetelahTransisi(() => {
    chatService
      .muatKontakPengguna(user?.id ?? 0)
      .then(setKontak)
      .catch((err: any) => setGalat(err?.message ?? 'Gagal memuat daftar pengguna.'))
      .finally(() => setMemuat(false));
  }, [user?.id]);

  /** Kelompokkan per huruf pertama, seperti buku alamat. */
  const seksi = useMemo(() => {
    const tersaring = cari
      ? kontak.filter(
          (item) =>
            item.nama.toLowerCase().includes(cari.toLowerCase()) ||
            item.keterangan.toLowerCase().includes(cari.toLowerCase())
        )
      : kontak;

    const peta = new Map<string, KontakChat[]>();
    tersaring.forEach((item) => {
      const huruf = (item.nama[0] ?? '#').toUpperCase();
      peta.set(huruf, [...(peta.get(huruf) ?? []), item]);
    });

    return [...peta.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([huruf, data]) => ({ title: huruf, data }));
  }, [kontak, cari]);

  const mulai = async (item: KontakChat) => {
    await chatService.mulaiPercakapan(user?.id ?? 'tamu', item.id);
    router.replace(`/(tabs)/chat/${item.id}` as any);
  };

  return (
    <View style={gs.screenPlain}>
      <AppBar judul="Chat Baru" />

      <View style={[gs.containerX, { marginVertical: Spacing.sm }]}>
        <Text style={[gs.caption, { marginBottom: Spacing.xs }]}>
          {memuat ? 'Memuat kontak...' : `${kontak.length} pengguna`}
        </Text>
        <View style={[gs.searchBar, { paddingVertical: Spacing.xs }]}>
          <Icon name="magnify" size={20} color={Colors.textTertiary} />
          <TextInput
            style={gs.fieldInner}
            placeholder="Cari nama atau jabatan..."
            placeholderTextColor={Colors.placeholder}
            value={cari}
            onChangeText={setCari}
          />
        </View>
      </View>

      {memuat ? (
        <SkeletonDaftar avatar="bulat" />
      ) : (
        <SectionList
          sections={seksi}
          keyExtractor={(item) => item.id}
          stickySectionHeadersEnabled
          contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.xxl }}
          initialNumToRender={14}
          windowSize={9}
          removeClippedSubviews
          renderSectionHeader={({ section }) => (
            <View style={styles.kepalaSeksi}>
              <Text style={styles.hurufSeksi}>{section.title}</Text>
            </View>
          )}
          ListEmptyComponent={
            <View style={[gs.center, { marginTop: Spacing.xxl }]}>
              <Text style={gs.emptyText}>
                {galat ?? 'Tidak ada pengguna yang cocok.'}
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.baris} activeOpacity={0.7} onPress={() => mulai(item)}>
              <View style={styles.avatar}>
                <Text style={styles.avatarInisial}>{inisial(item.nama)}</Text>
              </View>
              <View style={[gs.flex1, { marginLeft: Spacing.md }]}>
                <Text style={styles.nama} numberOfLines={1}>
                  {item.nama}
                </Text>
                <Text style={gs.bodySm} numberOfLines={1}>
                  {item.keterangan}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const AVATAR = 46;

const styles = {
  kepalaSeksi: {
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.screenPadding,
    paddingVertical: Spacing.xs,
  },
  hurufSeksi: {
    fontFamily: fonts.semibold,
    fontSize: Typography.sizes.xs,
    color: brand[700],
  },
  baris: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: Spacing.screenPadding,
    paddingVertical: Spacing.sm + 2,
  },
  avatar: {
    width: AVATAR,
    height: AVATAR,
    borderRadius: AVATAR / 2,
    backgroundColor: brand[100],
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  avatarInisial: {
    fontFamily: fonts.semibold,
    fontSize: Typography.sizes.md,
    color: brand[700],
  },
  nama: {
    fontFamily: fonts.semibold,
    fontSize: Typography.sizes.lg,
    color: Colors.textPrimary,
  },
};
