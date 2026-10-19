/**
 * Bukti perbaikan tiket ("Trouble Ticket", PDF) dibuat di HP: HTML formulir (`buatHtmlBuktiTiket`)
 * → PDF → share sheet. Mekanik PDF-nya ada di `pdfService`.
 */
import { DetailTiket } from '../types/tiket';
import { buatHtmlBuktiTiket } from '../utils/buktiTiketHtml';
import { bagikanHtmlSebagaiPdf, keDataUri, muatLogo, pastikanBisaBagikan } from './pdfService';

export async function bagikanBuktiTiket(detail: DetailTiket): Promise<void> {
  await pastikanBisaBagikan();

  const [logo, fotoSebelum, fotoSesudah] = await Promise.all([
    muatLogo(),
    keDataUri(detail.fotoSebelum),
    keDataUri(detail.fotoSesudah),
  ]);

  const html = buatHtmlBuktiTiket(detail, { logo, fotoSebelum, fotoSesudah });
  const nama = `Bukti-Tiket-${(detail.noTiket || String(detail.id)).replace(/[^\w-]+/g, '-')}.pdf`;
  await bagikanHtmlSebagaiPdf(html, nama, 'Bagikan Bukti Perbaikan Tiket');
}
