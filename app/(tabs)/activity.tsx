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
 *  - daftar datar ala notifikasi (bukan kartu): ikon, judul, nomor · pengaju, waktu relatif
 *  - mengetuk baris membuka DETAIL (Kaizen / Tiket) supaya diperiksa dulu; Setujui / Tolak
 *    Kaizen ada di detail Kaizen (bar menempel di bawah layar), bukan di daftar ini
 *  - tiket: geser baris ke kiri untuk "Proses" (tiket belum punya aksi di halaman detailnya)
 *  - daftar disegarkan setiap layar ini kembali fokus, jadi keputusan yang diambil di
 *    detail langsung tercermin di sini
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, StyleSheet } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import Icon from '../../src/components/common/Icon';
import KeadaanKosong from '../../src/components/common/KeadaanKosong';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors, { brand, slate } from '../../constants/Colors';
import Spacing from '../../constants/Spacing';
import { gs } from '../../constants/GlobalStyles';
import { fonts } from '../../constants/Typography';
import { dialog } from '../../src/components/common/AppDialog';
import {
  approvalService,
  ItemApproval,
  RingkasanApproval,
} from '../../src/services/approvalService';
import { useAuth } from '../../src/contexts/AuthContext';
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

type JenisKunci = 'kaizen' | 'tiket';
const RUPA: Record<JenisKunci, { icon: string; tile: string; warna: string }> = {
  kaizen: { icon: 'lightbulb-on-outline', tile: brand[50], warna: brand[600] },
  tiket: { icon: 'ticket-outline', tile: Colors.serviceAmber, warna: '#b45309' },
};

export default function ApprovalCenterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  // Antrean Kaizen hanya untuk yang punya permission approve_kaizen (aturan yang sama dengan server);
  // tanpa itu angka, chip, dan itemnya tidak ditampilkan sama sekali.
  const { user } = useAuth();
  const bisaKaizen = !!user?.permission_names?.includes('approve_kaizen');
  const [ringkasan, setRingkasan] = useState<RingkasanApproval>({ total: 0, kaizen: 0, tiket: 0 });
  const [kaizen, setKaizen] = useState<ItemApproval[]>([]);
  const [tiket, setTiket] = useState<ItemApproval[]>([]);
  const [saring, setSaring] = useState<Saring>('semua');
  // Dibuka dari menu Kaizen (`?jenis=kaizen`): langsung tersaring ke jenis itu.
  const { jenis } = useLocalSearchParams<{ jenis?: string }>();
  useEffect(() => {
    if (jenis === 'tiket' || (jenis === 'kaizen' && bisaKaizen)) setSaring(jenis);
  }, [jenis, bisaKaizen]);
  const [memuat, setMemuat] = useState(true);
  const [menyegarkan, setMenyegarkan] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);

  const muat = useCallback(async () => {
    try {
      setGalat(null);
      const hasil = await approvalService.antrean();
      setRingkasan(bisaKaizen ? hasil.ringkasan : { total: hasil.ringkasan.tiket, kaizen: 0, tiket: hasil.ringkasan.tiket });
      setKaizen(bisaKaizen ? hasil.kaizen : []);
      setTiket(hasil.tiket);
    } catch (err: any) {
      setGalat(err?.message ?? 'Gagal memuat antrean persetujuan.');
    } finally {
      setMemuat(false);
      setMenyegarkan(false);
    }
  }, [bisaKaizen]);

  useFocusEffect(useCallback(() => jalankanSetelahTransisi(() => muat()), [muat]));

  const daftar = useMemo(() => {
    if (saring === 'kaizen') return kaizen;
    if (saring === 'tiket') return tiket;
    // Gabungan diurut terbaru dulu supaya yang paling mendesak di atas.
    return [...kaizen, ...tiket].sort(
      (a, b) => new Date(b.tanggal ?? 0).getTime() - new Date(a.tanggal ?? 0).getTime()
    );
  }, [saring, kaizen, tiket]);

  /** Buang tiket dari daftar tanpa menunggu server — terasa responsif. */
  const buangTiket = (item: ItemApproval) => {
    setTiket((isi) => isi.filter((x) => x.id !== item.id));
    setRingkasan((r) => ({
      total: Math.max(0, r.total - 1),
      kaizen: r.kaizen,
      tiket: Math.max(0, r.tiket - 1),
    }));
  };

  const proses = async (item: ItemApproval) => {
    const setuju = await dialog.confirm({
      title: 'Proses Tiket',
      message: `Tandai tiket "${item.judul}" mulai diproses?`,
      confirmText: 'Proses',
    });
    if (!setuju) return;

    try {
      await approvalService.prosesTiket(item.id);
      buangTiket(item);
    } catch (err: any) {
      dialog.alert('Gagal Memproses', err?.message ?? 'Terjadi kesalahan.', 'danger');
    }
  };

  /** Ketuk baris → detail. Setujui/Tolak Kaizen dilakukan di detail Kaizen. */
  const buka = (item: ItemApproval) => {
    if (item.jenis === 'kaizen') router.push(`/kaizen/${item.id}` as any);
    else if (item.nomor) router.push(`/services/tiket/${item.nomor}` as any);
  };

  const Chip = ({ nilai, label, jumlah }: { nilai: Saring; label: string; jumlah: number }) => (
    <ChipSaring label={label} jumlah={jumlah} aktif={saring === nilai} onPress={() => setSaring(nilai)} />
  );

  if (memuat) {
    return (
      <View style={gs.screen}>
        <SkeletonDaftar />
      </View>
    );
  }

  return (
    <View style={[gs.screen, { backgroundColor: slate[100] }]}>
      {/* Penyaring */}
      <View style={[gs.containerX, { paddingVertical: Spacing.md }]}>
        <View style={[gs.row, gs.gapSm]}>
          <Chip nilai="semua" label="Semua" jumlah={ringkasan.total} />
          {bisaKaizen ? <Chip nilai="kaizen" label="Kaizen" jumlah={ringkasan.kaizen} /> : null}
          <Chip nilai="tiket" label="Tiket" jumlah={ringkasan.tiket} />
        </View>
      </View>

      <FlatList
        data={daftar}
        keyExtractor={(item) => `${item.jenis}-${item.id}`}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: insets.bottom }}
        showsVerticalScrollIndicator={false}
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
        ItemSeparatorComponent={() => (
          <View style={styles.wadahPemisah}>
            <View style={styles.pemisah} />
          </View>
        )}
        ListEmptyComponent={
          <KeadaanKosong
            pose={galat ? 'mikir' : 'jempol'}
            judul={galat ? 'Gagal memuat' : 'Semua beres'}
            teks={galat ?? 'Tidak ada pengajuan yang menunggu keputusan Anda.'}
          />
        }
        renderItem={({ item }) => {
          const rupa = RUPA[item.jenis];
          const sub = [item.nomor ? `#${item.nomor}` : null, item.pengaju ? `Diajukan oleh ${item.pengaju}` : null]
            .filter(Boolean)
            .join(' · ');

          const baris = (
            <TouchableOpacity style={styles.baris} activeOpacity={0.6} onPress={() => buka(item)}>
              <View style={[styles.logo, { backgroundColor: rupa.tile }]}>
                <Icon name={rupa.icon as any} size={18} color={rupa.warna} />
              </View>

              <View style={gs.flex1}>
                <Text style={styles.judul} numberOfLines={1}>
                  {item.judul}
                </Text>
                {sub ? (
                  <Text style={styles.sub} numberOfLines={1}>
                    {sub}
                  </Text>
                ) : null}
              </View>

              <View style={styles.kanan}>
                <Text style={styles.waktu} numberOfLines={1}>{jarakWaktu(item.tanggal)}</Text>
              </View>
              <Icon name="chevron-right" size={16} color={Colors.textTertiary} />
            </TouchableOpacity>
          );

          // Tiket: geser ke kiri untuk "Proses" (halaman detail tiket belum punya aksi itu).
          return item.jenis === 'tiket' ? (
            <Swipeable
              overshootRight={false}
              renderRightActions={(_progres, _geser, metode) => (
                <TouchableOpacity
                  style={styles.aksiProses}
                  onPress={() => {
                    metode.close();
                    proses(item);
                  }}
                >
                  <Icon name="progress-wrench" size={18} color={Colors.white} />
                  <Text style={styles.teksAksi}>Proses</Text>
                </TouchableOpacity>
              )}
            >
              {baris}
            </Swipeable>
          ) : (
            baris
          );
        }}
      />
    </View>
  );
}

/** Chip penyaring: aktif = hijau penuh, nonaktif = putih berbingkai; angka antrean di pil kecil. */
function ChipSaring({ label, jumlah, aktif, onPress }: { label: string; jumlah: number; aktif: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      style={[styles.chip, aktif && styles.chipAktif]}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityState={{ selected: aktif }}
    >
      <Text style={[styles.chipTeks, aktif && styles.chipTeksAktif]}>{label}</Text>
      {jumlah > 0 ? (
        <View style={[styles.chipJumlah, aktif && styles.chipJumlahAktif]}>
          <Text style={[styles.chipJumlahTeks, aktif && styles.chipJumlahTeksAktif]}>{jumlah}</Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Spacing.radius.full,
    ...Spacing.curve,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  chipAktif: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipTeks: {
    fontSize: 12,
    fontFamily: fonts.semibold,
    color: Colors.textSecondary,
  },
  chipTeksAktif: {
    color: Colors.white,
  },
  chipJumlah: {
    minWidth: 18,
    height: 18,
    paddingHorizontal: 5,
    borderRadius: 9,
    backgroundColor: slate[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipJumlahAktif: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  chipJumlahTeks: {
    fontSize: 10,
    fontFamily: fonts.bold,
    color: Colors.textSecondary,
  },
  chipJumlahTeksAktif: {
    color: Colors.white,
  },
  baris: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.white,
  },
  logo: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
  judul: {
    fontSize: 12,
    fontFamily: fonts.semibold,
    color: Colors.textPrimary,
  },
  sub: {
    marginTop: 2,
    fontSize: 12,
    fontFamily: fonts.regular,
    color: Colors.textSecondary,
  },
  kanan: {
    alignItems: 'flex-end',
    maxWidth: '30%',
  },
  waktu: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: Colors.textTertiary,
  },
  wadahPemisah: {
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.lg,
  },
  pemisah: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.border,
    marginLeft: 42 + Spacing.md,
  },
  aksiProses: {
    width: 72,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    backgroundColor: brand[600],
  },
  teksAksi: {
    color: Colors.white,
    fontSize: 12,
    fontFamily: fonts.semibold,
  },
});
