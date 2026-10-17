/**
 * Notifikasi — data nyata dari GET /notifications/latest.
 *
 * Sebelumnya layar ini berisi daftar contoh yang di-hardcode. Sekarang membaca
 * notifikasi Laravel yang sesungguhnya, diratakan oleh `notifikasiService`.
 */
import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, StyleSheet } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import Icon from '../../src/components/common/Icon';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors, { brand, slate } from '../../constants/Colors';
import Spacing from '../../constants/Spacing';
import { gs } from '../../constants/GlobalStyles';
import { fonts } from '../../constants/Typography';
import { API_CONFIG } from '../../constants/Api';
import AppBar from '../../src/components/common/AppBar';
import { dialog } from '../../src/components/common/AppDialog';
import {
  notifikasiService,
  rupaNotifikasi,
  Notifikasi,
} from '../../src/services/notifikasiService';
import { kaizenService } from '../../src/services/kaizenService';
import { jalankanSetelahTransisi } from '../../src/utils/useSetelahTransisi';
import { SkeletonBaris } from '../../src/components/common/Skeleton';

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

const hostTautan = (url: string) => url.match(/^https?:\/\/([^/:?#]+)/i)?.[1].toLowerCase() ?? '';
const HOST_API = hostTautan(API_CONFIG.BASE_URL);
/** Domain milik SIMWT: mwtpart.co.id (beserta subdomain) dan host API yang sedang dipakai. */
const hostInternal = (host: string) =>
  host === 'mwtpart.co.id' || host.endsWith('.mwtpart.co.id') || (!!HOST_API && host === HOST_API);

/** Notifikasi Kaizen dibuka ke detail Kaizen di dalam aplikasi, bukan ke web. */
const adaTujuan = (n: Notifikasi) => n.tipe.toLowerCase().includes('kaizen');

const WARNA = {
  brand: { tile: brand[50], icon: brand[600] },
  warning: { tile: Colors.serviceAmber, icon: '#b45309' },
  danger: { tile: Colors.serviceRed, icon: Colors.dangerDark },
};

export default function NotifikasiScreen() {
  const router = useRouter();
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

  const adaBelumDibaca = daftar.some((n) => !n.dibaca);

  const tandaiSemua = async () => {
    try {
      await notifikasiService.tandaiSemuaDibaca();
      setDaftar((lama) => lama.map((n) => ({ ...n, dibaca: true })));
    } catch (err: any) {
      dialog.alert('Gagal', err?.message ?? 'Tidak bisa menandai notifikasi.');
    }
  };

  const tandaiSatu = async (item: Notifikasi) => {
    try {
      await notifikasiService.tandaiDibaca(item.id);
      setDaftar((lama) => lama.map((n) => (n.id === item.id ? { ...n, dibaca: true } : n)));
    } catch (err: any) {
      dialog.alert('Gagal', err?.message ?? 'Tidak bisa menandai notifikasi.', 'danger');
    }
  };

  const hapusSatu = async (item: Notifikasi) => {
    try {
      await notifikasiService.hapus(item.id);
      setDaftar((lama) => lama.filter((n) => n.id !== item.id));
    } catch (err: any) {
      dialog.alert('Gagal', err?.message ?? 'Tidak bisa menghapus notifikasi.', 'danger');
    }
  };

  /** Kotak aksi yang muncul saat baris digeser ke kiri: Dibaca (hanya bila belum dibaca) dan Hapus. */
  const aksiGeser = (item: Notifikasi, tutup: () => void) => (
    <View style={styles.aksiGeser}>
      {!item.dibaca ? (
        <TouchableOpacity
          style={[styles.kotakAksi, { backgroundColor: brand[600] }]}
          onPress={() => {
            tutup();
            tandaiSatu(item);
          }}
        >
          <Icon name="check" size={18} color={Colors.white} />
          <Text style={styles.teksAksi}>Dibaca</Text>
        </TouchableOpacity>
      ) : null}
      <TouchableOpacity
        style={[styles.kotakAksi, { backgroundColor: Colors.danger }]}
        onPress={() => {
          tutup();
          hapusSatu(item);
        }}
      >
        <Icon name="delete-outline" size={18} color={Colors.white} />
        <Text style={styles.teksAksi}>Hapus</Text>
      </TouchableOpacity>
    </View>
  );

  const hapusSemua = async () => {
    const setuju = await dialog.confirm({
      title: 'Hapus Semua Notifikasi',
      message: 'Semua notifikasi akan dihapus permanen dan tidak bisa dikembalikan. Lanjutkan?',
      confirmText: 'Hapus Semua',
      cancelText: 'Batal',
      destructive: true,
    });
    if (!setuju) return;
    try {
      await notifikasiService.hapusSemua();
      setDaftar([]);
    } catch (err: any) {
      dialog.alert('Gagal', err?.message ?? 'Tidak bisa menghapus notifikasi.', 'danger');
    }
  };

  const appBar = (
    <AppBar
      judul="Notifikasi"
      kanan={
        daftar.length > 0 ? (
          <View style={[gs.row, { gap: Spacing.lg, paddingHorizontal: Spacing.lg }]}>
            {adaBelumDibaca ? (
              <TouchableOpacity onPress={tandaiSemua}>
                <Text style={{ color: Colors.white, fontSize: 12, fontFamily: fonts.semibold }}>
                  Tandai semua dibaca
                </Text>
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity onPress={hapusSemua} hitSlop={10} accessibilityLabel="Hapus semua notifikasi">
              <Icon name="delete-outline" size={18} color={Colors.white} />
            </TouchableOpacity>
          </View>
        ) : undefined
      }
    />
  );

  // Notifikasi Kaizen → detail Kaizen. Notifikasi lama belum menyimpan id, jadi dicari
  // lewat "Nomor" di isi pesan. Mengembalikan false bila tidak ketemu.
  const bukaKaizen = async (item: Notifikasi): Promise<boolean> => {
    let id = item.idKaizen;
    if (!id) {
      const nomor = item.pesan.match(/Nomor\s*:\s*(\S+)/)?.[1];
      if (!nomor || nomor === '-') return false;
      try {
        const hasil = await kaizenService.getList({ search: nomor });
        id = hasil.data.find((k) => k.nomor === nomor)?.id ?? null;
      } catch {
        return false;
      }
    }
    if (!id) return false;
    router.push(`/kaizen/${id}` as any);
    return true;
  };

  const buka = async (item: Notifikasi) => {
    if (item.tipe.toLowerCase().includes('kaizen') && (await bukaKaizen(item))) return;
    if (!item.tautan) return;
    // Tautan menunjuk halaman SIMWT web — buka di peramban dalam aplikasi (Custom Tabs / Safari View).
    // Hanya http(s); skema lain ditolak supaya tautan aneh dari server tidak ikut terbuka.
    if (!/^https?:\/\//i.test(item.tautan)) {
      dialog.alert('Tautan Tidak Valid', item.tautan);
      return;
    }
    // Tautan ke luar domain SIMWT diminta konfirmasi dulu.
    const host = hostTautan(item.tautan);
    if (!hostInternal(host)) {
      const lanjut = await dialog.confirm({
        title: 'Tautan Eksternal',
        message: `Notifikasi ini membuka situs di luar SIMWT (${host}). Lanjutkan?`,
        confirmText: 'Buka',
        cancelText: 'Batal',
      });
      if (!lanjut) return;
    }
    try {
      await WebBrowser.openBrowserAsync(item.tautan, { toolbarColor: Colors.primary, controlsColor: Colors.white, createTask: false });
    } catch {
      dialog.alert('Gagal Membuka', 'Tautan tidak bisa dibuka di peramban.');
    }
  };

  if (memuat) {
    return (
      <View style={[gs.screen, { backgroundColor: slate[100] }]}>
        {appBar}
        <SkeletonBaris jumlah={8} />
      </View>
    );
  }

  return (
    <View style={[gs.screen, { backgroundColor: slate[100] }]}>
      {appBar}
      <FlatList
        data={daftar}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: insets.bottom }}
        showsVerticalScrollIndicator={false}
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
          <View style={styles.kosong}>
            <View style={styles.kosongIkon}>
              <Icon
                name={galat ? 'alert-circle-outline' : 'bell-off-outline'}
                size={36}
                color={galat ? Colors.danger : brand[600]}
              />
            </View>
            <Text style={gs.emptyTitle}>{galat ? 'Gagal memuat' : 'Belum ada notifikasi'}</Text>
            <Text style={[gs.emptyText, gs.textCenter]}>
              {galat ?? 'Pemberitahuan untuk Anda akan tampil di sini.'}
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const rupa = rupaNotifikasi(item.tipe);
          const warna = WARNA[rupa.warna];

          return (
            <Swipeable
              overshootRight={false}
              renderRightActions={(_progres, _geser, metode) => aksiGeser(item, metode.close)}
            >
            <TouchableOpacity
              style={styles.baris}
              activeOpacity={item.tautan || adaTujuan(item) ? 0.6 : 1}
              disabled={!item.tautan && !adaTujuan(item)}
              onPress={() => buka(item)}
            >
              <View style={[styles.logo, { backgroundColor: warna.tile }]}>
                <Icon name={rupa.icon as any} size={18} color={warna.icon} />
              </View>

              <View style={gs.flex1}>
                <Text style={[styles.judul, !item.dibaca && { fontFamily: fonts.bold }]} numberOfLines={2}>
                  {item.judul}
                </Text>
                {item.pesan ? (
                  <Text style={styles.sub} numberOfLines={2}>
                    {item.pesan}
                  </Text>
                ) : null}
              </View>

              <View style={styles.kanan}>
                <Text style={styles.waktu} numberOfLines={1}>{jarakWaktu(item.waktu)}</Text>
                <View style={styles.penanda}>
                  {item.tautan && !adaTujuan(item) ? <Icon name="open-in-new" size={12} color={brand[600]} /> : null}
                  {!item.dibaca ? <View style={styles.titikBaru} /> : null}
                </View>
              </View>
            </TouchableOpacity>
            </Swipeable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
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
  aksiGeser: {
    flexDirection: 'row',
  },
  kotakAksi: {
    width: 72,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  teksAksi: {
    color: Colors.white,
    fontSize: 12,
    fontFamily: fonts.semibold,
  },
  kanan: {
    alignItems: 'flex-end',
    gap: 4,
    maxWidth: '30%',
    alignSelf: 'flex-start',
  },
  waktu: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: Colors.textTertiary,
  },
  penanda: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  titikBaru: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: brand[500],
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
  kosong: {
    alignItems: 'center',
    paddingTop: Spacing.xxxl,
    paddingHorizontal: Spacing.xl,
  },
  kosongIkon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: brand[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
});
