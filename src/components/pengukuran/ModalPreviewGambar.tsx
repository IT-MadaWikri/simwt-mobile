/**
 * Pratinjau drawing layar penuh, bisa digeser antar-drawing. Presentasional.
 *
 * ponytail: tanpa cubit-untuk-zoom (butuh pustaka gestur tambahan); tambahkan bila drawing perlu diperbesar.
 */
import React, { useEffect, useState } from 'react';
import { FlatList, Image, Modal, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '../common/Icon';
import Colors from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { fonts } from '../../../constants/Typography';
import { SlideDrawing } from '../../utils/pengukuran';

interface ModalPreviewGambarProps {
  /** Drawing yang dibuka lebih dulu; null = tertutup. */
  indexAwal: number | null;
  slides: SlideDrawing[];
  onTutup: () => void;
}

export default function ModalPreviewGambar({ indexAwal, slides, onTutup }: ModalPreviewGambarProps) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (indexAwal !== null) setIndex(indexAwal);
  }, [indexAwal]);

  return (
    <Modal visible={indexAwal !== null} animationType="fade" onRequestClose={onTutup} statusBarTranslucent>
      <View style={styles.latar}>
        {indexAwal !== null ? (
          <FlatList
            data={slides}
            keyExtractor={(s) => String(s.id)}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            initialScrollIndex={Math.min(indexAwal, Math.max(slides.length - 1, 0))}
            getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
            onMomentumScrollEnd={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
            renderItem={({ item }) => (
              <View style={{ width, height }}>
                {item.url ? <Image source={{ uri: item.url }} style={styles.gambar} resizeMode="contain" /> : null}
              </View>
            )}
          />
        ) : null}

        <TouchableOpacity
          style={[styles.tutup, { top: insets.top + Spacing.md }]}
          onPress={onTutup}
          hitSlop={10}
          accessibilityLabel="Tutup pratinjau"
        >
          <Icon name="close" size={20} color={Colors.white} />
        </TouchableOpacity>

        {slides.length > 1 ? (
          <Text style={[styles.jumlah, { bottom: insets.bottom + Spacing.xl }]}>
            {index + 1} / {slides.length}
          </Text>
        ) : null}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  latar: { flex: 1, backgroundColor: Colors.black },
  gambar: { width: '100%', height: '100%' },
  tutup: {
    position: 'absolute',
    right: Spacing.lg,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  jumlah: { position: 'absolute', alignSelf: 'center', fontFamily: fonts.semibold, fontSize: 12, color: Colors.white },
});
