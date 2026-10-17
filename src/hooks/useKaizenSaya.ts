/**
 * Orkestrator layar "Kaizen Saya": menggabungkan daftar (`useDaftarKaizen`) dan
 * ringkasan (`useRingkasanKaizen`), lalu mengatur kapan keduanya dimuat ulang.
 * Layar hanya memanggil hook ini dan merender hasilnya.
 */
import { useCallback, useRef } from 'react';
import { useFocusEffect } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { useDaftarKaizen } from './useDaftarKaizen';
import { useRingkasanKaizen } from './useRingkasanKaizen';

export function useKaizenSaya() {
  const { user } = useAuth();
  const daftar = useDaftarKaizen();
  const ringkasan = useRingkasanKaizen(user?.nik);
  const { muatUlang } = daftar;
  const { muatPoin, muatJumlahDraf } = ringkasan;

  // Fokus pertama sudah dimuat efek debounce di `useDaftarKaizen`; kembali dari
  // "Buat Kaizen" → daftar ikut segar tanpa spinner penuh.
  const pertamaFokus = useRef(true);
  useFocusEffect(
    useCallback(() => {
      muatPoin();
      muatJumlahDraf();
      if (pertamaFokus.current) {
        pertamaFokus.current = false;
        return;
      }
      muatUlang();
    }, [muatPoin, muatJumlahDraf, muatUlang])
  );

  const segarkan = () => {
    muatPoin();
    daftar.segarkan();
  };

  return { user, ...daftar, ...ringkasan, segarkan };
}
