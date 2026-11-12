/**
 * BottomSheet — sheet dari bawah yang dipakai bersama oleh seluruh aplikasi, dibangun di atas
 * `@gorhom/bottom-sheet` (BottomSheetModal).
 *
 *   <BottomSheet visible={buka} onClose={() => setBuka(false)} title="Judul">
 *     ...isi apa saja...
 *   </BottomSheet>
 *
 * Tinggi sheet otomatis mengikuti isi (maks 85% layar); isi selalu bisa digulir vertikal bila
 * lebih tinggi. Saat sheet naik, isi baru dipasang sesaat kemudian (spinner dulu) supaya
 * pembukaannya tidak tersendat oleh isi yang berat. Keyboard: sheet terangkat di atas keyboard.
 * Geser ke bawah, ketuk latar, atau tombol kembali Android menutup sheet.
 *
 * `visible` mengendalikan sheet: true → tampil, false → turun lalu dilepas. `onClose` dipanggil
 * saat pengguna menutupnya sendiri; pemanggil yang menolak menutup (mis. sedang memproses) cukup
 * tidak mengubah `visible`, dan sheet akan dimunculkan kembali.
 *
 * Kolom ketik di dalam sheet memakai `InputSheet` (bukan `TextInput`) supaya keyboard tertangani.
 */
import React, { createContext, useCallback, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { BackHandler, StyleSheet, Text, TextInput, TextInputProps, useWindowDimensions, View } from 'react-native';
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetTextInput,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BrandSpinner from './BrandSpinner';
import Colors, { brand, slate } from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { useTinggiKeyboard } from '../../hooks/useTinggiKeyboard';
import { fonts, fontsJudul, ukuranIsi, ukuranCatatan } from '../../../constants/Typography';

const TINGGI_PENUH = 0.85;
/** Perkiraan tinggi handle + judul sheet, dikurangkan agar sheet `penuh` tidak melebihi layar. */
const TINGGI_KEPALA = 100;

const DalamSheet = createContext(false);

/** Pengganti `TextInput` untuk kolom ketik di dalam BottomSheet; di luar sheet berperilaku biasa. */
export const InputSheet = React.forwardRef<TextInput, TextInputProps>(function InputSheet(props, ref) {
  return useContext(DalamSheet) ? <BottomSheetTextInput ref={ref as never} {...props} /> : <TextInput ref={ref} {...props} />;
});

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  /** Isi yang menempel di bawah judul dan tidak ikut menggulir (mis. kolom cari). */
  kepalaTetap?: React.ReactNode;
  /**
   * Sheet setinggi mungkin (di bawah status bar) — untuk sheet cari yang keyboardnya langsung terbuka:
   * kolom di atas tetap terlihat, dan daftar bisa digulir sampai di atas keyboard.
   */
  penuh?: boolean;
  children: React.ReactNode;
}

/**
 * Isi sheet. Dipasang hanya selama sheet tampil, jadi spinner muncul di setiap pembukaan dan isi
 * sebenarnya baru dirender setelah interaksi (animasi buka) selesai.
 */
function IsiSheet({ kepalaTetap, paddingBawah, tinggiMin, children }: { kepalaTetap?: React.ReactNode; paddingBawah: number; tinggiMin?: number; children: React.ReactNode }) {
  const [siap, setSiap] = useState(false);

  // Dua frame cukup agar sheet mulai naik; animasinya jalan di thread UI jadi tak tersendat isi.
  useEffect(() => {
    let kedua = 0;
    const pertama = requestAnimationFrame(() => {
      kedua = requestAnimationFrame(() => setSiap(true));
    });
    return () => {
      cancelAnimationFrame(pertama);
      cancelAnimationFrame(kedua);
    };
  }, []);

  if (!siap) {
    return (
      <BottomSheetView style={[styles.memuat, tinggiMin ? { minHeight: tinggiMin } : null]}>
        <BrandSpinner size={24} color={brand[600]} />
      </BottomSheetView>
    );
  }

  return (
    <BottomSheetScrollView
      bounces={false}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      stickyHeaderIndices={kepalaTetap ? [0] : undefined}
      contentContainerStyle={{ paddingBottom: paddingBawah, minHeight: tinggiMin }}
    >
      {kepalaTetap ? <View style={styles.kepalaTetap}>{kepalaTetap}</View> : null}
      {children}
    </BottomSheetScrollView>
  );
}

export default function BottomSheet({ visible, onClose, title, subtitle, kepalaTetap, penuh, children }: BottomSheetProps) {
  const insets = useSafeAreaInsets();
  const { height: tinggiLayar } = useWindowDimensions();
  const ref = useRef<BottomSheetModal>(null);
  // Ruang gulir tambahan setinggi keyboard di semua sheet: di Android edge-to-edge keyboard menutupi
  // bagian bawah sheet, jadi isi terbawah (kolom form, hasil cari) harus bisa digulir naik di atasnya.
  const tinggiKeyboard = useTinggiKeyboard();
  const tinggiPenuh = tinggiLayar - insets.top;

  const visibleRef = useRef(visible);
  visibleRef.current = visible;
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  // `dismiss()` pada modal yang belum/sudah tidak tampil membuat statusnya macet (present berikutnya
  // tidak jalan), jadi hanya dipanggil bila sheet memang sedang tampil.
  const tampil = useRef(false);

  useLayoutEffect(() => {
    if (visible) {
      tampil.current = true;
      ref.current?.present();
    } else if (tampil.current) {
      ref.current?.dismiss();
    }
  }, [visible]);

  // Sheet terlepas karena digeser/diketuk, bukan karena `visible` jadi false: beri tahu pemanggil;
  // bila pemanggil menolak (visible tetap true), munculkan lagi.
  const saatLepas = useCallback(() => {
    tampil.current = false;
    if (!visibleRef.current) return;
    onCloseRef.current();
    setTimeout(() => {
      if (!visibleRef.current) return;
      tampil.current = true;
      ref.current?.present();
    }, 50);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const langganan = BackHandler.addEventListener('hardwareBackPress', () => {
      ref.current?.dismiss();
      return true;
    });
    return () => langganan.remove();
  }, [visible]);

  const renderLatar = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} opacity={0.45} />
    ),
    []
  );

  const renderKepala = useCallback(
    () => (
      <View style={styles.kepala}>
        <View style={styles.handle} />
        {title ? <Text style={styles.title}>{title}</Text> : null}
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
    ),
    [title, subtitle]
  );

  return (
    <BottomSheetModal
      ref={ref}
      onDismiss={saatLepas}
      stackBehavior="push"
      enableDynamicSizing
      maxDynamicContentSize={penuh ? tinggiPenuh : tinggiLayar * TINGGI_PENUH}
      topInset={insets.top}
      enablePanDownToClose
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      enableBlurKeyboardOnGesture
      android_keyboardInputMode="adjustResize"
      backdropComponent={renderLatar}
      handleComponent={renderKepala}
      backgroundStyle={styles.latar}
    >
      <DalamSheet.Provider value>
        <IsiSheet
          kepalaTetap={kepalaTetap}
          paddingBawah={insets.bottom + Spacing.lg + tinggiKeyboard}
          tinggiMin={penuh ? tinggiPenuh - TINGGI_KEPALA : undefined}
        >
          {children}
        </IsiSheet>
      </DalamSheet.Provider>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  latar: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: Spacing.radius.xxl,
    borderTopRightRadius: Spacing.radius.xxl,
    ...Spacing.curve,
  },
  kepala: {
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
    paddingHorizontal: Spacing.screenPadding,
  },
  kepalaTetap: {
    backgroundColor: Colors.white,
  },
  memuat: {
    minHeight: 120,
    alignItems: 'center',
    justifyContent: 'center',
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
    fontFamily: fontsJudul.bold,
    fontSize: ukuranIsi,
    color: Colors.textPrimary,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: ukuranCatatan,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
