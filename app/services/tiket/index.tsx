/**
 * Tiket Masalah — riwayat tiket yang pernah diajukan pengguna ini.
 *
 * Sumber: GET /tiket/saya (dicocokkan lewat id_pengguna, dgn jaring pengaman
 * nama untuk tiket lama). Ketuk kartu → detail + progres; tombol bulat
 * mengambang → buat tiket baru.
 */
import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import Icon from '../../../src/components/common/Icon';
import Button from '../../../src/components/common/Button';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors, { brand } from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { gs } from '../../../constants/GlobalStyles';
import { tiketService, TiketRingkas } from '../../../src/services/tiketService';
import { jalankanSetelahTransisi } from '../../../src/utils/useSetelahTransisi';
import { SkeletonDaftar } from '../../../src/components/common/Skeleton';

/** Rupa lencana per status — PENDING kuning, PROSES brand, OK netral. */
const STATUS: Record<string, { label: string; badge: any; text: any; icon: string }> = {
  PENDING: { label: 'Menunggu', badge: gs.badgeWarning, text: gs.badgeTextWarning, icon: 'clock-outline' },
  PROSES: { label: 'Diproses', badge: gs.badgeBrand, text: gs.badgeTextBrand, icon: 'progress-wrench' },
  OK: { label: 'Selesai', badge: gs.badgeMuted, text: gs.badgeTextMuted, icon: 'check-circle-outline' },
};

function tanggal(iso: string | null): string {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function TiketSayaScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [tiket, setTiket] = useState<TiketRingkas[]>([]);
  const [memuat, setMemuat] = useState(true);
  const [menyegarkan, setMenyegarkan] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);

  const muat = useCallback(async () => {
    try {
      setGalat(null);
      setTiket(await tiketService.tiketSaya());
    } catch (err: any) {
      setGalat(err?.message ?? 'Gagal memuat riwayat tiket.');
    } finally {
      setMemuat(false);
      setMenyegarkan(false);
    }
  }, []);

  // Segarkan tiap kembali fokus — tiket yang baru dibuat langsung tampil.
  useFocusEffect(
    useCallback(() => jalankanSetelahTransisi(() => muat()), [muat])
  );

  if (memuat) {
    return (
      <View style={gs.screen}>
        <SkeletonDaftar />
      </View>
    );
  }

  return (
    <View style={gs.screen}>
      <FlatList
        data={tiket}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={[gs.scrollContent, { paddingBottom: insets.bottom + 96 }]}
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
            <Icon
              name={galat ? 'alert-circle-outline' : 'ticket-confirmation-outline'}
              size={44}
              color={Colors.textTertiary}
            />
            <Text style={gs.emptyTitle}>{galat ? 'Gagal memuat' : 'Belum ada tiket'}</Text>
            <Text style={gs.emptyText}>
              {galat ?? 'Tiket yang Anda ajukan akan tampil di sini.'}
            </Text>
            {galat && (
              <Button
                label="Coba Lagi"
                onPress={() => {
                  setMemuat(true);
                  muat();
                }}
                style={{ marginTop: Spacing.lg }}
              />
            )}
          </View>
        }
        renderItem={({ item }) => {
          const status = STATUS[item.status_pengajuan] ?? STATUS.PENDING;
          return (
            <TouchableOpacity
              style={[gs.card, { marginBottom: Spacing.md }]}
              activeOpacity={0.75}
              onPress={() => router.push(`/services/tiket/${item.no_ticket}` as any)}
            >
              <View style={gs.rowBetween}>
                <Text style={[gs.caption, gs.textSemibold]}>#{item.no_ticket}</Text>
                <View style={[gs.badge, status.badge]}>
                  <Icon
                    name={status.icon as any}
                    size={12}
                    color={(status.text as any).color}
                  />
                  <Text style={[gs.badgeText, status.text]}>{status.label}</Text>
                </View>
              </View>

              <Text style={[gs.title, { marginTop: Spacing.xs }]} numberOfLines={2}>
                {item.judul_masalah}
              </Text>

              <View style={[gs.rowWrap, gs.gapMd, { marginTop: Spacing.sm }]}>
                {item.jenis && <Text style={gs.caption}>{item.jenis}</Text>}
                {item.plant && <Text style={gs.caption}>· {item.plant}</Text>}
                <Text style={gs.caption}>· Diajukan {tanggal(item.tanggal_diajukan)}</Text>
                {item.status_pengajuan === 'OK' && (
                  <Text style={gs.caption}>· Selesai {tanggal(item.tanggal_selesai)}</Text>
                )}
              </View>
            </TouchableOpacity>
          );
        }}
      />

      {/* Tombol buat mengambang ala aplikasi native. */}
      <Button
        icon="plus"
        label="Buat Tiket"
        onPress={() => router.push('/services/tiket/buat' as any)}
        style={[styles.fab, { bottom: insets.bottom + Spacing.xl }]}
        accessibilityLabel="Buat tiket baru"
      />
    </View>
  );
}

const styles = {
  fab: {
    position: 'absolute' as const,
    right: Spacing.xl,
  },
};
