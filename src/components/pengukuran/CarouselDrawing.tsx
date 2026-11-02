/** Carousel drawing di atas form pengukuran; mengetuk gambar membuka pratinjau penuh. Presentasional. */
import React from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import Icon from '../common/Icon';
import Colors, { slate } from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { fonts } from '../../../constants/Typography';
import { SlideDrawing } from '../../utils/pengukuran';

const TINGGI = 200;

interface CarouselDrawingProps {
  slides: SlideDrawing[];
  onPilih: (index: number) => void;
}

export default function CarouselDrawing({ slides, onPilih }: CarouselDrawingProps) {
  const { width } = useWindowDimensions();

  return (
    <View>
      <FlatList
        data={slides}
        keyExtractor={(s) => String(s.id)}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={[styles.slide, { width }]}
            activeOpacity={item.url ? 0.8 : 1}
            disabled={!item.url}
            onPress={() => onPilih(index)}
            accessibilityLabel={`Drawing ${index + 1}`}
          >
            {item.url ? (
              <Image source={{ uri: item.url }} style={styles.gambar} resizeMode="contain" />
            ) : (
              <View style={styles.kosong}>
                <Icon name="image" size={28} color={Colors.textTertiary} />
                <Text style={styles.teks}>Drawing belum tersedia</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      />
      {slides.length > 1 ? <Text style={styles.jumlah}>{slides.length} drawing · geser untuk melihat</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  slide: { height: TINGGI, backgroundColor: slate[100] },
  gambar: { width: '100%', height: '100%' },
  kosong: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.sm },
  teks: { fontFamily: fonts.regular, fontSize: 12, color: Colors.textTertiary },
  jumlah: {
    position: 'absolute',
    bottom: Spacing.sm,
    alignSelf: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 2,
    borderRadius: Spacing.radius.full,
    backgroundColor: 'rgba(0,0,0,0.55)',
    fontFamily: fonts.regular,
    fontSize: 12,
    color: Colors.white,
    overflow: 'hidden',
  },
});
