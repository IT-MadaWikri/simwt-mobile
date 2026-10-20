/**
 * KalenderBulan — kalender sebulan: judul bulan + panah geser, baris nama hari,
 * lalu grid tanggal. Tanggal terpilih berupa lingkaran gelap, hari ini diberi
 * warna brand, dan `penanda` memberi titik berwarna di bawah tanggal.
 * Presentasional: pilihan & bulan yang tampil dipegang pemanggil.
 */
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from '../common/Icon';
import Colors, { brand } from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { fonts } from '../../../constants/Typography';
import { NAMA_BULAN, NAMA_HARI, SINGKATAN_HARI, kunciTanggal, sama, selBulan } from '../../utils/kalender';

interface KalenderBulanProps {
  tahun: number;
  /** 0–11. */
  bulan: number;
  terpilih: Date;
  /** Warna titik per tanggal, kuncinya `YYYY-MM-DD` (lihat `kunciTanggal`). */
  penanda?: Record<string, string[]>;
  onPilih: (tanggal: Date) => void;
  /** -1 = bulan lalu, +1 = bulan depan. */
  onGeser: (delta: number) => void;
}

export default function KalenderBulan({ tahun, bulan, terpilih, penanda = {}, onPilih, onGeser }: KalenderBulanProps) {
  const hariIni = new Date();
  const sel = selBulan(tahun, bulan);

  return (
    <View>
      <View style={styles.kepala}>
        <View style={styles.flex1}>
          {/* Judul besar: pengecualian dari aturan 12px, seperti sapaan di beranda. */}
          <Text style={styles.judul}>{NAMA_BULAN[bulan]} {tahun}</Text>
          <Text style={styles.sub}>
            {NAMA_HARI[terpilih.getDay()]}, {terpilih.getDate()} {NAMA_BULAN[terpilih.getMonth()]} {terpilih.getFullYear()}
          </Text>
        </View>
        <TouchableOpacity style={styles.panah} hitSlop={8} onPress={() => onGeser(-1)} accessibilityLabel="Bulan sebelumnya">
          <Icon name="chevron-left" size={20} color={Colors.ink} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.panah} hitSlop={8} onPress={() => onGeser(1)} accessibilityLabel="Bulan berikutnya">
          <Icon name="chevron-right" size={20} color={Colors.ink} />
        </TouchableOpacity>
      </View>

      <View style={styles.baris}>
        {SINGKATAN_HARI.map((h) => (
          <Text key={h} style={styles.namaHari}>{h}</Text>
        ))}
      </View>

      <View style={styles.grid}>
        {sel.map((tgl, i) => {
          if (!tgl) return <View key={i} style={styles.sel} />;
          const dipilih = sama(tgl, terpilih);
          const titik = penanda[kunciTanggal(tgl)] ?? [];
          return (
            <TouchableOpacity key={i} style={styles.sel} activeOpacity={0.7} onPress={() => onPilih(tgl)}>
              <View style={[styles.bulat, dipilih && styles.bulatDipilih]}>
                <Text
                  style={[
                    styles.angka,
                    sama(tgl, hariIni) && !dipilih && styles.angkaHariIni,
                    dipilih && styles.angkaDipilih,
                  ]}
                >
                  {tgl.getDate()}
                </Text>
              </View>
              <View style={styles.titikBaris}>
                {titik.slice(0, 3).map((warna, k) => (
                  <View key={k} style={[styles.titik, { backgroundColor: warna }]} />
                ))}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  kepala: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  judul: { fontFamily: fonts.bold, fontSize: 18, color: Colors.textPrimary },
  sub: { fontFamily: fonts.regular, fontSize: 12, color: Colors.textTertiary },
  panah: {
    width: 32,
    height: 32,
    borderRadius: Spacing.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  baris: { flexDirection: 'row', paddingHorizontal: Spacing.sm, marginBottom: Spacing.xs },
  namaHari: {
    width: `${100 / 7}%`,
    textAlign: 'center',
    fontFamily: fonts.regular,
    fontSize: 12,
    color: Colors.textTertiary,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: Spacing.sm, paddingBottom: Spacing.md },
  sel: { width: `${100 / 7}%`, height: 50, alignItems: 'center', justifyContent: 'center' },
  bulat: { width: 34, height: 34, borderRadius: 17, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  bulatDipilih: { backgroundColor: Colors.ink },
  angka: { fontFamily: fonts.medium, fontSize: 12, color: Colors.textPrimary },
  angkaHariIni: { fontFamily: fonts.bold, color: brand[600] },
  angkaDipilih: { fontFamily: fonts.bold, color: Colors.white },
  titikBaris: { height: 6, flexDirection: 'row', gap: 2, marginTop: 1 },
  titik: { width: 4, height: 4, borderRadius: 2 },
});
