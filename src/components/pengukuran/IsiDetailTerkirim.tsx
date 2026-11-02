/** Isi layar Detail Pengukuran Terkirim: info, part, approval, dan sampel per titik ukur. Presentasional. */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Icon from '../common/Icon';
import LencanaJudgment from './LencanaJudgment';
import Colors, { brand } from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { fonts } from '../../../constants/Typography';
import { formatTanggalWaktu } from '../../utils/pengukuran';
import { DetailTerkirim, KelompokHasil, TahapApproval } from '../../types/pengukuran';

const IKON_APPROVAL: Record<TahapApproval['kunci'], string> = {
  inspected: 'eye-outline',
  checked: 'clipboard-check-outline',
  approved: 'check-decagram',
};

function Info({ label, nilai }: { label: string; nilai: string }) {
  return (
    <View style={styles.info}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.nilai}>{nilai}</Text>
    </View>
  );
}

function BarisApproval({ tahap }: { tahap: TahapApproval }) {
  const sudah = !!tahap.oleh;
  return (
    <View style={styles.baris}>
      <View style={[styles.ikon, sudah && { backgroundColor: brand[50] }]}>
        <Icon name={IKON_APPROVAL[tahap.kunci]} size={18} color={sudah ? brand[700] : Colors.textTertiary} />
      </View>
      <View style={styles.isi}>
        <Text style={styles.nilai}>{tahap.label}</Text>
        <Text style={styles.sub}>{tahap.oleh ?? 'Menunggu pemeriksaan'}</Text>
        {tahap.pada ? <Text style={styles.sub}>{formatTanggalWaktu(tahap.pada)}</Text> : null}
      </View>
    </View>
  );
}

function BlokHasil({ kelompok }: { kelompok: KelompokHasil }) {
  return (
    <View style={styles.hasil}>
      <Text style={styles.periode}>Periode {kelompok.periode}</Text>
      <Text style={styles.nilai}>{kelompok.nama} (DWG: {kelompok.drawing})</Text>
      <Text style={styles.sub}>{kelompok.alat} · Standar {kelompok.target}</Text>

      <View style={styles.sampel}>
        {kelompok.sampel.map((s, i) => {
          const ng = s.judgement === 'NG';
          return (
            <View key={i} style={[styles.kotakSampel, ng && styles.kotakNg]}>
              <Text style={styles.sub}>#{i + 1}</Text>
              <Text style={[styles.nilai, { color: ng ? Colors.dangerDark : Colors.textPrimary }]}>{s.nilai}</Text>
              <Text style={[styles.judgement, { color: ng ? Colors.dangerDark : brand[700] }]}>{s.judgement ?? '-'}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

export default function IsiDetailTerkirim({ detail }: { detail: DetailTerkirim }) {
  return (
    <View>
      <View style={styles.seksi}>
        <View style={styles.judulBaris}>
          <Text style={styles.kode}>{detail.kodeUnik}</Text>
          <LencanaJudgment judgment={detail.judgment} />
        </View>
        <View style={styles.grid}>
          <Info label="Tanggal pengukuran" nilai={formatTanggalWaktu(detail.tanggal)} />
          <Info label="Periode" nilai={detail.periode} />
          <Info label="Shift" nilai={detail.shift} />
          <Info label="Diukur oleh" nilai={detail.diukurOleh} />
        </View>
      </View>

      <View style={styles.seksi}>
        <Text style={styles.judulSeksi}>Part</Text>
        <Text style={styles.nilai}>{detail.partNama}</Text>
        <Text style={styles.sub}>{detail.partKode}</Text>
        <View style={styles.lot}>
          <Text style={styles.sub}>Nomor lot</Text>
          <Text style={styles.nilai}>{detail.lotNo}</Text>
        </View>
      </View>

      <View style={styles.seksi}>
        <Text style={styles.judulSeksi}>Status approval</Text>
        {detail.approval.map((t) => (
          <BarisApproval key={t.kunci} tahap={t} />
        ))}
      </View>

      <View style={styles.seksi}>
        <Text style={styles.judulSeksi}>Hasil pengukuran</Text>
        {detail.hasil.length === 0 ? <Text style={styles.sub}>Belum ada hasil pengukuran.</Text> : null}
        {detail.hasil.map((k) => (
          <BlokHasil key={k.kunci} kelompok={k} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  seksi: {
    padding: Spacing.screenPadding,
    gap: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderSubtle,
    backgroundColor: Colors.white,
  },
  judulSeksi: { fontFamily: fonts.bold, fontSize: 12, color: Colors.textPrimary },
  judulBaris: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.md },
  kode: { flex: 1, fontFamily: fonts.bold, fontSize: 14, color: Colors.textPrimary },
  grid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: Spacing.md },
  info: { width: '50%', gap: 2, paddingRight: Spacing.md },
  label: { fontFamily: fonts.regular, fontSize: 12, color: Colors.textTertiary },
  nilai: { fontFamily: fonts.semibold, fontSize: 12, color: Colors.textPrimary },
  sub: { fontFamily: fonts.regular, fontSize: 12, color: Colors.textSecondary },
  lot: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Spacing.radius.md,
    ...Spacing.curve,
    backgroundColor: Colors.borderSubtle,
  },
  baris: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md },
  ikon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.borderSubtle },
  isi: { flex: 1, gap: 2 },
  hasil: { gap: 2, paddingTop: Spacing.sm, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: Colors.border },
  periode: { fontFamily: fonts.bold, fontSize: 12, color: brand[700] },
  sampel: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, paddingTop: Spacing.sm },
  kotakSampel: {
    minWidth: 76,
    gap: 2,
    padding: Spacing.md,
    borderRadius: Spacing.radius.md,
    ...Spacing.curve,
    borderWidth: 1,
    borderColor: brand[200],
    backgroundColor: brand[50],
  },
  kotakNg: { borderColor: Colors.danger, backgroundColor: Colors.serviceRed },
  judgement: { fontFamily: fonts.bold, fontSize: 12 },
});
