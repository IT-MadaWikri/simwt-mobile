/** Daftar Aset — aset di departemen pengguna, dengan pencarian, filter kategori, dan paginasi gulir. */
import React from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppBar from '../../../src/components/common/AppBar';
import Icon from '../../../src/components/common/Icon';
import KeadaanKosong from '../../../src/components/common/KeadaanKosong';
import { SkeletonDaftar } from '../../../src/components/common/Skeleton';
import BarisAset from '../../../src/components/aset/BarisAset';
import SheetFilterAset from '../../../src/components/aset/SheetFilterAset';
import Colors, { brand } from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { fonts, ukuranIsi } from '../../../constants/Typography';
import { gs, inputReset } from '../../../constants/GlobalStyles';
import { useDaftarAset } from '../../../src/hooks/useDaftarAset';
import { StatusAset } from '../../../src/types/aset';

const JUDUL: Record<StatusAset, string> = { maintenance: 'Aset Maintenance', tidak_aktif: 'Aset Tidak Aktif' };

export default function DaftarAsetScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { status: statusParam } = useLocalSearchParams<{ status?: string }>();
  const status = statusParam === 'maintenance' || statusParam === 'tidak_aktif' ? statusParam : undefined;
  const {
    aset, total, kataKunci, setKataKunci, kategoriId, setKategoriId, opsiKategori, filterTerbuka, setFilterTerbuka,
    memuat, memuatLebih, menyegarkan, error, segarkan, muatLebihBanyak,
  } = useDaftarAset(status);

  return (
    <>
      <AppBar judul={status ? JUDUL[status] : 'Daftar Aset'} />
      <View style={[gs.screen, { backgroundColor: Colors.white }]}>
        <View style={styles.barisCari}>
          <View style={[gs.searchBar, gs.flex1, styles.kotakCari]}>
            <Icon name="magnify" size={16} color={Colors.textTertiary} />
            <TextInput
              style={styles.cari}
              placeholder="Cari nama, nomor, atau PIC aset"
              placeholderTextColor={Colors.placeholder}
              value={kataKunci}
              onChangeText={setKataKunci}
              returnKeyType="search"
            />
            {kataKunci ? (
              <TouchableOpacity onPress={() => setKataKunci('')} hitSlop={10} accessibilityLabel="Hapus pencarian">
                <Icon name="close-circle" size={16} color={Colors.textTertiary} />
              </TouchableOpacity>
            ) : null}
          </View>
          <TouchableOpacity style={styles.tombol} onPress={() => setFilterTerbuka(true)} accessibilityLabel="Filter">
            <Icon name="filter-outline" size={16} color={Colors.textPrimary} />
            {kategoriId ? <View style={styles.titik} /> : null}
          </TouchableOpacity>
        </View>
        {!memuat && !error ? <Text style={[styles.jumlah, gs.containerX]}>{total} aset</Text> : null}

        {memuat ? (
          <SkeletonDaftar />
        ) : error && aset.length === 0 ? (
          <Text style={[gs.emptyText, gs.containerX]}>{error}</Text>
        ) : (
          <FlatList
            data={aset}
            keyExtractor={(a) => a.asset_number}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ flexGrow: 1, paddingBottom: insets.bottom + Spacing.xxl }}
            refreshControl={<RefreshControl refreshing={menyegarkan} onRefresh={segarkan} colors={[Colors.primary]} tintColor={Colors.primary} />}
            onEndReached={muatLebihBanyak}
            onEndReachedThreshold={0.4}
            ItemSeparatorComponent={() => <View style={styles.pemisah} />}
            ListEmptyComponent={
              <KeadaanKosong
                pose="mikir"
                judul="Aset tidak ditemukan"
                teks={kataKunci || kategoriId ? 'Tidak ada aset yang cocok dengan pencarian atau filtermu.' : status ? 'Tidak ada aset dengan status ini.' : 'Belum ada aset di departemenmu.'}
              />
            }
            ListFooterComponent={memuatLebih ? <ActivityIndicator style={{ marginVertical: Spacing.lg }} color={Colors.primary} /> : null}
            renderItem={({ item }) => (
              <BarisAset
                nama={item.alias || item.asset_name}
                nomor={item.asset_number}
                keterangan={[item.kategori, item.asset_pic].filter(Boolean).join(' · ')}
                lokasi={[item.plant, item.departemen].filter(Boolean).join(' · ')}
                onPress={() => router.push({ pathname: '/scan-result', params: { nomor: item.asset_number } })}
              />
            )}
          />
        )}
      </View>

      <SheetFilterAset
        visible={filterTerbuka}
        onClose={() => setFilterTerbuka(false)}
        aktif={kategoriId}
        opsi={opsiKategori}
        onTerapkan={(id) => {
          setKategoriId(id);
          setFilterTerbuka(false);
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  barisCari: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.screenPadding,
    paddingVertical: Spacing.md,
  },
  kotakCari: { height: 36, paddingVertical: 0, paddingHorizontal: Spacing.md, gap: 6 },
  cari: {
    flex: 1,
    paddingVertical: 0,
    fontSize: ukuranIsi,
    fontFamily: fonts.regular,
    color: Colors.textPrimary,
    ...inputReset,
  },
  tombol: {
    width: 36,
    height: 36,
    marginLeft: Spacing.sm,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  titik: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: brand[600],
  },
  jumlah: { fontFamily: fonts.regular, fontSize: 12, color: Colors.textTertiary, paddingBottom: Spacing.sm },
  pemisah: { height: StyleSheet.hairlineWidth, backgroundColor: Colors.border, marginHorizontal: Spacing.screenPadding },
});
