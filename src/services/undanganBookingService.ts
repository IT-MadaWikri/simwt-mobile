/**
 * Surat Undangan Rapat (PDF) dibuat di HP: HTML formulir (`buatHtmlUndanganBooking`) → PDF → share
 * sheet. Mekanik PDF-nya ada di `pdfService`.
 */
import { Booking } from '../types/booking';
import { buatHtmlUndanganBooking } from '../utils/undanganBookingHtml';
import { bagikanHtmlSebagaiPdf, muatLogo, pastikanBisaBagikan } from './pdfService';

export async function bagikanUndanganBooking(b: Booking): Promise<void> {
  await pastikanBisaBagikan();
  const html = buatHtmlUndanganBooking(b, await muatLogo());
  await bagikanHtmlSebagaiPdf(html, `Undangan-Rapat-${b.id}.pdf`, 'Bagikan Undangan Rapat');
}
