/** Artikel CMS Berita (`GET /artikel`), sudah dirapikan oleh `src/adapters/berita.ts`. */
export interface Berita {
  id: number;
  judul: string;
  ringkasan: string;
  /** Nilai mentah dari server (mis. "hc"); label tampilnya lewat `labelKategori`. */
  kategori: string;
  penulis: string | null;
  /** ISO 8601, null bila server tidak mengirim. */
  terbitPada: string | null;
  menitBaca: number;
  sampulUrl: string | null;
  /** Berapa kali artikel dibuka (penghitung kasar di server). */
  dilihat: number;
  jumlahSuka: number;
  disukai: boolean;
}

export interface BeritaDetail extends Berita {
  /** HTML yang sudah disanitasi server (p, br, strong, em, u, ul, ol, li, a, h2, h3, blockquote). */
  isi: string;
  /** "Mungkin Anda suka": artikel terbit lain (sekategori lebih dulu), paling banyak 3. */
  terkait: Berita[];
}

export interface HalamanBerita {
  data: Berita[];
  currentPage: number;
  lastPage: number;
}

export interface StatusSuka {
  disukai: boolean;
  jumlahSuka: number;
}
