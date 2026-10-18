/**
 * Tiket Saya — riwayat tiket yang diajukan akun ini, dengan chip filter status,
 * tarik-untuk-segarkan, dan tombol "Buat Tiket" mengambang.
 * Sumber: GET /tiket/saya (maks. 50, terbaru dulu).
 */
import React, { useCallback, useRef } from 'react';
import { View, Text, FlatList, ScrollView, TouchableOpacity, RefreshControl, StyleSheet } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '../../../src/components/common/Icon';
import Button from '../../../src/components/common/Button';
import AppBar from '../../../src/components/common/AppBar';
import { SkeletonBaris } from '../../../src/components/common/Skeleton';
import KartuTiket from '../../../src/components/tiket/KartuTiket';
import Colors, { brand } from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { fonts } from '../../../constants/Typography';
import { gs } from '../../../constants/GlobalStyles';
import { FilterStatusTiket, useTiketSaya } from '../../../src/hooks/useTiketSaya';

const FILTER: { label: string; value: FilterStatusTiket }[] = [
  { label: 'Semua', value: '' },
  { label: 'Menunggu', value: 'PENDING' },
  { label: 'Diproses', value: 'PROSES' },
  { label: 'Selesai', value: 'OK' },
];

export default function TiketSayaScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { tiket, jumlah, status, setStatus, memuat, menyegarkan, error, muat, muatUlang, segarkan } = useTiketSaya();

  // Kembali dari "Buat Tiket" → daftar ikut segar tanpa skeleton penuh.
  const pertamaFokus = useRef(true);
  useFocusEffect(
    useCallback(() => {
      if (pertamaFokus.current) {
        pertamaFokus.current = false;
        return;
      }
      muat();
    }, [muat])
  );

  return (
    <View style={[gs.screen, { backgroundColor: Colors.white }]}>
      <AppBar judul="Tiket Saya" />

      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipBaris}>
          {FILTER.map((f) => {
            const aktif = status === f.value;
            return (
              <TouchableOpacity
                key={f.label}
                activeOpacity={0.7}
                onPress={() => setStatus(f.value)}
                style={[styles.chip, aktif && styles.chipAktif]}
              >
                <Text style={[styles.chipTeks, aktif && styles.chipTeksAktif]}>
                  {f.label} · {jumlah[f.value]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {memuat ? (
        <SkeletonBaris jumlah={6} />
      ) : (
        <FlatList
          data={tiket}
          keyExtractor={(t) => String(t.id)}
          contentContainerStyle={{ paddingBottom: insets.bottom + 96 }}
          ItemSeparatorComponent={() => <View style={styles.pemisah} />}
          refreshControl={
            <RefreshControl refreshing={menyegarkan} onRefresh={segarkan} colors={[Colors.primary]} tintColor={Colors.primary} />
          }
          ListEmptyComponent={
            <View style={[gs.center, { marginTop: Spacing.xxxl, paddingHorizontal: Spacing.xl }]}>
              <Icon
                name={error ? 'alert-circle-outline' : 'ticket-confirmation-outline'}
                size={44}
                color={Colors.textTertiary}
              />
              <Text style={gs.emptyTitle}>{error ? 'Gagal memuat' : 'Belum ada tiket'}</Text>
              <Text style={gs.emptyText}>
                {error ?? (status ? 'Tidak ada tiket dengan status ini.' : 'Tiket yang kamu ajukan akan tampil di sini.')}
              </Text>
              {error ? <Button label="Coba Lagi" onPress={muatUlang} style={{ marginTop: Spacing.lg }} /> : null}
            </View>
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
    </View>
  );
}

const styles = StyleSheet.create({
  chipBaris: { paddingHorizontal: Spacing.screenPadding, paddingVertical: Spacing.md, gap: Spacing.sm },
  chip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Spacing.radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  chipAktif: { backgroundColor: brand[50], borderColor: brand[600] },
  chipTeks: { fontFamily: fonts.medium, fontSize: 12, color: Colors.textSecondary },
  chipTeksAktif: { fontFamily: fonts.semibold, color: brand[700] },
  pemisah: { height: StyleSheet.hairlineWidth, backgroundColor: Colors.border, marginHorizontal: Spacing.screenPadding },
  fab: { position: 'absolute', right: Spacing.xl },
});
