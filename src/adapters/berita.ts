/**
 * Adapter murni modul Berita: mengubah respons `/artikel` menjadi bentuk yang stabil untuk layar.
 * Tanpa React, api, atau storage.
 */
import { Berita, BeritaDetail } from '../types/berita';

const LABEL_KATEGORI: Record<string, string> = {
  pengumuman: 'Pengumuman',
  sistem: 'Sistem',
  kaizen: 'Kaizen',
  hc: 'Human Capital',
  umum: 'Umum',
};

export const labelKategori = (kategori: string) => LABEL_KATEGORI[kategori] ?? 'Umum';

export function adaptasiBerita(mentah: any): Berita {
  return {
    id: Number(mentah?.id) || 0,
    judul: String(mentah?.judul ?? ''),
    ringkasan: String(mentah?.ringkasan ?? ''),
    kategori: String(mentah?.kategori ?? 'umum'),
    penulis: mentah?.penulis ?? null,
    terbitPada: mentah?.terbit_pada ?? null,
    menitBaca: Number(mentah?.menit_baca) || 1,
    sampulUrl: mentah?.sampul_url ?? null,
    dilihat: Number(mentah?.dilihat) || 0,
    jumlahSuka: Number(mentah?.jumlah_suka) || 0,
    disukai: !!mentah?.disukai,
  };
}

export const adaptasiDetailBerita = (mentah: any): BeritaDetail => ({
  ...adaptasiBerita(mentah),
  isi: String(mentah?.isi ?? ''),
  terkait: ((mentah?.terkait ?? []) as unknown[]).map(adaptasiBerita),
});

const BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

/** "18 Okt 2026" — kosong bila tanggal tidak valid. */
export function tanggalBerita(iso: string | null): string {
  const t = iso ? new Date(iso) : null;
  return t && !isNaN(t.getTime()) ? `${t.getDate()} ${BULAN[t.getMonth()]} ${t.getFullYear()}` : '';
}

const potong = (teks: string, batas: number) => (teks.length <= batas ? teks : `${teks.slice(0, batas - 1).trimEnd()}…`);

/** Pesan untuk dibagikan (WhatsApp dll), sama gayanya dengan `teksBagikanTiket`. Artikel belum punya tautan publik. */
export const teksBagikanBerita = (b: Pick<Berita, 'judul' | 'kategori' | 'terbitPada' | 'penulis' | 'ringkasan'>) =>
  [
    // Format WhatsApp: *tebal*, _miring_. Tanda * di judul dibuang supaya tidak merusak penebalan.
    `📰 *${b.judul.replace(/\*/g, '')}*`,
    `_${[labelKategori(b.kategori), tanggalBerita(b.terbitPada), b.penulis].filter(Boolean).join(' · ')}_`,
    '',
    b.ringkasan ? potong(b.ringkasan, 160) : null,
    b.ringkasan ? '' : null,
    'Baca selengkapnya di aplikasi *SIMWT Mobile*.',
    '_PT Mada Wikri Tunggal · #SIMWT_',
  ]
    .filter((x) => x !== null)
    .join('\n');
