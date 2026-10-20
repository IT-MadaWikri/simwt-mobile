/**
 * JalurMinggu — kepala tanggal + satu baris pekan (Min–Sab) untuk mode hari.
 * Tanggal terpilih berupa lingkaran gelap; `penanda` memberi titik berwarna.
 * Presentasional: tanggal terpilih dipegang pemanggil.
 */
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from '../common/Icon';
import Colors, { brand } from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { fonts } from '../../../constants/Typography';
import { NAMA_BULAN, NAMA_HARI, SINGKATAN_HARI, harianPekan, kunciTanggal, sama } from '../../utils/kalender';

interface JalurMingguProps {
  terpilih: Date;
  /** Warna titik per tanggal, kuncinya `YYYY-MM-DD`. */
  penanda?: Record<string, string[]>;
  onPilih: (tanggal: Date) => void;
  /** -1 = pekan lalu, +1 = pekan depan. */
  onGeser: (delta: number) => void;
}

export default function JalurMinggu({ terpilih, penanda = {}, onPilih, onGeser }: JalurMingguProps) {
  const hariIni = new Date();
  const pekan = harianPekan(terpilih);
  const pekanIni = pekan.some((d) => sama(d, hariIni));

  return (
    <View>
      <View style={styles.kepala}>
        <View style={styles.flex1}>
          <Text style={styles.sub}>{pekanIni ? 'Minggu ini' : `${pekan[0].getDate()} ${NAMA_BULAN[pekan[0].getMonth()].slice(0, 3)} – ${pekan[6].getDate()} ${NAMA_BULAN[pekan[6].getMonth()].slice(0, 3)}`}</Text>
          {/* Judul besar: pengecualian dari aturan 12px, seperti sapaan di beranda. */}
          <Text style={styles.judul}>
            {terpilih.getDate()} {NAMA_BULAN[terpilih.getMonth()].slice(0, 3)}, {String(terpilih.getFullYear()).slice(2)}{' '}
            <Text style={styles.hari}>{NAMA_HARI[terpilih.getDay()]}</Text>
          </Text>
        </View>
        <TouchableOpacity style={styles.panah} hitSlop={8} onPress={() => onGeser(-1)} accessibilityLabel="Pekan sebelumnya">
          <Icon name="chevron-left" size={20} color={Colors.ink} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.panah} hitSlop={8} onPress={() => onGeser(1)} accessibilityLabel="Pekan berikutnya">
          <Icon name="chevron-right" size={20} color={Colors.ink} />
        </TouchableOpacity>
      </View>

      <View style={styles.baris}>
        {pekan.map((tgl, i) => {
          const dipilih = sama(tgl, terpilih);
          const titik = penanda[kunciTanggal(tgl)] ?? [];
          return (
            <TouchableOpacity key={i} style={styles.sel} activeOpacity={0.7} onPress={() => onPilih(tgl)}>
              <Text style={[styles.namaHari, dipilih && styles.namaHariDipilih]}>{SINGKATAN_HARI[i]}</Text>
              <View style={[styles.bulat, dipilih && styles.bulatDipilih]}>
                <Text style={[styles.angka, sama(tgl, hariIni) && !dipilih && styles.angkaHariIni, dipilih && styles.angkaDipilih]}>
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
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  sub: { fontFamily: fonts.regular, fontSize: 12, color: Colors.textTertiary },
  judul: { fontFamily: fonts.bold, fontSize: 18, color: Colors.textPrimary },
  hari: { fontFamily: fonts.regular, color: Colors.textSecondary },
  panah: { width: 32, height: 32, borderRadius: Spacing.radius.full, alignItems: 'center', justifyContent: 'center' },
  baris: { flexDirection: 'row', paddingHorizontal: Spacing.sm, paddingBottom: Spacing.sm },
  sel: { width: `${100 / 7}%`, alignItems: 'center' },
  namaHari: { fontFamily: fonts.regular, fontSize: 12, color: Colors.textTertiary, marginBottom: Spacing.xs },
  namaHariDipilih: { fontFamily: fonts.bold, color: Colors.textPrimary },
  bulat: { width: 34, height: 34, borderRadius: 17, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  bulatDipilih: { backgroundColor: Colors.ink },
  angka: { fontFamily: fonts.medium, fontSize: 12, color: Colors.textPrimary },
  angkaHariIni: { fontFamily: fonts.bold, color: brand[600] },
  angkaDipilih: { fontFamily: fonts.bold, color: Colors.white },
  titikBaris: { height: 6, flexDirection: 'row', gap: 2, marginTop: 1 },
  titik: { width: 4, height: 4, borderRadius: 2 },
});
