/**
 * Bottom sheet pass Form Keluar Pabrik hasil pindai QR di gerbang: siapa, kapan, dan satu tombol aksi
 * (Catat Keluar / Catat Kembali). Presentasional: data & pencatatan datang dari `useGerbangKeluarPabrik`.
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import BottomSheet from '../common/BottomSheet';
import Button from '../common/Button';
import Icon from '../common/Icon';
import { Skeleton } from '../common/Skeleton';
import LencanaStatusKeluarPabrik from './LencanaStatusKeluarPabrik';
import Colors, { brand, slate } from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { fonts } from '../../../constants/Typography';
import { gs } from '../../../constants/GlobalStyles';
import { GerbangKeluarPabrik, HasilGerbang } from '../../types/layananHrd';
import { LABEL_JENIS, formatRentangJam, formatTanggalKeluar, formatWaktuKeluarPabrik } from '../../adapters/keluarPabrik';

interface SheetGerbangKeluarPabrikProps {
  visible: boolean;
  pass: GerbangKeluarPabrik | null;
  /** Hasil pencatatan terakhir (setelah menekan tombol aksi). */
  hasil: HasilGerbang | null;
  memuat: boolean;
  mencatat: boolean;
  error: string;
  onCatat: () => void;
  onClose: () => void;
}

/** Tombol aksi menurut tahap pass; `aktif` false = tidak ada yang bisa dicatat. */
function aksiUntuk(pass: GerbangKeluarPabrik) {
  if (pass.tahap === 'keluar') return { label: 'Catat Keluar', icon: 'logout', aktif: true };
  if (pass.tahap === 'kembali') return { label: 'Catat Kembali', icon: 'login', aktif: true };
  if (pass.tahap === 'selesai') return { label: 'Aktivitas Sudah Selesai', icon: 'check-circle', aktif: false };
  return { label: 'Izin Belum Disetujui', icon: 'alert-circle', aktif: false };
}

function Baris({ ikon, teks }: { ikon: string; teks: string }) {
  return (
    <View style={styles.baris}>
      <Icon name={ikon} size={14} color={Colors.textTertiary} />
      <Text style={styles.teksBaris} numberOfLines={2}>{teks}</Text>
    </View>
  );
}

/** Kotak kecil: waktu keluar / kembali aktual di gerbang. */
function Catatan({ label, waktu }: { label: string; waktu: string | null }) {
  return (
    <View style={[styles.kotak, waktu ? styles.kotakIsi : null]}>
      <Text style={styles.labelKotak}>{label}</Text>
      <Text style={[styles.waktuKotak, !waktu && { color: Colors.textTertiary }]}>{waktu ? formatWaktuKeluarPabrik(waktu) : 'Belum'}</Text>
    </View>
  );
}

export default function SheetGerbangKeluarPabrik({ visible, pass, hasil, memuat, mencatat, error, onCatat, onClose }: SheetGerbangKeluarPabrikProps) {
  const aksi = pass ? aksiUntuk(pass) : null;
  const sukses = hasil?.tipe === 'success';

  return (
    <BottomSheet visible={visible} onClose={onClose} title="QR Pass Keluar Pabrik">
      <View style={styles.isi}>
        {memuat ? (
          <View style={styles.kartu}>
            <Skeleton w="60%" h={14} />
            <Skeleton w="40%" h={12} style={{ marginTop: Spacing.md }} />
            <Skeleton w="80%" h={12} style={{ marginTop: Spacing.md }} />
          </View>
        ) : !pass ? (
          <View style={styles.galat}>
            <Icon name="alert-circle-outline" size={40} color={Colors.danger} />
            <Text style={styles.teksGalat}>{error || 'Pass tidak ditemukan.'}</Text>
          </View>
        ) : (
          <>
            {hasil ? (
              <View style={[styles.hasil, { backgroundColor: sukses ? brand[50] : '#fffbeb' }]}>
                <Icon name={sukses ? 'check-circle' : 'alert-circle'} size={18} color={sukses ? brand[600] : '#b45309'} />
                <View style={gs.flex1}>
                  <Text style={[styles.judulHasil, { color: sukses ? brand[700] : '#b45309' }]}>{hasil.judul}</Text>
                  <Text style={styles.pesanHasil}>{hasil.pesan}</Text>
                </View>
              </View>
            ) : null}

            <View style={styles.kartu}>
              <View style={styles.kepala}>
                <View style={styles.ikon}>
                  <Icon name="account" size={18} color={brand[700]} />
                </View>
                <View style={gs.flex1}>
                  <Text style={styles.nama} numberOfLines={1}>{pass.namaUser}</Text>
                  <Text style={styles.nomor}>{pass.nomorDokumen}</Text>
                </View>
                <LencanaStatusKeluarPabrik status={pass.status} label={pass.statusLabel} />
              </View>

              <View style={styles.rincian}>
                <Baris ikon="briefcase-outline" teks={`${LABEL_JENIS[pass.jenisKeluar]} · ${[pass.departemen, pass.plant].filter(Boolean).join(' · ') || '-'}`} />
                <Baris ikon="calendar" teks={`${formatTanggalKeluar(pass.tanggalKeluar)} · ${formatRentangJam(pass.jamKeluar, pass.jamKembali)}`} />
                {pass.alasan ? <Baris ikon="file-document" teks={pass.alasan} /> : null}
              </View>

              <View style={styles.catatan}>
                <Catatan label="Keluar" waktu={pass.waktuKeluarAktual} />
                <Catatan label="Kembali" waktu={pass.waktuKembaliAktual} />
              </View>
            </View>

            {error ? <Text style={styles.galatKecil}>{error}</Text> : null}

            {hasil ? (
              <Button label="Selesai" variant="outline" block onPress={onClose} style={styles.tombol} />
            ) : aksi ? (
              <Button
                label={aksi.label}
                icon={aksi.icon}
                block
                disabled={!aksi.aktif}
                loading={mencatat}
                onPress={onCatat}
                style={styles.tombol}
              />
            ) : null}
          </>
        )}
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  isi: { paddingHorizontal: Spacing.lg },
  kartu: {
    backgroundColor: Colors.white,
    borderRadius: Spacing.radius.xl,
    ...Spacing.curve,
    padding: Spacing.md,
  },
  kepala: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  ikon: { width: 36, height: 36, borderRadius: 18, backgroundColor: brand[50], alignItems: 'center', justifyContent: 'center' },
  nama: { fontFamily: fonts.bold, fontSize: 12, color: Colors.textPrimary },
  nomor: { fontFamily: fonts.regular, fontSize: 12, color: Colors.textTertiary, marginTop: 1 },
  rincian: { marginTop: Spacing.md, rowGap: 6 },
  baris: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
  teksBaris: { flex: 1, fontFamily: fonts.regular, fontSize: 12, color: Colors.textSecondary },
  catatan: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md },
  kotak: { flex: 1, padding: Spacing.sm, borderRadius: Spacing.radius.md, ...Spacing.curve, backgroundColor: slate[100] },
  kotakIsi: { backgroundColor: brand[50] },
  labelKotak: { fontFamily: fonts.regular, fontSize: 11, color: Colors.textTertiary },
  waktuKotak: { fontFamily: fonts.semibold, fontSize: 12, color: Colors.textPrimary, marginTop: 1 },
  hasil: { flexDirection: 'row', gap: Spacing.sm, padding: Spacing.md, marginBottom: Spacing.md, borderRadius: Spacing.radius.lg, ...Spacing.curve },
  judulHasil: { fontFamily: fonts.bold, fontSize: 12 },
  pesanHasil: { fontFamily: fonts.regular, fontSize: 12, color: Colors.textSecondary, marginTop: 1 },
  tombol: { marginTop: Spacing.lg },
  galat: { alignItems: 'center', paddingVertical: Spacing.xl },
  teksGalat: { fontFamily: fonts.regular, fontSize: 12, color: Colors.textSecondary, textAlign: 'center', marginTop: Spacing.md },
  galatKecil: { fontFamily: fonts.regular, fontSize: 12, color: Colors.danger, marginTop: Spacing.sm },
});
