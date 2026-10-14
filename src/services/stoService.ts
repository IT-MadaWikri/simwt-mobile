/**
 * Stok Opname — klien untuk endpoint `/api/sto` di api-simwt.
 *
 * Kontrak: sim-mwt/docs/sto/scan/02-kontrak-api.md
 * Cakupan saat ini adalah metode STO yang BERJALAN (spreadsheet + editor
 * native di web). Endpoint tulis alur scan belum ada di server.
 */
import api from './api';
import { API_CONFIG } from '../../constants/Api';

export interface StoPeriode {
  id: number;
  judul: string;
  bulan: number | null;
  tahun: number | null;
  status: 'draft' | 'in_progress' | 'completed';
  akurasi: number | null;
  total_item: number | null;
  item_cocok: number | null;
  jumlah_lembar: number;
  plant: { id: number; nama: string } | null;
  departemen: string | null;
  diimpor_pada: string | null;
}

export interface StoLembar {
  id: number;
  kode: string;
  nama: string | null;
  kategori: string | null;
  kode_gudang: string | null;
  urutan: number;
  akurasi: number | null;
  jumlah_baris: number;
  sudah_dihitung: number;
  belum_dihitung: number;
  disinkron_pada: string | null;
}

export interface StoBaris {
  id: number;
  urutan: number;
  kode_part: string | null;
  nama_part: string | null;
  satuan: string | null;
  gudang: string | null;
  lokasi: string | null;
  qty_sistem: number | null;
  /** NULL = belum dihitung. 0 = sudah dihitung, hasilnya nol. Jangan disamakan. */
  qty_saat_ini: number | null;
  tanda: string | null;
}

export interface StoPaket {
  periode: { id: number; judul: string; status: string; boleh_diisi: boolean };
  lembar: {
    id: number;
    kode: string;
    nama: string | null;
    kode_gudang: string | null;
    pakai_lokasi: boolean;
  };
  lokasi: string[];
  baris: StoBaris[];
  jumlah_baris: number;
  versi: string | null;
}

export const stoService = {
  /** Periode STO milik plant pengguna. */
  async periode(): Promise<StoPeriode[]> {
    const response = await api.get(API_CONFIG.ENDPOINTS.STO_PERIODE);
    return response.data?.data ?? [];
  },

  /** Lembar satu periode beserta progres pengisiannya. */
  async lembar(idPeriode: number): Promise<{ periode: any; lembar: StoLembar[] }> {
    const response = await api.get(
      `${API_CONFIG.ENDPOINTS.STO_PERIODE}/${idPeriode}/lembar`
    );
    return response.data?.data ?? { periode: null, lembar: [] };
  },

  /**
   * Unduhan satu lembar untuk dipakai offline.
   *
   * ⚠️ `qty_sistem` yang ikut terbawa adalah angka SAP. JANGAN tampilkan saat
   * PIC sedang memasukkan hitungan — kalau terlihat, angka sistem cenderung
   * disalin dan hasil STO jadi terlihat sempurna tanpa pernah diverifikasi.
   * Tampilkan hanya SESUDAH angka dimasukkan, sebagai peringatan selisih.
   */
  async paket(idLembar: number): Promise<StoPaket> {
    const response = await api.get(
      `${API_CONFIG.ENDPOINTS.STO_LEMBAR}/${idLembar}/paket`
    );
    return response.data.data;
  },
};

export default stoService;
