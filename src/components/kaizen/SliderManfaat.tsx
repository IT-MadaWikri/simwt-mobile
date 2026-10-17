/**
 * SliderManfaat — kartu-kartu manfaat Kaizen yang digeser mendatar, dengan titik indikator.
 *
 * Dipakai di sheet rincian manfaat pada Detail Kaizen dan Buat Kaizen, supaya rupanya sama.
 * Satu manfaat: kartu selebar layar. Lebih dari satu: kartu sedikit lebih sempit supaya yang
 * berikutnya mengintip (tanda bisa digeser). Presentasional murni — data dan aksi dari pemanggil.
 *
 * Pasang `key` di pemanggil (mis. per kategori) supaya slider mulai lagi dari kartu pertama.
 */
import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, useWindowDimensions } from 'react-native';
import Icon from '../common/Icon';
import Avatar from '../common/Avatar';
import Colors, { slate } from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { fonts, ukuranIsi } from '../../../constants/Typography';
import { gs } from '../../../constants/GlobalStyles';

export interface ItemManfaat {
  /** Ikon & warna kategori (lihat LENCANA). */
  ikon: string;
  warna: string;
  /** 'Eksternal' = luar perusahaan; selain itu dalam perusahaan. Kosong = chip disembunyikan. */
  tipe?: string | null;
  hemat?: string | null;
  sebelum?: string | null;
  sesudah?: string | null;
  area?: string | null;
  pic?: string | null;
  /** Elemen di bawah isi kartu (mis. tombol Ubah/Hapus). */
  aksi?: React.ReactNode;
}

const BARIS: { ikon: string; label: string; isi: keyof Pick<ItemManfaat, 'hemat' | 'sebelum' | 'sesudah'> }[] = [
  { ikon: 'piggy-bank', label: 'Penghematan', isi: 'hemat' },
  { ikon: 'history', label: 'Sebelum', isi: 'sebelum' },
  { ikon: 'creation', label: 'Sesudah', isi: 'sesudah' },
];

export default function SliderManfaat({ items }: { items: ItemManfaat[] }) {
  const { width } = useWindowDimensions();
  const [aktif, setAktif] = useState(0);
  const lebar = items.length > 1 ? Math.round(width * 0.86) : width - Spacing.lg * 2;
  const interval = lebar + Spacing.sm;

  return (
    <>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={(e) => setAktif(Math.round(e.nativeEvent.contentOffset.x / interval))}
        snapToInterval={interval}
        decelerationRate="fast"
        contentContainerStyle={styles.isi}
      >
        {items.map((m, urut) => (
          <View key={urut} style={[styles.kartu, { width: lebar }]}>
            <View style={gs.rowBetween}>
              <View style={[gs.row, { gap: 6 }]}>
                <Icon name={m.ikon} size={16} color={m.warna} />
                <Text style={styles.nomor}>Manfaat {urut + 1}</Text>
              </View>
              {m.tipe ? (
                <View style={styles.chip}>
                  <Text style={styles.teksChip}>{m.tipe === 'Eksternal' ? 'Luar perusahaan' : 'Dalam perusahaan'}</Text>
                </View>
              ) : null}
            </View>

            {/* Label & isi sejajar satu baris supaya kartu ringkas. */}
            {BARIS.map((b) => (
              <View key={b.isi} style={styles.baris}>
                <View style={styles.kolomLabel}>
                  <Icon name={b.ikon} size={14} color={Colors.textTertiary} />
                  <Text style={styles.label} numberOfLines={1}>{b.label}</Text>
                </View>
                <Text style={b.isi === 'hemat' ? [styles.hemat, { color: m.warna }] : styles.teks}>
                  {m[b.isi] || (b.isi === 'hemat' ? '—' : '-')}
                </Text>
              </View>
            ))}

            {m.area || m.pic ? (
              <View style={[gs.row, { gap: Spacing.md }]}>
                {m.area ? (
                  <View style={styles.meta}>
                    <Icon name="map-marker-outline" size={14} color={Colors.textTertiary} />
                    <Text style={styles.teksMeta} numberOfLines={1}>{m.area}</Text>
                  </View>
                ) : null}
                {m.pic ? (
                  <View style={styles.meta}>
                    <Avatar nama={m.pic} ukuran={18} />
                    <Text style={styles.teksMeta} numberOfLines={1}>{m.pic}</Text>
                  </View>
                ) : null}
              </View>
            ) : null}

            {m.aksi}
          </View>
        ))}
      </ScrollView>
      {items.length > 1 ? (
        <View style={styles.titikWadah}>
          {items.map((_, i) => (
            <View key={i} style={[styles.titik, i === aktif && styles.titikAktif]} />
          ))}
        </View>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  isi: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  kartu: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    gap: 4,
    borderRadius: Spacing.radius.md,
    ...Spacing.curve,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    backgroundColor: slate[50],
  },
  nomor: {
    fontSize: ukuranIsi,
    fontFamily: fonts.bold,
    color: Colors.textPrimary,
  },
  chip: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Spacing.radius.full,
    ...Spacing.curve,
    backgroundColor: slate[100],
  },
  teksChip: {
    fontSize: 10,
    fontFamily: fonts.semibold,
    color: Colors.textSecondary,
  },
  baris: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  // Lebar tetap + tanpa wrap supaya isi semua baris rata di kolom yang sama.
  kolomLabel: {
    width: 100,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  label: {
    flexShrink: 1,
    fontSize: 12,
    fontFamily: fonts.medium,
    color: Colors.textTertiary,
  },
  hemat: {
    flex: 1,
    fontSize: 12,
    fontFamily: fonts.bold,
  },
  teks: {
    flex: 1,
    fontSize: ukuranIsi,
    fontFamily: fonts.regular,
    color: Colors.textPrimary,
  },
  meta: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  teksMeta: {
    flex: 1,
    fontSize: ukuranIsi,
    fontFamily: fonts.regular,
    color: Colors.textSecondary,
  },
  titikWadah: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.sm,
  },
  titik: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: slate[300],
  },
  titikAktif: {
    width: 16,
    backgroundColor: Colors.primary,
  },
});
