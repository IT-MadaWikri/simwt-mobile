/**
 * BarisBooking — satu booking pada daftar harian, gaya garis waktu: label
 * kecil jenis rapat & tempat dengan lencana status, lalu lingkaran ikon
 * berwarna ruangannya (sama dengan titik di kalender), judul kegiatan tebal,
 * jam, dan tombol bagikan. Presentasional.
 */
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from '../common/Icon';
import Colors, { brand, slate } from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { fonts } from '../../../constants/Typography';

export const IKON = { offline: 'door-open', online: 'video-outline', luar: 'map-marker-outline' } as const;

/** Warna lencana per status (0–6); latar = tint, teks = warna tegas. */
export const WARNA_STATUS: Record<number, { bg: string; fg: string }> = {
  0: { bg: slate[100], fg: slate[600] },
  1: { bg: '#eff6ff', fg: '#1d4ed8' },
  2: { bg: '#fffbeb', fg: '#b45309' },
  3: { bg: brand[50], fg: brand[700] },
  4: { bg: '#fff7ed', fg: '#c2410c' },
  5: { bg: slate[100], fg: slate[500] },
  6: { bg: '#fef2f2', fg: Colors.dangerDark },
};

interface BarisBookingProps {
  jenis: keyof typeof IKON;
  /** Mis. "Di Ruangan · Sarbini". */
  kategori: string;
  judul: string;
  /** Mis. "09:00 - 10:00". */
  jam: string;
  status: number;
  statusLabel: string;
  warna: string;
  onPress: () => void;
  onBagikan: () => void;
}

export default function BarisBooking({ jenis, kategori, judul, jam, status, statusLabel, warna, onPress, onBagikan }: BarisBookingProps) {
  const lencana = WARNA_STATUS[status] ?? WARNA_STATUS[0];
  return (
    <TouchableOpacity style={styles.baris} activeOpacity={0.7} onPress={onPress}>
      <View style={styles.atas}>
        <Text style={styles.kategori} numberOfLines={1}>{kategori}</Text>
        <View style={[styles.lencana, { backgroundColor: lencana.bg }]}>
          <Text style={[styles.teksLencana, { color: lencana.fg }]} numberOfLines={1}>{statusLabel}</Text>
        </View>
      </View>
      <View style={styles.isi}>
        <View style={[styles.ikon, { backgroundColor: `${warna}26` }]}>
          <Icon name={IKON[jenis]} size={18} color={warna} />
        </View>
        <View style={styles.teks}>
          <Text style={styles.judul} numberOfLines={2}>{judul}</Text>
          <Text style={styles.jam}>{jam}</Text>
        </View>
        <TouchableOpacity style={styles.bagikan} activeOpacity={0.7} hitSlop={8} onPress={onBagikan} accessibilityLabel={`Bagikan ${judul}`}>
          <Icon name="share-variant" size={16} color={Colors.ink} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  baris: {
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  atas: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.xs },
  kategori: { flex: 1, fontFamily: fonts.regular, fontSize: 12, color: Colors.textTertiary },
  isi: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  ikon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  teks: { flex: 1 },
  judul: { fontFamily: fonts.bold, fontSize: 12, color: Colors.textPrimary },
  jam: { fontFamily: fonts.regular, fontSize: 12, color: Colors.textTertiary, marginTop: 2 },
  lencana: { paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: Spacing.radius.full },
  teksLencana: { fontFamily: fonts.semibold, fontSize: 11 },
  bagikan: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
