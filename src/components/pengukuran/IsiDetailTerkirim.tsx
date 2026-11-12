/** Isi layar Detail Pengukuran Terkirim: info, part, approval, dan sampel per titik ukur. Presentasional. */
import React, { useEffect, useRef, useState } from 'react';
import { Animated, LayoutAnimation, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from '../common/Icon';
import LencanaJudgment from './LencanaJudgment';
import Lencana from '../common/Lencana';
import Colors, { brand, lencana } from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { fonts, fontsJudul, ukuranIsi, ukuranCatatan } from '../../../constants/Typography';
import { formatTanggalWaktu } from '../../utils/pengukuran';
import { DetailTerkirim, KelompokHasil, SampelTerkirim, TahapApproval } from '../../types/pengukuran';

const IKON_APPROVAL: Record<TahapApproval['kunci'], string> = {
  inspected: 'eye-outline',
  checked: 'clipboard-check-outline',
  approved: 'check-decagram',
};

const WARNA_APPROVAL: Record<TahapApproval['kunci'], { bg: string; fg: string }> = {
  inspected: lencana.biru,
  checked: lencana.kuning,
  approved: lencana.hijau,
};

function Info({ label, nilai }: { label: string; nilai: string }) {
  return (
    <View style={styles.info}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.nilai}>{nilai}</Text>
    </View>
  );
}

function KartuApproval({ tahap }: { tahap: TahapApproval }) {
  const sudah = !!tahap.oleh;
  return (
    <View style={[styles.kotakSampel, styles.kartuApproval]}>
      <View style={styles.judulHasil}>
        <View style={[styles.ikon, sudah && { backgroundColor: WARNA_APPROVAL[tahap.kunci].bg }]}>
          <Icon name={IKON_APPROVAL[tahap.kunci]} size={14} color={sudah ? WARNA_APPROVAL[tahap.kunci].fg : Colors.textTertiary} />
        </View>
        <Text style={[styles.nilai, styles.flex1]} numberOfLines={1}>{tahap.label}</Text>
      </View>
      <Text style={styles.sub} numberOfLines={1}>{tahap.oleh ?? 'Menunggu pemeriksaan'}</Text>
      <Text style={styles.sub} numberOfLines={1}>{tahap.pada ? formatTanggalWaktu(tahap.pada) : '-'}</Text>
    </View>
  );
}

const BARIS_PER_HALAMAN = 1;
const KOLOM = 2;

const potong = <T,>(daftar: T[], ukuran: number): T[][] =>
  Array.from({ length: Math.ceil(daftar.length / ukuran) }, (_, i) => daftar.slice(i * ukuran, (i + 1) * ukuran));

function KotakSampel({ nomor, sampel }: { nomor: number; sampel: SampelTerkirim }) {
  const ng = sampel.judgement === 'NG';
  return (
    <View style={[styles.kotakSampel, ng && styles.kotakNg]}>
      <Text style={styles.nomorSampel}>#{nomor}</Text>
      <Text style={[styles.nilai, styles.nilaiSampel, ng && { color: Colors.dangerDark }]} numberOfLines={1}>{sampel.nilai}</Text>
      {sampel.judgement ? (
        <Icon name={ng ? 'close-circle' : 'check-circle'} size={12} color={ng ? Colors.dangerDark : brand[600]} />
      ) : null}
    </View>
  );
}

/** Grid 2 kolom sama lebar dalam satu baris; bila lebih dari 2 item, digeser per halaman. */
function GridGeser<T>({ data, kunci, renderItem }: { data: T[]; kunci: (item: T) => string | number; renderItem: (item: T) => React.ReactNode }) {
  const [lebar, setLebar] = useState(0);
  const [halaman, setHalaman] = useState(0);
  const daftarHalaman = potong(data, KOLOM * BARIS_PER_HALAMAN);
  const bisaGeser = daftarHalaman.length > 1;

  const renderHalaman = (isi: T[], i: number) => (
    <View key={i} style={[styles.barisSampel, bisaGeser && lebar > 0 ? { width: lebar } : null]}>
      {isi.map((item) => <React.Fragment key={kunci(item)}>{renderItem(item)}</React.Fragment>)}
      {isi.length < KOLOM ? <View style={styles.kosong} /> : null}
    </View>
  );

  if (!bisaGeser) return <View style={styles.sampel}>{daftarHalaman.map(renderHalaman)}</View>;

  return (
    <View style={styles.sampel} onLayout={(e) => setLebar(e.nativeEvent.layout.width)}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => lebar > 0 && setHalaman(Math.round(e.nativeEvent.contentOffset.x / lebar))}
      >
        {daftarHalaman.map(renderHalaman)}
      </ScrollView>
      <View style={styles.titikHalaman}>
        {daftarHalaman.map((_, i) => (
          <View key={i} style={[styles.titikGeser, i === halaman && styles.titikGeserAktif]} />
        ))}
      </View>
    </View>
  );
}

function BlokHasil({ kelompok }: { kelompok: KelompokHasil }) {
  return (
    <View style={styles.hasil}>
      <View style={styles.judulHasil}>
        <Text style={[styles.nilai, styles.namaTitik]} numberOfLines={1}>{kelompok.nama}</Text>
        <Lencana label={`DWG ${kelompok.drawing}`} warna={lencana.abu} />
      </View>
      <View style={styles.keterangan}>
        <Icon name="ruler" size={14} color={Colors.textTertiary} />
        <Text style={[styles.sub, styles.flex1]}>{kelompok.alat}</Text>
      </View>
      <View style={styles.keterangan}>
        <Icon name="target" size={14} color={Colors.textTertiary} />
        <Text style={[styles.sub, styles.flex1]}>Standar {kelompok.target}</Text>
      </View>
      <GridGeser
        data={kelompok.sampel.map((sampel, i) => ({ sampel, nomor: i + 1 }))}
        kunci={(x) => x.nomor}
        renderItem={(x) => <KotakSampel nomor={x.nomor} sampel={x.sampel} />}
      />
    </View>
  );
}

/** Satu periode (Awal / Tengah / Akhir) sebagai akordion berisi titik-titik ukurnya. */
function GrupPeriode({ periode, daftar, terbukaAwal, pertama }: { periode: string; daftar: KelompokHasil[]; terbukaAwal: boolean; pertama: boolean }) {
  const [terbuka, setTerbuka] = useState(terbukaAwal);
  const putar = useRef(new Animated.Value(terbukaAwal ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(putar, { toValue: terbuka ? 1 : 0, duration: 200, useNativeDriver: true }).start();
  }, [putar, terbuka]);

  const ubah = () => {
    LayoutAnimation.configureNext(LayoutAnimation.create(200, 'easeInEaseOut', 'opacity'));
    setTerbuka((t) => !t);
  };
  const jumlahNg = daftar.reduce((n, k) => n + k.sampel.filter((x) => x.judgement === 'NG').length, 0);

  return (
    <View style={[styles.grup, !pertama && styles.grupGaris]}>
      <TouchableOpacity style={styles.kepalaGrup} onPress={ubah} activeOpacity={0.6}>
        <Text style={styles.periode}>Periode {periode}</Text>
        <Lencana label={`${daftar.length} titik`} warna={lencana.abu} />
        {jumlahNg > 0 ? <Lencana label={`${jumlahNg} NG`} warna={lencana.merah} /> : null}
        <View style={styles.flex1} />
        <Animated.View style={{ transform: [{ rotate: putar.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] }) }] }}>
          <Icon name="chevron-down" size={16} color={Colors.textTertiary} />
        </Animated.View>
      </TouchableOpacity>
      {terbuka ? daftar.map((k) => <BlokHasil key={k.kunci} kelompok={k} />) : null}
    </View>
  );
}

export default function IsiDetailTerkirim({ detail }: { detail: DetailTerkirim }) {
  const periodeBerurutan = Array.from(
    detail.hasil.reduce((peta, k) => peta.set(k.periode, [...(peta.get(k.periode) ?? []), k]), new Map<string, KelompokHasil[]>())
  );

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
        <GridGeser data={detail.approval} kunci={(t) => t.kunci} renderItem={(t) => <KartuApproval tahap={t} />} />
      </View>

      <View style={styles.seksi}>
        <Text style={styles.judulSeksi}>Hasil pengukuran</Text>
        {detail.hasil.length === 0 ? <Text style={styles.sub}>Belum ada hasil pengukuran.</Text> : null}
        {periodeBerurutan.map(([periode, daftar], i) => (
          <GrupPeriode key={periode} periode={periode} daftar={daftar} terbukaAwal={i === 0} pertama={i === 0} />
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
  judulSeksi: { fontFamily: fontsJudul.bold, fontSize: ukuranIsi, color: Colors.textPrimary },
  judulBaris: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.md },
  kode: { flex: 1, fontFamily: fonts.bold, fontSize: 14, color: Colors.textPrimary },
  grid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: Spacing.md },
  info: { width: '50%', gap: 2, paddingRight: Spacing.md },
  label: { fontFamily: fonts.regular, fontSize: ukuranIsi, color: Colors.textTertiary },
  nilai: { fontFamily: fonts.semibold, fontSize: ukuranIsi, color: Colors.textPrimary },
  sub: { fontFamily: fonts.regular, fontSize: ukuranCatatan, color: Colors.textSecondary },
  lot: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Spacing.radius.md,
    ...Spacing.curve,
    backgroundColor: Colors.borderSubtle,
  },
  ikon: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.borderSubtle },
  flex1: { flex: 1 },
  grup: { overflow: 'hidden' },
  grupGaris: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: Colors.border },
  kepalaGrup: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: Spacing.md },
  periode: { fontFamily: fonts.bold, fontSize: ukuranIsi, color: brand[700] },
  hasil: { gap: 4, paddingBottom: Spacing.md },
  keterangan: { flexDirection: 'row', alignItems: 'flex-start', gap: 6 },
  judulHasil: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  namaTitik: { flex: 1 },
  sampel: { paddingTop: 4 },
  barisSampel: { flexDirection: 'row', gap: 6 },
  kosong: { flex: 1 },
  kartuApproval: { flexDirection: 'column', alignItems: 'stretch', gap: 2, paddingVertical: Spacing.md },
  kotakSampel: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Spacing.radius.md,
    ...Spacing.curve,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  kotakNg: { borderColor: Colors.serviceRed, backgroundColor: Colors.serviceRed },
  nomorSampel: { fontFamily: fonts.regular, fontSize: 11, color: Colors.textTertiary },
  nilaiSampel: { flex: 1 },
  titikHalaman: { flexDirection: 'row', justifyContent: 'center', gap: 4, paddingTop: 6 },
  titikGeser: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.border },
  titikGeserAktif: { backgroundColor: brand[600] },
});
