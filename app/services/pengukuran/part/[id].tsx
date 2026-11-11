/**
 * Pilih Proses — daftar proses sebuah part beserta jumlah titik ukurnya. Mengetuk proses membuka form
 * pengukuran untuk proses itu.
 */
import React, { useMemo, useState } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, RefreshControl, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '../../../../src/components/common/Icon';
import Button from '../../../../src/components/common/Button';
import KeadaanKosong from '../../../../src/components/common/KeadaanKosong';
import { SkeletonBaris } from '../../../../src/components/common/Skeleton';
import Colors, { brand } from '../../../../constants/Colors';
import Spacing from '../../../../constants/Spacing';
import { fonts, ukuranIsi, ukuranCatatan } from '../../../../constants/Typography';
import { gs, inputReset } from '../../../../constants/GlobalStyles';
import { useDetailPart } from '../../../../src/hooks/useDetailPart';
import Muncul from '../../../../src/components/common/Muncul';

export default function PilihProsesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const d = useDetailPart(id);
  const [kata, setKata] = useState('');

  const proses = useMemo(() => {
    const standar = d.detailPart?.standar_pengukuran ?? [];
    const q = kata.trim().toLowerCase();
    return (d.detailPart?.proses ?? [])
      .filter((p) => p.id !== null && (!q || p.proses.toLowerCase().includes(q)))
      .map((p) => ({ ...p, titik: standar.filter((s) => Number(s.proses_id) === p.id).length }));
  }, [d.detailPart, kata]);

  const part = d.detailPart;

  return (
    <View style={[gs.screen, { backgroundColor: Colors.white }]}>
      {part ? (
        <View style={styles.kepala}>
          <Text style={styles.nama} numberOfLines={2}>{part.nama}</Text>
          <Text style={styles.sub} numberOfLines={1}>{[part.kode, part.nama_customer].filter(Boolean).join(' · ')}</Text>
        </View>
      ) : null}

      <View style={styles.barisCari}>
        <View style={[gs.searchBar, gs.flex1, styles.kotakCari]}>
          <Icon name="magnify" size={16} color={Colors.textTertiary} />
          <TextInput
            style={styles.cari}
            placeholder="Cari proses"
            placeholderTextColor={Colors.placeholder}
            value={kata}
            onChangeText={setKata}
            returnKeyType="search"
          />
          {kata ? (
            <TouchableOpacity onPress={() => setKata('')} hitSlop={10} accessibilityLabel="Hapus pencarian">
              <Icon name="close-circle" size={16} color={Colors.textTertiary} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {d.memuat ? (
        <SkeletonBaris jumlah={4} />
      ) : (
        <Muncul style={{ flex: 1 }}>
          <FlatList
            data={proses}
            keyExtractor={(item) => String(item.id)}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ flexGrow: 1, paddingBottom: insets.bottom + Spacing.xxl }}
            ItemSeparatorComponent={() => <View style={styles.pemisah} />}
            refreshControl={
              <RefreshControl refreshing={d.menyegarkan} onRefresh={d.segarkan} colors={[Colors.primary]} tintColor={Colors.primary} />
            }
            ListEmptyComponent={
              <KeadaanKosong
                pose="mikir"
                judul={d.error ? 'Gagal memuat' : kata.trim() ? 'Proses tidak ditemukan' : 'Belum ada proses'}
                teks={d.error ?? (kata.trim() ? 'Coba kata cari lain.' : 'Proses untuk part ini belum tersedia.')}
              >
                {d.error ? <Button label="Coba Lagi" onPress={d.segarkan} style={{ marginTop: Spacing.lg }} /> : null}
              </KeadaanKosong>
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.baris}
                activeOpacity={0.6}
                onPress={() =>
                  router.push({ pathname: '/services/pengukuran/input' as any, params: { idPart: id, idProses: String(item.id) } })
                }
              >
                <View style={styles.logo}>
                  <Icon name="cog-outline" size={20} color={brand[700]} />
                </View>
                <View style={gs.flex1}>
                  <Text style={styles.nama}>{item.proses}</Text>
                  <Text style={styles.sub}>{item.titik} titik pengukuran</Text>
                </View>
                <Icon name="chevron-right" size={16} color={Colors.textTertiary} />
              </TouchableOpacity>
            )}
          />
        </Muncul>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  kepala: { gap: 2, paddingHorizontal: Spacing.screenPadding, paddingTop: Spacing.md },
  nama: { fontFamily: fonts.semibold, fontSize: ukuranIsi, color: Colors.textPrimary },
  sub: { fontFamily: fonts.regular, fontSize: ukuranCatatan, color: Colors.textSecondary },
  barisCari: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.screenPadding, paddingVertical: Spacing.md },
  kotakCari: { height: 36, paddingVertical: 0, paddingHorizontal: Spacing.md, gap: 6 },
  cari: { flex: 1, paddingVertical: 0, fontSize: ukuranIsi, fontFamily: fonts.regular, color: Colors.textPrimary, ...inputReset },
  baris: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.screenPadding,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
  },
  logo: {
    width: 42,
    height: 42,
    borderRadius: Spacing.radius.sm,
    ...Spacing.curve,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: brand[50],
  },
  pemisah: { height: StyleSheet.hairlineWidth, backgroundColor: Colors.border, marginHorizontal: Spacing.screenPadding },
});
