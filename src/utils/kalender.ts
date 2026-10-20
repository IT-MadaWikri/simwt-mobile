/**
 * Pembantu kalender bulanan — murni, tanpa React. Pekan dimulai hari Minggu
 * (seperti kalender pada rancangan Booking Ruangan).
 */
export const NAMA_BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];
export const NAMA_HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
export const SINGKATAN_HARI = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

/** Kunci tanggal `YYYY-MM-DD` (zona waktu perangkat) — untuk mencocokkan data per tanggal. */
export const kunciTanggal = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export const sama = (a: Date, b: Date) => kunciTanggal(a) === kunciTanggal(b);

/**
 * Isi grid satu bulan: `null` = sel kosong (sebelum tanggal 1 / setelah tanggal
 * terakhir), selalu kelipatan 7 supaya baris terakhir penuh.
 */
export function selBulan(tahun: number, bulan: number): (Date | null)[] {
  const awal = new Date(tahun, bulan, 1).getDay();
  const jumlah = new Date(tahun, bulan + 1, 0).getDate();
  const sel: (Date | null)[] = [
    ...Array<null>(awal).fill(null),
    ...Array.from({ length: jumlah }, (_, i) => new Date(tahun, bulan, i + 1)),
  ];
  while (sel.length % 7 !== 0) sel.push(null);
  return sel;
}

/** Tanggal `d` ditambah `n` hari (boleh negatif); jamnya dibuang. */
export const tambahHari = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

/** Tujuh tanggal pekan (Minggu–Sabtu) yang memuat `d`. */
export const harianPekan = (d: Date): Date[] => Array.from({ length: 7 }, (_, i) => tambahHari(d, i - d.getDay()));

/** Geser `delta` bulan dari (tahun, bulan); mengurus pergantian tahun. */
export function geserBulan(tahun: number, bulan: number, delta: number) {
  const d = new Date(tahun, bulan + delta, 1);
  return { tahun: d.getFullYear(), bulan: d.getMonth() };
}

if (__DEV__) {
  // Pemeriksaan kecil: Okt 2026 mulai Kamis, 31 hari → 4 hari kosong + 31 + 0 = 35 → kelipatan 7.
  const sel = selBulan(2026, 9);
  console.assert(sel.length % 7 === 0 && sel.filter(Boolean).length === 31 && sel[4] !== null && sel[3] === null, 'selBulan');
  console.assert(harianPekan(new Date(2026, 9, 21))[0].getDate() === 18 && harianPekan(new Date(2026, 9, 21))[6].getDate() === 24, 'harianPekan');
  console.assert(geserBulan(2026, 11, 1).tahun === 2027 && geserBulan(2026, 0, -1).bulan === 11, 'geserBulan');
}
