/**
 * SkeletonDetailKaizen — kerangka yang meniru urutan seksi Detail Kaizen
 * (ringkasan, jejak keputusan, foto, kondisi, manfaat), supaya saat data tiba
 * tiap balok digantikan isinya di tempat yang sama, bukan seluruh layar berganti.
 * Ukuran seksi mengikuti `styles.kartu` di `app/(tabs)/kaizen/[id].tsx`.
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Colors from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { Skeleton } from '../common/Skeleton';

function Seksi({ children }: { children: React.ReactNode }) {
  return <View style={styles.seksi}>{children}</View>;
}

export default function SkeletonDetailKaizen() {
  return (
    <View style={styles.layar}>
      <Seksi>
        <View style={styles.barisAntar}>
          <Skeleton w={72} h={20} />
          <Skeleton w={96} h={12} />
        </View>
        <Skeleton w="45%" h={14} style={styles.jarakAtas} />
        <Skeleton w="65%" h={12} style={styles.jarakAtas} />
        <View style={styles.garis} />
        <View style={styles.baris}>
          <Skeleton w={34} h={34} r={17} />
          <View style={styles.isi}>
            <Skeleton w="50%" h={12} />
            <Skeleton w="70%" h={10} />
          </View>
        </View>
        <Skeleton w="55%" h={10} style={styles.jarakAtas} />
      </Seksi>

      <Seksi>
        {[0, 1, 2].map((i) => (
          <View key={i} style={[styles.baris, i > 0 && styles.jarakAtasBesar]}>
            <Skeleton w={16} h={16} r={8} />
            <View style={styles.isi}>
              <Skeleton w="55%" h={12} />
              {i < 2 ? <Skeleton w="30%" h={10} /> : null}
            </View>
          </View>
        ))}
      </Seksi>

      <Seksi>
        <Skeleton w={44} h={10} style={styles.judulSeksi} />
        <View style={styles.baris}>
          <Skeleton h={0} r={Spacing.radius.lg} style={styles.foto} />
          <Skeleton h={0} r={Spacing.radius.lg} style={styles.foto} />
        </View>
      </Seksi>

      <Seksi>
        <Skeleton w={64} h={10} style={styles.judulSeksi} />
        {[0, 1].map((i) => (
          <View key={i} style={i > 0 && styles.jarakAtasBesar}>
            <Skeleton w="35%" h={12} />
            <Skeleton w="95%" h={10} style={styles.jarakAtas} />
            <Skeleton w="70%" h={10} style={styles.jarakAtas} />
          </View>
        ))}
      </Seksi>

      <Seksi>
        <Skeleton w={80} h={10} style={styles.judulSeksi} />
        {[0, 1].map((i) => (
          <View key={i} style={[styles.baris, i > 0 && styles.jarakAtasBesar]}>
            <Skeleton w={24} h={24} r={12} />
            <Skeleton w="50%" h={12} />
          </View>
        ))}
      </Seksi>
    </View>
  );
}

const styles = StyleSheet.create({
  layar: { flex: 1, backgroundColor: Colors.white },
  seksi: {
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.sm,
  },
  baris: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  barisAntar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  isi: { flex: 1, gap: 6 },
  garis: { height: StyleSheet.hairlineWidth, backgroundColor: Colors.border, marginVertical: Spacing.md },
  jarakAtas: { marginTop: Spacing.sm },
  jarakAtasBesar: { marginTop: Spacing.md },
  judulSeksi: { marginBottom: Spacing.md },
  // aspectRatio 1 seperti `ubinFoto`; tinggi diturunkan dari lebar.
  foto: { flex: 1, width: undefined, height: undefined, aspectRatio: 1 },
});
