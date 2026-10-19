/**
 * Foto sebelum/sesudah pada detail tiket: dua ubin berdampingan (Sebelum kiri, Sesudah kanan);
 * ketuk untuk memperbesar (layar penuh). Sisi yang belum punya foto diisi penanda kosong. Presentasional — satu-satunya
 * state-nya adalah foto yang sedang diperbesar.
 */
import React, { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from '../common/Icon';
import ZoomFoto from './ZoomFoto';
import Colors, { slate } from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { fonts } from '../../../constants/Typography';

interface FotoTiketProps {
  fotoSebelum: string | null;
  fotoSesudah: string | null;
}

export default function FotoTiket({ fotoSebelum, fotoSesudah }: FotoTiketProps) {
  const [besar, setBesar] = useState<string | null>(null);
  const [gagal, setGagal] = useState<string[]>([]);
  // Sisi ubin dihitung dari lebar baris: flex + aspectRatio membuat ubin kosong & berfoto beda ukuran.
  const [lebar, setLebar] = useState(0);
  const sisi = lebar > 0 ? (lebar - Spacing.sm) / 2 : undefined;
  const foto = [
    { label: 'Sebelum', uri: fotoSebelum },
    { label: 'Sesudah', uri: fotoSesudah },
  ];

  if (!fotoSebelum && !fotoSesudah) return null;

  return (
    <>
      <View style={styles.baris} onLayout={(e) => setLebar(e.nativeEvent.layout.width)}>
        {foto.map((f) =>
          f.uri && !gagal.includes(f.uri) ? (
            <TouchableOpacity key={f.label} style={[styles.ubin, { width: sisi, height: sisi }]} activeOpacity={0.85} onPress={() => setBesar(f.uri)}>
              <Image
                source={{ uri: f.uri }}
                style={styles.gambar}
                resizeMode="cover"
                onError={() => setGagal((g) => [...g, f.uri as string])}
              />
              <View style={[styles.tag, f.label === 'Sesudah' && { backgroundColor: Colors.primary }]}>
                <Text style={styles.teksTag}>{f.label}</Text>
              </View>
            </TouchableOpacity>
          ) : (
            <View key={f.label} style={[styles.ubin, styles.kosong, { width: sisi, height: sisi }]}>
              <Icon name="image" size={22} color={Colors.textTertiary} />
              <Text style={styles.teksKosong}>{f.label}: {f.uri ? 'foto gagal dimuat' : 'belum ada foto'}</Text>
            </View>
          )
        )}
      </View>

      <ZoomFoto uri={besar} onTutup={() => setBesar(null)} />
    </>
  );
}

const styles = StyleSheet.create({
  baris: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
  ubin: {
    borderRadius: Spacing.radius.lg,
    ...Spacing.curve,
    overflow: 'hidden',
    backgroundColor: slate[100],
  },
  gambar: { width: '100%', height: '100%' },
  kosong: { alignItems: 'center', justifyContent: 'center', gap: 4, padding: Spacing.sm },
  teksKosong: { fontSize: 12, fontFamily: fonts.regular, color: Colors.textTertiary, textAlign: 'center' },
  tag: {
    position: 'absolute',
    left: 8,
    bottom: 8,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Spacing.radius.full,
    ...Spacing.curve,
    backgroundColor: 'rgba(15,23,42,0.75)',
  },
  teksTag: { fontSize: 12, fontFamily: fonts.semibold, color: Colors.white },
});
