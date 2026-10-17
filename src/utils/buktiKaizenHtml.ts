/**
 * HTML "Bukti Kaizen Digital" untuk dijadikan PDF (expo-print) — padanan
 * `resources/views/kaizen/export-pdf.blade.php` di sim-mwt. Fungsi murni:
 * gambar sudah berupa data URI (atau null) dan datanya dari detail Kaizen.
 *
 * ponytail: template ini salinan dari web; bila formulir web berubah, ubah di sini juga.
 */
import { KaizenDetail } from '../types/kaizen';
import { BULAN } from './kaizen';

export interface GambarBukti {
  logo: string | null;
  fotoSebelum: string | null;
  fotoSesudah: string | null;
  qr: string | null;
}

const KATEGORI = ['Productivity', 'Quality', 'Cost', 'Delivery', 'Safety', 'Morale'];

const h = (v: unknown) =>
  String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const teks = (v: unknown) => h(v).replace(/\r?\n/g, '<br>');

const tanggal = (iso?: string) => {
  const t = new Date((iso ?? '').replace(' ', 'T'));
  return isNaN(t.getTime()) ? '-' : `${t.getDate()} ${BULAN[t.getMonth()]} ${t.getFullYear()}`;
};

const foto = (src: string | null) =>
  src ? `<img class="foto" src="${src}" />` : '<p style="font-style:italic">Tidak ada gambar</p>';

export function buatHtmlBuktiKaizen(d: KaizenDetail, g: GambarBukti): string {
  const k = d.kaizen as any;
  const komite = d.nilaiPanitia?.nilai_panitia ?? 0;
  const pelaksanaan = d.nilaiPanitia?.nilai_pelaksanaan ?? 0;
  const pqcdsm = d.totalKategoriNilai ?? 0;
  // Sama dengan web: total = nilai PQCDSM + nilai komite + nilai pelaksanaan.
  const total = pqcdsm + komite + pelaksanaan;

  const barisManfaat = d.manfaats
    .map(
      (m) => `<tr>
        <td colspan="2">${h(m.manfaat_nilai?.kategori)}</td>
        <td>${teks(m.sebelum)}</td><td>${teks(m.sesudah)}</td>
        <td>${h(m.hemat)}</td><td>${h(m.area)}</td><td>${h(m.pic)}</td>
      </tr>`
    )
    .join('');

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<style>
  @page { margin: 20px; }
  body { margin: 0; font-family: Arial, sans-serif; font-size: 10px; color: #000; }
  table { border-collapse: collapse; width: 100%; }
  .form td, .form th { border: 1px solid #000; padding: 4px; vertical-align: top; }
  .judul { text-align: center; font-size: 16px; font-weight: bold; vertical-align: middle !important; }
  .logo { text-align: center; vertical-align: middle !important; width: 15%; }
  .logo img { max-width: 80%; max-height: 50px; }
  .info { border: 1px solid #000; padding: 3px; margin: 3px 0; }
  .label { font-weight: bold; }
  .tengah { text-align: center; }
  .foto { max-width: 100%; max-height: 190px; display: block; margin: 6px auto 0; }
  .nilai td, .manfaat td, .manfaat th { border: 1px solid #000; padding: 2px; text-align: center; font-size: 9px; }
  .catatan { margin-top: 6px; font-size: 9px; }
</style></head>
<body>
<table class="form">
  <tr>
    <td class="logo">${g.logo ? `<img src="${g.logo}" />` : ''}</td>
    <td class="judul" colspan="3">BUKTI KAIZEN DIGITAL</td>
    <td colspan="2" style="width:26%">
      <div class="info">No. Registrasi : ${h(k.nomor)}</div>
      <div class="info">Tanggal Terbit : ${tanggal(k.created_at)}</div>
    </td>
  </tr>
  <tr>
    <td colspan="4"><span class="label">1. TEMA KAIZEN</span><br>${teks(k.tema)}</td>
    <td colspan="2">
      <div class="info">Departemen : ${h(k.departemen?.kode ?? k.nama_departemen)}</div>
      <div class="info">Plant : ${h(k.plant?.nama)}</div>
    </td>
  </tr>
  <tr>
    <td class="label">DISARANKAN OLEH</td><td colspan="2">${h(k.disarankan_oleh)}</td>
    <td class="label" rowspan="2">DISETUJUI OLEH (Kabag)</td><td colspan="2" rowspan="2">${h(k.disetujui_oleh ?? k.approval_oleh)}</td>
  </tr>
  <tr>
    <td class="label">DILAKSANAKAN OLEH</td><td colspan="2">${h(k.nama_pelaksana)}</td>
  </tr>
  <tr>
    <td class="tengah label" colspan="3" style="width:50%">2. PHOTO (SEBELUM KAIZEN)${foto(g.fotoSebelum)}</td>
    <td class="tengah label" colspan="3" style="width:50%">3. PHOTO (SESUDAH KAIZEN)${foto(g.fotoSesudah)}</td>
  </tr>
  <tr>
    <td colspan="3" style="height:90px"><b>4. SEBELUM KAIZEN (PROBLEM/MASALAH) JELASKAN DENGAN SINGKAT</b><br><br>${teks(k.detail_sebelum)}</td>
    <td colspan="3"><b>5. SETELAH KAIZEN (BAGAIMANA PERBAIKANNYA) JELASKAN DENGAN SINGKAT</b><br><br>${teks(k.detail_sesudah)}</td>
  </tr>
  <tr>
    <td colspan="3">
      <b>6. PENILAIAN</b>
      <table class="nilai" style="margin-top:4px">
        <tr><td>P</td><td>Q</td><td>C</td><td>D</td><td>S</td><td>M</td><td>Nilai PQCDSM</td><td>Nilai Komite</td><td><b>Total</b></td></tr>
        <tr>${KATEGORI.map((c) => `<td>${d.kategoriNilai?.[c] ?? 0}</td>`).join('')}<td>${pqcdsm}</td><td>${komite}</td><td><b>${total}</b></td></tr>
      </table>
      <br><b>QMS / Komite :</b> ${h(d.nilaiPanitia?.dinilai_oleh ?? k.dinilai_oleh)}
    </td>
    <td colspan="3">
      <b>7. MANFAAT</b>
      <table class="manfaat" style="margin-top:4px">
        <thead><tr><th colspan="2">KATEGORI</th><th>SEBELUM</th><th>SESUDAH</th><th>HEMAT</th><th>AREA</th><th>PIC</th></tr></thead>
        <tbody>${barisManfaat}</tbody>
      </table>
    </td>
  </tr>
</table>
<table class="catatan"><tr>
  <td><p>Catatan:</p><p>P = Productivity Q = Quality C = Cost D = Delivery S = Safety M = Morale</p></td>
  <td style="text-align:right">${g.qr ? `<img src="${g.qr}" style="width:80px;height:80px" />` : ''}</td>
</tr></table>
</body></html>`;
}
