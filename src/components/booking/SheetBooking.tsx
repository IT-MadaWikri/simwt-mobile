/**
 * SheetBooking — rincian satu booking: kegiatan, waktu, tempat, peminjam,
 * departemen, link meeting (bisa dibuka), dan daftar peserta. Presentasional.
 */
import { StyleSheet, Text, View } from 'react-native';
import BottomSheet from '../common/BottomSheet';
import Button from '../common/Button';
import Colors from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { fonts } from '../../../constants/Typography';

interface SheetBookingProps {
  visible: boolean;
  onClose: () => void;
  judul: string;
  /** Pasangan label–isi yang sudah diformat (tanggal, jam, tempat, …); isi kosong dilewati. */
  rincian: { label: string; isi: string | null }[];
  peserta: string[];
  /** Ada = tampilkan tombol "Buka Link Meeting". */
  onBukaLink?: () => void;
  onBagikan: () => void;
}

export default function SheetBooking({ visible, onClose, judul, rincian, peserta, onBukaLink, onBagikan }: SheetBookingProps) {
  return (
    <BottomSheet visible={visible} onClose={onClose} title={judul}>
      <View style={styles.isi}>
        {rincian
          .filter((r) => r.isi)
          .map((r) => (
            <View key={r.label} style={styles.baris}>
              <Text style={styles.label}>{r.label}</Text>
              <Text style={styles.nilai}>{r.isi}</Text>
            </View>
          ))}

        {peserta.length > 0 ? (
          <View style={styles.baris}>
            <Text style={styles.label}>Peserta ({peserta.length})</Text>
            <Text style={styles.nilai}>{peserta.join(', ')}</Text>
          </View>
        ) : null}

        {onBukaLink ? <Button variant="outline" icon="open-in-new" label="Buka Link Meeting" onPress={onBukaLink} block /> : null}
        <Button icon="share-variant" label="Bagikan Undangan" onPress={onBagikan} block />
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  isi: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.lg, gap: Spacing.md },
  baris: { gap: 2 },
  label: { fontFamily: fonts.regular, fontSize: 12, color: Colors.textTertiary },
  nilai: { fontFamily: fonts.semibold, fontSize: 12, color: Colors.textPrimary },
});
