/**
 * Detail tiket + progres penanganan.
 *
 * Sumber: GET /tiket/lihat/{no_ticket} — berisi tiket + relasi `progress`
 * (catatan penanganan dari tim terkait) yang digambar sebagai linimasa.
 */
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors, { brand } from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { gs } from '../../../constants/GlobalStyles';
import LoadingSpinner from '../../../src/components/common/LoadingSpinner';
import { tiketService } from '../../../src/services/tiketService';

function waktu(iso: string | null | undefined): string {
  if (!iso) return '-';
  return new Date(iso).toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Menunggu ditangani',
  PROSES: 'Sedang diproses',
  OK: 'Selesai',
};

export default function DetailTiketScreen() {
  const { nomor } = useLocalSearchParams<{ nomor: string }>();
  const insets = useSafeAreaInsets();
  const [tiket, setTiket] = useState<any>(null);
  const [memuat, setMemuat] = useState(true);

  useEffect(() => {
    if (!nomor) return;
    tiketService
      .lihat(nomor)
      .then(setTiket)
      .finally(() => setMemuat(false));
  }, [nomor]);

  if (memuat) {
    return (
      <View style={gs.screen}>
        <LoadingSpinner message="Memuat detail tiket..." />
      </View>
    );
  }

  if (!tiket) {
    return (
      <View style={[gs.screen, gs.centerFill]}>
        <MaterialCommunityIcons name="ticket-outline" size={48} color={Colors.textTertiary} />
        <Text style={gs.emptyTitle}>Tiket tidak ditemukan</Text>
        <Text style={gs.emptyText}>Nomor {nomor} tidak ada di sistem.</Text>
      </View>
    );
  }

  const selesai = tiket.status_pengajuan === 'OK';
  const progres: any[] = tiket.progress ?? [];

  // Linimasa: diajukan → tiap progress → (selesai bila sudah).
  const linimasa = [
    {
      id: 'diajukan',
      judul: 'Tiket diajukan',
      isi: `oleh ${tiket.diajukan_oleh ?? '-'}`,
      waktu: tiket.tanggal_diajukan,
      selesai: true,
    },
    ...progres.map((item, indeks) => ({
      id: `p-${item.id ?? indeks}`,
      judul: item.keterangan ?? item.deskripsi ?? 'Progres penanganan',
      isi: item.pic ?? item.sparepart?.nama ?? null,
      waktu: item.tanggal_progress ?? item.created_at,
      selesai: true,
    })),
    {
      id: 'selesai',
      judul: selesai ? 'Tiket selesai' : 'Menunggu penyelesaian',
      isi: selesai ? tiket.diselesaikan_oleh && `oleh ${tiket.diselesaikan_oleh}` : null,
      waktu: selesai ? tiket.tanggal_selesai : null,
      selesai,
    },
  ];

  return (
    <>
      <Stack.Screen options={{ title: `Tiket #${nomor}` }} />
      <ScrollView
        style={gs.screen}
        contentContainerStyle={[gs.scrollContent, { paddingBottom: insets.bottom + Spacing.xxl }]}
      >
        {/* Kepala tiket */}
        <View style={gs.card}>
          <View style={gs.rowBetween}>
            <Text style={[gs.caption, gs.textSemibold]}>#{tiket.no_ticket}</Text>
            <View style={[gs.badge, selesai ? gs.badgeMuted : gs.badgeBrand]}>
              <Text style={[gs.badgeText, selesai ? gs.badgeTextMuted : gs.badgeTextBrand]}>
                {STATUS_LABEL[tiket.status_pengajuan] ?? tiket.status_pengajuan}
              </Text>
            </View>
          </View>

          <Text style={[gs.h3, { marginTop: Spacing.sm }]}>{tiket.judul_masalah}</Text>
          {tiket.detail_masalah ? (
            <Text style={[gs.body, { marginTop: Spacing.sm }]}>{tiket.detail_masalah}</Text>
          ) : null}

          <View style={gs.divider} />
          <View style={[gs.rowWrap, gs.gapMd]}>
            {tiket.jenis?.nama && <Info icon="shape-outline" teks={tiket.jenis.nama} />}
            {tiket.departemen?.nama && <Info icon="office-building-outline" teks={tiket.departemen.nama} />}
            {tiket.aset?.asset_number && <Info icon="barcode" teks={tiket.aset.asset_number} />}
          </View>
        </View>

        {/* Linimasa progres */}
        <Text style={[gs.sectionTitle, { marginTop: Spacing.sectionGap }]}>Progres Penanganan</Text>
        <View style={gs.card}>
          {linimasa.map((langkah, indeks) => (
            <View key={langkah.id} style={[gs.row, { alignItems: 'flex-start' }]}>
              {/* Kolom penanda: titik + garis penghubung. */}
              <View style={{ alignItems: 'center', width: 24 }}>
                <View
                  style={[
                    styles.titik,
                    { backgroundColor: langkah.selesai ? brand[500] : Colors.border },
                  ]}
                >
                  {langkah.selesai && (
                    <MaterialCommunityIcons name="check" size={10} color={Colors.white} />
                  )}
                </View>
                {indeks < linimasa.length - 1 && <View style={styles.garis} />}
              </View>

              <View style={[gs.flex1, { paddingBottom: Spacing.lg, marginLeft: Spacing.sm }]}>
                <Text style={[gs.title, { fontSize: 14 }]}>{langkah.judul}</Text>
                {langkah.isi ? <Text style={gs.bodySm}>{langkah.isi}</Text> : null}
                {langkah.waktu ? <Text style={gs.caption}>{waktu(langkah.waktu)}</Text> : null}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </>
  );
}

function Info({ icon, teks }: { icon: string; teks: string }) {
  return (
    <View style={[gs.row, gs.gapXs]}>
      <MaterialCommunityIcons name={icon as any} size={14} color={brand[600]} />
      <Text style={gs.bodySm}>{teks}</Text>
    </View>
  );
}

const styles = {
  titik: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginTop: 2,
  },
  garis: {
    flex: 1,
    width: 2,
    minHeight: 22,
    backgroundColor: Colors.borderSubtle,
  },
};
