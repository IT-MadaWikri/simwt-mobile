/**
 * Adapter murni modul Tiket: mengubah respons `GET /tiket/lihat/{nomor}` menjadi
 * `DetailTiket` yang siap dirender. Tanpa React, api, atau storage.
 */
import { DetailTiket, LangkahLinimasa, StatusTiket, TiketRingkas } from '../types/tiket';

/** Label & nada warna per status — dipakai daftar, filter, dan detail. */
export const STATUS_TIKET: Record<StatusTiket, { label: string; keterangan: string; ikon: string }> = {
  PENDING: { label: 'Menunggu', keterangan: 'Menunggu ditangani', ikon: 'clock-outline' },
  PROSES: { label: 'Diproses', keterangan: 'Sedang diproses', ikon: 'progress-wrench' },
  OK: { label: 'Selesai', keterangan: 'Selesai', ikon: 'check-circle-outline' },
};

const JUDUL_PROGRESS: Record<string, string> = {
  perbaikan: 'Perbaikan',
  trial: 'Trial',
  request_trial: 'Permintaan trial',
};

const statusAman = (nilai: unknown): StatusTiket =>
  nilai === 'PROSES' || nilai === 'OK' ? nilai : 'PENDING';

/** Baris-baris keterangan sebuah progress; yang kosong dibuang. */
const barisProgress = (p: any): string[] =>
  [
    p.analisa && `Analisa: ${p.analisa}`,
    p.penanganan && `Penanganan: ${p.penanganan}`,
    p.jenis_penanganan && `Jenis: ${p.jenis_penanganan}`,
    p.sparepart?.nama && `Sparepart: ${p.sparepart.nama}${p.qty_part ? ` × ${p.qty_part}` : ''}`,
    p.is_vendor && p.nama_vendor && `Vendor: ${p.nama_vendor}`,
    p.hasil_trial && `Hasil trial: ${p.hasil_trial}`,
    p.pic_perbaikan && `PIC: ${p.pic_perbaikan}`,
  ].filter(Boolean) as string[];

export function adaptasiDetailTiket(mentah: any): DetailTiket {
  const status = statusAman(mentah?.status_pengajuan);
  const selesai = status === 'OK';

  const progress: any[] = Array.isArray(mentah?.progress) ? mentah.progress : [];

  const linimasa: LangkahLinimasa[] = [
    {
      id: 'diajukan',
      judul: 'Tiket diajukan',
      isi: mentah?.diajukan_oleh ? [`Oleh ${mentah.diajukan_oleh}`] : [],
      waktu: mentah?.tanggal_diajukan ?? null,
      selesai: true,
    },
    ...(mentah?.tanggal_proses
      ? [{ id: 'diproses', judul: 'Mulai diproses', isi: [], waktu: mentah.tanggal_proses, selesai: true }]
      : []),
    ...progress.map((p, i) => ({
      id: `p-${p.id ?? i}`,
      judul: JUDUL_PROGRESS[p.jenis_update] ?? 'Update penanganan',
      isi: barisProgress(p),
      waktu: p.tanggal_progress ?? p.created_at ?? null,
      selesai: true,
    })),
    {
      id: 'selesai',
      judul: selesai ? 'Tiket selesai' : 'Menunggu penyelesaian',
      isi: selesai && mentah?.diselesaikan_oleh ? [`Oleh ${mentah.diselesaikan_oleh}`] : [],
      waktu: selesai ? mentah?.tanggal_selesai ?? null : null,
      selesai,
    },
  ];

  const aset = mentah?.aset?.asset_name
    ? `${mentah.aset.asset_name}${mentah.aset.asset_number ? ` (${mentah.aset.asset_number})` : ''}`
    : null;

  return {
    id: mentah?.id ?? 0,
    noTiket: mentah?.no_ticket ?? '',
    judul: mentah?.judul_masalah ?? '',
    detail: mentah?.detail_masalah ?? '',
    status,
    diajukanOleh: mentah?.diajukan_oleh ?? '-',
    jenis: mentah?.jenis?.nama ?? null,
    departemen: mentah?.departemen?.nama ?? null,
    plant: mentah?.plant?.nama ?? null,
    aset,
    tanggalDiajukan: mentah?.tanggal_diajukan ?? null,
    tanggalSelesai: mentah?.tanggal_selesai ?? null,
    fotoSebelum: mentah?.foto_sebelum ?? null,
    fotoSesudah: mentah?.foto_sesudah ?? null,
    linimasa,
  };
}

export interface KriteriaTiket {
  search: string;
  /** '' = semua status. */
  status: StatusTiket | '';
  /** 'YYYY-MM-DD' atau ''. */
  dari: string;
  sampai: string;
  urutkan: 'TERBARU' | 'TERLAMA';
}

/** Tanggal lokal 'YYYY-MM-DD' dari ISO, supaya cocok dengan nilai FieldTanggal. */
const tanggalLokal = (iso: string | null) => {
  if (!iso) return '';
  const t = new Date(iso);
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
};

/** Saring + urutkan daftar tiket di sisi klien (server mengirim maksimal 50). */
export function saringTiket(daftar: TiketRingkas[], k: KriteriaTiket): TiketRingkas[] {
  const kata = k.search.trim().toLowerCase();
  const hasil = daftar.filter((t) => {
    if (k.status && t.status_pengajuan !== k.status) return false;
    const tgl = tanggalLokal(t.tanggal_diajukan);
    if (k.dari && tgl < k.dari) return false;
    if (k.sampai && tgl > k.sampai) return false;
    if (!kata) return true;
    return [t.no_ticket, t.judul_masalah, t.jenis, t.plant].some((v) => v?.toLowerCase().includes(kata));
  });
  const arah = k.urutkan === 'TERBARU' ? -1 : 1;
  return hasil.sort((a, b) => arah * ((a.tanggal_diajukan ?? '').localeCompare(b.tanggal_diajukan ?? '')));
}
