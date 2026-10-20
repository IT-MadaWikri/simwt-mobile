/**
 * Galeri foto aset: satu foto persegi 1:1 selebar layar yang bisa digeser, titik penanda di
 * bawahnya. Tanpa foto, tampil ubin kosong berikon. Presentasional.
 */
import React, { useState } from 'react';
import { FlatList, Image, StyleSheet, View, useWindowDimensions } from 'react-native';
import Icon from '../common/Icon';
import Colors, { brand, slate } from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';

interface GaleriAsetProps {
  /** URL foto yang sudah utuh. */
  foto: string[];
}

export default function GaleriAset({ foto }: GaleriAsetProps) {
  const { width } = useWindowDimensions();
  const [aktif, setAktif] = useState(0);
  // Area foto persegi 1:1 selebar layar.
  const tinggi = width;

  if (foto.length === 0) {
    return (
      <View style={[styles.kosong, { height: tinggi }]}>
        <Icon name="image" size={40} color={slate[300]} />
      </View>
    );
  }

  return (
    <View>
      <FlatList
        data={foto}
        keyExtractor={(uri, i) => `${i}-${uri}`}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => setAktif(Math.round(e.nativeEvent.contentOffset.x / width))}
        renderItem={({ item }) => (
          <View style={[styles.bingkai, { width, height: tinggi }]}>
            <Image source={{ uri: item }} style={styles.foto} resizeMode="cover" />
          </View>
        )}
      />
      {foto.length > 1 ? (
        <View style={styles.titik}>
          {foto.map((_, i) => (
            <View key={i} style={[styles.bulat, i === aktif && styles.bulatAktif]} />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  kosong: { backgroundColor: slate[100], alignItems: 'center', justifyContent: 'center' },
  bingkai: { backgroundColor: slate[100] },
  foto: { width: '100%', height: '100%' },
  titik: {
    position: 'absolute',
    bottom: Spacing.sm,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  bulat: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.white, opacity: 0.7 },
  bulatAktif: { backgroundColor: brand[600], opacity: 1 },
});
