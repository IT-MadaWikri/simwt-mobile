/**
 * Linimasa progres tiket (gaya "jejak keputusan" Kaizen): ikon kecil + garis tipis
 * penghubung, judul semibold, keterangan dan waktu di bawahnya. Langkah yang belum
 * terjadi digambar abu-abu. Presentasional.
 */
import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from '../common/Icon';
import ZoomFoto from './ZoomFoto';
import Colors, { brand, slate } from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { fonts, ukuranIsi } from '../../../constants/Typography';
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
  const [besar, setBesar] = useState<string | null>(null);
  return (
    <View>
      {langkah.map((l, i) => {
        const terakhir = i === langkah.length - 1;
        return (
          <View key={l.id} style={styles.baris}>
            <View style={styles.kolom}>
              <Icon
                name={l.selesai ? 'check-circle' : 'clock-outline'}
                size={16}
                color={l.selesai ? brand[600] : slate[400]}
              />
              {terakhir ? null : <View style={styles.tiang} />}
            </View>
            <View style={[styles.isi, { paddingBottom: terakhir ? 0 : Spacing.md }]}>
              <Text style={[styles.judul, !l.selesai && { color: Colors.textTertiary }]}>{l.judul}</Text>
              {l.isi.map((baris, n) => (
                <Text key={n} style={styles.teks}>{baris}</Text>
              ))}
              {l.sparepart ? (
                <View style={styles.part}>
                  <Icon name="cog-outline" size={14} color={brand[600]} />
                  <Text style={[styles.teks, { flex: 1 }]}>
                    Ganti part: <Text style={styles.namaPart}>{l.sparepart}</Text>
                  </Text>
                </View>
              ) : null}
              {l.foto ? (
                <View style={styles.foto}>
                  {l.keteranganFoto ? <Text style={styles.teks}>{l.keteranganFoto}</Text> : null}
                  <TouchableOpacity activeOpacity={0.85} onPress={() => setBesar(l.foto ?? null)}>
                    <Image source={{ uri: l.foto }} style={styles.gambar} resizeMode="cover" />
                  </TouchableOpacity>
                </View>
              ) : null}
              {l.waktu ? <Text style={styles.waktu}>{waktu(l.waktu)}</Text> : null}
            </View>
          </View>
        );
      })}
      <ZoomFoto uri={besar} onTutup={() => setBesar(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  baris: { flexDirection: 'row', gap: Spacing.sm },
  kolom: { alignItems: 'center', width: 18 },
  tiang: { flex: 1, width: 1.5, marginVertical: 3, backgroundColor: slate[200] },
  isi: { flex: 1, gap: 2 },
  judul: { fontSize: ukuranIsi, fontFamily: fonts.semibold, color: Colors.textPrimary },
  teks: { fontSize: 12, fontFamily: fonts.regular, color: Colors.textSecondary },
  waktu: { fontSize: 12, fontFamily: fonts.regular, color: Colors.textTertiary },
  foto: { gap: 4, marginTop: 2 },
  part: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: 2,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: brand[200],
    borderRadius: Spacing.radius.md,
    ...Spacing.curve,
    backgroundColor: brand[50],
  },
  namaPart: { fontFamily: fonts.bold, color: Colors.textPrimary },
  gambar: { width: 96, height: 96, borderRadius: Spacing.radius.sm, ...Spacing.curve, backgroundColor: slate[100] },
});
