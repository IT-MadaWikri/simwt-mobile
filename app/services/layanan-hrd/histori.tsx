/**
 * Histori Form Keluar Pabrik — semua form yang diajukan akun ini, terbaru dulu, dengan tarik-untuk-segarkan.
 * Sumber: GET /layanan-hrd/keluar-pabrik/saya. Kembali dari form → daftar ikut segar tanpa skeleton.
 */
import React, { useCallback, useRef } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppBar from '../../../src/components/common/AppBar';
import Button from '../../../src/components/common/Button';
import KeadaanKosong from '../../../src/components/common/KeadaanKosong';
import { SkeletonBaris } from '../../../src/components/common/Skeleton';
import KartuKeluarPabrik from '../../../src/components/layananHrd/KartuKeluarPabrik';
import Colors from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { gs } from '../../../constants/GlobalStyles';
import { useKeluarPabrikSaya } from '../../../src/hooks/useKeluarPabrik';
import { LABEL_JENIS, formatRentangJam, formatTanggalKeluar } from '../../../src/adapters/keluarPabrik';

export default function HistoriKeluarPabrikScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const h = useKeluarPabrikSaya();
  const { muatUlang } = h;

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

  const ajukan = () => router.push('/services/layanan-hrd/keluar-pabrik' as any);

  return (
    <View style={[gs.screen, { backgroundColor: Colors.white }]}>
      <AppBar judul="Histori Form" />
      {h.memuat ? (
        <SkeletonBaris jumlah={5} style={styles.daftar} />
      ) : (
        <FlatList
          data={h.daftar}
          keyExtractor={(f) => String(f.id)}
          contentContainerStyle={[styles.daftar, { paddingBottom: insets.bottom + Spacing.xxl }, h.daftar.length === 0 && { flexGrow: 1 }]}
          refreshControl={<RefreshControl refreshing={h.menyegarkan} onRefresh={h.segarkan} colors={[Colors.primary]} tintColor={Colors.primary} />}
          renderItem={({ item }) => (
            <KartuKeluarPabrik
              jenis={LABEL_JENIS[item.jenisKeluar]}
              waktu={`${formatTanggalKeluar(item.tanggalKeluar)} · ${formatRentangJam(item.jamKeluar, item.jamKembali)}`}
              nomorDokumen={item.nomorDokumen}
              status={item.status}
              statusLabel={item.statusLabel}
              onPress={() => router.push(`/services/layanan-hrd/${item.id}` as any)}
            />
          )}
          ListEmptyComponent={
            h.error ? (
              <KeadaanKosong pose="mikir" judul="Gagal memuat" teks={h.error} style={styles.kosong}>
                <Button label="Coba Lagi" onPress={h.cobaLagi} style={{ marginTop: Spacing.lg }} />
              </KeadaanKosong>
            ) : (
              <KeadaanKosong pose="persilakan" judul="Belum ada form" teks="Form keluar pabrik yang Anda ajukan akan tampil di sini." style={styles.kosong}>
                <Button label="Ajukan Form Keluar Pabrik" icon="plus" onPress={ajukan} style={{ marginTop: Spacing.lg }} />
              </KeadaanKosong>
            )
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  daftar: { paddingHorizontal: Spacing.screenPadding },
  kosong: { flex: 1, justifyContent: 'center' },
});
