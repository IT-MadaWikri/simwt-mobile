import * as Location from 'expo-location';
import { adaptasiCuaca, type Cuaca } from '../adapters/cuaca';

export interface CuacaLokasi extends Cuaca {
  lokasi: string;
}

// Dipakai bila izin lokasi ditolak atau GPS gagal.
const LOKASI_CADANGAN = { nama: 'Jakarta', lat: -6.2, lon: 106.82 };

/** Minta izin (hanya saat app dipakai) lalu ambil posisi; null bila ditolak/gagal. */
async function posisiPengguna() {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return null;
    const pos =
      (await Location.getLastKnownPositionAsync()) ??
      (await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }));
    const { latitude: lat, longitude: lon } = pos.coords;
    const [alamat] = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lon }).catch(() => []);
    return { nama: alamat?.city || alamat?.subregion || alamat?.region || 'Lokasi saya', lat, lon };
  } catch {
    return null;
  }
}

// API publik pihak ketiga tanpa kunci — sengaja tidak lewat api.ts agar header Bearer/X-SIMMWT-KEY tidak bocor.
export const cuacaService = {
  async saatIni(): Promise<CuacaLokasi> {
    const { nama, lat, lon } = (await posisiPengguna()) ?? LOKASI_CADANGAN;
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&timezone=auto`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Gagal memuat cuaca');
    const cuaca = adaptasiCuaca(await res.json());
    if (!cuaca) throw new Error('Data cuaca tidak valid');
    return { ...cuaca, lokasi: nama };
  },
};
