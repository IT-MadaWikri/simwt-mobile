/**
 * Pengukuran Terkirim — riwayat pengukuran plant ini. Kolom cari (part / checker), filter judgment +
 * tanggal, daftar dengan tarik-untuk-segarkan dan gulir tanpa batas. Mengetuk baris membuka detailnya.
 * Sumber: GET /pengukuran-qc/riwayat.
 */
import React from 'react';
import { View, FlatList, TextInput, TouchableOpacity, RefreshControl, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BrandSpinner from '../../../../src/components/common/BrandSpinner';
import Icon from '../../../../src/components/common/Icon';
import Button from '../../../../src/components/common/Button';
import KeadaanKosong from '../../../../src/components/common/KeadaanKosong';
import { SkeletonBaris } from '../../../../src/components/common/Skeleton';
import KartuTerkirim from '../../../../src/components/pengukuran/KartuTerkirim';
import SheetFilterTerkirim from '../../../../src/components/pengukuran/SheetFilterTerkirim';
import Colors, { brand } from '../../../../constants/Colors';
import Spacing from '../../../../constants/Spacing';
import { fonts, ukuranIsi } from '../../../../constants/Typography';
import { gs, inputReset } from '../../../../constants/GlobalStyles';
import { useDaftarTerkirim } from '../../../../src/hooks/useDaftarTerkirim';
import { formatTanggalWaktu } from '../../../../src/utils/pengukuran';
import Muncul from '../../../../src/components/common/Muncul';

export default function PengukuranTerkirimScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const t = useDaftarTerkirim();

  // Titik hijau di tombol filter bila judgment/tanggal sedang menyaring (kata cari tampak di kolomnya sendiri).
  const filterAktif = !!(t.judgment || t.tanggalMulai || t.tanggalSelesai);

  return (
    <View style={[gs.screen, { backgroundColor: Colors.white }]}>
      <View style={styles.barisCari}>
        <View style={[gs.searchBar, gs.flex1, styles.kotakCari]}>
          <Icon name="magnify" size={16} color={Colors.textTertiary} />
          <TextInput
            style={styles.cari}
            placeholder="Cari nama part atau checker"
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
      </View>

      {t.memuat ? (
        <SkeletonBaris jumlah={6} />
      ) : (
        <Muncul style={{ flex: 1 }}>
          <FlatList
            data={t.terkirim}
            keyExtractor={(item) => String(item.id)}
            keyboardShouldPersistTaps="handled"
            onEndReached={t.muatBerikutnya}
            onEndReachedThreshold={0.4}
            contentContainerStyle={{ flexGrow: 1, paddingBottom: insets.bottom + Spacing.xxl }}
            ItemSeparatorComponent={() => <View style={styles.pemisah} />}
            refreshControl={
              <RefreshControl refreshing={t.menyegarkan} onRefresh={t.segarkan} colors={[Colors.primary]} tintColor={Colors.primary} />
            }
            ListFooterComponent={t.memuatLebih ? <BrandSpinner size={20} color={brand[600]} /> : null}
            ListEmptyComponent={
              <KeadaanKosong
                pose={t.error || t.adaFilter ? 'mikir' : 'persilakan'}
                judul={t.error ? 'Gagal memuat' : t.adaFilter ? 'Tidak ditemukan' : 'Belum ada pengukuran'}
                teks={t.error ?? (t.adaFilter ? 'Coba ubah kata cari atau filter.' : 'Pengukuran yang sudah dikirim akan tampil di sini.')}
              >
                {t.error ? <Button label="Coba Lagi" onPress={t.cobaLagi} style={{ marginTop: Spacing.lg }} /> : null}
              </KeadaanKosong>
            }
            renderItem={({ item }) => (
              <KartuTerkirim
                namaPart={item.nama_part || '-'}
                namaChecker={item.nama_checker || '-'}
                waktu={formatTanggalWaktu(item.tanggal_dikirim)}
                judgment={item.judgment}
                onPress={() => router.push(`/services/pengukuran/terkirim/${item.id}` as any)}
              />
            )}
          />
        </Muncul>
      )}

      <SheetFilterTerkirim
        visible={t.filterTerbuka}
        onClose={t.tutupFilter}
        aktif={{ judgment: t.judgment, tanggalMulai: t.tanggalMulai, tanggalSelesai: t.tanggalSelesai }}
        memuat={t.memuatFilter}
        onTerapkan={t.terapkanFilter}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  barisCari: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.screenPadding, paddingVertical: Spacing.md },
  kotakCari: { height: 36, paddingVertical: 0, paddingHorizontal: Spacing.md, gap: 6 },
  cari: { flex: 1, paddingVertical: 0, fontSize: ukuranIsi, fontFamily: fonts.regular, color: Colors.textPrimary, ...inputReset },
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
