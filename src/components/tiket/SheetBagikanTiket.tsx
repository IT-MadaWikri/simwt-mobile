/**
 * Menu Bagikan tiket (pesan teks / bukti perbaikan PDF), sama dengan menu Bagikan di detail Kaizen.
 * Opsi PDF hanya muncul setelah pekerjaan selesai (`adaBukti`). Presentasional.
 */
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import BottomSheet from '../common/BottomSheet';
import BrandSpinner from '../common/BrandSpinner';
import Icon from '../common/Icon';
import Colors, { brand } from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { fonts, ukuranIsi } from '../../../constants/Typography';
import { gs } from '../../../constants/GlobalStyles';

interface SheetBagikanTiketProps {
  visible: boolean;
  /** Bukti perbaikan (PDF) tersedia: tiket sudah RESOLVED/OK. */
  adaBukti: boolean;
  membuatPdf: boolean;
  onBagikanPesan: () => void;
  onBagikanPdf: () => void;
  onClose: () => void;
}

export default function SheetBagikanTiket({
  visible,
  adaBukti,
  membuatPdf,
  onBagikanPesan,
  onBagikanPdf,
  onClose,
}: SheetBagikanTiketProps) {
  return (
    <BottomSheet visible={visible} onClose={() => (membuatPdf ? null : onClose())} title="Bagikan Tiket">
      <TouchableOpacity style={styles.opsi} onPress={onBagikanPesan} disabled={membuatPdf} activeOpacity={0.7}>
        <View style={styles.ikon}>
          <Icon name="chat-outline" size={18} color={brand[700]} />
        </View>
        <View style={gs.flex1}>
          <Text style={styles.judul}>Bagikan sebagai pesan</Text>
          <Text style={styles.ket}>Teks ringkas ke WhatsApp, Telegram, dan lainnya</Text>
        </View>
      </TouchableOpacity>
      {adaBukti ? (
        <TouchableOpacity style={styles.opsi} onPress={onBagikanPdf} disabled={membuatPdf} activeOpacity={0.7}>
          <View style={styles.ikon}>
            {membuatPdf ? <BrandSpinner size={18} color={brand[700]} /> : <Icon name="file-document" size={18} color={brand[700]} />}
          </View>
          <View style={gs.flex1}>
            <Text style={styles.judul}>{membuatPdf ? 'Membuat PDF…' : 'Bagikan bukti perbaikan (PDF)'}</Text>
            <Text style={styles.ket}>Formulir Trouble Ticket berisi progres dan foto sebelum/sesudah</Text>
          </View>
        </TouchableOpacity>
      ) : null}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  opsi: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  ikon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: brand[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  judul: { fontSize: ukuranIsi, fontFamily: fonts.semibold, color: Colors.textPrimary },
  ket: { marginTop: 2, fontSize: 12, fontFamily: fonts.regular, color: Colors.textTertiary },
});
