/**
 * BarisBerita — satu baris daftar berita: thumbnail di kiri; waktu/kategori, judul, dan
 * penulis + suka + bagikan di kanan. Dipakai beranda dan daftar berita.
 */
import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import Colors, { slate } from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { fonts } from '../../../constants/Typography';
import { labelKategori } from '../../adapters/berita';
import { relatif } from '../../utils/kaizen';
import { Berita } from '../../types/berita';
import Icon from '../common/Icon';

interface BarisBeritaProps {
  berita: Berita;
  onPress: () => void;
  onSuka: () => void;
  onBagikan: () => void;
}

export default function BarisBerita({ berita, onPress, onSuka, onBagikan }: BarisBeritaProps) {
  const { judul, kategori, terbitPada, penulis, sampulUrl, disukai, jumlahSuka, dilihat } = berita;

  return (
    <TouchableOpacity style={styles.baris} activeOpacity={0.8} onPress={onPress}>
      <View style={styles.thumb}>
        {sampulUrl ? (
          <Image source={{ uri: sampulUrl }} style={StyleSheet.absoluteFill} resizeMode="cover" />
        ) : (
          <Icon name="image" size={22} color={Colors.textTertiary} />
        )}
      </View>
      <View style={styles.teks}>
        <Text style={styles.meta} numberOfLines={1}>
          {terbitPada ? `${relatif(terbitPada)} · ` : ''}
          {labelKategori(kategori)}
        </Text>
        <Text style={styles.judul} numberOfLines={2}>
          {judul}
        </Text>
        <View style={styles.baraBawah}>
          <Text style={[styles.meta, styles.penulis]} numberOfLines={1}>
            {penulis ?? 'Redaksi'}
          </Text>
          <View style={styles.tombolSuka}>
            <Icon name="eye-outline" size={16} color={Colors.textSecondary} />
            <Text style={styles.meta}>{dilihat}</Text>
          </View>
          <TouchableOpacity style={styles.tombolSuka} hitSlop={10} onPress={onSuka}>
            <Icon
              name="heart"
              size={16}
              color={disukai ? Colors.danger : Colors.textSecondary}
              fill={disukai ? Colors.danger : 'none'}
            />
            <Text style={styles.meta}>{jumlahSuka}</Text>
          </TouchableOpacity>
          <TouchableOpacity hitSlop={10} onPress={onBagikan}>
            <Icon name="share-variant" size={16} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  baris: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderSubtle,
  },
  // Rasio 16:10 — sama dengan sampul di detail dan potongan di CMS web (sim-mwt).
  thumb: {
    width: 112,
    aspectRatio: 16 / 10,
    borderRadius: Spacing.radius.sm,
    ...Spacing.curve,
    backgroundColor: slate[100],
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  teks: {
    flex: 1,
    justifyContent: 'space-between',
  },
  baraBawah: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  penulis: {
    flex: 1,
  },
  tombolSuka: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  meta: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  judul: {
    fontFamily: fonts.bold,
    fontSize: 12,
    lineHeight: 18,
    color: Colors.textPrimary,
  },
});
