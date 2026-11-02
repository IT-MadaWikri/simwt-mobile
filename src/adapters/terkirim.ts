/**
 * Adapter detail pengukuran terkirim (`TransaksiPengukuranDetailResource` di api-simwt): meratakan
 * `details` menjadi kelompok per periode × titik ukur × alat, dengan target yang siap ditampilkan.
 * Bila bentuk API berubah, ubah adapter ini. Tanpa React, api, atau storage.
 */
import { DetailTerkirim, Judgement, KelompokHasil, TahapApproval } from '../types/pengukuran';

type Mentah = Record<string, any>;

const teks = (nilai: unknown, cadangan = '-') => {
  const t = nilai === null || nilai === undefined ? '' : String(nilai).trim();
  return t || cadangan;
};

const judgement = (nilai: unknown): Judgement | null => (nilai === 'OK' || nilai === 'NG' ? nilai : null);

/** Radio: daftar target alat; selain itu: target standar, atau rentang min–max bila ada. */
const buatTarget = (item: Mentah): string => {
  const standar: Mentah = item.standar ?? {};
  if (standar.tipe_input === 'radio') {
    const daftar: string[] = Array.isArray(standar.tool_target_values) ? standar.tool_target_values : [];
    return daftar.length ? daftar.join(', ') : teks(standar.tool_target_string, 'Target belum diatur');
  }
  if (standar.target_string) return String(standar.target_string);
  const min = Number(standar.min_value);
  const max = Number(standar.max_value);
  return Number.isFinite(min) && Number.isFinite(max) && (min !== 0 || max !== 0) ? `${min} – ${max}` : 'Target belum diatur';
};

export const normalisasiDetailTerkirim = (mentah: unknown): DetailTerkirim | null => {
  const m = mentah as Mentah | null;
  const data: Mentah | null = m && typeof m === 'object' ? (m.data && typeof m.data === 'object' ? m.data : m) : null;
  if (!data) return null;

  const periodeInduk = teks(data.periode, 'Awal');
  const details: Mentah[] = Array.isArray(data.details) ? data.details : [];

  const kelompok = new Map<string, KelompokHasil>();
  details.forEach((item) => {
    const periode = teks(item.periode, periodeInduk);
    const standar: Mentah = item.standar ?? {};
    const alat = teks(standar.nama_tool ?? item.resolved_alat_ukur_nama);
    const kunci = `${periode}|${item.standar_id}|${item.resolved_alat_ukur_id ?? alat}`;

    if (!kelompok.has(kunci)) {
      kelompok.set(kunci, {
        kunci,
        periode,
        nama: teks(standar.nama_standar),
        drawing: teks(standar.nomor_drawing),
        alat,
        target: buatTarget(item),
        sampel: [],
      });
    }
    kelompok.get(kunci)!.sampel.push({ nilai: teks(item.nilai_input), judgement: judgement(item.judgement) });
  });

  const periodeUnik = Array.from(new Set(Array.from(kelompok.values()).map((k) => k.periode)));
  const tahap = (kunci: TahapApproval['kunci'], label: string): TahapApproval => ({
    kunci,
    label,
    oleh: data[`${kunci}_by`] ?? null,
    pada: data[`${kunci}_at`] ?? null,
  });

  return {
    id: data.id,
    kodeUnik: teks(data.kode_unik),
    judgment: judgement(data.judgment),
    tanggal: data.tanggal ?? null,
    shift: teks(data.shift),
    periode: periodeUnik.length ? periodeUnik.join(', ') : periodeInduk,
    diukurOleh: teks(data.inspector_name),
    lotNo: teks(data.lot_no),
    partNama: teks(data.part?.nama),
    partKode: teks(data.part?.kode),
    approval: [tahap('inspected', 'Inspected'), tahap('checked', 'Checked'), tahap('approved', 'Approved')],
    hasil: Array.from(kelompok.values()),
  };
};
