export interface KaizenPlant {
  id: number;
  nama: string;
}

export interface KaizenDepartemen {
  id: number;
  nama: string;
}

export interface Kaizen {
  id: number;
  nomor?: string;
  tema: string;
  disarankan_oleh?: string;
  disetujui_oleh?: string | null;
  nama_pelaksana: string;
  nik_nama_pelaksana: string;
  id_departemen: number;
  id_plant: number;
  status: 'DITERIMA' | 'DISETUJUI' | 'DITOLAK' | string;
  alasan?: string;
  created_at: string;
  plant?: KaizenPlant;
  departemen?: any;
  department?: any;
  departemenUser?: any;
  nama_departemen?: string;
  nilai?: number;
  foto_kondisi_sebelum?: string;
  foto_kondisi_sesudah?: string;
  kondisi_sebelum?: string;
  kondisi_sesudah?: string;

  /**
   * Nama field alternatif yang dikembalikan endpoint detail
   * (`GET /kaizen/data/{idKaizen}`) — berdampingan dengan pasangan
   * `*_kondisi_*` di atas, tidak selalu keduanya terisi. Layar detail
   * membaca keempatnya, jadi keempatnya harus ada di tipe ini.
   */
  detail_sebelum?: string;
  detail_sesudah?: string;
  foto_sebelum?: string;
  foto_sesudah?: string;
}

export interface KaizenDashboardData {
  jumlahKaizen: number;
  jumlahMasuk: number;
  jumlahDiterima: number;
  jumlahDisetujui: number;
  rataRataPerBulan: number;
  tingkatPenerimaan: number;
  tahunSekarang: string;
  tahunFilter: string;
  plantFilter: string | null;
  availableYears: number[];
  plants: KaizenPlant[];
  departemenTargets: any[];
  chartAktualPerBulan: number[];
  chartTargetPerBulan: number[];
  chartPencapaianPerBulan: number[];
  kaizens: Kaizen[];
}

export interface KaizenFilterData {
  plants: KaizenPlant[];
  departemens: KaizenDepartemen[];
  tahuns: number[];
}

export interface KaizenManfaat {
  id: number;
  sebelum: string;
  sesudah: string;
  hemat: string | null;
  area: string;
  pic: string | null;
  tipe_area: string | null;
  manfaat_nilai?: { id: number; kategori: string } | null;
}

export interface KaizenKriteria {
  nama: string;
  kriteria: string;
  nilai_max: number;
}

export interface KaizenDetail {
  kaizen: Kaizen & { approval_oleh?: string | null; tgl_approve?: string | null; dinilai_oleh?: string | null };
  manfaats: KaizenManfaat[];
  jumlahManfaat: number;
  kategoriNilai: Record<string, number>;
  totalKategoriNilai: number;
  nilaiPanitia: {
    nilai_panitia: number;
    nilai_final: number;
    nilai_pelaksanaan?: number | null;
    dinilai_oleh?: string;
    /** Gambar QR bukti Kaizen (URL siap pakai dari server). */
    qr_code_url?: string | null;
  } | null;
  nilaiFinal: { total_nilai: number } | null;
  kriteriaPenilaian: KaizenKriteria[];
  /** Hak pengguna atas Kaizen ini, dihitung server. */
  izin?: { approve: boolean; nilai: boolean; reset: boolean };
}

export interface KaizenListPage {
  data: Kaizen[];
  current_page: number;
  last_page: number;
  total: number;
}

export interface KaizenGift {
  id: number;
  nama_gift: string;
  harga_gift: number;
  gambar?: string | null;
  /** URL siap pakai dari server; `gambar` hanya path relatif. */
  gambar_url?: string | null;
}

export interface KaizenRedeem {
  id: number;
  kode_redeem: string;
  status_redeem: 'Diproses' | 'Gift Ready' | 'Diterima' | 'Dibatalkan' | string;
  alasan_dibatalkan?: string | null;
  created_at: string;
  gift?: KaizenGift | null;
}

export interface KaizenPoin {
  poin: number;
  jumlah_kaizen: number;
  nilai_tertinggi: number;
  /** Total nilai manfaat per kategori PQCDSM dari semua Kaizen milik akun. */
  pqcdsm?: Record<string, number>;
  /** Hutang Kaizen tahun berjalan; 12 keadaan periode, Jan..Des. Null bila akun belum terhubung ke karyawan. */
  hutang?: {
    tahun: number;
    terlewat: number;
    keadaan: ('ada' | 'kosong' | 'berjalan' | 'belum-mulai' | 'belum-wajib')[];
  } | null;
  gifts: KaizenGift[];
  riwayat: KaizenRedeem[];
}

export interface KaizenPeringkat {
  nama: string;
  jumlah: number;
}

export interface KaizenTop {
  tahun: number;
  pelaksana: KaizenPeringkat[];
  departemen: KaizenPeringkat[];
}

/** Pilihan untuk formulir Buat Kaizen. */
export interface KaizenOpsiBuat {
  kategori: { id: number; kategori: string }[];
  departemen: { id: number; nama: string; kode: string | null; id_departemen_induk: number | null }[];
  id_departemen: number | null;
  plant: { id: number; nama: string; kode: string | null } | null;
}

/** Hasil cari karyawan (Pelaksana, Disarankan oleh, PIC). */
export interface KaryawanRingkas {
  nik: string;
  nama: string;
  phone: string | null;
  email: string | null;
}
