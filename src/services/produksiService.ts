/** Pencapaian Produksi (input stroke dies) — klien endpoint `/api/aset/.../produksi/*` di api-simwt. */
import api from './api';
import { FormProduksi, JenisCariProduksi, MasterProduksi } from '../types/produksi';

const angka = (teks: string) => Number(teks.replace(',', '.')) || 0;

/** Susun payload dari isian form; `total_produksi` selalu OK + NG supaya lolos pemeriksaan silang server. */
export function buatPayloadProduksi(form: FormProduksi, mesin: string | null) {
  const ok = Math.trunc(angka(form.jumlahOk));
  const ng = Math.trunc(angka(form.jumlahNg));
  return {
    nama_operator: form.operator.trim(),
    shift: form.shift,
    nama_sub_departemen: form.subDepartemen,
    nama_leader: form.leader.trim(),
    mesin: mesin || undefined,
    kode_gudang: form.kodeGudang || undefined,
    nama_part: form.part?.label,
    nama_proses: form.proses,
    nama_sub_proses: form.subProses || undefined,
    total_produksi: ok + ng,
    jumlah_ok: ok,
    jumlah_ng: ng,
    stroke_hari_ini: angka(form.strokeHariIni),
    cap_per_jam: form.capPerJam.trim() ? Math.trunc(angka(form.capPerJam)) : undefined,
    planning_hari_ini: Math.trunc(angka(form.planning)),
    supply_material: form.material?.label,
    supply_material_qty: form.material ? angka(form.materialQty) : undefined,
    alasan_ng: form.alasanNg
      .filter((b) => b.alasan.trim() && b.qty.trim())
      .map((b) => ({ alasan: b.alasan.trim(), qty: Math.trunc(angka(b.qty)) })),
    keterangan: form.keterangan.trim() || undefined,
  };
}

export const produksiService = {
  /** Master form untuk satu dies; `mesin` (nomor) mengisi sub-departemen otomatis. */
  async form(nomorDies: string, mesin?: string | null): Promise<MasterProduksi> {
    try {
      const body = (await api.get(`/aset/${encodeURIComponent(nomorDies)}/produksi/form`, { params: { mesin: mesin || undefined } })).data;
      return body.data;
    } catch (err: any) {
      if (err.response?.status === 404) throw new Error('Aset ini bukan dies, jadi tidak bisa dicatat pencapaiannya.');
      throw new Error(err.isNetworkError ? err.message : 'Gagal memuat formulir pencapaian produksi.');
    }
  },

  /** Pencarian untuk field form; server membalas kosong bila kata kunci kurang dari 2 huruf (kecuali alasan NG). */
  async cari<T>(jenis: JenisCariProduksi, q: string): Promise<T[]> {
    const body = (await api.get(`/aset/produksi/cari/${jenis}`, { params: { q } })).data;
    return body?.data ?? [];
  },

  /** Proses yang tersedia untuk sebuah part; `sesuai_part` false = part belum dipetakan, semua proses ditampilkan. */
  async prosesPart(partId: number): Promise<{ daftar: string[]; sesuai_part: boolean }> {
    const body = (await api.get('/aset/produksi/part-proses', { params: { part_id: partId } })).data;
    return body.data;
  },

  /** Simpan pencapaian; mengembalikan akumulasi stroke dies yang baru. */
  async simpan(nomorDies: string, form: FormProduksi, mesin: string | null): Promise<number> {
    const body = (await api.post(`/aset/${encodeURIComponent(nomorDies)}/produksi`, buatPayloadProduksi(form, mesin))).data;
    return body.data.jumlah_stroke;
  },
};

export default produksiService;
