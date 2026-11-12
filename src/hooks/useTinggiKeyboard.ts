/**
 * Tinggi keyboard yang sedang tampil (0 bila tertutup), untuk mengangkat isi layar tepat di atasnya.
 *
 * Dipakai menggantikan `KeyboardAvoidingView` di Android: pada layar edge-to-edge perhitungan
 * `KeyboardAvoidingView` meleset (isi bawah tetap terpotong keyboard), sedangkan tinggi dari event
 * keyboard langsung dapat dipakai sebagai padding bawah.
 */
import { useEffect, useState } from 'react';
import { Keyboard, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function useTinggiKeyboard() {
  const insets = useSafeAreaInsets();
  const [tinggi, setTinggi] = useState(0);

  useEffect(() => {
    const ios = Platform.OS === 'ios';
    const a = Keyboard.addListener(ios ? 'keyboardWillShow' : 'keyboardDidShow', (e) => setTinggi(e.endCoordinates.height));
    const b = Keyboard.addListener(ios ? 'keyboardWillHide' : 'keyboardDidHide', () => setTinggi(0));
    return () => {
      a.remove();
      b.remove();
    };
  }, []);

  // Android edge-to-edge: tinggi dari event tidak termasuk navigation bar, padahal keyboard duduk di
  // atasnya — tanpa ini bilah di atas keyboard (mis. kolom pesan chat) tertutup setinggi nav bar.
  return tinggi > 0 && Platform.OS === 'android' ? tinggi + insets.bottom : tinggi;
}
