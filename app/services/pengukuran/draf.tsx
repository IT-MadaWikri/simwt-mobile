/**
 * Draf Pengukuran — draf yang disimpan di perangkat (kedaluwarsa 7 hari). Ketuk untuk melanjutkan di form
 * pengukuran; tombol sampah menghapusnya.
 */
import React, { useCallback } from 'react';
import { View, FlatList, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '../../../src/components/common/Icon';
import KeadaanKosong from '../../../src/components/common/KeadaanKosong';
import { dialog } from '../../../src/components/common/AppDialog';
import KartuDraf from '../../../src/components/pengukuran/KartuDraf';
import Colors from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { fonts, ukuranIsi } from '../../../constants/Typography';
import { gs, inputReset } from '../../../constants/GlobalStyles';
import { useDrafPengukuran } from '../../../src/hooks/useDrafPengukuran';
import { DrafPengukuran } from '../../../src/types/pengukuran';
import { relatif } from '../../../src/utils/kaizen';

export default function DrafPengukuranScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const d = useDrafPengukuran();

  useFocusEffect(useCallback(() => d.muat(), [d.muat]));

  const hapus = async (draf: DrafPengukuran) => {
    const ya = await dialog.confirm({
      title: 'Hapus draf ini?',
      message: draf.draftName,
      confirmText: 'Hapus',
      destructive: true,
    });
    if (ya) d.hapus(draf.id);
  };

  return (
    <View style={[gs.screen, { backgroundColor: Colors.white }]}>
      <View style={styles.barisCari}>
        <View style={[gs.searchBar, gs.flex1, styles.kotakCari]}>
          <Icon name="magnify" size={16} color={Colors.textTertiary} />
          <TextInput
            style={styles.cari}
            placeholder="Cari nama draf atau nomor part"
            placeholderTextColor={Colors.placeholder}
            value={d.search}
            onChangeText={d.setSearch}
            returnKeyType="search"
          />
          {d.search ? (
            <TouchableOpacity onPress={() => d.setSearch('')} hitSlop={10} accessibilityLabel="Hapus pencarian">
              <Icon name="close-circle" size={16} color={Colors.textTertiary} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <FlatList
        data={d.draf}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1, paddingBottom: insets.bottom + Spacing.xl }}
        ItemSeparatorComponent={() => <View style={styles.pemisah} />}
        ListEmptyComponent={
          d.memuat ? null : (
            <KeadaanKosong
              pose="ide"
              judul={d.search.trim() ? 'Tidak ditemukan' : 'Belum ada draf'}
              teks={d.search.trim() ? 'Coba kata cari lain.' : 'Tekan "Simpan draf" di form pengukuran untuk menyimpan isian yang belum selesai.'}
            />
          )
        }
        renderItem={({ item }) => (
          <KartuDraf
            judul={item.draftName}
            keterangan={[item.partCode, item.process, item.customer].filter(Boolean).join(' · ')}
            waktu={relatif(item.updatedAt)}
            onPress={() =>
              router.push({
                pathname: '/services/pengukuran/input' as any,
                params: { idPart: String(item.partId), idProses: String(item.processId ?? ''), draf: item.id },
              })
            }
            onHapus={() => hapus(item)}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  barisCari: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.screenPadding, paddingVertical: Spacing.md },
  kotakCari: { height: 36, paddingVertical: 0, paddingHorizontal: Spacing.md, gap: 6 },
  cari: { flex: 1, paddingVertical: 0, fontSize: ukuranIsi, fontFamily: fonts.regular, color: Colors.textPrimary, ...inputReset },
  pemisah: { height: StyleSheet.hairlineWidth, backgroundColor: Colors.border, marginHorizontal: Spacing.screenPadding },
});
