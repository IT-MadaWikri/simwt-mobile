/**
 * KeadaanKosong — maskot + judul + keterangan untuk daftar kosong, hasil cari
 * nihil, atau gagal memuat. Satu komponen untuk semua layar, supaya tidak ada
 * lagi blok ikon-dalam-lingkaran yang disalin ke tiap file.
 */
import { ReactNode } from 'react';
import { Image, ImageSourcePropType, StyleSheet, Text, View, ViewStyle } from 'react-native';
import Colors from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { fonts } from '../../../constants/Typography';

export const MASKOT = {
  salam: require('../../../assets/images/maskot/putri-salam.png'),
  jempol: require('../../../assets/images/maskot/putri-jempol.png'),
  ide: require('../../../assets/images/maskot/putri-ide.png'),
  semangat: require('../../../assets/images/maskot/putri-semangat.png'),
  mikir: require('../../../assets/images/maskot/putra-mikir.png'),
  sapa: require('../../../assets/images/maskot/putra-sapa.png'),
  persilakan: require('../../../assets/images/maskot/putra-persilakan.png'),
} satisfies Record<string, ImageSourcePropType>;

export type PoseMaskot = keyof typeof MASKOT;

// Rasio lebar/tinggi tiap berkas (tinggi aslinya sama, 420px).
export const RASIO_MASKOT: Record<PoseMaskot, number> = {
  salam: 175 / 420,
  jempol: 179 / 420,
  ide: 204 / 420,
  semangat: 231 / 420,
  mikir: 174 / 420,
  sapa: 195 / 420,
  persilakan: 229 / 420,
};

interface KeadaanKosongProps {
  pose?: PoseMaskot;
  judul: string;
  teks?: string | null;
  tinggi?: number;
  /** Tombol/aksi di bawah teks (mis. "Coba lagi"). */
  children?: ReactNode;
  style?: ViewStyle;
}

export default function KeadaanKosong({
  pose = 'salam',
  judul,
  teks,
  tinggi = 150,
  children,
  style,
}: KeadaanKosongProps) {
  return (
    <View style={[styles.wadah, style]}>
      <Image
        source={MASKOT[pose]}
        style={{ width: tinggi * RASIO_MASKOT[pose], height: tinggi }}
        resizeMode="contain"
        accessibilityIgnoresInvertColors
      />
      <Text style={styles.judul}>{judul}</Text>
      {teks ? <Text style={styles.teks}>{teks}</Text> : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wadah: {
    alignItems: 'center',
    paddingTop: Spacing.xxl,
    paddingHorizontal: Spacing.xl,
  },
  judul: {
    marginTop: Spacing.md,
    fontFamily: fonts.bold,
    fontSize: 14,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  teks: {
    marginTop: Spacing.xs,
    fontFamily: fonts.regular,
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
