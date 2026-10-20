/**
 * Jumlah notifikasi belum dibaca, dihitung ulang tiap layar pemakainya
 * kembali fokus (mis. setelah membaca notifikasi).
 */
import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { notifikasiService } from '../services/notifikasiService';

export function useBelumDibaca() {
  const [belumDibaca, setBelumDibaca] = useState(0);

  useFocusEffect(
    useCallback(() => {
      notifikasiService
        .jumlahBelumDibaca()
        .then(setBelumDibaca)
        .catch(() => {});
    }, [])
  );

  return belumDibaca;
}

export default useBelumDibaca;
