/**
 * Adapter respons master part produksi (`PartProduksiService::ambilPart` & `ambilPartById`).
 *
 * Backend sudah menormalkan bentuknya (proses selalu `[{id, proses}]|null`, `is_critical` boolean,
 * `sample_count` integer, `opsi_radio` array, tools dari `getToolsWithConfig()`), jadi di sini tinggal
 * memastikan tipe & nilai default yang aman untuk UI. Bila bentuk API berubah, ubah adapter ini —
 * jangan menambah fallback nama kunci. Tanpa React, api, atau storage.
 */
import {
  AlatUkur,
  Checker,
  DetailPart,
  OpsiBisnisPartner,
  Part,
  ProsesPart,
  StandarPengukuran,
} from '../types/pengukuran';

type Mentah = Record<string, any>;

const adalahObjek = (nilai: unknown): nilai is Mentah => !!nilai && typeof nilai === 'object';

const angkaAtauNull = (nilai: unknown): number | null => {
  const angka = Number(nilai);
  return nilai !== null && nilai !== undefined && nilai !== '' && Number.isFinite(angka) ? angka : null;
};

const teksAtauNull = (nilai: unknown) => (nilai !== undefined && nilai !== null ? String(nilai) : null);

/** Titik critical minimal 5 sampel (aturan QC); tanpa `sample_count`: 5 bila critical, selain itu 3. */
const ambilSampleCount = (item: Mentah): number => {
  const critical = Boolean(item?.is_critical);
  const angka = Number(item?.sample_count);
  const sampleCount = Number.isFinite(angka) && angka > 0 ? angka : 0;

  if (sampleCount > 0) return critical ? Math.max(sampleCount, 5) : sampleCount;
  return critical ? 5 : 3;
};

const normalisasiAlat = (tool: Mentah, induk: Mentah): AlatUkur => ({
  id: tool?.id,
  nama: tool?.nama || '-',
  tipe_input: tool?.tipe_input || induk?.tipe_input || 'number',
  standar_min: tool?.standar_min ?? induk?.standar_min,
  standar_max: tool?.standar_max ?? induk?.standar_max,
  opsi_radio: tool?.opsi_radio ?? induk?.opsi_radio,
  target_string: tool?.target_string ?? null,
});

const normalisasiStandar = (item: Mentah = {}): StandarPengukuran => {
  const sampleCount = ambilSampleCount(item);

  return {
    ...item,
    id: item?.id,
    nama_point: item?.nama_point || '',
    tipe_input: item?.tipe_input || 'number',
    sample_count: sampleCount,
    is_critical: Boolean(item?.is_critical) || sampleCount >= 5,
    nomor_drawing: String(item?.nomor_drawing ?? '-'),
    simbol_target: item?.simbol_target ?? null,
    target_string: item?.target_string ?? null,
    standar_min: teksAtauNull(item?.standar_min),
    standar_max: teksAtauNull(item?.standar_max),
    opsi_radio: Array.isArray(item?.opsi_radio) ? item.opsi_radio : null,
    tools: Array.isArray(item?.tools) ? item.tools.map((tool: Mentah) => normalisasiAlat(tool, item)) : [],
  };
};

export const normalisasiProsesPart = (proses: unknown): ProsesPart[] | null => {
  if (!Array.isArray(proses)) return null;

  const hasil = proses
    .map((item): ProsesPart | null => {
      const nama = typeof item?.proses === 'string' ? item.proses : typeof item?.nama === 'string' ? item.nama : '';
      return nama ? { id: angkaAtauNull(item?.id), proses: nama } : null;
    })
    .filter((item): item is ProsesPart => item !== null);

  return hasil.length > 0 ? hasil : null;
};

/** Baris daftar part. */
export const normalisasiPart = (item: Mentah): Part => {
  const namaBisnisPartner: string = item?.nama_bisnis_partner ?? '';
  return {
    ...item,
    id: item?.id,
    kode: item?.kode ?? '',
    nama: item?.nama ?? '',
    nama_bisnis_partner: namaBisnisPartner,
    nama_customer: item?.nama_customer || namaBisnisPartner,
    jenis: typeof item?.jenis === 'string' ? item.jenis : '',
    proses: normalisasiProsesPart(item?.proses),
    jumlah_standar_pengukuran: item?.standar_pengukuran_count || 0,
    gambar_part: item?.gambar_part || null,
  };
};

export const normalisasiDetailPart = (mentah: unknown): DetailPart | null => {
  const data: Mentah | null = adalahObjek(mentah) ? (adalahObjek(mentah.data) ? mentah.data : mentah) : null;
  if (!data) return null;

  const namaBisnisPartner: string = data.nama_bisnis_partner ?? '';

  return {
    ...data,
    id: data.id,
    kode: data.kode ?? '',
    nama: data.nama ?? '',
    nama_bisnis_partner: namaBisnisPartner,
    nama_customer: data.nama_customer || namaBisnisPartner,
    jenis: typeof data.jenis === 'string' ? data.jenis : '',
    proses: normalisasiProsesPart(data.proses),
    standar_pengukuran: Array.isArray(data.standar_pengukuran) ? data.standar_pengukuran.map(normalisasiStandar) : [],
    drawings: Array.isArray(data.drawings) ? data.drawings : [],
    gambar_part: data.gambar_part || null,
  };
};

/** Opsi filter proses: buang duplikat (id bila ada, selain itu nama). */
export const normalisasiOpsiProsesFilter = (proses: unknown): ProsesPart[] => {
  if (!Array.isArray(proses)) return [];

  const peta = new Map<string, ProsesPart>();
  proses.forEach((item) => {
    if (!adalahObjek(item)) return;
    const nama = String(item.proses || item.nama || '').trim();
    if (!nama) return;

    const id = angkaAtauNull(item.id);
    const kunci = id !== null ? `id:${id}` : `nama:${nama.toLowerCase()}`;
    if (!peta.has(kunci)) peta.set(kunci, { id, proses: nama });
  });

  return Array.from(peta.values());
};

export const normalisasiOpsiBisnisPartnerFilter = (bisnisPartner: unknown): OpsiBisnisPartner[] => {
  if (!Array.isArray(bisnisPartner)) return [];

  const peta = new Map<number, OpsiBisnisPartner>();
  bisnisPartner.forEach((item) => {
    if (!adalahObjek(item)) return;
    const id = angkaAtauNull(item.id);
    const nama = String(item.nama || '').trim();
    if (id === null || !nama || peta.has(id)) return;
    peta.set(id, { id, nama, code: item.code || '', jenis_bp: item.jenis_bp || '' });
  });

  return Array.from(peta.values());
};

/** Daftar karyawan untuk pilihan checker. */
export const normalisasiChecker = (daftar: unknown): Checker[] => {
  if (!Array.isArray(daftar)) return [];

  return daftar
    .filter(adalahObjek)
    .map((item) => ({
      id: item.id || item.nik || item.nama_lengkap || item.name,
      name: String(item.nama_lengkap || item.name || item.nama || ''),
      nik: String(item.nik || ''),
    }))
    .filter((item) => item.name);
};
