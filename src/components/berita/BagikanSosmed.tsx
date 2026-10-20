/**
 * BagikanSosmed — baris tombol bulat berwarna merek WhatsApp, Telegram, dan X,
 * plus "Lainnya" (lembar bagikan bawaan HP). Artikel belum punya tautan
 * publik, jadi yang dikirim adalah teksnya; Facebook dan LinkedIn butuh tautan
 * sehingga belum disertakan.
 */
import { Linking, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import Colors, { slate } from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { fonts } from '../../../constants/Typography';

interface BagikanSosmedProps {
  teks: string;
  /** Dipanggil bila aplikasi tujuan tidak bisa dibuka. */
  onGagal: (nama: string) => void;
}

const TUJUAN = [
  { nama: 'WhatsApp', ikon: 'whatsapp', warna: '#25D366', url: (t: string) => `https://wa.me/?text=${t}` },
  { nama: 'Telegram', ikon: 'telegram', warna: '#26A5E4', url: (t: string) => `https://t.me/share/url?url=%20&text=${t}` },
  { nama: 'X', ikon: 'x-twitter', warna: '#000000', url: (t: string) => `https://twitter.com/intent/tweet?text=${t}` },
] as const;

export default function BagikanSosmed({ teks, onGagal }: BagikanSosmedProps) {
  const buka = (nama: string, url: string) => Linking.openURL(url).catch(() => onGagal(nama));

  return (
    <View style={styles.wadah}>
      <Text style={styles.judul}>Bagikan berita ini</Text>
      <View style={styles.baris}>
        {TUJUAN.map((t) => (
          <TouchableOpacity
            key={t.nama}
            style={[styles.bulat, { backgroundColor: t.warna }]}
            activeOpacity={0.8}
            onPress={() => buka(t.nama, t.url(encodeURIComponent(teks)))}
            accessibilityLabel={`Bagikan lewat ${t.nama}`}
          >
            <FontAwesome6 name={t.ikon} size={20} color={Colors.white} />
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={[styles.bulat, { backgroundColor: slate[600] }]}
          activeOpacity={0.8}
          onPress={() => Share.share({ message: teks }).catch(() => {})}
          accessibilityLabel="Bagikan lewat aplikasi lain"
        >
          <FontAwesome6 name="share-nodes" size={18} color={Colors.white} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wadah: { marginTop: Spacing.lg },
  judul: {
    fontFamily: fonts.bold,
    fontSize: 12,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  baris: { flexDirection: 'row', gap: Spacing.md },
  bulat: {
    width: 44,
    height: 44,
    borderRadius: Spacing.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
