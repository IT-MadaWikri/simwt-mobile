/**
 * Detail satu lembar STO — daftar baris part dari paket offline.
 *
 * Sumber: GET /sto/lembar/{id}/paket. Layar ini BACA SAJA.
 *
 * ⚠️ Aturan qty_sistem (angka SAP), sesuai kontrak: disembunyikan untuk baris
 * yang BELUM dihitung, dan baru ditampilkan pada baris yang sudah ada
 * hasilnya — sebagai pembanding selisih. Kalau angka sistem terlihat sebelum
 * menghitung, PIC cenderung menyalinnya dan hasil STO tampak sempurna tanpa
 * pernah diverifikasi.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import Icon from '../../../src/components/common/Icon';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors, { brand } from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { fonts, judulAppBar } from '../../../constants/Typography';
import { gs } from '../../../constants/GlobalStyles';
import { stoService, StoPaket, StoBaris } from '../../../src/services/stoService';
import AppBar from '../../../src/components/common/AppBar';
import { SkeletonDaftar } from '../../../src/components/common/Skeleton';

type Saring = 'semua' | 'belum' | 'selisih';

export default function DetailLembarStoScreen() {
  const { lembar: idLembar } = useLocalSearchParams<{ lembar: string }>();
  const insets = useSafeAreaInsets();
  const [paket, setPaket] = useState<StoPaket | null>(null);
  const [memuat, setMemuat] = useState(true);
  const [galat, setGalat] = useState<string | null>(null);
  const [cari, setCari] = useState('');
  const [saring, setSaring] = useState<Saring>('semua');

  useEffect(() => {
    if (!idLembar) return;
    stoService
      .paket(Number(idLembar))
      .then(setPaket)
      .catch((err: any) => setGalat(err?.message ?? 'Gagal memuat lembar.'))
      .finally(() => setMemuat(false));
  }, [idLembar]);

  const baris = useMemo(() => {
    if (!paket) return [];
    let hasil = paket.baris;
    if (saring === 'belum') hasil = hasil.filter((item) => item.qty_saat_ini === null);
    if (saring === 'selisih')
      hasil = hasil.filter(
        (item) =>
          item.qty_saat_ini !== null &&
          item.qty_sistem !== null &&
          item.qty_saat_ini !== item.qty_sistem
      );
    if (cari) {
      const kunci = cari.toLowerCase();
      hasil = hasil.filter(
        (item) =>
          item.kode_part?.toLowerCase().includes(kunci) ||
          item.nama_part?.toLowerCase().includes(kunci) ||
          item.lokasi?.toLowerCase().includes(kunci)
      );
    }
    return hasil;
  }, [paket, cari, saring]);

  if (memuat) {
    return (
      <View style={gs.screen}>
        <SkeletonDaftar />
      </View>
    );
  }

  if (!paket) {
    return (
      <View style={[gs.screen, gs.centerFill]}>
        <Icon name="file-alert-outline" size={48} color={Colors.textTertiary} />
        <Text style={gs.emptyTitle}>Gagal memuat</Text>
        <Text style={gs.emptyText}>{galat ?? 'Lembar tidak ditemukan.'}</Text>
      </View>
    );
  }

  const renderBaris = ({ item }: { item: StoBaris }) => {
    const sudah = item.qty_saat_ini !== null;
    const selisih =
      sudah && item.qty_sistem !== null ? (item.qty_saat_ini as number) - item.qty_sistem : null;

    return (
      <View style={[gs.card, { marginBottom: Spacing.sm, paddingVertical: Spacing.md }]}>
        <View style={gs.rowBetween}>
          <Text style={[gs.caption, gs.textSemibold, gs.flex1]} numberOfLines={1}>
            {item.kode_part ?? '(tanpa kode)'}
          </Text>
          {item.lokasi ? (
            <View style={[gs.badge, gs.badgeMuted]}>
              <Icon name="map-marker-outline" size={11} color={Colors.textSecondary} />
              <Text style={[gs.badgeText, gs.badgeTextMuted]}>{item.lokasi}</Text>
            </View>
          ) : null}
        </View>

        <Text style={[gs.title, { fontSize: 14, marginTop: 2 }]} numberOfLines={2}>
          {item.nama_part ?? '-'}
        </Text>

        <View style={[gs.rowBetween, { marginTop: Spacing.sm }]}>
          {sudah ? (
            <>
              <Text style={gs.bodySm}>
                Dihitung:{' '}
                <Text style={[gs.textSemibold, { color: Colors.textPrimary }]}>
                  {item.qty_saat_ini?.toLocaleString('id-ID')} {item.satuan ?? ''}
                </Text>
                {item.qty_sistem !== null && (
                  <Text style={gs.caption}>
                    {'  '}· sistem {item.qty_sistem.toLocaleString('id-ID')}
                  </Text>
                )}
              </Text>
              {selisih !== null && selisih !== 0 ? (
                <Text style={[gs.bodySm, gs.textSemibold, { color: Colors.dangerDark }]}>
                  {selisih > 0 ? '+' : ''}
                  {selisih.toLocaleString('id-ID')}
                </Text>
              ) : selisih === 0 ? (
                <Icon name="check-circle-outline" size={16} color={brand[500]} />
              ) : null}
            </>
          ) : (
            // qty_sistem SENGAJA tidak diperlihatkan sebelum dihitung.
            <View style={[gs.badge, gs.badgeWarning]}>
              <Icon name="clock-outline" size={11} color="#b45309" />
              <Text style={[gs.badgeText, gs.badgeTextWarning]}>Belum dihitung</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const Chip = ({ nilai, label }: { nilai: Saring; label: string }) => (
    <TouchableOpacity
      style={[gs.badge, saring === nilai ? gs.badgeBrand : gs.badgeMuted]}
      onPress={() => setSaring(nilai)}
    >
      <Text style={[gs.badgeText, saring === nilai ? gs.badgeTextBrand : gs.badgeTextMuted]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <>
      <AppBar judul={`${paket.lembar.kode} · ${paket.periode.judul}`} />

      <View style={gs.screen}>
        <View style={[gs.containerX, { paddingTop: Spacing.md }]}>
          <View style={[gs.searchBar, { paddingVertical: Spacing.xs }]}>
            <Icon name="magnify" size={20} color={Colors.textTertiary} />
            <TextInput
              style={gs.fieldInner}
              placeholder="Cari kode part, nama, atau lokasi..."
              placeholderTextColor={Colors.placeholder}
              value={cari}
              onChangeText={setCari}
            />
          </View>

          <View style={[gs.row, gs.gapSm, { marginTop: Spacing.md }]}>
            <Chip nilai="semua" label={`Semua (${paket.jumlah_baris})`} />
            <Chip nilai="belum" label="Belum dihitung" />
            <Chip nilai="selisih" label="Ada selisih" />
          </View>
        </View>

        <FlatList
          data={baris}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderBaris}
          contentContainerStyle={[gs.scrollContent, { paddingBottom: insets.bottom + Spacing.xxl }]}
          initialNumToRender={12}
          windowSize={7}
          removeClippedSubviews
          ListEmptyComponent={
            <Text style={[gs.emptyText, { marginTop: Spacing.xl }]}>
              Tidak ada baris yang cocok dengan saringan.
            </Text>
          }
        />
      </View>
    </>
  );
}
