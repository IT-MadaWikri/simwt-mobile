/**
 * Foto sebelum/sesudah pada detail tiket: dua ubin berdampingan (Sebelum kiri, Sesudah kanan);
 * ketuk untuk memperbesar (layar penuh). Sisi yang belum punya foto diisi penanda kosong. Presentasional — satu-satunya
 * state-nya adalah foto yang sedang diperbesar.
 */
import React, { useState } from 'react';
import { Image, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '../common/Icon';
import Colors, { slate } from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { fonts } from '../../../constants/Typography';

interface FotoTiketProps {
  fotoSebelum: string | null;
  fotoSesudah: string | null;
}

export default function FotoTiket({ fotoSebelum, fotoSesudah }: FotoTiketProps) {
  const insets = useSafeAreaInsets();
  const [besar, setBesar] = useState<string | null>(null);
  const foto = [
    { label: 'Sebelum', uri: fotoSebelum },
    { label: 'Sesudah', uri: fotoSesudah },
  ];

  if (!fotoSebelum && !fotoSesudah) return null;

  return (
    <>
      <View style={styles.baris}>
        {foto.map((f) =>
          f.uri ? (
            <TouchableOpacity key={f.label} style={styles.ubin} activeOpacity={0.85} onPress={() => setBesar(f.uri)}>
              <Image source={{ uri: f.uri }} style={styles.gambar} resizeMode="cover" />
              <View style={[styles.tag, f.label === 'Sesudah' && { backgroundColor: Colors.primary }]}>
                <Text style={styles.teksTag}>{f.label}</Text>
              </View>
            </TouchableOpacity>
          ) : (
            <View key={f.label} style={[styles.ubin, styles.kosong]}>
              <Icon name="image" size={22} color={Colors.textTertiary} />
              <Text style={styles.teksKosong}>{f.label}: belum ada foto</Text>
            </View>
          )
        )}
      </View>

      <Modal visible={!!besar} transparent animationType="fade" onRequestClose={() => setBesar(null)} statusBarTranslucent>
        <View style={styles.latar}>
          {besar ? <Image source={{ uri: besar }} style={StyleSheet.absoluteFill} resizeMode="contain" /> : null}
          <TouchableOpacity
            style={[styles.tutup, { top: insets.top + Spacing.md }]}
            onPress={() => setBesar(null)}
            accessibilityLabel="Tutup foto"
          >
            <Icon name="close" size={20} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  baris: { flexDirection: 'row', gap: Spacing.sm },
  ubin: {
    flex: 1,
    aspectRatio: 1,
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
  latar: { flex: 1, backgroundColor: 'rgba(0,0,0,0.92)' },
  tutup: {
    position: 'absolute',
    right: Spacing.lg,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
