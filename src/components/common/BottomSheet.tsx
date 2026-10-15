/**
 * BottomSheet — sheet dari bawah yang bisa digeser jari, dipakai bersama
 * oleh seluruh aplikasi.
 *
 *   <BottomSheet visible={buka} onClose={() => setBuka(false)} title="Judul">
 *     ...isi apa saja...
 *   </BottomSheet>
 *
 * Tiga posisi: tertutup, setengah (setinggi isinya) dan penuh (85% layar).
 * Saat dilepas, sheet menempel ke posisi terdekat dari titik proyeksi
 * gerakannya. Isi yang lebih tinggi dari layar bisa di-scroll; geseran ke
 * bawah dari posisi scroll teratas menurunkan sheet.
 *
 * `penuh` membuka sheet langsung di posisi penuh — untuk isi yang punya
 * kolom ketik (cari, formulir).
 *
 * Keyboard: sheet diangkat tepat di atas keyboard dan tingginya dipotong
 * supaya tidak melewati status bar, jadi isi tetap terlihat & bisa
 * di-scroll. Tumpang-tindihnya dihitung dari tinggi wadah yang terukur,
 * sehingga benar baik saat Android mengecilkan jendela maupun tidak.
 *
 * Penutupan oleh pemanggil (mis. setelah memilih item) cukup dengan
 * `onClose` langsung — tidak perlu menunggu animasi.
 */
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Keyboard,
  Modal,
  PanResponder,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors, { slate } from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { fonts } from '../../../constants/Typography';
import { gs } from '../../../constants/GlobalStyles';

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  /** Buka langsung di posisi penuh (untuk isi berkolom ketik). */
  penuh?: boolean;
  children: React.ReactNode;
}

export default function BottomSheet({
  visible,
  onClose,
  title,
  subtitle,
  penuh: bukaPenuh = false,
  children,
}: BottomSheetProps) {
  const insets = useSafeAreaInsets();
  const { height: tinggiLayar } = useWindowDimensions();
  const penuh = tinggiLayar * 0.85;

  const y = useRef(new Animated.Value(penuh)).current;
  const yNow = useRef(penuh);
  const awal = useRef(0);
  const scrollY = useRef(0);
  const [tinggiKepala, setTinggiKepala] = useState(0);
  const [tinggiIsi, setTinggiIsi] = useState(0);

  // Posisi "setengah": hanya isi yang terlihat, sisanya di bawah layar.
  const isi = tinggiKepala + tinggiIsi;
  const [wadah, setWadah] = useState(tinggiLayar);
  const [atasKeyboard, setAtasKeyboard] = useState<number | null>(null);
  const tertutupKeyboard = atasKeyboard === null ? 0 : Math.max(0, wadah - atasKeyboard);
  const tinggiSheet = Math.min(penuh, wadah - tertutupKeyboard - insets.top - Spacing.sm);
  const setengah = bukaPenuh || tertutupKeyboard > 0 ? 0 : isi > 0 ? Math.max(0, tinggiSheet - isi) : penuh;

  useEffect(() => {
    const a = Keyboard.addListener('keyboardDidShow', (e) => setAtasKeyboard(e.endCoordinates.screenY));
    const b = Keyboard.addListener('keyboardDidHide', () => setAtasKeyboard(null));
    return () => {
      a.remove();
      b.remove();
    };
  }, []);
  const setengahRef = useRef(setengah);
  setengahRef.current = setengah;
  const penuhRef = useRef(penuh);
  penuhRef.current = penuh;

  useEffect(() => {
    const id = y.addListener(({ value }) => {
      yNow.current = value;
    });
    return () => y.removeListener(id);
  }, [y]);

  const keTarget = (nilai: number) =>
    Animated.spring(y, { toValue: nilai, bounciness: 4, useNativeDriver: true }).start();

  const tutup = () => {
    Animated.timing(y, { toValue: penuhRef.current, duration: 200, useNativeDriver: true }).start(
      ({ finished }) => finished && onClose()
    );
  };
  const tutupRef = useRef(tutup);
  tutupRef.current = tutup;

  // Saat dibuka: mulai dari bawah lalu naik. Saat isi berubah tinggi (hasil
  // cari bertambah, keyboard muncul): cukup pindah ke posisi baru, tanpa
  // mengulang animasi dari bawah.
  const sudahBuka = useRef(false);
  useEffect(() => {
    if (!visible) {
      sudahBuka.current = false;
      return;
    }
    if (!sudahBuka.current) {
      scrollY.current = 0;
      y.setValue(penuhRef.current);
    }
    if (bukaPenuh || isi > 0) {
      sudahBuka.current = true;
      keTarget(setengah);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, isi, setengah]);

  const selesaiGeser = (dy: number, vy: number) => {
    const proyeksi = awal.current + dy + vy * 120;
    const target = [0, setengahRef.current, penuhRef.current].reduce((a, b) =>
      Math.abs(b - proyeksi) < Math.abs(a - proyeksi) ? b : a
    );
    if (target >= penuhRef.current) tutupRef.current();
    else keTarget(target);
  };

  const geser = {
    onPanResponderGrant: () => {
      y.stopAnimation((v) => {
        awal.current = v;
      });
    },
    onPanResponderMove: (_: unknown, g: { dy: number }) => {
      y.setValue(Math.max(0, awal.current + g.dy));
    },
    onPanResponderRelease: (_: unknown, g: { dy: number; vy: number }) =>
      selesaiGeser(g.dy, g.vy),
    onPanResponderTerminate: (_: unknown, g: { dy: number; vy: number }) =>
      selesaiGeser(g.dy, g.vy),
  };

  // Kepala (strip + judul): menangkap sentuhan seketika.
  const panKepala = useRef(
    PanResponder.create({ onStartShouldSetPanResponder: () => true, ...geser })
  ).current;

  // Badan: menangkap geseran vertikal bila (turun & scroll di puncak) atau
  // (naik & sheet belum penuh). Selebihnya dibiarkan ke ScrollView.
  const panBadan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponderCapture: (_, g) => {
        if (Math.abs(g.dy) < 6 || Math.abs(g.dy) < Math.abs(g.dx)) return false;
        if (g.dy > 0) return scrollY.current <= 0;
        return yNow.current > 1;
      },
      ...geser,
    })
  ).current;

  const latar = y.interpolate({
    inputRange: [setengah, penuh],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={tutup} statusBarTranslucent>
      <View style={styles.overlay} onLayout={(e) => setWadah(e.nativeEvent.layout.height)}>
        <Animated.View style={[StyleSheet.absoluteFill, styles.latar, { opacity: latar }]}>
          <TouchableOpacity style={gs.flex1} activeOpacity={1} onPress={tutup} />
        </Animated.View>

        <Animated.View
          style={[styles.sheet, { height: tinggiSheet, bottom: tertutupKeyboard, transform: [{ translateY: y }] }]}
        >
          <View
            style={styles.kepala}
            onLayout={(e) => setTinggiKepala(e.nativeEvent.layout.height)}
            {...panKepala.panHandlers}
          >
            <View style={styles.handle} />
            {title ? <Text style={styles.title}>{title}</Text> : null}
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>

          <View style={gs.flex1} {...panBadan.panHandlers}>
            <ScrollView
              bounces={false}
              showsVerticalScrollIndicator={false}
              scrollEventThrottle={16}
              onScroll={(e) => {
                scrollY.current = e.nativeEvent.contentOffset.y;
              }}
              onContentSizeChange={(_, h) => setTinggiIsi(h)}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: (tertutupKeyboard ? 0 : insets.bottom) + Spacing.lg }}
            >
              {children}
            </ScrollView>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
  },
  latar: {
    backgroundColor: 'rgba(15, 27, 20, 0.45)',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.white,
    borderTopLeftRadius: Spacing.radius.xxl,
    borderTopRightRadius: Spacing.radius.xxl,
    ...Spacing.curve,
    overflow: 'hidden',
  },
  kepala: {
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
    paddingHorizontal: Spacing.screenPadding,
  },
  handle: {
    alignSelf: 'center',
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: slate[300],
    marginBottom: Spacing.lg,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
