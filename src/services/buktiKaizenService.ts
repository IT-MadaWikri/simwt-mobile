/**
 * Bukti Kaizen Digital (PDF) dibuat di HP: HTML formulir (`buatHtmlBuktiKaizen`)
 * → PDF → share sheet. Mekanik PDF-nya ada di `pdfService`.
 */
import { KaizenDetail } from '../types/kaizen';
import { buatHtmlBuktiKaizen } from '../utils/buktiKaizenHtml';
import { urlFoto } from '../utils/kaizen';
import { bagikanHtmlSebagaiPdf, keDataUri, muatLogo, pastikanBisaBagikan } from './pdfService';

export async function bagikanBuktiKaizen(detail: KaizenDetail): Promise<void> {
  await pastikanBisaBagikan();

  const k = detail.kaizen as any;
  const [gLogo, fotoSebelum, fotoSesudah, qr] = await Promise.all([
    muatLogo(),
    keDataUri(k.foto_sebelum_url ?? urlFoto(k.foto_sebelum)),
    keDataUri(k.foto_sesudah_url ?? urlFoto(k.foto_sesudah)),
    keDataUri(detail.nilaiPanitia?.qr_code_url),
  ]);

  const html = buatHtmlBuktiKaizen(detail, { logo: gLogo, fotoSebelum, fotoSesudah, qr });
  const nama = `Bukti-Kaizen-${String(k.nomor ?? k.id).replace(/[^\w-]+/g, '-')}.pdf`;
  await bagikanHtmlSebagaiPdf(html, nama, 'Bagikan Bukti Kaizen');
}
