/** Adapter murni: kode cuaca WMO (Open-Meteo) → ikon + label Indonesia. */
export interface Cuaca {
  suhu: number;
  ikon: string;
  label: string;
}

const peta = (kode: number): Pick<Cuaca, 'ikon' | 'label'> => {
  if (kode === 0) return { ikon: 'weather-sunny', label: 'Cerah' };
  if (kode <= 2) return { ikon: 'weather-partly-cloudy', label: 'Cerah berawan' };
  if (kode === 3) return { ikon: 'weather-cloudy', label: 'Berawan' };
  if (kode <= 48) return { ikon: 'weather-fog', label: 'Berkabut' };
  if (kode <= 67 || (kode >= 80 && kode <= 82)) return { ikon: 'weather-rainy', label: 'Hujan' };
  if (kode <= 77 || kode >= 85 && kode <= 86) return { ikon: 'weather-snowy', label: 'Bersalju' };
  return { ikon: 'weather-lightning', label: 'Badai petir' };
};

export function adaptasiCuaca(respons: any): Cuaca | null {
  const c = respons?.current;
  if (typeof c?.temperature_2m !== 'number') return null;
  return { suhu: Math.round(c.temperature_2m), ...peta(Number(c.weather_code) || 0) };
}
