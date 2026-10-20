/**
 * Tata letak garis waktu harian — murni, tanpa React. Booking yang waktunya
 * beririsan (mis. dua ruangan berbeda) dibagi ke kolom berdampingan supaya
 * tidak saling menimpa; yang tidak beririsan memakai lebar penuh.
 */
export interface ItemWaktu {
  mulai: Date;
  selesai: Date;
}

export interface Tata<T extends ItemWaktu> {
  item: T;
  /** Indeks kolom dari kiri (0-based). */
  kolom: number;
  /** Jumlah kolom dalam gugus irisannya. */
  jumlahKolom: number;
}

export function susunKolom<T extends ItemWaktu>(daftar: T[]): Tata<T>[] {
  const urut = [...daftar].sort((a, b) => a.mulai.getTime() - b.mulai.getTime() || a.selesai.getTime() - b.selesai.getTime());
  const hasil: Tata<T>[] = [];
  let gugus: Tata<T>[] = [];
  let akhirKolom: number[] = []; // waktu selesai terakhir tiap kolom
  let akhirGugus = 0;

  const tutupGugus = () => {
    gugus.forEach((t) => (t.jumlahKolom = akhirKolom.length));
    hasil.push(...gugus);
    gugus = [];
    akhirKolom = [];
  };

  for (const item of urut) {
    const mulai = item.mulai.getTime();
    if (gugus.length && mulai >= akhirGugus) tutupGugus();
    let kolom = akhirKolom.findIndex((akhir) => akhir <= mulai);
    if (kolom === -1) kolom = akhirKolom.length;
    akhirKolom[kolom] = item.selesai.getTime();
    akhirGugus = Math.max(gugus.length ? akhirGugus : 0, item.selesai.getTime());
    gugus.push({ item, kolom, jumlahKolom: 1 });
  }
  tutupGugus();
  return hasil;
}

/** Jam awal & akhir (bulat) yang ditampilkan: minimal `minAwal`–`minAkhir`, melebar bila ada booking di luarnya. */
export function rentangJamTampil(daftar: ItemWaktu[], minAwal = 7, minAkhir = 19) {
  let awal = minAwal;
  let akhir = minAkhir;
  for (const { mulai, selesai } of daftar) {
    awal = Math.min(awal, mulai.getHours());
    const jamSelesai = selesai.getHours() + (selesai.getMinutes() > 0 ? 1 : 0);
    akhir = Math.max(akhir, selesai.getDate() !== mulai.getDate() ? 24 : jamSelesai);
  }
  return { awal, akhir: Math.min(24, akhir) };
}

if (__DEV__) {
  const t = (j: number, m = 0) => new Date(2026, 9, 21, j, m);
  const a = { mulai: t(9), selesai: t(10, 30) };
  const b = { mulai: t(10), selesai: t(11) }; // beririsan dengan a
  const c = { mulai: t(13), selesai: t(14) }; // sendiri
  const hasil = susunKolom([c, b, a]);
  const ambil = (x: ItemWaktu) => hasil.find((h) => h.item === x)!;
  console.assert(ambil(a).kolom === 0 && ambil(b).kolom === 1 && ambil(a).jumlahKolom === 2 && ambil(c).jumlahKolom === 1, 'susunKolom');
  console.assert(rentangJamTampil([{ mulai: t(5), selesai: t(21, 15) }]).awal === 5 && rentangJamTampil([{ mulai: t(5), selesai: t(21, 15) }]).akhir === 22, 'rentangJamTampil');
}
