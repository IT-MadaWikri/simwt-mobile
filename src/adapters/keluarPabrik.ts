/**
 * Adapter Form Keluar Pabrik — murni (tanpa React/api/storage): merapikan respons
 * `/layanan-hrd/keluar-pabrik/*`, membuat nilai awal form, dan memvalidasi isian dengan aturan yang sama
 * seperti server (`FormKeluarPabrikController::simpan` di api-simwt).
 */
import {
  FormKeluarPabrik,
  GalatKeluarPabrik,
  HasilLacakKeluarPabrik,
  KeluarPabrikDetail,
  KeluarPabrikRingkas,
  OpsiKeluarPabrik,
} from '../types/layananHrd';
import { LangkahLinimasa } from '../types/tiket';
import { departemenUntukPlant, subUntukPlant } from './requestAkun';

export { departemenUntukPlant, subUntukPlant };

const angka = (v: any) => (v === null || v === undefined || v === '' ? null : Number(v));
const daftarAngka = (v: any): number[] => (Array.isArray(v) ? v.map(Number) : []);

export const LABEL_JENIS = { dinas: 'Dinas Kantor', pribadi: 'Keperluan Pribadi' } as const;
export const LABEL_KATEGORI = { staff_magang_pkl: 'Staff / Magang / PKL / Operator', kabag: 'Kepala Bagian (Kabag)' } as const;

export const adaptasiOpsiKeluarPabrik = (m: any): OpsiKeluarPabrik => ({
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
        kategori: m.pemohon.kategori === 'kabag' ? 'kabag' : 'staff_magang_pkl',
      }
    : null,
});

export const adaptasiKeluarPabrik = (m: any): KeluarPabrikRingkas => ({
  id: Number(m?.id),
  nomorDokumen: m?.nomor_dokumen ?? '',
  status: m?.status ?? 'menunggu',
  statusLabel: m?.status_label ?? '',
  jenisKeluar: m?.jenis_keluar === 'dinas' ? 'dinas' : 'pribadi',
  kategori: m?.kategori_pemohon === 'kabag' ? 'kabag' : 'staff_magang_pkl',
  tanggalKeluar: m?.tanggal_keluar ?? '',
  jamKeluar: m?.jam_keluar ?? '',
  jamKembali: m?.jam_kembali || null,
  departemen: m?.departemen ?? null,
  plant: m?.plant ?? null,
  catatanPenolakan: m?.catatan_penolakan ?? null,
  diajukanAt: m?.diajukan_at ?? null,
});

export const adaptasiDetailKeluarPabrik = (m: any): KeluarPabrikDetail => ({
  ...adaptasiKeluarPabrik(m),
  namaUser: m?.nama_user ?? '',
  alasan: m?.alasan ?? '',
  catatanPersetujuan: m?.catatan_persetujuan ?? null,
  disetujuiOleh: m?.disetujui_oleh ?? null,
  waktuKeluarAktual: m?.waktu_keluar_aktual ?? null,
  waktuKembaliAktual: m?.waktu_kembali_aktual ?? null,
  gerbangUrl: m?.gerbang_url ?? null,
  histori: (m?.histori ?? []).map((h: any) => ({
    aksi: h?.aksi ?? '',
    catatan: h?.catatan ?? null,
    oleh: h?.oleh ?? null,
    waktu: h?.waktu ?? null,
  })),
});

export const adaptasiLacakKeluarPabrik = (m: any): HasilLacakKeluarPabrik => ({
  ...adaptasiKeluarPabrik(m),
  namaUser: m?.nama_user ?? '',
  nikTersamar: m?.nik_tersamar ?? '',
  milikSaya: !!m?.milik_saya,
});

const dua = (n: number) => String(n).padStart(2, '0');

/** Tanggal lokal 'YYYY-MM-DD' dan jam lokal 'HH:mm' — sama dengan nilai awal form web (hari ini, sekarang). */
export const hariIni = (d = new Date()) => `${d.getFullYear()}-${dua(d.getMonth() + 1)}-${dua(d.getDate())}`;
export const jamSekarang = (d = new Date()) => `${dua(d.getHours())}:${dua(d.getMinutes())}`;

export const formKeluarPabrikKosong = (): FormKeluarPabrik => ({
  kategori: 'staff_magang_pkl',
  idPlant: null,
  idDepartemen: null,
  subDepartemen: null,
  tanggal: hariIni(),
  jamKeluar: jamSekarang(),
  jamKembali: '',
  jenis: null,
  alasan: '',
});

/** Galat per field (kosong = aman). */
export function galatKeluarPabrik(f: FormKeluarPabrik, opsi: OpsiKeluarPabrik | null): GalatKeluarPabrik {
  const g: GalatKeluarPabrik = {};
  if (!f.idPlant) g.plant = 'Pilih plant.';
  if (!f.idDepartemen) g.departemen = 'Pilih departemen.';
  const dept = opsi?.departemen.find((d) => d.id === f.idDepartemen);
  if (subUntukPlant(dept, f.idPlant).length > 0 && !f.subDepartemen) g.sub = 'Pilih sub departemen.';
  if (!f.jenis) g.jenis = 'Pilih jenis keluar.';
  if (!f.alasan.trim()) g.alasan = 'Alasan keluar pabrik wajib diisi.';
  return g;
}

/** Jejak status untuk `LinimasaTiket`, ditambah langkah berikutnya (abu-abu) selama form masih menunggu. */
export function langkahKeluarPabrik(d: KeluarPabrikDetail): LangkahLinimasa[] {
  const langkah: LangkahLinimasa[] = d.histori.map((h, i) => ({
    id: `${i}-${h.aksi}`,
    judul: h.aksi,
    isi: [h.oleh ? `Oleh ${h.oleh}` : null, h.catatan].filter((x): x is string => !!x),
    waktu: h.waktu,
    selesai: true,
  }));
  if (d.status === 'menunggu') {
    const pemberi = d.kategori === 'kabag' ? 'Manager Plant atau HRD' : 'Leader, Kepala Bagian, atau HRD';
    langkah.push({ id: 'berikutnya', judul: `Menunggu persetujuan ${pemberi}`, isi: [], waktu: null, selesai: false });
  }
  return langkah;
}

const BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

/** 'YYYY-MM-DD' → "23 Okt 2026". */
export const formatTanggalKeluar = (v: string) => {
  const [t, b, h] = v.split('-').map(Number);
  return t ? `${h} ${BULAN[b - 1]} ${t}` : '-';
};

/** Jam keluar & kembali → "09.00 – 12.00" atau "09.00" bila tidak kembali. */
export const formatRentangJam = (keluar: string, kembali: string | null) =>
  [keluar, kembali].filter(Boolean).join(' – ').replace(/:/g, '.');

/** Waktu ISO → "23 Okt 2026, 09.54". */
export const formatWaktuKeluarPabrik = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '-';

if (__DEV__) {
  // Pemeriksaan kecil aturan form: kosong → plant, departemen, jenis, alasan wajib.
  const kosong = galatKeluarPabrik(formKeluarPabrikKosong(), null);
  console.assert(!!kosong.plant && !!kosong.departemen && !!kosong.jenis && !!kosong.alasan, 'galatKeluarPabrik kosong');
  const lengkap = { ...formKeluarPabrikKosong(), idPlant: 1, idDepartemen: 1, jenis: 'dinas' as const, alasan: 'x' };
  console.assert(Object.keys(galatKeluarPabrik(lengkap, null)).length === 0, 'galatKeluarPabrik lengkap');
}
