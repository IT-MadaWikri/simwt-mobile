/**
 * Adapter Request Akun — murni (tanpa React/api/storage): merapikan respons `/layanan-it/request-akun/*`,
 * menurunkan pilihan form (departemen per plant, jenis per sistem), dan memvalidasi isian dengan aturan
 * yang sama seperti server (`RequestAkunController::simpan` di api-simwt).
 */
import {
  DepartemenOpsi,
  FormRequestAkun,
  GalatRequestAkun,
  HasilLacakRequestAkun,
  LangkahRequestAkun,
  OpsiRequestAkun,
  RequestAkunDetail,
  RequestAkunRingkas,
} from '../types/layananIt';
import { LangkahLinimasa } from '../types/tiket';

const angka = (v: any) => (v === null || v === undefined || v === '' ? null : Number(v));
const daftarAngka = (v: any): number[] => (Array.isArray(v) ? v.map(Number) : []);

export const adaptasiOpsiRequestAkun = (m: any): OpsiRequestAkun => ({
  sistem: (m?.sistem ?? []).map((s: any) => ({ nama: String(s.nama), jenis: (s.jenis ?? []).map(String) })),
  webapps: (m?.webapps ?? []).map(String),
  metode: (m?.metode ?? []).map((x: any) => ({
    nilai: x.nilai,
    label: String(x.label ?? x.nilai),
    keterangan: String(x.keterangan ?? ''),
    tersedia: !!x.tersedia,
  })),
  plant: (m?.plant ?? []).map((p: any) => ({ id: Number(p.id), nama: String(p.nama) })),
  departemen: (m?.departemen ?? []).map((d: any) => ({
    id: Number(d.id),
    nama: String(d.nama),
    plantIds: daftarAngka(d.plant_ids),
    subs: (d.subs ?? []).map((s: any) => ({ id: Number(s.id), nama: String(s.nama), plantIds: daftarAngka(s.plant_ids) })),
  })),
  pemohon: m?.pemohon
    ? {
        nama: String(m.pemohon.nama ?? ''),
        nik: String(m.pemohon.nik ?? ''),
        idPlant: angka(m.pemohon.id_plant),
        idDepartemen: angka(m.pemohon.id_departemen),
        subDepartemen: angka(m.pemohon.sub_departemen),
      }
    : null,
});

export const adaptasiRequestAkun = (m: any): RequestAkunRingkas => ({
  id: Number(m?.id),
  nomorDokumen: m?.nomor_dokumen ?? '',
  jenisPermintaan: m?.jenis_permintaan ?? '',
  sistem: m?.sistem ?? '-',
  status: m?.status ?? 'pending_kabag',
  statusLabel: m?.status_label ?? '',
  departemen: m?.departemen ?? null,
  plant: m?.plant ?? null,
  catatanPenolakan: m?.catatan_penolakan ?? null,
  metodePenyerahan: m?.metode_penyerahan ?? null,
  diajukanAt: m?.diajukan_at ?? null,
  selesaiAt: m?.selesai_at ?? null,
});

const adaptasiLangkah = (h: any): LangkahRequestAkun => ({
  aksi: h?.aksi ?? '',
  aksiLabel: h?.aksi_label ?? '',
  catatan: h?.catatan ?? null,
  oleh: h?.oleh ?? null,
  waktu: h?.waktu ?? null,
});

export const adaptasiDetailRequestAkun = (m: any): RequestAkunDetail => ({
  ...adaptasiRequestAkun(m),
  namaUser: m?.nama_user ?? '',
  usernameAkun: m?.username_akun ?? null,
  emailDiminta: m?.email_diminta ?? null,
  detailAkses: m?.detail_akses ?? null,
  keterangan: m?.keterangan ?? '',
  alasan: m?.alasan ?? '',
  metodePreferensi: m?.metode_penyerahan_preferensi ?? null,
  histori: (m?.histori ?? []).map(adaptasiLangkah),
});

export const adaptasiLacakRequestAkun = (m: any): HasilLacakRequestAkun => ({
  ...adaptasiRequestAkun(m),
  namaUser: m?.nama_user ?? '',
  nikTersamar: m?.nik_tersamar ?? '',
  milikSaya: !!m?.milik_saya,
});

export const FORM_REQUEST_AKUN_KOSONG: FormRequestAkun = {
  idPlant: null,
  idDepartemen: null,
  subDepartemen: null,
  sistem: null,
  jenis: null,
  webapps: null,
  webappsLainnya: '',
  namaSistemLainnya: '',
  emailDiminta: '',
  username: '',
  detailAkses: '',
  keterangan: '',
  alasan: '',
  metode: null,
};

/** Berlaku di plant ini? Daftar plant kosong = berlaku di semua plant (sama dengan form web). */
const diPlant = (plantIds: number[], idPlant: number | null) => !idPlant || plantIds.length === 0 || plantIds.includes(idPlant);

export const departemenUntukPlant = (daftar: DepartemenOpsi[], idPlant: number | null) =>
  daftar.filter((d) => diPlant(d.plantIds, idPlant));

export const subUntukPlant = (dept: DepartemenOpsi | undefined, idPlant: number | null) =>
  (dept?.subs ?? []).filter((s) => diPlant(s.plantIds, idPlant));

export const jenisUntukSistem = (opsi: OpsiRequestAkun | null, sistem: string | null) =>
  opsi?.sistem.find((s) => s.nama === sistem)?.jenis ?? [];

/** Sistem yang memakai kolom "Detail akses" (Gmail & HARIS tidak). */
export const pakaiDetailAkses = (sistem: string | null) => !!sistem && sistem !== 'Gmail' && sistem !== 'HARIS System';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Galat per field (kosong = aman). */
export function galatRequestAkun(f: FormRequestAkun, opsi: OpsiRequestAkun | null): GalatRequestAkun {
  const g: GalatRequestAkun = {};
  if (!f.idPlant) g.plant = 'Pilih plant.';
  if (!f.idDepartemen) g.departemen = 'Pilih departemen tujuan approval.';
  const dept = opsi?.departemen.find((d) => d.id === f.idDepartemen);
  if (subUntukPlant(dept, f.idPlant).length > 0 && !f.subDepartemen) g.sub = 'Pilih sub departemen.';
  if (!f.sistem) g.sistem = 'Pilih sistem yang terdampak.';
  if (!f.jenis) g.jenis = 'Pilih jenis permintaan.';
  if (f.sistem === 'WebApps' && !f.webapps) g.webapps = 'Pilih aplikasi WebApps yang dimaksud.';
  if (f.sistem === 'WebApps' && f.webapps === 'Lainnya' && !f.webappsLainnya.trim()) g.webappsLainnya = 'Nama aplikasi wajib diisi.';
  if (f.sistem === 'Lainnya' && !f.namaSistemLainnya.trim()) g.namaSistemLainnya = 'Nama sistem wajib diisi.';
  if (f.sistem === 'Gmail' && !EMAIL.test(f.emailDiminta.trim())) g.emailDiminta = 'Isi alamat email Gmail yang valid.';
  if (f.sistem && f.sistem !== 'Gmail' && !f.username.trim()) g.username = 'Username / ID akun wajib diisi.';
  if (!f.keterangan.trim()) g.keterangan = 'Keterangan wajib diisi.';
  if (!f.alasan.trim()) g.alasan = 'Alasan wajib diisi.';
  if (!f.metode) g.metode = 'Pilih metode penyerahan akun.';
  return g;
}

/** Jejak status untuk `LinimasaTiket`, ditambah langkah berikutnya (abu-abu) selama request masih berjalan. */
export function langkahRequestAkun(d: RequestAkunDetail): LangkahLinimasa[] {
  const langkah: LangkahLinimasa[] = d.histori.map((h, i) => ({
    id: `${i}-${h.aksi}`,
    judul: h.aksiLabel,
    isi: [h.oleh ? `Oleh ${h.oleh}` : null, h.catatan].filter((x): x is string => !!x),
    waktu: h.waktu,
    selesai: true,
  }));
  const berikutnya =
    d.status === 'pending_kabag' ? 'Menunggu persetujuan Kepala Bagian' : d.status === 'pending_it' ? 'Menunggu diproses Tim IT' : null;
  if (berikutnya) langkah.push({ id: 'berikutnya', judul: berikutnya, isi: [], waktu: null, selesai: false });
  return langkah;
}

export const LABEL_METODE: Record<string, string> = { email: 'Dikirim via email', langsung: 'Diserahkan langsung', whatsapp: 'WhatsApp' };

/** Waktu ISO → "23 Okt 2026, 09.54". */
export const formatWaktuRequest = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '-';

if (__DEV__) {
  // Pemeriksaan kecil aturan kondisional: Gmail wajib alamat email & tanpa username; sistem lain sebaliknya.
  const dasar = { ...FORM_REQUEST_AKUN_KOSONG, idPlant: 1, idDepartemen: 1, jenis: 'Penambahan Akses', keterangan: 'x', alasan: 'x', metode: 'langsung' as const };
  const gmail = galatRequestAkun({ ...dasar, sistem: 'Gmail', emailDiminta: 'salah' }, null);
  console.assert(!!gmail.emailDiminta && !gmail.username, 'galatRequestAkun Gmail');
  const nas = galatRequestAkun({ ...dasar, sistem: 'NAS' }, null);
  console.assert(!!nas.username && !nas.emailDiminta && !nas.webapps, 'galatRequestAkun NAS');
  console.assert(Object.keys(galatRequestAkun({ ...dasar, sistem: 'NAS', username: 'u' }, null)).length === 0, 'galatRequestAkun lengkap');
}
