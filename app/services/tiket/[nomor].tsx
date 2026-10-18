/**
 * Detail tiket + linimasa progres penanganan.
 * Sumber: GET /tiket/lihat/{no_ticket}, dirapikan oleh `adaptasiDetailTiket`.
 */
import React from 'react';
import { View, Text, ScrollView, Image, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '../../../src/components/common/Icon';
import AppBar from '../../../src/components/common/AppBar';
import { SkeletonDetail } from '../../../src/components/common/Skeleton';
import LencanaStatusTiket from '../../../src/components/tiket/LencanaStatusTiket';
import LinimasaTiket from '../../../src/components/tiket/LinimasaTiket';
import Colors, { brand } from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { fonts } from '../../../constants/Typography';
import { gs } from '../../../constants/GlobalStyles';
import { useDetailTiket } from '../../../src/hooks/useDetailTiket';

export default function DetailTiketScreen() {
  const { nomor } = useLocalSearchParams<{ nomor: string }>();
  const insets = useSafeAreaInsets();
  const { tiket, memuat, error } = useDetailTiket(nomor);

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

  const info = [
    { ikon: 'shape-outline', teks: tiket.jenis },
    { ikon: 'office-building-outline', teks: tiket.departemen },
    { ikon: 'factory', teks: tiket.plant },
    { ikon: 'barcode', teks: tiket.aset },
  ].filter((i) => i.teks);

  const foto = [
    { label: 'Foto sebelum', uri: tiket.fotoSebelum },
    { label: 'Foto sesudah', uri: tiket.fotoSesudah },
  ].filter((f) => f.uri);

  return (
    <>
      <AppBar judul={`Tiket #${tiket.noTiket}`} />
      <ScrollView
        style={gs.screen}
        contentContainerStyle={[gs.scrollContent, { paddingBottom: insets.bottom + Spacing.xxl }]}
      >
        <View style={gs.card}>
          <View style={gs.rowBetween}>
            <Text style={[gs.caption, gs.textSemibold]}>#{tiket.noTiket}</Text>
            <LencanaStatusTiket status={tiket.status} panjang />
          </View>

          <Text style={[gs.h3, { marginTop: Spacing.sm }]}>{tiket.judul}</Text>
          {tiket.detail ? <Text style={[gs.body, { marginTop: Spacing.sm }]}>{tiket.detail}</Text> : null}

          {info.length > 0 ? (
            <>
              <View style={gs.divider} />
              <View style={styles.info}>
                {info.map((i) => (
                  <View key={i.ikon} style={[gs.row, gs.gapXs]}>
                    <Icon name={i.ikon as any} size={14} color={brand[600]} />
                    <Text style={[gs.bodySm, gs.flex1]}>{i.teks}</Text>
                  </View>
                ))}
              </View>
            </>
          ) : null}
        </View>

        {foto.length > 0 ? (
          <>
            <Text style={[gs.sectionTitle, { marginTop: Spacing.sectionGap }]}>Foto</Text>
            <View style={styles.fotoBaris}>
              {foto.map((f) => (
                <View key={f.label} style={styles.fotoKolom}>
                  <Image source={{ uri: f.uri! }} style={styles.foto} resizeMode="cover" />
                  <Text style={styles.fotoLabel}>{f.label}</Text>
                </View>
              ))}
            </View>
          </>
        ) : null}

        <Text style={[gs.sectionTitle, { marginTop: Spacing.sectionGap }]}>Progres Penanganan</Text>
        <View style={gs.card}>
          <LinimasaTiket langkah={tiket.linimasa} />
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  info: { gap: Spacing.sm },
  fotoBaris: { flexDirection: 'row', gap: Spacing.md },
  fotoKolom: { flex: 1, gap: Spacing.xs },
  foto: { width: '100%', aspectRatio: 1, borderRadius: Spacing.radius.sm, backgroundColor: Colors.borderSubtle },
  fotoLabel: { fontFamily: fonts.regular, fontSize: 12, color: Colors.textSecondary },
});
