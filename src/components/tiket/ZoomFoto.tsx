/** Foto layar penuh (modal gelap) untuk memperbesar foto tiket. Presentasional. */
import React from 'react';
import { Image, Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '../common/Icon';
import Colors from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';

interface ZoomFotoProps {
  /** URL foto yang diperbesar; null = tertutup. */
  uri: string | null;
  onTutup: () => void;
}

export default function ZoomFoto({ uri, onTutup }: ZoomFotoProps) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={!!uri} transparent animationType="fade" onRequestClose={onTutup} statusBarTranslucent>
      <View style={styles.latar}>
        {uri ? <Image source={{ uri }} style={StyleSheet.absoluteFill} resizeMode="contain" /> : null}
        <TouchableOpacity
          style={[styles.tutup, { top: insets.top + Spacing.md }]}
          onPress={onTutup}
          accessibilityLabel="Tutup foto"
        >
          <Icon name="close" size={20} color={Colors.white} />
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  latar: { flex: 1, backgroundColor: 'rgba(0,0,0,0.92)' },
  tutup: {
    position: 'absolute',
    right: Spacing.lg,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
