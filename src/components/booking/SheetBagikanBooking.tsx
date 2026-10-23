/**
 * Menu Bagikan booking (pesan teks / surat undangan PDF), sama dengan menu Bagikan di detail tiket dan
 * Kaizen. Presentasional.
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

interface SheetBagikanBookingProps {
  visible: boolean;
  membuatPdf: boolean;
  onBagikanPesan: () => void;
  onBagikanPdf: () => void;
  onClose: () => void;
}

export default function SheetBagikanBooking({ visible, membuatPdf, onBagikanPesan, onBagikanPdf, onClose }: SheetBagikanBookingProps) {
  return (
    <BottomSheet visible={visible} onClose={() => (membuatPdf ? null : onClose())} title="Bagikan Undangan">
      <TouchableOpacity style={styles.opsi} onPress={onBagikanPesan} disabled={membuatPdf} activeOpacity={0.7}>
        <View style={styles.ikon}>
          <Icon name="chat-outline" size={18} color={brand[700]} />
        </View>
        <View style={gs.flex1}>
          <Text style={styles.judul}>Bagikan sebagai pesan</Text>
          <Text style={styles.ket}>Teks ringkas ke WhatsApp, Telegram, dan lainnya</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity style={styles.opsi} onPress={onBagikanPdf} disabled={membuatPdf} activeOpacity={0.7}>
        <View style={styles.ikon}>
          {membuatPdf ? <BrandSpinner size={18} color={brand[700]} /> : <Icon name="file-document" size={18} color={brand[700]} />}
        </View>
        <View style={gs.flex1}>
          <Text style={styles.judul}>{membuatPdf ? 'Membuat PDF…' : 'Bagikan surat undangan (PDF)'}</Text>
          <Text style={styles.ket}>Surat resmi Form-HRD&GA-09 berisi daftar peserta dan agenda</Text>
        </View>
      </TouchableOpacity>
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
