/**
 * Tipe domain Pengukuran QC: master part & standar pengukuran dari
 * `GET /master-data/master-part-produksi`, isian form, draf lokal, dan payload kirim.
 */

export type Periode = 'Awal' | 'Tengah' | 'Akhir';
export type JenisTitik = 'dimensi' | 'visual';
export type StatusPeriode = 'kosong' | 'sebagian' | 'lengkap';
export type Judgement = 'OK' | 'NG';

export interface ProsesPart {
  id: number | null;
  proses: string;
}

export interface AlatUkur {
  id: number;
  nama: string;
  tipe_input: string;
  standar_min?: string | number | null;
  standar_max?: string | number | null;
  opsi_radio?: unknown;
  target_string: string | null;
}

/** Satu titik ukur (dimensi atau visual) pada sebuah proses. */
export interface StandarPengukuran {
  id: number;
  proses_id?: number | null;
  nama_point: string;
  tipe_input: string;
  sample_count: number;
  is_critical: boolean;
  nomor_drawing: string;
  simbol_target: string | null;
  target_string: string | null;
  standar_min: string | null;
  standar_max: string | null;
  opsi_radio: string[] | null;
  tools: AlatUkur[];
  /** Nama proses bila backend mengirimnya sebagai objek/teks, bukan `proses_id`. */
  proses?: string | { proses?: string; nama?: string } | null;
}

export interface DrawingPart {
  id?: number | string;
  proses_id?: number | null;
  drawing_path?: string | null;
}

/** Baris di daftar part. */
export interface Part {
  id: number;
  kode: string;
  nama: string;
  jenis: string;
  proses: ProsesPart[] | null;
  nama_bisnis_partner: string;
  nama_customer: string;
  jumlah_standar_pengukuran: number;
  /** Path relatif di storage api-simwt (lihat `buatUrlStorageApi`); null bila part tak punya gambar. */
  gambar_part: string | null;
}

export interface DetailPart extends Omit<Part, 'jumlah_standar_pengukuran'> {
  standar_pengukuran: StandarPengukuran[];
  drawings: DrawingPart[];
}

export interface HalamanPart {
  items: Part[];
  total: number;
  page: number;
}

export interface FilterPart {
  search: string;
  proses: string[];
  bisnisPartner: number[];
}

export interface OpsiBisnisPartner {
  id: number;
  nama: string;
  code: string;
  jenis_bp: string;
}

export interface Checker {
  id: string | number;
  name: string;
  nik: string;
}

/** Baris riwayat pengukuran terkirim. */
export interface PengukuranTerkirim {
  id: number;
  nama_part: string | null;
  nama_checker: string | null;
  tanggal_dikirim: string | null;
  status?: string | null;
  judgment: 'OK' | 'NG' | null;
}

export interface HalamanTerkirim {
  items: PengukuranTerkirim[];
  total: number;
  page: number;
}

export interface FilterTerkirim {
  search: string;
  judgment: '' | 'OK' | 'NG' | 'Pending';
  tanggalMulai: string;
  tanggalSelesai: string;
}

export interface FormInfo {
  lotNumber: string;
  checkerName: string;
  shift: string;
  waktuAwal: string;
  waktuTengah: string;
  waktuAkhir: string;
}

/** Nilai isian: kunci dari `buatKeyMeasurement` / `buatKeyTool`. */
export type NilaiPengukuran = Record<string, string>;
export type PilihanAlat = Record<string, number | string>;

export interface KonfigurasiInput {
  tipeInput: string;
  standarMin: number;
  standarMax: number;
  targetString: string;
  opsiRadio: string[];
}

export interface NilaiTerkirim {
  value_input: string;
  judgement: Judgement;
  alat_ukur_id: number | string;
}

export interface MeasurementGroup {
  standar_pengukuran_id: number;
  values: NilaiTerkirim[];
}

export interface PayloadPengukuran {
  part_id: number;
  id_proses: number | string | null;
  checker: string;
  tanggal: string;
  shift: string;
  no_lot?: string;
  periode?: Periode;
  waktu_awal?: string;
  waktu_tengah?: string;
  waktu_akhir?: string;
  periods: { periode: Periode; measurements: MeasurementGroup[] }[];
}

/** Draf yang disimpan di perangkat; satu draf = satu isian yang belum dikirim. */
export interface DrafPengukuran {
  id: string;
  createdAt: string;
  updatedAt: string;
  draftName: string;
  draftDescription: string;
  partId: number;
  partCode: string;
  partName: string;
  customer: string;
  processId: number | null;
  processName: string;
  process: string;
  formInfo: FormInfo;
  activePeriod: Periode;
  activePeriods: Periode[];
  measurements: NilaiPengukuran;
  selectedTools: PilihanAlat;
}

/** Bisnis partner yang dipilih di filter part (nama disimpan agar chip tetap terbaca saat sheet dibuka lagi). */
export type PilihanBisnisPartner = Pick<OpsiBisnisPartner, 'id' | 'nama'>;

export interface SampelTerkirim {
  nilai: string;
  judgement: Judgement | null;
}

/** Sampel satu titik ukur pada satu periode, dengan alat yang dipakai. */
export interface KelompokHasil {
  kunci: string;
  periode: string;
  nama: string;
  drawing: string;
  alat: string;
  target: string;
  sampel: SampelTerkirim[];
}

export interface TahapApproval {
  kunci: 'inspected' | 'checked' | 'approved';
  label: string;
  oleh: string | null;
  pada: string | null;
}

/** Detail satu pengukuran terkirim, sudah dirapikan untuk layar. */
export interface DetailTerkirim {
  id: number;
  kodeUnik: string;
  judgment: Judgement | null;
  tanggal: string | null;
  shift: string;
  periode: string;
  diukurOleh: string;
  lotNo: string;
  partNama: string;
  partKode: string;
  approval: TahapApproval[];
  hasil: KelompokHasil[];
}
