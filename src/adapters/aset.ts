/**
 * Adapter data opsional aset (`assets.extra_data`): spesifikasi teknis per kategori
 * (`spesifikasi`, kunci → nilai) dan "Data Lainnya" bebas (`tambahan`, daftar nama/nilai).
 * Api-simwt mengirim kolom JSON ini apa adanya, bisa berupa string. Label mengikuti
 * `SpesifikasiAsetRegistry` di sim-mwt; kunci yang belum dikenal dirapikan dari namanya.
 */
import type { BarisInfoAset } from '../types/aset';

const LABEL: Record<string, string> = {
  processor: 'Processor',
  ram: 'RAM',
  storage_ssd_gb: 'SSD',
  storage_hdd_gb: 'HDD',
  vga: 'VGA',
  os_version: 'Sistem Operasi',
  mac_address: 'MAC Address',
  nomor_mesin: 'Nomor Mesin',
  kapasitas: 'Kapasitas',
  tegangan_vac: 'Tegangan',
  daya_kw: 'Daya',
  tahun_pembuatan: 'Tahun Pembuatan',
  dimensi: 'Dimensi (P x L x T)',
  nomor_polisi: 'Nomor Polisi',
  nomor_rangka: 'Nomor Rangka',
  tahun_kendaraan: 'Tahun',
  bahan_bakar: 'Bahan Bakar',
  warna: 'Warna',
  masa_stnk: 'Masa Berlaku STNK',
  masa_kir: 'Masa Berlaku KIR',
  ip_address: 'Alamat IP',
  lokasi_pasang: 'Lokasi Pemasangan',
  jumlah_kanal: 'Jumlah Kanal / Port',
  resolusi: 'Resolusi',
  catatan_teknis: 'Catatan Teknis',
  tipe_cetak: 'Jenis Cetak',
  ukuran_kertas: 'Ukuran Kertas Maksimum',
  tipe_tinta: 'Tinta / Toner',
  koneksi: 'Koneksi',
  imei: 'IMEI',
  nomor_seluler: 'Nomor Seluler',
  penyimpanan_gb: 'Penyimpanan',
  lumens: 'Kecerahan',
  jam_lampu: 'Jam Pakai Lampu',
  versi: 'Versi',
  serial_lisensi: 'Serial Number / Kunci Lisensi',
  jumlah_seat: 'Jumlah Seat',
};

const SATUAN: Record<string, string> = {
  storage_ssd_gb: 'GB',
  storage_hdd_gb: 'GB',
  penyimpanan_gb: 'GB',
  tegangan_vac: 'VAC',
  daya_kw: 'kW',
  lumens: 'lumens',
  jam_lampu: 'jam',
};

const rapikanKunci = (kunci: string) => kunci.replace(/_/g, ' ').replace(/\b\w/g, (h) => h.toUpperCase());

const urai = (mentah: unknown): unknown => {
  if (typeof mentah !== 'string') return mentah;
  try {
    return JSON.parse(mentah);
  } catch {
    return null;
  }
};

const keObjek = (nilai: unknown): Record<string, unknown> =>
  nilai && typeof nilai === 'object' && !Array.isArray(nilai) ? (nilai as Record<string, unknown>) : {};

export function adaptasiExtraData(mentah: unknown): { spesifikasi: BarisInfoAset[]; tambahan: BarisInfoAset[] } {
  const bruto = urai(mentah);
  const extra = keObjek(bruto);

  const spesifikasi = Object.entries(keObjek(extra.spesifikasi))
    .filter(([, nilai]) => nilai !== null && nilai !== undefined && String(nilai).trim() !== '')
    .map(([kunci, nilai]) => ({
      label: LABEL[kunci] ?? rapikanKunci(kunci),
      nilai: SATUAN[kunci] ? `${nilai} ${SATUAN[kunci]}` : String(nilai),
    }));

  // Bentuk baru: `tambahan`; bentuk lama: daftar polos nama/nilai di akar.
  const baris = Array.isArray(extra.tambahan) ? extra.tambahan : Array.isArray(bruto) ? bruto : [];
  const tambahan = (baris as { nama?: unknown; nilai?: unknown }[])
    .filter((b) => b && typeof b === 'object' && b.nama && b.nilai !== undefined && String(b.nilai).trim() !== '')
    .map((b) => ({ label: String(b.nama), nilai: String(b.nilai) }));

  return { spesifikasi, tambahan };
}
