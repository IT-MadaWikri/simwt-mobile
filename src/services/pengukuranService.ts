/**
 * Pengukuran QC — klien endpoint `master-data/*` (part, proses, bisnis partner, karyawan) dan
 * `transaksi/pengukuran` di api-simwt (`/pengukuran-qc/*`). Autentikasinya token akun; server menurunkan
 * plant dari `pengguna.plant` (middleware `plant.pengguna`), jadi tidak ada kunci atau aktivasi perangkat.
 *
 * Payload kirim selalu `periods[]` (Final Inspection mengirim satu periode 'Awal'); logika
 * susunnya ada di `buatPayloadPengukuran` supaya layar cukup menyambung state → payload → `kirim`.
 */
import api from './api';
import { storage } from '../utils/storage';
import {
  normalisasiChecker,
  normalisasiDetailPart,
  normalisasiOpsiBisnisPartnerFilter,
  normalisasiOpsiProsesFilter,
  normalisasiPart,
} from '../adapters/part';
import { normalisasiDetailTerkirim } from '../adapters/terkirim';
import { buatMeasurementsPerPeriode } from '../utils/pengukuran';
import {
  Checker,
  DetailPart,
  DetailTerkirim,
  FilterPart,
  FilterTerkirim,
  FormInfo,
  HalamanPart,
  HalamanTerkirim,
  NilaiPengukuran,
  OpsiBisnisPartner,
  PayloadPengukuran,
  Periode,
  PilihanAlat,
  PengukuranTerkirim,
  ProsesPart,
  StandarPengukuran,
} from '../types/pengukuran';

/** Respons bisa berupa array langsung, `{ data: [...] }`, atau paginator Laravel. */
const ambilDaftar = (body: any): any[] => (Array.isArray(body) ? body : Array.isArray(body?.data) ? body.data : []);
const ambilTotal = (body: any): number => Number(body?.total ?? body?.meta?.total ?? 0);

/**
 * Akun tanpa plant tidak boleh memuat data QC (server juga menolak dengan 403); dicek di sini supaya
 * pesannya jelas tanpa menunggu jaringan. Dari data akun yang tersimpan di perangkat.
 */
async function pastikanPlant(): Promise<void> {
  const user = await storage.getUser();
  if (!user?.plant) throw new Error('Akun belum terhubung ke plant. Hubungi admin.');
}

export interface ArgBuatPayload {
  isFinalInspection: boolean;
  detailPart: Pick<DetailPart, 'id'>;
  idProses: number | string | null;
  formInfo: FormInfo;
  daftarPeriodePengisian: Periode[];
  dimensiStandards: StandarPengukuran[];
  visualStandards: StandarPengukuran[];
  measurementForm: NilaiPengukuran;
  selectedToolIds: PilihanAlat;
}

export function buatPayloadPengukuran({
  isFinalInspection,
  detailPart,
  idProses,
  formInfo,
  daftarPeriodePengisian,
  dimensiStandards,
  visualStandards,
  measurementForm,
  selectedToolIds,
}: ArgBuatPayload): PayloadPengukuran {
  const buatPeriods = (daftar: Periode[]) =>
    daftar.map((periode) => ({
      periode,
      measurements: buatMeasurementsPerPeriode({ periode, dimensiStandards, visualStandards, measurementForm, selectedToolIds }),
    }));

  const dasar = {
    part_id: detailPart.id,
    id_proses: idProses,
    checker: formInfo.checkerName,
    tanggal: new Date().toISOString().split('T')[0],
  };

  if (isFinalInspection) {
    return { ...dasar, no_lot: formInfo.lotNumber, periode: 'Awal', shift: 'Shift 1', periods: buatPeriods(['Awal']) };
  }

  return {
    ...dasar,
    shift: formInfo.shift,
    ...(daftarPeriodePengisian.includes('Awal') ? { waktu_awal: formInfo.waktuAwal } : {}),
    ...(daftarPeriodePengisian.includes('Tengah') ? { waktu_tengah: formInfo.waktuTengah } : {}),
    ...(daftarPeriodePengisian.includes('Akhir') ? { waktu_akhir: formInfo.waktuAkhir } : {}),
    periods: buatPeriods(daftarPeriodePengisian),
  };
}

/** Parameter pencarian opsi filter: kata kunci + batas hasil (maks 50). */
const paramOpsi = (search: string, limit: number) => ({
  search: search.trim() || undefined,
  limit: Number.isFinite(limit) && limit > 0 ? Math.min(limit, 50) : undefined,
});

export const pengukuranService = {
  async daftarPart(filter: FilterPart, page: number): Promise<HalamanPart> {
    await pastikanPlant();
    const response = await api.get('/pengukuran-qc/part', {
      params: {
        search: filter.search || undefined,
        // axios menulis array sebagai `proses[]=a&proses[]=b`, bentuk yang dibaca Laravel.
        proses: filter.proses.length ? filter.proses : undefined,
        bisnis_partner: filter.bisnisPartner.length ? filter.bisnisPartner : undefined,
        page,
      },
    });
    return { items: ambilDaftar(response.data).map(normalisasiPart), total: ambilTotal(response.data), page };
  },

  async detailPart(id: number | string): Promise<DetailPart | null> {
    await pastikanPlant();
    const response = await api.get(`/pengukuran-qc/part/${id}`);
    return normalisasiDetailPart(response.data);
  },

  async cariProses(search = '', limit = 20): Promise<ProsesPart[]> {
    await pastikanPlant();
    const response = await api.get('/pengukuran-qc/proses', { params: paramOpsi(search, limit) });
    return normalisasiOpsiProsesFilter(ambilDaftar(response.data));
  },

  async cariBisnisPartner(search = '', limit = 20): Promise<OpsiBisnisPartner[]> {
    await pastikanPlant();
    const response = await api.get('/pengukuran-qc/bisnis-partner', { params: paramOpsi(search, limit) });
    return normalisasiOpsiBisnisPartnerFilter(ambilDaftar(response.data));
  },

  async cariChecker(nama = ''): Promise<Checker[]> {
    await pastikanPlant();
    const response = await api.get('/pengukuran-qc/checker', { params: { nama: nama.trim() || undefined } });
    return normalisasiChecker(ambilDaftar(response.data));
  },

  async daftarTerkirim(filter: FilterTerkirim, page: number): Promise<HalamanTerkirim> {
    await pastikanPlant();
    const response = await api.get('/pengukuran-qc/riwayat', {
      params: {
        page,
        search: filter.search || undefined,
        judgment: filter.judgment || undefined,
        start_date: filter.tanggalMulai || undefined,
        end_date: filter.tanggalSelesai || undefined,
      },
    });
    return { items: ambilDaftar(response.data) as PengukuranTerkirim[], total: ambilTotal(response.data), page };
  },

  async detailTerkirim(id: number | string): Promise<DetailTerkirim | null> {
    await pastikanPlant();
    const response = await api.get(`/pengukuran-qc/riwayat/${id}`);
    return normalisasiDetailTerkirim(response.data);
  },

  /** Mengembalikan data transaksi baru (mis. `kode_unik`). Melempar Error berpesan yang bisa langsung ditampilkan. */
  async kirim(payload: PayloadPengukuran): Promise<{ kode_unik?: string }> {
    await pastikanPlant();
    try {
      const response = await api.post('/pengukuran-qc/riwayat', payload);
      return response.data?.data ?? response.data ?? {};
    } catch (e) {
      const err = e as { response?: { data?: { message?: string; errors?: Record<string, string[]> } }; message?: string };
      const galatField = Object.values(err.response?.data?.errors ?? {})[0]?.[0];
      throw new Error(galatField || err.response?.data?.message || err.message || 'Pengukuran belum bisa dikirim. Coba lagi.');
    }
  },
};

export default pengukuranService;
