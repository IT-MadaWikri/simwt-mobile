/**
 * Approval Center — semua yang menunggu keputusan Anda, dalam satu layar.
 *
 * Menggantikan tab "Aktivitas" yang sebelumnya berisi daftar contoh statis.
 * Daftar dibaca dari GET /approval (gabungan Kaizen + Tiket, sudah disaring
 * ke plant/departemen pengguna); tindakannya memakai endpoint modul
 * masing-masing lewat `approvalService`.
 *
 * Pola mobile yang dipakai:
 *  - chip penyaring di atas (Semua / Kaizen / Tiket) dengan angka antrean
 *  - kartu ringkas: nomor, judul, pengaju, waktu relatif
 *  - aksi langsung di kartu — Setujui / Tolak untuk Kaizen, Proses untuk
 *    Tiket — supaya tidak perlu masuk ke halaman lain hanya untuk satu klik
 *  - item hilang dari daftar begitu diputuskan (optimistis), lalu daftar
 *    disegarkan dari server
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import Icon from '../../src/components/common/Icon';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors, { brand } from '../../constants/Colors';
import Spacing from '../../constants/Spacing';
import { gs } from '../../constants/GlobalStyles';
import Button from '../../src/components/common/Button';
import BrandSpinner from '../../src/components/common/BrandSpinner';
import { dialog } from '../../src/components/common/AppDialog';
import {
  approvalService,
  ItemApproval,
  RingkasanApproval,
} from '../../src/services/approvalService';
import { jalankanSetelahTransisi } from '../../src/utils/useSetelahTransisi';
import { SkeletonDaftar } from '../../src/components/common/Skeleton';

type Saring = 'semua' | 'kaizen' | 'tiket';

function jarakWaktu(iso: string | null): string {
  if (!iso) return '';
  const selisih = Date.now() - new Date(iso).getTime();
  const jam = Math.floor(selisih / 3600000);
  if (jam < 1) return 'Baru saja';
  if (jam < 24) return `${jam} jam lalu`;
  const hari = Math.floor(jam / 24);
  if (hari < 30) return `${hari} hari lalu`;
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

const RUPA: Record<JenisKunci, { icon: string; label: string }> = {
  kaizen: { icon: 'lightbulb-on-outline', label: 'Kaizen' },
  tiket: { icon: 'ticket-outline', label: 'Tiket' },
};
type JenisKunci = 'kaizen' | 'tiket';

export default function ApprovalCenterScreen() {
  const insets = useSafeAreaInsets();
  const [ringkasan, setRingkasan] = useState<RingkasanApproval>({ total: 0, kaizen: 0, tiket: 0 });
  const [kaizen, setKaizen] = useState<ItemApproval[]>([]);
  const [tiket, setTiket] = useState<ItemApproval[]>([]);
  const [saring, setSaring] = useState<Saring>('semua');
  // Dibuka dari menu Kaizen (`?jenis=kaizen`): langsung tersaring ke jenis itu.
  const { jenis } = useLocalSearchParams<{ jenis?: string }>();
  useEffect(() => {
    if (jenis === 'kaizen' || jenis === 'tiket') setSaring(jenis);
  }, [jenis]);
  const [memuat, setMemuat] = useState(true);
  const [menyegarkan, setMenyegarkan] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);
  /** Id item yang sedang diproses — tombolnya diganti spinner. */
  const [sibuk, setSibuk] = useState<string | null>(null);

  const muat = useCallback(async () => {
    try {
      setGalat(null);
      const hasil = await approvalService.antrean();
      setRingkasan(hasil.ringkasan);
      setKaizen(hasil.kaizen);
      setTiket(hasil.tiket);
    } catch (err: any) {
      setGalat(err?.message ?? 'Gagal memuat antrean persetujuan.');
    } finally {
      setMemuat(false);
      setMenyegarkan(false);
    }
  }, []);

  useFocusEffect(useCallback(() => jalankanSetelahTransisi(() => muat()), [muat]));

  const daftar = useMemo(() => {
    if (saring === 'kaizen') return kaizen;
    if (saring === 'tiket') return tiket;
    // Gabungan diurut terbaru dulu supaya yang paling mendesak di atas.
    return [...kaizen, ...tiket].sort(
      (a, b) => new Date(b.tanggal ?? 0).getTime() - new Date(a.tanggal ?? 0).getTime()
    );
  }, [saring, kaizen, tiket]);

  /** Buang item dari daftar tanpa menunggu server — terasa responsif. */
  const buang = (item: ItemApproval) => {
    if (item.jenis === 'kaizen') setKaizen((isi) => isi.filter((x) => x.id !== item.id));
    else setTiket((isi) => isi.filter((x) => x.id !== item.id));
    setRingkasan((r) => ({
      total: Math.max(0, r.total - 1),
      kaizen: item.jenis === 'kaizen' ? Math.max(0, r.kaizen - 1) : r.kaizen,
      tiket: item.jenis === 'tiket' ? Math.max(0, r.tiket - 1) : r.tiket,
    }));
  };

  const setujui = async (item: ItemApproval) => {
    const setuju = await dialog.confirm({
      title: 'Setujui Kaizen',
      message: `Setujui "${item.judul}" dari ${item.pengaju ?? 'pengaju'}?`,
      confirmText: 'Setujui',
    });
    if (!setuju) return;

    setSibuk(`${item.jenis}-${item.id}`);
    try {
      await approvalService.setujuiKaizen(item.id);
      buang(item);
    } catch (err: any) {
      dialog.alert('Gagal Menyetujui', err?.message ?? 'Terjadi kesalahan.', 'danger');
    } finally {
      setSibuk(null);
    }
  };

  const tolak = async (item: ItemApproval) => {
    // Alasan diketik pengaju keputusan, bukan teks baku — alasannya ikut
    // terkirim ke email pemberitahuan dan tercatat permanen di kolom
    // `alasan`, jadi kalimat generik tidak menolong siapa pun.
    // Tombol "Tolak" di dialog mati sampai kolomnya terisi (`wajib`),
    // sehingga tidak mungkin lolos lalu ditolak server dengan 422.
    const alasan = await dialog.prompt({
      title: 'Tolak Kaizen',
      message: `Sebutkan alasan penolakan "${item.judul}". Alasan ini dikirimkan ke pengaju.`,
      confirmText: 'Tolak',
      destructive: true,
      isian: {
        placeholder: 'Contoh: Ide sudah pernah diterapkan di line 2.',
        multiline: true,
        // Batas 255 mengikuti VALIDASI server (`alasan` => max:255), bukan
        // tipe kolomnya — kolomnya sendiri `text`, jadi validasi yang lebih
        // ketat. Tanpa batas ini, teks panjang baru ditolak setelah terkirim.
        maxLength: 255,
      },
    });
    if (!alasan) return;

    setSibuk(`${item.jenis}-${item.id}`);
    try {
      await approvalService.tolakKaizen(item.id, alasan);
      buang(item);
    } catch (err: any) {
      dialog.alert('Gagal Menolak', err?.message ?? 'Terjadi kesalahan.', 'danger');
    } finally {
      setSibuk(null);
    }
  };

  const proses = async (item: ItemApproval) => {
    const setuju = await dialog.confirm({
      title: 'Proses Tiket',
      message: `Tandai tiket "${item.judul}" mulai diproses?`,
      confirmText: 'Proses',
    });
    if (!setuju) return;

    setSibuk(`${item.jenis}-${item.id}`);
    try {
      await approvalService.prosesTiket(item.id);
      buang(item);
    } catch (err: any) {
      dialog.alert('Gagal Memproses', err?.message ?? 'Terjadi kesalahan.', 'danger');
    } finally {
      setSibuk(null);
    }
  };

  const Chip = ({ nilai, label, jumlah }: { nilai: Saring; label: string; jumlah: number }) => (
    <TouchableOpacity
      style={[gs.badge, saring === nilai ? gs.badgeBrand : gs.badgeMuted]}
      onPress={() => setSaring(nilai)}
      activeOpacity={0.8}
    >
      <Text style={[gs.badgeText, saring === nilai ? gs.badgeTextBrand : gs.badgeTextMuted]}>
        {label} {jumlah > 0 ? `(${jumlah})` : ''}
      </Text>
    </TouchableOpacity>
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
      {/* Ringkasan + penyaring */}
      <View style={[gs.containerX, { paddingTop: Spacing.md }]}>
        <View style={[gs.cardBrand, gs.row, gs.gapMd]}>
          <View style={[gs.iconTile, { backgroundColor: Colors.white }]}>
            <Icon name="clipboard-check-outline" size={22} color={brand[600]} />
          </View>
          <View style={gs.flex1}>
            <Text style={[gs.metric, { fontSize: 12, color: brand[800] }]}>
              {ringkasan.total}
            </Text>
            <Text style={[gs.bodySm, { color: brand[800] }]}>
              {ringkasan.total === 0
                ? 'Tidak ada yang menunggu persetujuan'
                : 'menunggu keputusan Anda'}
            </Text>
          </View>
        </View>

        <View style={[gs.row, gs.gapSm, { marginTop: Spacing.md, marginBottom: Spacing.sm }]}>
          <Chip nilai="semua" label="Semua" jumlah={ringkasan.total} />
          <Chip nilai="kaizen" label="Kaizen" jumlah={ringkasan.kaizen} />
          <Chip nilai="tiket" label="Tiket" jumlah={ringkasan.tiket} />
        </View>
      </View>

      <FlatList
        data={daftar}
        keyExtractor={(item) => `${item.jenis}-${item.id}`}
        contentContainerStyle={[gs.scrollContent, { paddingBottom: insets.bottom + Spacing.xxl }]}
        initialNumToRender={10}
        windowSize={7}
        removeClippedSubviews
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
          <View style={[gs.card, gs.center, { marginTop: Spacing.lg }]}>
            <Icon
              name={galat ? 'alert-circle-outline' : 'check-circle-outline'}
              size={44}
              color={galat ? Colors.textTertiary : brand[400]}
            />
            <Text style={gs.emptyTitle}>{galat ? 'Gagal memuat' : 'Semua beres'}</Text>
            <Text style={gs.emptyText}>
              {galat ?? 'Tidak ada pengajuan yang menunggu keputusan Anda.'}
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const rupa = RUPA[item.jenis];
          const sedangSibuk = sibuk === `${item.jenis}-${item.id}`;

          return (
            <View style={[gs.card, { marginBottom: Spacing.md }]}>
              <View style={gs.rowBetween}>
                <View style={[gs.badge, gs.badgeBrand]}>
                  <Icon name={rupa.icon as any} size={12} color={brand[700]} />
                  <Text style={[gs.badgeText, gs.badgeTextBrand]}>{rupa.label}</Text>
                </View>
                <Text style={gs.caption}>{jarakWaktu(item.tanggal)}</Text>
              </View>

              <Text style={[gs.title, { marginTop: Spacing.sm }]} numberOfLines={2}>
                {item.judul}
              </Text>

              {item.nomor ? (
                <Text style={gs.caption} numberOfLines={1}>
                  #{item.nomor}
                </Text>
              ) : null}
              {item.pengaju ? (
                <Text style={[gs.bodySm, { marginTop: 2 }]} numberOfLines={1}>
                  Diajukan oleh {item.pengaju}
                </Text>
              ) : null}
              {item.keterangan ? (
                <Text style={[gs.bodySm, { marginTop: Spacing.xs }]} numberOfLines={2}>
                  {item.keterangan}
                </Text>
              ) : null}

              <View style={[gs.row, gs.gapSm, { marginTop: Spacing.lg }]}>
                {sedangSibuk ? (
                  <View style={[gs.flex1, gs.center, { paddingVertical: Spacing.sm }]}>
                    <BrandSpinner size={24} />
                  </View>
                ) : item.jenis === 'kaizen' ? (
                  <>
                    <Button variant="muted" label="Tolak" onPress={() => tolak(item)} style={gs.flex1} />
                    <Button icon="check" label="Setujui" onPress={() => setujui(item)} style={gs.flex1} />
                  </>
                ) : (
                  <Button icon="progress-wrench" label="Mulai Proses" onPress={() => proses(item)} style={gs.flex1} />
                )}
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}
