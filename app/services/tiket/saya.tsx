/**
 * Tiket Saya — riwayat tiket yang diajukan akun ini. Pola sama dengan Kaizen Saya:
 * kolom cari, tombol filter (status + tanggal) dan urutan, daftar dengan
 * tarik-untuk-segarkan, serta tombol "Buat Tiket" mengambang.
 * Sumber: GET /tiket/saya — cari, filter, urutan, dan paginasi (gulir tanpa batas) diproses server.
 */
import React, { useCallback, useRef } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, RefreshControl, StyleSheet } from 'react-native';
import BrandSpinner from '../../../src/components/common/BrandSpinner';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '../../../src/components/common/Icon';
import Button from '../../../src/components/common/Button';
import AppBar from '../../../src/components/common/AppBar';
import KeadaanKosong from '../../../src/components/common/KeadaanKosong';
import { SkeletonBaris } from '../../../src/components/common/Skeleton';
import KartuTiket from '../../../src/components/tiket/KartuTiket';
import SheetFilterTiket from '../../../src/components/tiket/SheetFilterTiket';
import Colors, { brand } from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { fonts, ukuranIsi } from '../../../constants/Typography';
import { gs, inputReset } from '../../../constants/GlobalStyles';
import { useTiketSaya } from '../../../src/hooks/useTiketSaya';

export default function TiketSayaScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const t = useTiketSaya();
  const { muatUlang } = t;

  // Kembali dari "Buat Tiket" → daftar ikut segar tanpa skeleton penuh.
  const pertamaFokus = useRef(true);
  useFocusEffect(
    useCallback(() => {
      if (pertamaFokus.current) {
        pertamaFokus.current = false;
        return;
      }
      muatUlang();
    }, [muatUlang])
  );

  // Titik hijau di tombol filter bila status/tanggal sedang menyaring (kata cari tampak di kolomnya sendiri).
  const filterAktif = !!(t.status || t.tanggalDari || t.tanggalSampai);

  return (
    <View style={[gs.screen, { backgroundColor: Colors.white }]}>
      <AppBar judul="Tiket Saya" />

      <View style={styles.barisCari}>
        <View style={[gs.searchBar, gs.flex1, styles.kotakCari]}>
          <Icon name="magnify" size={16} color={Colors.textTertiary} />
          <TextInput
            style={styles.cari}
            placeholder="Cari nomor, judul, atau jenis"
            placeholderTextColor={Colors.placeholder}
            value={t.search}
            onChangeText={t.setSearch}
            returnKeyType="search"
          />
          {t.search ? (
            <TouchableOpacity onPress={() => t.setSearch('')} hitSlop={10} accessibilityLabel="Hapus pencarian">
              <Icon name="close-circle" size={16} color={Colors.textTertiary} />
            </TouchableOpacity>
          ) : null}
        </View>
        <TouchableOpacity style={styles.tombol} onPress={t.bukaFilter} accessibilityLabel="Filter">
          <Icon name="filter-outline" size={16} color={Colors.textPrimary} />
          {filterAktif ? <View style={styles.titik} /> : null}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tombol}
          onPress={t.gantiUrutan}
          accessibilityLabel={t.urutkan === 'TERBARU' ? 'Urutan: terbaru dulu' : 'Urutan: terlama dulu'}
        >
          <Icon name={t.urutkan === 'TERBARU' ? 'sort-descending' : 'sort-ascending'} size={16} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {t.memuat ? (
        <SkeletonBaris jumlah={6} />
      ) : (
        <FlatList
          data={t.tiket}
          keyExtractor={(item) => String(item.id)}
          keyboardShouldPersistTaps="handled"
          onEndReached={t.muatBerikutnya}
          onEndReachedThreshold={0.4}
          contentContainerStyle={{ paddingBottom: insets.bottom + 96 }}
          ItemSeparatorComponent={() => <View style={styles.pemisah} />}
          refreshControl={
            <RefreshControl refreshing={t.menyegarkan} onRefresh={t.segarkan} colors={[Colors.primary]} tintColor={Colors.primary} />
          }
          ListFooterComponent={t.memuatLebih ? <BrandSpinner size={20} color={brand[600]} /> : null}
          ListEmptyComponent={
            <KeadaanKosong
              pose={t.error || t.adaFilter ? 'mikir' : 'persilakan'}
              judul={t.error ? 'Gagal memuat' : t.adaFilter ? 'Tidak ditemukan' : 'Belum ada tiket'}
              teks={t.error ?? (t.adaFilter ? 'Coba ubah kata cari atau filter.' : 'Tiket yang kamu ajukan akan tampil di sini.')}
            >
              {t.error ? <Button label="Coba Lagi" onPress={t.cobaLagi} style={{ marginTop: Spacing.lg }} /> : null}
            </KeadaanKosong>
          }
          renderItem={({ item }) => (
            <KartuTiket
              noTiket={item.no_ticket}
              judul={item.judul_masalah}
              status={item.status_pengajuan}
              jenis={item.jenis}
              plant={item.plant}
              tanggalDiajukan={item.tanggal_diajukan}
              tanggalSelesai={item.tanggal_selesai}
              onPress={() => router.push(`/services/tiket/${item.no_ticket}` as any)}
            />
          )}
        />
      )}

      <Button
        icon="plus"
        label="Buat Tiket"
        onPress={() => router.push('/services/tiket/buat')}
        style={[styles.fab, { bottom: insets.bottom + Spacing.xl }]}
        accessibilityLabel="Buat tiket baru"
      />

      <SheetFilterTiket
        visible={t.filterTerbuka}
        onClose={t.tutupFilter}
        aktif={{ status: t.status, dari: t.tanggalDari, sampai: t.tanggalSampai }}
        jumlah={t.jumlah}
        memuat={t.memuatFilter}
        onTerapkan={t.terapkanFilter}
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
  titik: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: brand[600],
  },
  pemisah: { height: StyleSheet.hairlineWidth, backgroundColor: Colors.border, marginHorizontal: Spacing.screenPadding },
  fab: { position: 'absolute', right: Spacing.xl },
});
