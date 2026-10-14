/**
 * Notifikasi — data nyata dari GET /notifications/latest.
 *
 * Sebelumnya layar ini berisi daftar contoh yang di-hardcode. Sekarang membaca
 * notifikasi Laravel yang sesungguhnya, diratakan oleh `notifikasiService`.
 */
import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, Linking } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors, { brand } from '../../constants/Colors';
import Spacing from '../../constants/Spacing';
import { gs } from '../../constants/GlobalStyles';
import LoadingSpinner from '../../src/components/common/LoadingSpinner';
import { dialog } from '../../src/components/common/AppDialog';
import {
  notifikasiService,
  rupaNotifikasi,
  Notifikasi,
} from '../../src/services/notifikasiService';
import { jalankanSetelahTransisi } from '../../src/utils/useSetelahTransisi';

/** "Baru saja" / "3 jam lalu" / tanggal. */
function jarakWaktu(iso: string | null): string {
  if (!iso) return '';
  const selisih = Date.now() - new Date(iso).getTime();
  const menit = Math.floor(selisih / 60000);
  if (menit < 1) return 'Baru saja';
  if (menit < 60) return `${menit} menit lalu`;
  const jam = Math.floor(menit / 60);
  if (jam < 24) return `${jam} jam lalu`;
  const hari = Math.floor(jam / 24);
  if (hari < 7) return `${hari} hari lalu`;
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

const WARNA = {
  brand: { tile: brand[50], icon: brand[600] },
  warning: { tile: Colors.serviceAmber, icon: '#b45309' },
  danger: { tile: Colors.serviceRed, icon: Colors.dangerDark },
};

export default function NotifikasiScreen() {
  const insets = useSafeAreaInsets();
  const [daftar, setDaftar] = useState<Notifikasi[]>([]);
  const [memuat, setMemuat] = useState(true);
  const [menyegarkan, setMenyegarkan] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);

  const muat = useCallback(async () => {
    try {
      setGalat(null);
      setDaftar(await notifikasiService.terbaru());
    } catch (err: any) {
      setGalat(err?.message ?? 'Gagal memuat notifikasi.');
    } finally {
      setMemuat(false);
      setMenyegarkan(false);
    }
  }, []);

  useFocusEffect(useCallback(() => jalankanSetelahTransisi(() => muat()), [muat]));

  const buka = async (item: Notifikasi) => {
    if (!item.tautan) return;
    // Tautan menunjuk halaman SIMWT web — buka di peramban perangkat.
    const bisa = await Linking.canOpenURL(item.tautan);
    if (bisa) Linking.openURL(item.tautan);
    else dialog.alert('Tautan Tidak Valid', item.tautan);
  };

  if (memuat) {
    return (
      <View style={gs.screen}>
        <LoadingSpinner message="Memuat notifikasi..." />
      </View>
    );
  }

  return (
    <View style={gs.screen}>
      <FlatList
        data={daftar}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[gs.scrollContent, { paddingBottom: insets.bottom + Spacing.xxl }]}
        refreshControl={
          <RefreshControl
            refreshing={menyegarkan}
            onRefresh={() => {
              setMenyegarkan(true);
              muat();
            }}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={[gs.card, gs.center, { marginTop: Spacing.xl }]}>
            <MaterialCommunityIcons
              name={galat ? 'alert-circle-outline' : 'bell-off-outline'}
              size={44}
              color={Colors.textTertiary}
            />
            <Text style={gs.emptyTitle}>{galat ? 'Gagal memuat' : 'Belum ada notifikasi'}</Text>
            <Text style={gs.emptyText}>
              {galat ?? 'Pemberitahuan untuk Anda akan tampil di sini.'}
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const rupa = rupaNotifikasi(item.tipe);
          const warna = WARNA[rupa.warna];

          return (
            <TouchableOpacity
              style={[gs.card, gs.row, gs.gapMd, { marginBottom: Spacing.sm }]}
              activeOpacity={item.tautan ? 0.75 : 1}
              disabled={!item.tautan}
              onPress={() => buka(item)}
            >
              <View style={[gs.iconTile, { backgroundColor: warna.tile }]}>
                <MaterialCommunityIcons name={rupa.icon as any} size={20} color={warna.icon} />
              </View>

              <View style={gs.flex1}>
                <View style={gs.rowBetween}>
                  <Text style={[gs.title, gs.flex1, { fontSize: 14 }]} numberOfLines={2}>
                    {item.judul}
                  </Text>
                  {!item.dibaca && <View style={styles.titikBaru} />}
                </View>

                {item.pesan ? (
                  <Text style={[gs.bodySm, { marginTop: 2 }]} numberOfLines={3}>
                    {item.pesan}
                  </Text>
                ) : null}

                <View style={[gs.rowBetween, { marginTop: Spacing.xs }]}>
                  <Text style={gs.caption}>{jarakWaktu(item.waktu)}</Text>
                  {item.tautan ? (
                    <View style={[gs.row, gs.gapXs]}>
                      <Text style={[gs.caption, gs.textBrand]}>Buka</Text>
                      <MaterialCommunityIcons name="open-in-new" size={12} color={brand[600]} />
                    </View>
                  ) : null}
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = {
  titikBaru: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: brand[500],
    marginLeft: Spacing.sm,
    marginTop: 5,
  },
};
