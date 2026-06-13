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
  tema: string;
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

export interface KaizenDetail {
  kaizen: Kaizen;
  manfaats: any[];
  jumlahManfaat: number;
  kategoriNilai: Record<string, number>;
  totalKategoriNilai: number;
  nilaiPanitia: any;
  nilaiFinal: any;
}
