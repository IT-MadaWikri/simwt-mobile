/**
 * Adapter murni modul Tiket: mengubah respons `GET /tiket/lihat/{nomor}` menjadi
 * `DetailTiket` yang siap dirender. Tanpa React, api, atau storage.
 */
import { DetailTiket, LangkahLinimasa, MetrikTiket, StatusTiket } from '../types/tiket';

/** Label & nada warna per status — dipakai daftar, filter, dan detail. */
export const STATUS_TIKET: Record<StatusTiket, { label: string; keterangan: string; ikon: string }> = {
  PENDING: { label: 'Menunggu', keterangan: 'Menunggu ditangani', ikon: 'clock-outline' },
  NEED_APPROVAL: { label: 'Persetujuan', keterangan: 'Menunggu persetujuan', ikon: 'clock-outline' },
  PROSES: { label: 'Diproses', keterangan: 'Sedang diproses', ikon: 'progress-wrench' },
  RESOLVED: { label: 'Konfirmasi', keterangan: 'Menunggu konfirmasi pelapor', ikon: 'check-circle-outline' },
  OK: { label: 'Selesai', keterangan: 'Selesai', ikon: 'check-circle-outline' },
  FATAL: { label: 'Fatal', keterangan: 'Tidak dapat diperbaiki', ikon: 'alert-circle-outline' },
  CANCEL: { label: 'Dibatalkan', keterangan: 'Dibatalkan', ikon: 'close' },
};

/** Pesan ringkas untuk dibagikan (WhatsApp dll), sama gayanya dengan `teksBagikanKaizen`. */
export const teksBagikanTiket = (t: DetailTiket) =>
  [
    `🎫 Tiket #${t.noTiket}`,
    t.judul ? `"${t.judul}"` : null,
    `Status: ${STATUS_TIKET[t.status].keterangan}`,
    [t.jenis, t.plant].filter(Boolean).join(' · ') || null,
    t.diajukanOleh ? `Pengaju: ${t.diajukanOleh}` : null,
    t.pic ? `PIC: ${t.pic}` : null,
    '',
    'PT Mada Wikri Tunggal · #SIMWT',
  ]
    .filter((b) => b !== null)
    .join('\n');

const JUDUL_PROGRESS: Record<string, string> = {
  perbaikan: 'Perbaikan',
  trial: 'Trial',
  request_trial: 'Permintaan trial',
};

/** Status dari server yang belum dikenal jatuh ke PENDING supaya label/warna tidak undefined. */
export const statusAman = (nilai: unknown): StatusTiket =>
  typeof nilai === 'string' && nilai in STATUS_TIKET ? (nilai as StatusTiket) : 'PENDING';

/** Baris-baris keterangan sebuah progress; yang kosong dibuang. */
const barisProgress = (p: any): string[] =>
  [
    p.analisa && `Analisa: ${p.analisa}`,
    p.penanganan && `Penanganan: ${p.penanganan}`,
    p.jenis_penanganan && `Jenis: ${p.jenis_penanganan}`,
    p.is_vendor && p.nama_vendor && `Vendor: ${p.nama_vendor}`,
    p.hasil_trial && `Hasil trial: ${p.hasil_trial}`,
    p.pic_perbaikan && `PIC: ${p.pic_perbaikan}`,
  ].filter(Boolean) as string[];

/** Durasi final seperti di web: ≥ 1 menit → "1h 5m", kurang dari itu → "42s". */
export function formatDurasi(detik: number): string {
  const menit = Math.floor(detik / 60);
  return menit > 0 ? `${Math.floor(menit / 60)}h ${menit % 60}m` : `${detik}s`;
}

const selisihDetik = (dari?: string | null, sampai?: string | null) =>
  dari && sampai ? Math.max(0, Math.round((new Date(sampai).getTime() - new Date(dari).getTime()) / 1000)) : null;

/**
 * Empat metrik waktu detail tiket — rumus sama dengan web (`ticket/lihat.blade.php`):
 * downtime = masuk→selesai, tunggu = masuk→proses, proses = proses→selesai, perbaikan = durasi
 * perbaikan (proses→selesai; tiket berjenjang Dies/Mold di web memotongnya per segmen trial,
 * di sini belum). Tahap yang masih jalan menampilkan jam berjalan, bukan durasi final.
 */
export function hitungMetrik(mentah: any): MetrikTiket[] {
  const masuk = mentah?.tanggal_diajukan ?? null;
  const proses = mentah?.tanggal_proses ?? null;
  const selesai = mentah?.tanggal_selesai ?? null;
  const aktif = !['OK', 'CANCEL', 'FATAL'].includes(mentah?.status_pengajuan);

  const downtime = selesai ? selisihDetik(masuk, selesai) : null;
  const tunggu = proses ? selisihDetik(masuk, proses) : null;
  const prosesFinal = proses && selesai ? selisihDetik(proses, selesai) : null;
  const prosesBerjalan = !!proses && !selesai && aktif;

  return [
    { id: 'downtime', label: 'Total Downtime', keterangan: 'Dari masuk sampai selesai', detik: downtime, berjalanSejak: !selesai && aktif ? masuk : null },
    { id: 'tunggu', label: 'Waktu Tunggu', keterangan: 'Masuk → Proses', detik: tunggu, berjalanSejak: !proses && aktif ? masuk : null },
    { id: 'proses', label: 'Waktu Proses', keterangan: 'Proses → Final', detik: prosesFinal, berjalanSejak: prosesBerjalan ? proses : null },
    { id: 'perbaikan', label: 'Total Perbaikan', keterangan: 'Durasi perbaikan', detik: prosesFinal, berjalanSejak: prosesBerjalan ? proses : null },
  ];
}

export function adaptasiDetailTiket(mentah: any): DetailTiket {
  const status = statusAman(mentah?.status_pengajuan);
  const selesai = status === 'OK';
  // Pekerjaan sudah ditandai selesai teknisi (RESOLVED) atau sudah ditutup (OK).
  const pekerjaanSelesai = selesai || status === 'RESOLVED';
  const dikonfirmasi = selesai && !!mentah?.dikonfirmasi_pelapor_at;

  const progress: any[] = Array.isArray(mentah?.progress) ? mentah.progress : [];

  const linimasa: LangkahLinimasa[] = [
    {
      id: 'diajukan',
      judul: 'Tiket diajukan',
      isi: mentah?.pengaju_nama ?? mentah?.diajukan_oleh ? [`Oleh ${mentah.pengaju_nama ?? mentah.diajukan_oleh}`] : [],
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
      foto: p.foto_url ?? null,
      sparepart: p.sparepart?.nama ? `${p.sparepart.nama}${p.qty_part > 1 ? ` × ${p.qty_part}` : ''}` : null,
      keteranganFoto: p.analisa === 'Reopen oleh Pelapor' ? 'Foto sesudah sebelumnya (ditolak pelapor)' : undefined,
    })),
    {
      id: 'selesai',
      // Tiket lama (OK tanpa jejak konfirmasi) tetap "Tiket selesai"; alur baru memisahkan perbaikan dan konfirmasi.
      judul: !pekerjaanSelesai ? 'Menunggu penyelesaian' : status === 'RESOLVED' || dikonfirmasi ? 'Perbaikan selesai' : 'Tiket selesai',
      isi: pekerjaanSelesai && mentah?.diselesaikan_oleh ? [`Oleh ${mentah.diselesaikan_oleh}`] : [],
      waktu: pekerjaanSelesai ? mentah?.tanggal_selesai ?? null : null,
      selesai: pekerjaanSelesai,
    },
    ...(status === 'RESOLVED'
      ? [{ id: 'konfirmasi', judul: 'Menunggu konfirmasi pelapor', isi: [], waktu: null, selesai: false }]
      : []),
    ...(dikonfirmasi
      ? [
          {
            id: 'konfirmasi',
            judul: mentah?.is_auto_closed ? 'Otomatis selesai' : 'Dikonfirmasi pelapor',
            isi: mentah?.is_auto_closed ? ['Tidak ada konfirmasi dalam 12 jam'] : [],
            waktu: mentah.dikonfirmasi_pelapor_at,
            selesai: true,
          },
        ]
      : []),
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
    diajukanOleh: mentah?.pengaju_nama ?? mentah?.diajukan_oleh ?? '-',
    pic: mentah?.pic_nama ?? null,
    jenis: mentah?.jenis?.nama ?? null,
    departemen: mentah?.departemen?.nama ?? null,
    plant: mentah?.plant?.nama ?? null,
    aset,
    tanggalDiajukan: mentah?.tanggal_diajukan ?? null,
    tanggalSelesai: mentah?.tanggal_selesai ?? null,
    bisaKonfirmasi: mentah?.bisa_konfirmasi === true,
    batasKonfirmasi: mentah?.batas_konfirmasi ?? null,
    // URL utuh dari server (storage api atau web); path mentah tidak bisa dibuka HP.
    fotoSebelum: mentah?.foto_sebelum_url ?? null,
    fotoSesudah: mentah?.foto_sesudah_url ?? null,
    linimasa,
    metrik: hitungMetrik(mentah),
  };
}
