/**
 * Adapter booking ruangan — murni (tanpa React/api/storage): merapikan respons
 * server, mewarnai ruangan, memformat jam, dan memvalidasi form dengan aturan
 * yang sama seperti server (`BookingRuanganController::simpan`).
 */
import { slate } from '../../constants/Colors';
import { Booking, FormBooking, GalatBooking, JenisRapat, MasterBooking } from '../types/booking';
import { NAMA_BULAN, NAMA_HARI } from '../utils/kalender';
import type { AcaraKalender } from '../utils/kalenderOs';

const JENIS: JenisRapat[] = ['offline', 'online', 'luar'];

export const adaptasiBooking = (m: any): Booking => ({
  id: Number(m?.id),
  jenis: JENIS.includes(m?.jenis_rapat) ? m.jenis_rapat : 'offline',
  jenisLabel: m?.jenis_rapat_label ?? '',
  idRuangan: m?.id_ruangan ?? null,
  tempat: m?.tempat || '-',
  plant: m?.plant ?? null,
  departemen: m?.departemen ?? null,
  namaPeminjam: m?.nama_peminjam ?? '',
  namaKegiatan: m?.nama_kegiatan ?? '',
  linkMeeting: m?.link_meeting ?? null,
  mulai: new Date(m?.waktu_mulai),
  selesai: new Date(m?.waktu_selesai),
  status: Number(m?.status ?? 0),
  statusLabel: m?.status_label ?? '',
  peserta: Array.isArray(m?.peserta) ? m.peserta.map(String) : [],
});

export const adaptasiMaster = (m: any): MasterBooking => ({
  plant: (m?.plant ?? []).map((p: any) => ({ id: Number(p.id), nama: String(p.nama) })),
  ruangan: (m?.ruangan ?? []).map((r: any) => ({
    id: Number(r.id),
    nama: String(r.nama_ruangan),
    kapasitas: Number(r.kapasitas_ruangan ?? 0),
    idPlant: Number(r.id_plant),
  })),
  departemen: (m?.departemen ?? []).map((d: any) => ({ id: Number(d.id), nama: String(d.nama), kode: String(d.kode ?? '') })),
  awal: { idPlant: m?.default?.id_plant ?? null, namaPeminjam: m?.default?.nama_peminjam ?? '' },
});

/** Siklus 10 warna per ruangan, kuncinya `id % 10` seperti timeline di web; 0 (tanpa ruangan) netral. */
const WARNA_RUANGAN = [
  '#ff9a2e', '#ff6a5c', '#1fc2a8', '#9a6bff', '#4a98ff',
  '#ff5d9a', '#34c96b', '#14b8d4', '#f59e0b', '#0ea5e9',
];
export const warnaRuangan = (idRuangan: number | null) => (idRuangan ? WARNA_RUANGAN[idRuangan % WARNA_RUANGAN.length] : slate[400]);

/** `{ 'YYYY-MM-DD': [idRuangan, ...] }` dari server → warna titik kalender per tanggal. */
export const penandaKalender = (mentah: Record<string, number[]> | null | undefined): Record<string, string[]> =>
  Object.fromEntries(Object.entries(mentah ?? {}).map(([tgl, ids]) => [tgl, ids.map((id) => warnaRuangan(id))]));

const dua = (n: number) => String(n).padStart(2, '0');
export const formatJam = (d: Date) => `${dua(d.getHours())}:${dua(d.getMinutes())}`;
export const rentangJam = (b: Pick<Booking, 'mulai' | 'selesai'>) => `${formatJam(b.mulai)} - ${formatJam(b.selesai)}`;

/** Label kecil di atas baris booking: "Di Ruangan · Sarbini", "Online", "Di Luar Perusahaan · Hotel X". */
export const kategoriBooking = (b: Pick<Booking, 'jenis' | 'jenisLabel' | 'tempat'>) =>
  b.jenis === 'online' ? b.jenisLabel || 'Online' : `${b.jenisLabel} · ${b.tempat}`;

/** Pesan untuk dibagikan (WhatsApp dll): undangan rapat ringkas, gaya sama dengan `teksBagikanBerita`. */
export const teksBagikanBooking = (b: Booking) =>
  [
    '📅 *Undangan Rapat*',
    // Format WhatsApp: *tebal*. Tanda * di judul dibuang supaya tidak merusak penebalan.
    `*${b.namaKegiatan.replace(/\*/g, '')}*`,
    '',
    `🗓 ${NAMA_HARI[b.mulai.getDay()]}, ${b.mulai.getDate()} ${NAMA_BULAN[b.mulai.getMonth()]} ${b.mulai.getFullYear()}`,
    `🕘 ${rentangJam(b)}`,
    `${b.jenis === 'online' ? '💻' : '📍'} ${kategoriBooking(b)}${b.plant && b.jenis === 'offline' ? ` (${b.plant})` : ''}`,
    b.linkMeeting ? `🔗 ${b.linkMeeting}` : null,
    `👤 ${b.namaPeminjam}${b.departemen ? ` · ${b.departemen}` : ''}`,
    b.peserta.length ? `👥 Peserta: ${b.peserta.join(', ')}` : null,
    '',
    '_PT Mada Wikri Tunggal · #SIMWT_',
  ]
    .filter((x) => x !== null)
    .join('\n');

/** Isian acara untuk kalender OS: judul, waktu, lokasi, dan catatan (peminjam, link, peserta). */
export const acaraKalenderBooking = (b: Booking): AcaraKalender => ({
  judul: b.namaKegiatan,
  mulai: b.mulai,
  selesai: b.selesai,
  lokasi: b.tempat !== '-' ? [b.tempat, b.jenis === 'offline' ? b.plant : null].filter(Boolean).join(', ') : undefined,
  catatan: [
    `Peminjam: ${b.namaPeminjam}${b.departemen ? ` (${b.departemen})` : ''}`,
    b.linkMeeting ? `Link meeting: ${b.linkMeeting}` : null,
    b.peserta.length ? `Peserta: ${b.peserta.join(', ')}` : null,
  ]
    .filter((x) => x !== null)
    .join('\n'),
});

export const kunciBulan =(tahun: number, bulan: number) => `${tahun}-${dua(bulan + 1)}`;

/** Tanggal 'YYYY-MM-DD' + jam 'HH:mm' → 'YYYY-MM-DD HH:mm:00' (waktu lokal, seperti isian di web). */
export const gabungWaktu = (tanggal: string, jam: string) => `${tanggal} ${jam}:00`;

export const FORM_BOOKING_KOSONG = (tanggal: string): FormBooking => ({
  jenis: 'offline',
  idPlant: null,
  idRuangan: null,
  idDepartemen: null,
  linkMeeting: '',
  lokasi: '',
  namaPeminjam: '',
  namaKegiatan: '',
  tanggal,
  mulai: '09:00',
  selesai: '10:00',
  peserta: [],
});

/** Galat per field (kosong = aman). `sekarang` disuntik supaya mudah diuji. */
export function galatBooking(f: FormBooking, sekarang: Date = new Date()): GalatBooking {
  const g: GalatBooking = {};
  if (f.jenis !== 'luar' && !f.idPlant) g.plant = 'Plant wajib dipilih.';
  if (f.jenis === 'offline' && !f.idRuangan) g.ruangan = 'Ruangan wajib dipilih.';
  if (f.jenis === 'online' && !/^https?:\/\/\S+$/i.test(f.linkMeeting.trim())) g.link = 'Isi link meeting yang valid (diawali http:// atau https://).';
  if (f.jenis === 'luar' && !f.lokasi.trim()) g.lokasi = 'Lokasi rapat wajib diisi.';
  if (!f.idDepartemen) g.departemen = 'Departemen wajib dipilih.';
  if (!f.namaPeminjam.trim()) g.peminjam = 'Nama peminjam wajib diisi.';
  if (!f.namaKegiatan.trim()) g.kegiatan = 'Nama kegiatan wajib diisi.';

  const mulai = new Date(gabungWaktu(f.tanggal, f.mulai).replace(' ', 'T'));
  const selesai = new Date(gabungWaktu(f.tanggal, f.selesai).replace(' ', 'T'));
  if (isNaN(mulai.getTime()) || isNaN(selesai.getTime())) g.waktu = 'Tanggal dan jam wajib diisi.';
  else if (mulai < sekarang) g.waktu = 'Waktu mulai tidak boleh sudah lewat.';
  else if (selesai <= mulai) g.waktu = 'Jam selesai harus setelah jam mulai.';
  return g;
}

if (__DEV__) {
  // Pemeriksaan kecil: aturan validasi inti.
  const dasar = { ...FORM_BOOKING_KOSONG('2099-01-01'), idPlant: 1, idRuangan: 1, idDepartemen: 1, namaPeminjam: 'A', namaKegiatan: 'B' };
  console.assert(Object.keys(galatBooking(dasar)).length === 0, 'form valid');
  console.assert(!!galatBooking({ ...dasar, selesai: '08:00' }).waktu, 'selesai sebelum mulai');
  console.assert(!!galatBooking({ ...dasar, jenis: 'online', linkMeeting: 'bukan-url' }).link, 'link online');
  console.assert(!galatBooking({ ...dasar, jenis: 'luar', idPlant: null, lokasi: 'Hotel' }).plant, 'luar tanpa plant');
  console.assert(warnaRuangan(null) === slate[400] && warnaRuangan(13) === WARNA_RUANGAN[3], 'warna ruangan');
}
