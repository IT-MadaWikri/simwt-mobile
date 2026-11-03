/**
 * Daftar Part — part produksi untuk Pengukuran QC. Kolom cari, tombol filter (proses + bisnis partner),
 * lalu daftar dengan tarik-untuk-segarkan. Mengetuk part membuka pilihan proses.
 * Sumber: GET /pengukuran-qc/part — cari, filter, dan paginasi (gulir tanpa batas) diproses server.
 */
import React, { useCallback } from 'react';
import { View, FlatList, TextInput, TouchableOpacity, RefreshControl, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BrandSpinner from '../../../../src/components/common/BrandSpinner';
import Icon from '../../../../src/components/common/Icon';
import Button from '../../../../src/components/common/Button';
import KeadaanKosong from '../../../../src/components/common/KeadaanKosong';
import { SkeletonBaris } from '../../../../src/components/common/Skeleton';
import KartuPart from '../../../../src/components/pengukuran/KartuPart';
import SheetFilterPart from '../../../../src/components/pengukuran/SheetFilterPart';
import Colors, { brand } from '../../../../constants/Colors';
import Spacing from '../../../../constants/Spacing';
import { fonts, ukuranIsi } from '../../../../constants/Typography';
import { gs, inputReset } from '../../../../constants/GlobalStyles';
import { buatUrlStorageApi } from '../../../../src/utils/storageApi';
import { useDaftarPart } from '../../../../src/hooks/useDaftarPart';
import { useOpsiFilterPart } from '../../../../src/hooks/useOpsiFilterPart';

export default function DaftarPartScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const p = useDaftarPart();
  const bukaPart = useCallback((id: number) => router.push(`/services/pengukuran/part/${id}` as any), [router]);
  const opsi = useOpsiFilterPart(p.filterTerbuka);

  // Titik hijau di tombol filter bila proses/bisnis partner sedang menyaring (kata cari tampak di kolomnya sendiri).
  const filterAktif = p.proses.length > 0 || p.bisnisPartner.length > 0;

  return (
    <View style={[gs.screen, { backgroundColor: Colors.white }]}>
      <View style={styles.barisCari}>
        <View style={[gs.searchBar, gs.flex1, styles.kotakCari]}>
          <Icon name="magnify" size={16} color={Colors.textTertiary} />
          <TextInput
            style={styles.cari}
            placeholder="Cari nama atau nomor part"
            placeholderTextColor={Colors.placeholder}
            value={p.search}
            onChangeText={p.setSearch}
            returnKeyType="search"
          />
          {p.search ? (
            <TouchableOpacity onPress={() => p.setSearch('')} hitSlop={10} accessibilityLabel="Hapus pencarian">
              <Icon name="close-circle" size={16} color={Colors.textTertiary} />
            </TouchableOpacity>
          ) : null}
        </View>
        <TouchableOpacity style={styles.tombol} onPress={p.bukaFilter} accessibilityLabel="Filter">
          <Icon name="filter-outline" size={16} color={Colors.textPrimary} />
          {filterAktif ? <View style={styles.titik} /> : null}
        </TouchableOpacity>
      </View>

      {p.memuat ? (
        <SkeletonBaris jumlah={6} />
      ) : (
        <FlatList
          data={p.part}
          keyExtractor={(item) => String(item.id)}
          keyboardShouldPersistTaps="handled"
          onEndReached={p.muatBerikutnya}
          onEndReachedThreshold={0.4}
          contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.xxl }}
          ItemSeparatorComponent={() => <View style={styles.pemisah} />}
          refreshControl={
            <RefreshControl refreshing={p.menyegarkan} onRefresh={p.segarkan} colors={[Colors.primary]} tintColor={Colors.primary} />
          }
          ListFooterComponent={p.memuatLebih ? <BrandSpinner size={20} color={brand[600]} /> : null}
          ListEmptyComponent={
            <KeadaanKosong
              pose={p.error || p.adaFilter ? 'mikir' : 'persilakan'}
              judul={p.error ? 'Gagal memuat' : p.adaFilter ? 'Tidak ditemukan' : 'Belum ada part'}
              teks={p.error ?? (p.adaFilter ? 'Coba ubah kata cari atau filter.' : 'Part produksi di plant kamu akan tampil di sini.')}
            >
              {p.error ? <Button label="Coba Lagi" onPress={p.cobaLagi} style={{ marginTop: Spacing.lg }} /> : null}
            </KeadaanKosong>
          }
          renderItem={({ item }) => (
            <KartuPart
              id={item.id}
              nama={item.nama}
              kode={item.kode}
              bisnisPartner={item.nama_customer}
              jumlahProses={item.proses?.length ?? 0}
              gambarUrl={item.gambar_part ? buatUrlStorageApi(item.gambar_part) : null}
              onPress={bukaPart}
            />
          )}
        />
      )}

      <SheetFilterPart
        visible={p.filterTerbuka}
        onClose={p.tutupFilter}
        aktif={{ proses: p.proses, bisnisPartner: p.bisnisPartner }}
        proses={opsi.proses}
        bisnisPartner={opsi.bisnisPartner}
        memuat={p.memuatFilter}
        onTerapkan={p.terapkanFilter}
      />
    </View>
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
  titik: { position: 'absolute', top: 6, right: 6, width: 8, height: 8, borderRadius: 4, backgroundColor: brand[600] },
  pemisah: { height: StyleSheet.hairlineWidth, backgroundColor: Colors.border, marginHorizontal: Spacing.screenPadding },
});
