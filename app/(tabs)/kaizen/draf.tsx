/**
 * Draft Kaizen Anda — draf yang disimpan di perangkat. Tap untuk melanjutkan
 * di halaman Buat Kaizen; tombol sampah menghapusnya.
 */
import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '../../../src/components/common/Icon';
import KeadaanKosong from '../../../src/components/common/KeadaanKosong';
import { dialog } from '../../../src/components/common/AppDialog';
import Colors, { brand } from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { fonts, ukuranIsi } from '../../../constants/Typography';
import { gs } from '../../../constants/GlobalStyles';
import { useAuth } from '../../../src/contexts/AuthContext';
import { drafKaizen, DrafKaizen } from '../../../src/utils/drafKaizen';
import { relatif } from '../../../src/utils/kaizen';

export default function DrafKaizenScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [daftar, setDaftar] = useState<DrafKaizen[] | null>(null);

  const muat = useCallback(() => {
    drafKaizen.daftar(user?.nik).then(setDaftar);
  }, [user?.nik]);
  useFocusEffect(muat);

  const hapus = async (d: DrafKaizen) => {
    const ya = await dialog.confirm({
      title: 'Hapus draf ini?',
      message: d.tema || 'Draf tanpa judul',
      confirmText: 'Hapus',
      destructive: true,
    });
    if (!ya) return;
    await drafKaizen.hapus(user?.nik, d.id);
    muat();
  };

  return (
    <View style={[gs.screen, { backgroundColor: Colors.white }]}>
      <FlatList
        data={daftar ?? []}
        keyExtractor={(d) => d.id}
        contentContainerStyle={[styles.isi, { paddingBottom: insets.bottom + Spacing.xl }]}
        ListEmptyComponent={
          daftar ? (
            <KeadaanKosong pose="ide" judul="Belum ada draf" teks={'Tekan "Simpan draf" di halaman Buat Kaizen untuk menyimpan isian yang belum selesai.'} />
          ) : null
        }
        renderItem={({ item }) => {
          const meta = [
            `Langkah ${item.langkah}/2`,
            item.data.fotos.length ? `${item.data.fotos.length} foto` : null,
            item.data.manfaat.length ? `${item.data.manfaat.length} manfaat` : null,
          ].filter(Boolean);
          return (
            <TouchableOpacity
              style={styles.baris}
              activeOpacity={0.6}
              onPress={() => router.push({ pathname: '/kaizen/buat', params: { draf: item.id } })}
            >
              <View style={styles.ikon}>
                <Icon name="file-document" size={18} color={brand[700]} />
              </View>
              <View style={gs.flex1}>
                <Text style={styles.tema} numberOfLines={1}>{item.tema || 'Tanpa judul'}</Text>
                <Text style={styles.meta} numberOfLines={1}>
                  {meta.join(' · ')} · disimpan {relatif(new Date(item.diubah).toISOString())}
                </Text>
              </View>
              <TouchableOpacity onPress={() => hapus(item)} hitSlop={10} accessibilityLabel="Hapus draf">
                <Icon name="delete-outline" size={18} color={Colors.textTertiary} />
              </TouchableOpacity>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  isi: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
  },
  baris: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  ikon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: brand[50],
  },
  tema: {
    fontSize: 12,
    fontFamily: fonts.semibold,
    color: Colors.textPrimary,
  },
  meta: {
    marginTop: 2,
    fontSize: 12,
    fontFamily: fonts.regular,
    color: Colors.textSecondary,
  },
});
