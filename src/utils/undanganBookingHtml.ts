/**
 * HTML "Undangan Rapat" (Form-HRD&GA-09 Rev.01) untuk dijadikan PDF (expo-print) — padanan
 * `resources/views/peminjaman/undangan-pdf.blade.php` di sim-mwt. Fungsi murni: logo sudah berupa
 * data URI (atau null), datanya dari satu `Booking`.
 *
 * ponytail: salinan dari web; bila formulir web berubah, ubah di sini juga. Belum ada dua kode QR
 * (tanda tangan & tautan validasi): butuh pustaka QR dan alamat web publik. Tambahkan bila diperlukan.
 */
import { Booking } from '../types/booking';
import { NAMA_BULAN, NAMA_HARI } from './kalender';

const h = (v: unknown) =>
  String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const dua = (n: number) => String(n).padStart(2, '0');
const pukul = (d: Date) => `${dua(d.getHours())}.${dua(d.getMinutes())} WIB`;
const MAKS_PER_KOLOM = 12;

const tempatTeks = (b: Booking) => {
  if (b.jenis === 'luar') return b.tempat || '-';
  const plant = b.plant ? ` (${b.plant})` : '';
  return b.jenis === 'online' ? `Online Meeting${plant}` : `${b.tempat}${plant}`;
};

/** Daftar "Kepada Yth", terbagi kolom per 12 nama seperti di web. */
const kolomPeserta = (peserta: string[]) => {
  const jumlahKolom = Math.max(1, Math.ceil(peserta.length / MAKS_PER_KOLOM));
  const lebar = Math.floor(100 / jumlahKolom);
  return Array.from({ length: jumlahKolom }, (_, k) => {
    const awal = k * MAKS_PER_KOLOM;
    const baris = peserta
      .slice(awal, awal + MAKS_PER_KOLOM)
      .map((nama, i) => `<div class="peserta-item">${awal + i + 1}. ${h(nama)}</div>`)
      .join('');
    return `<td style="width:${lebar}%"><div class="kepada-title"${k > 0 ? ' style="visibility:hidden"' : ''}>Kepada Yth :</div>${baris}</td>`;
  }).join('');
};

export function buatHtmlUndanganBooking(b: Booking, logo: string | null): string {
  const tanggal = `${NAMA_HARI[b.mulai.getDay()]}, ${b.mulai.getDate()} ${NAMA_BULAN[b.mulai.getMonth()]} ${b.mulai.getFullYear()}`;
  const namaPendek = b.namaPeminjam.trim().split(/\s+/).slice(0, 2).join(' ');
  const link =
    b.jenis === 'online' && b.linkMeeting
      ? `<div class="detail-row"><span class="detail-label">Link Meeting</span><span>: <a href="${h(b.linkMeeting)}" style="color:blue;text-decoration:underline">${h(b.linkMeeting)}</a></span></div>`
      : '';

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Undangan Rapat - ${h(b.namaKegiatan)}</title>
<style>
  @page { size: A4; margin: 0; }
  body { font-family: "Times New Roman", serif; font-size: 14.5pt; line-height: 1.2; margin: 0; padding: 22pt 30pt; color: #000; background: #fff; }
  table { width: 100%; border-collapse: collapse; }
  .header-table { border: 2.25pt double #000; }
  .header-table td { vertical-align: middle; padding: 8pt; }
  .logo-cell { width: 100pt; text-align: center; }
  .logo-cell img { max-width: 62px; height: auto; }
  .title-cell { text-align: center; font-size: 24pt; font-weight: bold; padding: 22pt 0; }
  .kepada-table { border-top: 2.25pt double #000; border-left: 2.25pt double #000; border-right: 2.25pt double #000; }
  .kepada-table td { border-top: 1pt solid #000; vertical-align: top; padding: 8pt 0 8pt 8pt; height: 190pt; }
  .kepada-table td:first-child { border-left: 1pt solid #000; }
  .kepada-table td:last-child { border-right: 1pt solid #000; }
  .kepada-title { font-size: 13.5pt; margin-bottom: 12pt; }
  .peserta-item { margin-bottom: 2.5pt; font-size: 11.5pt; text-indent: -16.35pt; margin-left: 23.55pt; line-height: 1.2; }
  .kepada-table td:nth-child(n+2) .peserta-item { margin-left: 16.35pt; }
  .main-table { border: 2.25pt double #000; }
  .main-table td { border: 1pt solid #000; vertical-align: top; padding: 9pt 23pt; }
  .undangan-text { font-size: 14.5pt; line-height: 1.8; margin-bottom: 15pt; }
  .detail-row { margin-bottom: 7pt; font-size: 14.5pt; }
  .detail-label { display: inline-block; width: 120pt; }
  .pesan-text { font-size: 14.5pt; line-height: 1.45; text-align: justify; margin: 25pt 0; }
  .ttd { width: 130pt; text-align: center; margin-top: 10pt; }
  .ttd .garis { width: 100pt; height: 1pt; background: #000; margin: 56pt auto 2pt; }
  .validasi { font-size: 9.5pt; color: #666; margin-top: 12pt; line-height: 1.3; font-style: italic; }
  .footer-table td { border: 1pt solid #000; padding: 2.5pt 3.35pt; font-size: 11.5pt; }
</style></head>
<body>
<table class="header-table"><tr>
  <td class="logo-cell">${logo ? `<img src="${logo}" alt="PT. Mada Wikri Tunggal">` : ''}</td>
  <td class="title-cell">UNDANGAN RAPAT</td>
</tr></table>

<table class="kepada-table"><tr>${kolomPeserta(b.peserta)}</tr></table>

<table class="main-table"><tr><td>
  <div class="undangan-text">Bersama ini kami mengundang kehadiran bapak/ibu/saudara pada :</div>
  <div class="detail-row"><span class="detail-label">Hari,Tanggal</span><span>: ${h(tanggal)}</span></div>
  <div class="detail-row"><span class="detail-label">Pukul</span><span>: ${pukul(b.mulai)} s/d ${pukul(b.selesai)}</span></div>
  <div class="detail-row"><span class="detail-label">Tempat</span><span>: ${h(tempatTeks(b))}</span></div>
  ${link}
  <div class="detail-row"><span class="detail-label">Agenda</span><span>: ${h(b.namaKegiatan)}</span></div>
  <div class="pesan-text">Mengingat pentingnya acara tersebut, maka kami sangat mengharapkan bapak/ibu/saudara yang tersebut diatas untuk hadir tepat waktu dan tidak mewakili. Atas perhatiannya, kami ucapkan banyak terima kasih.</div>
  <div class="ttd">Hormat kami,<div class="garis"></div>${h(namaPendek)}</div>
  <div class="validasi">Undangan ini dibuat melalui SIMWT — Sistem Peminjaman Ruangan PT Mada Wikri Tunggal.</div>
</td></tr></table>

<table class="footer-table"><tr>
  <td style="width:70%">&nbsp;</td><td style="width:22%;white-space:nowrap">Form-HRD&amp;GA-09</td><td style="white-space:nowrap">Rev.01</td>
</tr></table>
</body></html>`;
}
