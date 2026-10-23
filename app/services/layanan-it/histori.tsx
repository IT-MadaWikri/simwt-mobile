/**
 * Histori Request — Request Akun dan Request Sistem yang diajukan akun ini, terbaru dulu, dua tab dengan
 * tarik-untuk-segarkan. Sumber: GET /layanan-it/request-akun/saya dan /request-sistem/saya. Kembali dari
 * form → daftar ikut segar tanpa skeleton.
 */
import React, { useCallback, useRef, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppBar from '../../../src/components/common/AppBar';
import Button from '../../../src/components/common/Button';
import KeadaanKosong from '../../../src/components/common/KeadaanKosong';
import { SkeletonBaris } from '../../../src/components/common/Skeleton';
import KartuRequestAkun from '../../../src/components/layananIt/KartuRequestAkun';
import KartuRequestSistem from '../../../src/components/layananIt/KartuRequestSistem';
import Colors, { slate } from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { fonts, ukuranIsi } from '../../../constants/Typography';
import { gs } from '../../../constants/GlobalStyles';
import { useRequestAkunSaya } from '../../../src/hooks/useRequestAkunSaya';
import { useRequestSistemSaya } from '../../../src/hooks/useRequestSistemSaya';
import { formatWaktuRequest } from '../../../src/adapters/requestAkun';

type Tab = 'akun' | 'sistem';

const TAB: { nilai: Tab; label: string }[] = [
  { nilai: 'akun', label: 'Akun' },
  { nilai: 'sistem', label: 'Sistem' },
];

export default function HistoriRequestScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<Tab>('akun');
  const akun = useRequestAkunSaya();
  const sistem = useRequestSistemSaya();
  const { muatUlang: muatUlangAkun } = akun;
  const { muatUlang: muatUlangSistem } = sistem;

  const pertamaFokus = useRef(true);
  useFocusEffect(
    useCallback(() => {
      if (pertamaFokus.current) {
        pertamaFokus.current = false;
        return;
      }
      muatUlangAkun();
      muatUlangSistem();
    }, [muatUlangAkun, muatUlangSistem])
  );

  const h = tab === 'akun' ? akun : sistem;
  const ajukan = () => router.push((tab === 'akun' ? '/services/layanan-it/request-akun' : '/services/layanan-it/request-sistem') as any);

  const kosong = h.error ? (
    <KeadaanKosong pose="mikir" judul="Gagal memuat" teks={h.error} style={styles.kosong}>
      <Button label="Coba Lagi" onPress={h.cobaLagi} style={{ marginTop: Spacing.lg }} />
    </KeadaanKosong>
  ) : (
    <KeadaanKosong
      pose="persilakan"
      judul="Belum ada request"
      teks={tab === 'akun' ? 'Request akun yang Anda ajukan akan tampil di sini.' : 'Request pembuatan sistem yang Anda ajukan akan tampil di sini.'}
      style={styles.kosong}
    >
      <Button label={tab === 'akun' ? 'Ajukan Request Akun' : 'Ajukan Request Sistem'} icon="plus" onPress={ajukan} style={{ marginTop: Spacing.lg }} />
    </KeadaanKosong>
  );

  const umum = {
    keyExtractor: (r: { id: number }) => String(r.id),
    contentContainerStyle: [styles.daftar, { paddingBottom: insets.bottom + Spacing.xxl }, h.daftar.length === 0 && { flexGrow: 1 }],
    refreshControl: <RefreshControl refreshing={h.menyegarkan} onRefresh={h.segarkan} colors={[Colors.primary]} tintColor={Colors.primary} />,
    ListEmptyComponent: kosong,
  };

  return (
    <View style={[gs.screen, { backgroundColor: Colors.white }]}>
      <AppBar judul="Histori Request" />

      <View style={styles.segmen}>
        {TAB.map((t) => (
          <TouchableOpacity key={t.nilai} style={[styles.pilihan, tab === t.nilai && styles.pilihanAktif]} activeOpacity={0.8} onPress={() => setTab(t.nilai)}>
            <Text style={[styles.teksPilihan, tab === t.nilai && styles.teksPilihanAktif]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {h.memuat ? (
        <SkeletonBaris jumlah={5} style={styles.daftar} />
      ) : tab === 'akun' ? (
        <FlatList
          {...umum}
          data={akun.daftar}
          renderItem={({ item }) => (
            <KartuRequestAkun
              jenis={item.jenisPermintaan}
              sistem={item.sistem}
              nomorDokumen={item.nomorDokumen}
              diajukan={formatWaktuRequest(item.diajukanAt)}
              status={item.status}
              statusLabel={item.statusLabel}
              onPress={() => router.push(`/services/layanan-it/${item.id}` as any)}
            />
          )}
        />
      ) : (
        <FlatList
          {...umum}
          data={sistem.daftar}
          renderItem={({ item }) => (
            <KartuRequestSistem
              namaAplikasi={item.namaAplikasi}
              nomorDokumen={item.nomorDokumen}
              diajukan={formatWaktuRequest(item.diajukanAt)}
              status={item.status}
              statusLabel={item.statusLabel}
              onPress={() => router.push(`/services/layanan-it/sistem/${item.id}` as any)}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  segmen: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    marginHorizontal: Spacing.screenPadding,
    marginTop: Spacing.md,
    padding: 3,
    borderRadius: Spacing.radius.full,
    backgroundColor: slate[100],
  },
  pilihan: { paddingHorizontal: Spacing.lg, height: 34, justifyContent: 'center', borderRadius: Spacing.radius.full },
  pilihanAktif: { backgroundColor: Colors.white },
  teksPilihan: { fontFamily: fonts.medium, fontSize: ukuranIsi, color: Colors.textSecondary },
  teksPilihanAktif: { fontFamily: fonts.bold, color: Colors.textPrimary },
  daftar: { paddingHorizontal: Spacing.screenPadding },
  kosong: { flex: 1, justifyContent: 'center' },
});
