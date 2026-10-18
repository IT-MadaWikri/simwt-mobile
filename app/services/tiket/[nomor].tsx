/**
 * Detail tiket — gaya sama dengan detail Kaizen: seksi selebar layar di atas latar
 * putih (dipisah celah tipis): ringkasan, detail masalah, foto, dan progres
 * penanganan. Sumber: GET /tiket/lihat/{no_ticket}, dirapikan `adaptasiDetailTiket`.
 */
import React from 'react';
import { View, Text, ScrollView, RefreshControl, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '../../../src/components/common/Icon';
import AppBar from '../../../src/components/common/AppBar';
import { SkeletonDetail } from '../../../src/components/common/Skeleton';
import RingkasanTiket from '../../../src/components/tiket/RingkasanTiket';
import FotoTiket from '../../../src/components/tiket/FotoTiket';
import LinimasaTiket from '../../../src/components/tiket/LinimasaTiket';
import Colors from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { fonts, ukuranIsi } from '../../../constants/Typography';
import { gs } from '../../../constants/GlobalStyles';
import { useDetailTiket } from '../../../src/hooks/useDetailTiket';

export default function DetailTiketScreen() {
  const { nomor } = useLocalSearchParams<{ nomor: string }>();
  const insets = useSafeAreaInsets();
  const { tiket, memuat, menyegarkan, error, segarkan } = useDetailTiket(nomor);

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
      <AppBar judul={`Tiket #${tiket.noTiket}`} />
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.xxl }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={menyegarkan} onRefresh={segarkan} colors={[Colors.primary]} tintColor={Colors.primary} />
        }
      >
        <View style={styles.seksi}>
          <RingkasanTiket
            noTiket={tiket.noTiket}
            judul={tiket.judul}
            status={tiket.status}
            jenis={tiket.jenis}
            plant={tiket.plant}
            diajukanOleh={tiket.diajukanOleh}
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

        <View style={styles.seksi}>
          <Text style={styles.judulSeksi}>Progres penanganan</Text>
          <LinimasaTiket langkah={tiket.linimasa} />
        </View>
      </ScrollView>
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
