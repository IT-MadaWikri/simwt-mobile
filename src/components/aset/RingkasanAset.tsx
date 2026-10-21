/**
 * RingkasanAset — kartu ringkasan di puncak halaman Aset, angkanya sama dengan dashboard IT di web:
 * kartu besar berupa carousel geser manual (halaman 1 total aset + selisih bulan lalu, halaman 2
 * rincian kategori yang menggulir vertikal bila banyak; titik penanda bila lebih dari satu halaman),
 * dua kartu kecil (maintenance, tidak aktif beserta persennya), dan kartu lebar berdonat persentase
 * aset aktif (plus aset baru dan perlu peremajaan). Presentasional: `ringkasan` null = belum dimuat.
 */
import React, { useState } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Icon from '../common/Icon';
import TeksBergulir from '../common/TeksBergulir';
import Colors, { brand } from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { fonts } from '../../../constants/Typography';
import { RingkasanAsetData } from '../../types/aset';

interface RingkasanAsetProps {
  ringkasan: RingkasanAsetData | null;
  /** Ketuk kartu Maintenance / Tidak aktif → daftar aset berstatus itu. */
  onBukaMaintenance: () => void;
  onBukaTidakAktif: () => void;
}

const UKURAN_DONAT = 52;
const TEBAL_DONAT = 5;
const JARI = (UKURAN_DONAT - TEBAL_DONAT) / 2;
const KELILING = 2 * Math.PI * JARI;

/** ScrollView vertikal dengan indikator gulir bulat buatan sendiri (bawaan sistem disembunyikan). */
function DaftarGulirBulat({ children }: { children: React.ReactNode }) {
  const [tinggiTampak, setTinggiTampak] = useState(0);
  const [tinggiIsi, setTinggiIsi] = useState(0);
  const [offset, setOffset] = useState(0);

  const bisaGulir = tinggiIsi > tinggiTampak + 1 && tinggiTampak > 0;
  const tinggiJempol = bisaGulir ? Math.max(24, (tinggiTampak / tinggiIsi) * tinggiTampak) : 0;
  const posisiJempol = bisaGulir ? (offset / (tinggiIsi - tinggiTampak)) * (tinggiTampak - tinggiJempol) : 0;

  return (
    <View style={styles.daftarKategori} onLayout={(e) => setTinggiTampak(e.nativeEvent.layout.height)}>
      <ScrollView
        nestedScrollEnabled
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={(e) => setOffset(Math.max(0, Math.min(e.nativeEvent.contentOffset.y, tinggiIsi - tinggiTampak)))}
        onContentSizeChange={(_, h) => setTinggiIsi(h)}
        contentContainerStyle={bisaGulir ? styles.isiBerjalur : undefined}
      >
        {children}
      </ScrollView>
      {bisaGulir ? (
        <View style={styles.jalur} pointerEvents="none">
          <View style={[styles.jempol, { height: tinggiJempol, transform: [{ translateY: posisiJempol }] }]} />
        </View>
      ) : null}
    </View>
  );
}

interface KartuStatusProps {
  label: string;
  jumlah?: number;
  persen: string;
  /** Porsi dari total (0–1) untuk cincin di sekeliling ikon. */
  rasio: number;
  ikon: string;
  warnaIkon: string;
  latarIkon: string;
  latar: string;
  onPress: () => void;
}

const UKURAN_CINCIN = 40;
const TEBAL_CINCIN = 3.5;
const JARI_CINCIN = (UKURAN_CINCIN - TEBAL_CINCIN) / 2;
const KELILING_CINCIN = 2 * Math.PI * JARI_CINCIN;

/** Kartu kecil berbentuk pil: ikon dalam cincin porsi di kiri, angka + label di tengah, chevron di kanan. */
function KartuStatus({ label, jumlah, persen, rasio, ikon, warnaIkon, latarIkon, latar, onPress }: KartuStatusProps) {
  const tengah = UKURAN_CINCIN / 2;
  return (
    <TouchableOpacity activeOpacity={0.7} onPress={onPress} style={[styles.kartuKecil, { backgroundColor: latar }]}>
      <View style={styles.cincin}>
        <Svg width={UKURAN_CINCIN} height={UKURAN_CINCIN}>
          <Circle cx={tengah} cy={tengah} r={JARI_CINCIN} stroke={latarIkon} strokeWidth={TEBAL_CINCIN} fill={Colors.white} />
          <Circle
            cx={tengah}
            cy={tengah}
            r={JARI_CINCIN}
            stroke={warnaIkon}
            strokeWidth={TEBAL_CINCIN}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={`${KELILING_CINCIN * Math.min(Math.max(rasio, 0), 1)} ${KELILING_CINCIN}`}
            rotation={-90}
            origin={`${tengah}, ${tengah}`}
          />
        </Svg>
        <View style={styles.ikonCincin}>
          <Icon name={ikon} size={16} color={warnaIkon} />
        </View>
      </View>
      <View style={styles.teksPil}>
        <Text style={styles.angka} numberOfLines={1}>
          {angka(jumlah)}
          <Text style={styles.labelBiasa}> ({persen})</Text>
        </Text>
        <Text style={styles.label} numberOfLines={1}>{label}</Text>
      </View>
      <Icon name="chevron-right" size={14} color={Colors.textTertiary} />
    </TouchableOpacity>
  );
}

const angka = (n?: number) => (n === undefined ? '–' : n.toLocaleString('id-ID'));
const persenDari = (n: number | undefined, total: number | undefined) =>
  n === undefined || !total ? '0,0%' : `${((n / total) * 100).toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;

export default function RingkasanAset({ ringkasan, onBukaMaintenance, onBukaTidakAktif }: RingkasanAsetProps) {
  const [lebarHalaman, setLebarHalaman] = useState(0);
  const [halamanAktif, setHalamanAktif] = useState(0);

  const persen = Math.round(ringkasan?.persen_aktif ?? 0);
  const selisih = ringkasan?.selisih_bulan_lalu ?? 0;

  const distribusi = ringkasan?.distribusi ?? [];
  const jumlahHalaman = distribusi.length > 0 ? 2 : 1;

  const saatGulirSelesai = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (lebarHalaman > 0) setHalamanAktif(Math.round(e.nativeEvent.contentOffset.x / lebarHalaman));
  };

  return (
    <View style={styles.pembungkus}>
      <View style={styles.baris}>
        <View style={[styles.kartu, styles.kartuBesar, { backgroundColor: Colors.serviceAmber }]}>
          <View style={styles.carousel} onLayout={(e) => setLebarHalaman(e.nativeEvent.layout.width)}>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              scrollEnabled={jumlahHalaman > 1}
              onMomentumScrollEnd={saatGulirSelesai}
            >
              <View style={[styles.halaman, { width: lebarHalaman || undefined }]}>
                <View style={[styles.ikon, { backgroundColor: '#ffedc2' }]}>
                  <Icon name="box" size={18} color="#ff9a2e" />
                </View>
                <View>
                  <Text style={styles.angkaBesar}>{angka(ringkasan?.total)}</Text>
                  <Text style={styles.label}>Total aset</Text>
                  {selisih !== 0 ? (
                    <Text style={[styles.label, { color: selisih > 0 ? brand[700] : Colors.dangerDark }]}>
                      {selisih > 0 ? '+' : ''}{selisih} dari bulan lalu
                    </Text>
                  ) : null}
                </View>
              </View>

              {distribusi.length > 0 ? (
                <View style={[styles.halaman, { width: lebarHalaman || undefined }]}>
                  <Text style={styles.judulHalaman}>Kategori</Text>
                  <DaftarGulirBulat>
                    <View style={styles.rincian}>
                      {distribusi.map((k) => (
                        <View key={k.label} style={styles.barisRincian}>
                          <Text style={[styles.label, styles.namaKategori]} numberOfLines={1}>{k.label}</Text>
                          <Text style={styles.nilaiRincian}>
                            {angka(k.jumlah)}
                            <Text style={styles.label}> ({persenDari(k.jumlah, ringkasan?.total)})</Text>
                          </Text>
                        </View>
                      ))}
                    </View>
                  </DaftarGulirBulat>
                </View>
              ) : null}
            </ScrollView>
          </View>

          {jumlahHalaman > 1 ? (
            <View style={styles.titik}>
              {Array.from({ length: jumlahHalaman }, (_, i) => (
                <View key={i} style={[styles.titikBulat, i === halamanAktif && styles.titikAktif]} />
              ))}
            </View>
          ) : null}
        </View>

        <View style={styles.kolom}>
          <KartuStatus
            label="Maintenance"
            jumlah={ringkasan?.maintenance}
            persen={persenDari(ringkasan?.maintenance, ringkasan?.total)}
            rasio={ringkasan?.total ? ringkasan.maintenance / ringkasan.total : 0}
            ikon="progress-wrench"
            warnaIkon="#4a98ff"
            latarIkon="#dbeafe"
            latar={Colors.serviceBlue}
            onPress={onBukaMaintenance}
          />
          <KartuStatus
            label="Tidak aktif"
            jumlah={ringkasan?.tidak_aktif}
            persen={persenDari(ringkasan?.tidak_aktif, ringkasan?.total)}
            rasio={ringkasan?.total ? ringkasan.tidak_aktif / ringkasan.total : 0}
            ikon="close-circle"
            warnaIkon="#ff6a5c"
            latarIkon="#fee2e2"
            latar={Colors.serviceRed}
            onPress={onBukaTidakAktif}
          />
        </View>
      </View>

      {/* Pil lebar: ikon dalam cincin persentase aktif, angka + rincian bergulir, persen besar di kanan. */}
      <View style={styles.kartuLebar}>
        <View style={styles.cincinBesar}>
          <Svg width={UKURAN_DONAT} height={UKURAN_DONAT}>
            <Circle cx={UKURAN_DONAT / 2} cy={UKURAN_DONAT / 2} r={JARI} stroke={brand[100]} strokeWidth={TEBAL_DONAT} fill={Colors.white} />
            <Circle
              cx={UKURAN_DONAT / 2}
              cy={UKURAN_DONAT / 2}
              r={JARI}
              stroke={brand[600]}
              strokeWidth={TEBAL_DONAT}
              strokeLinecap="round"
              fill="none"
              strokeDasharray={`${(KELILING * persen) / 100} ${KELILING}`}
              rotation={-90}
              origin={`${UKURAN_DONAT / 2}, ${UKURAN_DONAT / 2}`}
            />
          </Svg>
          <View style={styles.ikonCincin}>
            <Icon name="shield-lock-outline" size={20} color={brand[600]} />
          </View>
        </View>

        <View style={styles.isiLebar}>
          <Text style={styles.judulLebar} numberOfLines={1}>
            {ringkasan ? `${angka(ringkasan.aktif)} dari ${angka(ringkasan.total)}` : '–'}
            <Text style={styles.labelBiasa}> aset aktif</Text>
          </Text>
          <TeksBergulir
            style={styles.subLebar}
            teks={
              ringkasan
                ? [
                    `${angka(ringkasan.maintenance)} maintenance`,
                    `${angka(ringkasan.tidak_aktif)} tidak aktif`,
                    `${angka(ringkasan.baru_bulan_ini)} baru bulan ini`,
                    `${angka(ringkasan.perlu_peremajaan)} perlu peremajaan`,
                  ]
                : ['Memuat…']
            }
          />
        </View>

        <View style={styles.nilaiKanan}>
          <Text style={styles.persenBesar}>{ringkasan ? `${persen}%` : '–'}</Text>
          <Text style={styles.label}>aktif</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pembungkus: { paddingHorizontal: Spacing.screenPadding, gap: Spacing.md, marginBottom: Spacing.xl },
  baris: { flexDirection: 'row', gap: Spacing.md },
  kolom: { flex: 1, gap: Spacing.md },
  kartu: { borderRadius: Spacing.radius.xl, ...Spacing.curve, padding: Spacing.md },
  // Persegi 1:1; rincian kategori yang banyak menggulir di dalamnya, kartu tidak memanjang.
  kartuBesar: { flex: 1, aspectRatio: 1 },
  carousel: { flex: 1 },
  halaman: { flex: 1, justifyContent: 'space-between', gap: Spacing.sm },
  judulHalaman: { fontFamily: fonts.semibold, fontSize: 12, color: Colors.textPrimary },
  daftarKategori: { flex: 1 },
  // Ruang di kanan isi supaya teks tidak tertutup indikator.
  isiBerjalur: { paddingRight: 10 },
  jalur: { position: 'absolute', top: 0, bottom: 0, right: 0, width: 4, borderRadius: 2, backgroundColor: 'rgba(0,0,0,0.06)' },
  jempol: { width: 4, borderRadius: 2, backgroundColor: '#ff9a2e' },
  rincian: { gap: 4 },
  barisRincian: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: Spacing.xs },
  namaKategori: { flexShrink: 1 },
  nilaiRincian: { fontFamily: fonts.bold, fontSize: 12, color: Colors.textPrimary },
  titik: { flexDirection: 'row', justifyContent: 'center', gap: 4, paddingTop: Spacing.sm },
  titikBulat: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(0,0,0,0.15)' },
  titikAktif: { backgroundColor: '#ff9a2e' },
  kartuKecil: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingLeft: Spacing.sm,
    paddingRight: Spacing.md,
    borderRadius: Spacing.radius.full,
    ...Spacing.curve,
  },
  cincin: { width: UKURAN_CINCIN, height: UKURAN_CINCIN },
  ikonCincin: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  teksPil: { flex: 1 },
  ikon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  // Angka hero: pengecualian dari aturan 12px, seperti sapaan di beranda.
  angkaBesar: { fontFamily: fonts.bold, fontSize: 24, color: Colors.textPrimary },
  angka: { fontFamily: fonts.bold, fontSize: 14, color: Colors.textPrimary },
  label: { fontFamily: fonts.regular, fontSize: 12, color: Colors.textSecondary },
  labelBiasa: { fontFamily: fonts.regular, fontSize: 12, color: Colors.textSecondary },
  kartuLebar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
    paddingLeft: Spacing.sm,
    paddingRight: Spacing.lg,
    borderRadius: Spacing.radius.full,
    ...Spacing.curve,
    backgroundColor: Colors.serviceGreen,
  },
  cincinBesar: { width: UKURAN_DONAT, height: UKURAN_DONAT },
  isiLebar: { flex: 1, gap: 2 },
  judulLebar: { fontFamily: fonts.bold, fontSize: 14, color: Colors.textPrimary },
  subLebar: { fontFamily: fonts.regular, fontSize: 12, color: Colors.textSecondary },
  nilaiKanan: { alignItems: 'flex-end' },
  // Angka hero di kanan: pengecualian aturan 12px, seperti angka total aset.
  persenBesar: { fontFamily: fonts.bold, fontSize: 20, color: brand[700] },
});
