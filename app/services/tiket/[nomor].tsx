/**
 * Detail tiket — gaya sama dengan detail Kaizen: seksi selebar layar di atas latar
 * putih (dipisah celah tipis): ringkasan, detail masalah, foto, dan progres
 * penanganan. Sumber: GET /tiket/lihat/{no_ticket}, dirapikan `adaptasiDetailTiket`.
 */
import React, { useState } from 'react';
import { View, Text, ScrollView, RefreshControl, Share, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '../../../src/components/common/Icon';
import AppBar from '../../../src/components/common/AppBar';
import Button from '../../../src/components/common/Button';
import { dialog } from '../../../src/components/common/AppDialog';
import { SkeletonDetail } from '../../../src/components/common/Skeleton';
import RingkasanTiket from '../../../src/components/tiket/RingkasanTiket';
import FotoTiket from '../../../src/components/tiket/FotoTiket';
import MetrikTiket from '../../../src/components/tiket/MetrikTiket';
import LinimasaTiket from '../../../src/components/tiket/LinimasaTiket';
import SheetKonfirmasiTiket from '../../../src/components/tiket/SheetKonfirmasiTiket';
import SheetBagikanTiket from '../../../src/components/tiket/SheetBagikanTiket';
import Colors from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { fonts, ukuranIsi } from '../../../constants/Typography';
import { gs } from '../../../constants/GlobalStyles';
import { useDetailTiket } from '../../../src/hooks/useDetailTiket';
import { useKonfirmasiTiket } from '../../../src/hooks/useKonfirmasiTiket';
import { teksBagikanTiket } from '../../../src/adapters/tiket';
import { bagikanBuktiTiket } from '../../../src/services/buktiTiketService';

export default function DetailTiketScreen() {
  const { nomor } = useLocalSearchParams<{ nomor: string }>();
  const insets = useSafeAreaInsets();
  const { tiket, memuat, menyegarkan, error, muat, segarkan } = useDetailTiket(nomor);
  const aksi = useKonfirmasiTiket(nomor ?? '');
  const [sheetKonfirmasi, setSheetKonfirmasi] = useState(false);
  // Menu Bagikan (pesan / bukti PDF); `membuatPdf` = PDF sedang dibuat.
  const [sheetBagikan, setSheetBagikan] = useState(false);
  const [membuatPdf, setMembuatPdf] = useState(false);

  const bukaSheet = () => {
    aksi.hapusGalat();
    setSheetKonfirmasi(true);
  };
  const selesaiAksi = async (berhasil: boolean, judul: string, pesan: string) => {
    if (!berhasil) return;
    setSheetKonfirmasi(false);
    await muat();
    dialog.alert(judul, pesan, 'success');
  };

  const bagikanPesan = () => {
    if (!tiket) return;
    setSheetBagikan(false);
    Share.share({ message: teksBagikanTiket(tiket) }).catch(() => {});
  };
  const bagikanPdf = async () => {
    if (!tiket) return;
    setMembuatPdf(true);
    try {
      await bagikanBuktiTiket(tiket);
    } catch (e: any) {
      dialog.alert('Gagal Membuat PDF', e?.message || 'Bukti perbaikan tidak bisa dibuat. Coba lagi.', 'danger');
    } finally {
      setMembuatPdf(false);
      setSheetBagikan(false);
    }
  };

  if (memuat) {
    return (
      <View style={gs.screen}>
        <AppBar judul={`Tiket #${nomor}`} />
        <SkeletonDetail />
      </View>
    );
  }

  if (!tiket) {
    return (
      <View style={[gs.screen, gs.centerFill]}>
        <AppBar judul="Detail Tiket" />
        <Icon name="ticket-outline" size={48} color={Colors.textTertiary} />
        <Text style={gs.emptyTitle}>Tiket tidak ditemukan</Text>
        <Text style={gs.emptyText}>{error ?? `Nomor ${nomor} tidak ada di sistem.`}</Text>
      </View>
    );
  }

  const adaFoto = !!(tiket.fotoSebelum || tiket.fotoSesudah);

  return (
    <>
      <AppBar
        judul={`Tiket #${tiket.noTiket}`}
        kanan={
          <TouchableOpacity onPress={() => setSheetBagikan(true)} hitSlop={10} accessibilityLabel="Bagikan">
            <Icon name="share-variant" size={20} color={Colors.white} />
          </TouchableOpacity>
        }
      />
      <ScrollView
        contentContainerStyle={{ paddingBottom: tiket.bisaKonfirmasi ? 0 : insets.bottom }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={menyegarkan} onRefresh={segarkan} colors={[Colors.primary]} tintColor={Colors.primary} />
        }
      >
        {/* Kartu metrik langsung di atas latar layar (tanpa pembungkus putih). */}
        <View style={styles.metrik}>
          <MetrikTiket metrik={tiket.metrik} />
        </View>

        <View style={styles.seksi}>
          <RingkasanTiket
            noTiket={tiket.noTiket}
            judul={tiket.judul}
            status={tiket.status}
            jenis={tiket.jenis}
            plant={tiket.plant}
            diajukanOleh={tiket.diajukanOleh}
            pic={tiket.pic}
            departemen={tiket.departemen}
            aset={tiket.aset}
          />
        </View>

        <View style={styles.seksi}>
          <Text style={styles.judulSeksi}>Detail masalah</Text>
          <Text style={styles.teks}>{tiket.detail || '-'}</Text>
        </View>

        {adaFoto ? (
          <View style={styles.seksi}>
            <Text style={styles.judulSeksi}>Foto</Text>
            <FotoTiket fotoSebelum={tiket.fotoSebelum} fotoSesudah={tiket.fotoSesudah} />
          </View>
        ) : null}

        <View style={[styles.seksi, { marginBottom: 0 }]}>
          <Text style={styles.judulSeksi}>Progres penanganan</Text>
          {/* Tinggi dibatasi: progres panjang digulir di dalam kotak ini, bukan memanjangkan halaman. */}
          <ScrollView style={styles.linimasa} nestedScrollEnabled showsVerticalScrollIndicator>
            <LinimasaTiket langkah={tiket.linimasa} />
          </ScrollView>
        </View>
      </ScrollView>

      {/* Di luar ScrollView supaya tetap menempel di bawah saat halaman digulir. */}
      {tiket.bisaKonfirmasi ? (
        <View style={[styles.konfirmasi, { paddingBottom: insets.bottom + Spacing.md }]}>
          <View style={gs.flex1}>
            <Text style={styles.judulKonfirmasi}>Menunggu konfirmasi Anda</Text>
            <Text style={styles.teks}>Teknisi sudah menyelesaikan perbaikan. Apakah masalahnya sudah teratasi?</Text>
          </View>
          <Button label="Konfirmasi" icon="check-circle" onPress={bukaSheet} />
        </View>
      ) : null}

      <SheetBagikanTiket
        visible={sheetBagikan}
        adaBukti={tiket.status === 'RESOLVED' || tiket.status === 'OK'}
        membuatPdf={membuatPdf}
        onBagikanPesan={bagikanPesan}
        onBagikanPdf={bagikanPdf}
        onClose={() => setSheetBagikan(false)}
      />

      <SheetKonfirmasiTiket
        visible={sheetKonfirmasi}
        noTiket={tiket.noTiket}
        tanggalSelesai={tiket.tanggalSelesai}
        batasKonfirmasi={tiket.batasKonfirmasi}
        mengirim={aksi.mengirim}
        galat={aksi.galat}
        onKonfirmasi={async () => selesaiAksi(await aksi.konfirmasi(), 'Tiket Selesai', 'Terima kasih! Tiket telah dikonfirmasi selesai.')}
        onReopen={async (alasan) =>
          selesaiAksi(await aksi.reopen(alasan), 'Tiket Dibuka Kembali', 'Tiket dikembalikan ke teknisi untuk perbaikan ulang.')
        }
        onClose={() => setSheetKonfirmasi(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  /** Seksi selebar layar (tanpa kartu), dipisah celah abu-abu tipis. */
  seksi: {
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.sm,
  },
  konfirmasi: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderSubtle,
  },
  linimasa: { maxHeight: 320 },
  judulKonfirmasi: { fontSize: ukuranIsi, fontFamily: fonts.semibold, color: Colors.textPrimary },
  metrik: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, paddingBottom: Spacing.md },
  judulSeksi: {
    fontSize: 12,
    fontFamily: fonts.semibold,
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  teks: { fontSize: ukuranIsi, fontFamily: fonts.regular, color: Colors.textSecondary, lineHeight: 18 },
});
