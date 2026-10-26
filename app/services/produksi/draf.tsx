/**
 * Draf Pencapaian Produksi — draf yang disimpan di perangkat. Tap untuk melanjutkan di form
 * Pencapaian Produksi; tombol sampah menghapusnya.
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
import { fonts } from '../../../constants/Typography';
import { gs } from '../../../constants/GlobalStyles';
import { useAuth } from '../../../src/contexts/AuthContext';
import { drafProduksi, DrafProduksi } from '../../../src/utils/drafProduksi';
import { LANGKAH } from '../../../src/hooks/useFormProduksi';
import { relatif } from '../../../src/utils/kaizen';

export default function DrafProduksiScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [daftar, setDaftar] = useState<DrafProduksi[] | null>(null);

  const muat = useCallback(() => {
    drafProduksi.daftar(user?.nik).then(setDaftar);
  }, [user?.nik]);
  useFocusEffect(muat);

  const hapus = async (d: DrafProduksi) => {
    const ya = await dialog.confirm({
      title: 'Hapus draf ini?',
      message: d.judul || d.namaDies,
      confirmText: 'Hapus',
      destructive: true,
    });
    if (!ya) return;
    await drafProduksi.hapus(user?.nik, d.id);
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
            <KeadaanKosong pose="ide" judul="Belum ada draf" teks={'Tekan "Simpan draf" di form Pencapaian Produksi untuk menyimpan isian yang belum selesai.'} />
          ) : null
        }
        renderItem={({ item }) => {
          const meta = [
            item.pembuat ? `${item.pembuat}${item.shiftPembuat ? ` (Shift ${item.shiftPembuat})` : ''}` : null,
            item.judul ? item.namaDies : null,
            item.namaMesin,
            `Langkah ${Math.min(item.langkah + 1, LANGKAH.length)}/${LANGKAH.length}`,
          ].filter(Boolean);
          return (
            <TouchableOpacity
              style={styles.baris}
              activeOpacity={0.6}
              onPress={() =>
                router.push({
                  pathname: '/services/produksi/stroke',
                  params: { nomor: item.nomor, ...(item.mesin ? { mesin: item.mesin } : {}), draf: item.id },
                })
              }
            >
              <View style={styles.ikon}>
                <Icon name="gauge" size={18} color={brand[700]} />
              </View>
              <View style={gs.flex1}>
                <Text style={styles.judul} numberOfLines={1}>{item.judul || item.namaDies}</Text>
                <Text style={styles.meta} numberOfLines={2}>
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
  isi: { flexGrow: 1, paddingHorizontal: Spacing.lg },
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
  judul: { fontSize: 12, fontFamily: fonts.semibold, color: Colors.textPrimary },
  meta: { marginTop: 2, fontSize: 12, fontFamily: fonts.regular, color: Colors.textSecondary },
});
