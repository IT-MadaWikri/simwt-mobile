/**
 * Approval Center — antrean persetujuan yang menunggu keputusan pengguna.
 *
 * Daftarnya dibaca dari satu endpoint gabungan (`GET /approval`), tetapi
 * TINDAKAN setuju/tolak memakai endpoint milik modul masing-masing. Itu
 * disengaja: hanya ada satu jalur yang boleh mengubah data tiap modul,
 * lengkap dengan efek sampingnya (email approval, notifikasi, dsb).
 */
import api from './api';

export type JenisApproval = 'kaizen' | 'tiket';

export interface ItemApproval {
  id: number;
  jenis: JenisApproval;
  nomor: string | null;
  judul: string;
  pengaju: string | null;
  keterangan: string | null;
  tanggal: string | null;
}

export interface RingkasanApproval {
  total: number;
  kaizen: number;
  tiket: number;
}

export const approvalService = {
  async antrean(): Promise<{
    ringkasan: RingkasanApproval;
    kaizen: ItemApproval[];
    tiket: ItemApproval[];
  }> {
    const response = await api.get('/approval');
    const data = response.data?.data;
    return {
      ringkasan: data?.ringkasan ?? { total: 0, kaizen: 0, tiket: 0 },
      kaizen: data?.kaizen ?? [],
      tiket: data?.tiket ?? [],
    };
  },

  /** Setujui satu Kaizen. */
  async setujuiKaizen(id: number): Promise<void> {
    await api.get(`/kaizen/${id}/approve`);
  },

  /** Tolak satu Kaizen — alasan WAJIB diisi (divalidasi server). */
  async tolakKaizen(id: number, alasan: string): Promise<void> {
    await api.post(`/kaizen/${id}/reject`, { alasan });
  },

  /** Tandai tiket mulai diproses (PENDING → PROSES). */
  async prosesTiket(id: number): Promise<void> {
    await api.get(`/tiket/${id}/proses`);
  },
};

export default approvalService;
