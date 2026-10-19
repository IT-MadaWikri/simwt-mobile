/**
 * HTML "Trouble Ticket" (bukti perbaikan) untuk dijadikan PDF (expo-print) — padanan
 * `resources/views/ticket/cetak-v2.blade.php` di sim-mwt. Fungsi murni: gambar sudah berupa
 * data URI (atau null) dan datanya dari `DetailTiket`.
 *
 * ponytail: template ini salinan ringkas dari web; belum ada kode QR konfirmasi dan nomor formulir
 * (Form-IT-04). Bila formulir web berubah, ubah di sini juga.
 */
import { STATUS_TIKET } from '../adapters/tiket';
import { DetailTiket } from '../types/tiket';
import { BULAN } from './kaizen';

export interface GambarBuktiTiket {
  logo: string | null;
  fotoSebelum: string | null;
  fotoSesudah: string | null;
}

const h = (v: unknown) =>
  String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const teks = (v: unknown) => h(v).replace(/\r?\n/g, '<br>');

const p2 = (n: number) => String(n).padStart(2, '0');

/** "19 Okt 2026" atau, dengan `jam`, "19 Okt 2026 11:11". */
const tanggal = (iso: string | null, jam = false) => {
  if (!iso) return '-';
  const t = new Date(iso);
  if (isNaN(t.getTime())) return '-';
  const hari = `${t.getDate()} ${BULAN[t.getMonth()]} ${t.getFullYear()}`;
  return jam ? `${hari} ${p2(t.getHours())}:${p2(t.getMinutes())}` : hari;
};

const foto = (src: string | null) =>
  src ? `<img class="foto" src="${src}" />` : '<p class="redup">Tidak ada foto</p>';

export function buatHtmlBuktiTiket(d: DetailTiket, g: GambarBuktiTiket): string {
  const langkah = d.linimasa
    .map(
      (l) => `<li class="${l.selesai ? 'selesai' : 'belum'}">
        <div class="judul-langkah">${h(l.judul)}${l.waktu ? ` <span class="redup">- ${tanggal(l.waktu, true)}</span>` : ''}</div>
        ${l.isi.map((b) => `<div>${teks(b)}</div>`).join('')}
        ${l.sparepart ? `<div class="redup">Ganti part: ${h(l.sparepart)}</div>` : ''}
      </li>`
    )
    .join('');

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<style>
  @page { margin: 20px; }
  body { margin: 0; font-family: Arial, sans-serif; font-size: 10px; color: #000; }
  table { border-collapse: collapse; width: 100%; }
  td { border: 1px solid #000; padding: 4px; vertical-align: top; }
  .logo { text-align: center; vertical-align: middle; width: 15%; }
  .logo img { max-width: 80%; max-height: 50px; }
  .judul { text-align: center; font-size: 16px; font-weight: bold; vertical-align: middle; }
  .nomor { text-align: center; font-weight: bold; }
  .label { font-weight: bold; }
  .k { width: 17%; }
  .redup { color: #666; }
  .foto { max-width: 100%; max-height: 220px; display: block; margin: 6px auto 0; }
  ul.langkah { list-style: none; margin: 0; padding: 0; }
  ul.langkah li { position: relative; padding: 0 0 8px 18px; break-inside: avoid; }
  ul.langkah li::before { content: ''; position: absolute; left: 0; top: 2px; width: 9px; height: 9px; border-radius: 50%; border: 2px solid #ced4da; background: #fff; }
  ul.langkah li.selesai::before { background: #2fb344; border-color: #2fb344; }
  .judul-langkah { font-weight: bold; }
  .catatan { margin-top: 6px; font-size: 9px; font-style: italic; color: #666; }
</style></head>
<body>
<table>
  <tr>
    <td class="logo">${g.logo ? `<img src="${g.logo}" />` : ''}</td>
    <td class="judul" colspan="3">TROUBLE TICKET</td>
  </tr>
  <tr><td class="nomor" colspan="4">No Ticket: ${h(d.noTiket || '-')}</td></tr>
  <tr>
    <td class="k label">Diajukan Oleh</td><td>${h(d.diajukanOleh || '-')}</td>
    <td class="k label">Tanggal Pengajuan</td><td>${tanggal(d.tanggalDiajukan)}</td>
  </tr>
  <tr>
    <td class="label">Departemen</td><td>${h(d.departemen ?? '-')}</td>
    <td class="label">Aset</td><td>${h(d.aset ?? '-')}</td>
  </tr>
  <tr>
    <td class="label">Jenis Masalah</td><td>${h(d.jenis ?? '-')}</td>
    <td class="label">Lokasi (Plant)</td><td>${h(d.plant ?? '-')}</td>
  </tr>
  <tr>
    <td class="label">Status</td><td>${h(STATUS_TIKET[d.status].keterangan)}</td>
    <td class="label">PIC Perbaikan</td><td>${h(d.pic ?? '-')}</td>
  </tr>
  <tr><td class="label" colspan="4">Judul Masalah</td></tr>
  <tr><td colspan="4">${teks(d.judul || '-')}</td></tr>
  <tr><td class="label" colspan="4">Detail Masalah</td></tr>
  <tr><td colspan="4">${teks(d.detail || '-')}</td></tr>
  <tr><td class="label" colspan="4">Progress Perbaikan</td></tr>
  <tr><td colspan="4"><ul class="langkah">${langkah}</ul></td></tr>
  <tr>
    <td class="label" colspan="2" style="width:50%">Foto Sebelum${foto(g.fotoSebelum)}</td>
    <td class="label" colspan="2" style="width:50%">Foto Sesudah${foto(g.fotoSesudah)}</td>
  </tr>
</table>
<div class="catatan">Dokumen ini dibuat dari aplikasi SIMWT Mobile PT Mada Wikri Tunggal pada ${tanggal(new Date().toISOString(), true)}.</div>
</body></html>`;
}
