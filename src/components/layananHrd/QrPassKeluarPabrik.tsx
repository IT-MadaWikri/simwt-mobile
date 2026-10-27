/**
 * QR Pass Digital Form Keluar Pabrik — ditunjukkan ke petugas satpam di gerbang. Isi QR adalah tautan halaman
 * gerbang yang langsung mencatat keluar/kembali, jadi sengaja hanya gambar: tidak ada tombol buka tautan.
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import Colors, { slate } from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { fonts } from '../../../constants/Typography';

interface QrPassKeluarPabrikProps {
  url: string;
  ukuran?: number;
}

export default function QrPassKeluarPabrik({ url, ukuran = 200 }: QrPassKeluarPabrikProps) {
  return (
    <View style={styles.kartu}>
      <Text style={styles.judul}>QR Pass Digital</Text>
      <View style={styles.wadahQr}>
        <QRCode value={url} size={ukuran} />
      </View>
      <Text style={styles.petunjuk}>Tunjukkan QR ini ke petugas satpam di gerbang saat keluar dan saat kembali.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  kartu: {
    alignItems: 'center',
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    borderRadius: Spacing.radius.xl,
    ...Spacing.curve,
  },
  judul: { fontFamily: fonts.bold, fontSize: 12, color: Colors.textPrimary, marginBottom: Spacing.md },
  // Latar putih + jarak tepi supaya mudah dipindai walau tema gelap.
  wadahQr: { padding: Spacing.md, backgroundColor: Colors.white, borderWidth: 1, borderColor: slate[200], borderRadius: Spacing.radius.md, ...Spacing.curve },
  petunjuk: { fontFamily: fonts.regular, fontSize: 12, color: Colors.textTertiary, textAlign: 'center', marginTop: Spacing.md },
});
