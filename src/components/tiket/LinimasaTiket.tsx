/** Linimasa progres tiket: titik + garis penghubung + keterangan tiap langkah. */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from '../common/Icon';
import Colors, { brand } from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { fonts } from '../../../constants/Typography';
import { LangkahLinimasa } from '../../types/tiket';

const waktu = (iso: string) =>
  new Date(iso).toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

export default function LinimasaTiket({ langkah }: { langkah: LangkahLinimasa[] }) {
  return (
    <View>
      {langkah.map((l, i) => (
        <View key={l.id} style={styles.baris}>
          <View style={styles.penanda}>
            <View style={[styles.titik, { backgroundColor: l.selesai ? brand[500] : Colors.border }]}>
              {l.selesai ? <Icon name="check" size={10} color={Colors.white} /> : null}
            </View>
            {i < langkah.length - 1 ? <View style={styles.garis} /> : null}
          </View>

          <View style={styles.isi}>
            <Text style={styles.judul}>{l.judul}</Text>
            {l.isi.map((baris, n) => (
              <Text key={n} style={styles.teks}>{baris}</Text>
            ))}
            {l.waktu ? <Text style={styles.waktu}>{waktu(l.waktu)}</Text> : null}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  baris: { flexDirection: 'row', alignItems: 'flex-start' },
  penanda: { alignItems: 'center', width: 24 },
  titik: { width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  garis: { flex: 1, width: 2, minHeight: 22, backgroundColor: Colors.borderSubtle },
  isi: { flex: 1, marginLeft: Spacing.sm, paddingBottom: Spacing.lg, gap: 2 },
  judul: { fontFamily: fonts.semibold, fontSize: 12, color: Colors.textPrimary },
  teks: { fontFamily: fonts.regular, fontSize: 12, color: Colors.textSecondary },
  waktu: { fontFamily: fonts.regular, fontSize: 12, color: Colors.textTertiary },
});
