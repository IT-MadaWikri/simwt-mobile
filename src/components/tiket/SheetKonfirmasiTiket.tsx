/**
 * Sheet konfirmasi pelapor untuk tiket RESOLVED (sama dengan tombol "Ya, Konfirmasi Selesai" dan
 * "Reopen / Belum Selesai" di web). Reopen meminta alasan minimal 5 karakter. Presentasional —
 * state-nya hanya mode tampilan dan isian alasan.
 */
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import BottomSheet from '../common/BottomSheet';
import Button from '../common/Button';
import Colors from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { fonts } from '../../../constants/Typography';
import { gs } from '../../../constants/GlobalStyles';

const MIN_ALASAN = 5;
const MAKS_ALASAN = 2000;

const waktu = (iso: string) =>
  new Date(iso).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

interface SheetKonfirmasiTiketProps {
  visible: boolean;
  noTiket: string;
  tanggalSelesai: string | null;
  batasKonfirmasi: string | null;
  mengirim: boolean;
  galat: string | null;
  onKonfirmasi: () => void;
  onReopen: (alasan: string) => void;
  onClose: () => void;
}

export default function SheetKonfirmasiTiket({
  visible,
  noTiket,
  tanggalSelesai,
  batasKonfirmasi,
  mengirim,
  galat,
  onKonfirmasi,
  onReopen,
  onClose,
}: SheetKonfirmasiTiketProps) {
  const [reopen, setReopen] = useState(false);
  const [alasan, setAlasan] = useState('');

  // Selalu mulai dari pilihan awal dengan isian kosong.
  useEffect(() => {
    if (visible) {
      setReopen(false);
      setAlasan('');
    }
  }, [visible]);

  const panjang = alasan.trim().length;

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      penuh={reopen}
      title={reopen ? `Reopen tiket #${noTiket}` : `Konfirmasi tiket #${noTiket}`}
      subtitle={
        reopen
          ? 'Jelaskan mengapa perbaikan ini dianggap belum selesai atau masalah masih terjadi.'
          : 'Dengan mengonfirmasi, Anda menyatakan masalah sudah teratasi dan tiket akan ditutup.'
      }
    >
      <View style={styles.isi}>
        {reopen ? (
          <View>
            <TextInput
              style={[gs.field, styles.textArea]}
              placeholder="Jelaskan secara detail kendala yang masih terjadi…"
              placeholderTextColor={Colors.placeholder}
              value={alasan}
              onChangeText={setAlasan}
              multiline
              maxLength={MAKS_ALASAN}
              editable={!mengirim}
            />
            <Text style={styles.hitung}>{panjang < MIN_ALASAN ? `Minimal ${MIN_ALASAN} karakter` : `${alasan.length}/${MAKS_ALASAN}`}</Text>
          </View>
        ) : (
          <View style={styles.info}>
            {tanggalSelesai ? <Text style={styles.teks}>Diselesaikan teknisi pada {waktu(tanggalSelesai)}.</Text> : null}
            {batasKonfirmasi ? (
              <Text style={styles.teks}>Tanpa konfirmasi, tiket otomatis selesai pada {waktu(batasKonfirmasi)}.</Text>
            ) : null}
          </View>
        )}

        {galat ? <Text style={gs.errorText}>{galat}</Text> : null}

        {reopen ? (
          <View style={styles.baris}>
            <Button label="Kembali" variant="muted" style={gs.flex1} disabled={mengirim} onPress={() => setReopen(false)} />
            <Button
              label="Kirim Reopen"
              variant="danger"
              style={gs.flex1}
              loading={mengirim}
              disabled={panjang < MIN_ALASAN}
              onPress={() => onReopen(alasan)}
            />
          </View>
        ) : (
          <View style={styles.baris}>
            <Button label="Reopen" variant="dangerOutline" style={gs.flex1} disabled={mengirim} onPress={() => setReopen(true)} />
            <Button label="Ya, Konfirmasi Selesai" variant="primary" style={gs.flex1} loading={mengirim} onPress={onKonfirmasi} />
          </View>
        )}
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  isi: { paddingHorizontal: Spacing.screenPadding, gap: Spacing.md },
  info: { gap: 4 },
  teks: { fontSize: 12, fontFamily: fonts.regular, color: Colors.textSecondary },
  textArea: { minHeight: 110, textAlignVertical: 'top' },
  hitung: { marginTop: 4, fontSize: 12, fontFamily: fonts.regular, color: Colors.textTertiary, textAlign: 'right' },
  baris: { flexDirection: 'row', gap: Spacing.sm },
});
