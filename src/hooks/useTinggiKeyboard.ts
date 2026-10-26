/**
 * Tinggi keyboard yang sedang tampil (0 bila tertutup), untuk mengangkat isi layar tepat di atasnya.
 *
 * Dipakai menggantikan `KeyboardAvoidingView` di Android: pada layar edge-to-edge perhitungan
 * `KeyboardAvoidingView` meleset (isi bawah tetap terpotong keyboard), sedangkan tinggi dari event
 * keyboard langsung dapat dipakai sebagai padding bawah.
 */
import { useEffect, useState } from 'react';
import { Keyboard, Platform } from 'react-native';

export function useTinggiKeyboard() {
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

  return tinggi;
}
