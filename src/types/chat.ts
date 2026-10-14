/**
 * Tipe untuk fitur Chat.
 *
 * Status pesan meniru WhatsApp:
 *   menunggu  → jam pasir  (belum sampai server; juga status semua pesan ke
 *               sesama pengguna selama server chat/WebSocket belum hidup)
 *   terkirim  → ✓          (diterima server)
 *   dibaca    → ✓✓ biru    (dibaca lawan bicara)
 *   gagal     → ⚠          (perlu kirim ulang)
 */
export type StatusPesan = 'menunggu' | 'terkirim' | 'dibaca' | 'gagal';

export interface PesanChat {
  id: string;
  teks: string;
  /** `saya` = pengguna ini; selain itu id kontak pengirim. */
  pengirim: 'saya' | string;
  /** Epoch ms — dipakai untuk chip tanggal & pengurutan. */
  waktu: number;
  status: StatusPesan;
  lampiran?: { uri: string; nama: string; tipe: string } | null;
}

export interface KontakChat {
  id: string;
  nama: string;
  /** Baris kecil di bawah nama pada daftar (jabatan, atau slogan untuk AI). */
  keterangan: string;
  /** URL foto; kosong = tampilkan inisial. */
  foto?: string | null;
  /** Kontak AI (Mita) — dipin di atas & diberi rupa khusus, ala Meta AI. */
  ai?: boolean;
  online?: boolean;
}

/** Baris pada daftar chat: kontak + cuplikan pesan terakhir. */
export interface RingkasanChat {
  kontak: KontakChat;
  cuplikan: string;
  waktu: number | null;
  belumDibaca: number;
}
