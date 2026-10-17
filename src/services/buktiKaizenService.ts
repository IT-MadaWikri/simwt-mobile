/**
 * Bukti Kaizen Digital (PDF) dibuat di HP: HTML formulir (`buatHtmlBuktiKaizen`)
 * → PDF lewat expo-print → dibagikan lewat share sheet bawaan OS (expo-sharing).
 *
 * Gambar (logo, foto, QR) disematkan sebagai data URI supaya pasti ikut tercetak —
 * dokumen expo-print tidak menjamin gambar remote termuat di Android.
 */
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Asset } from 'expo-asset';
import { File, Paths } from 'expo-file-system';
import { KaizenDetail } from '../types/kaizen';
import { buatHtmlBuktiKaizen } from '../utils/buktiKaizenHtml';
import { urlFoto } from '../utils/kaizen';

const LOGO = require('../../assets/images/logo-loader.png');

const MIME: Record<string, string> = { png: 'image/png', webp: 'image/webp', gif: 'image/gif' };

/** Biner → base64. btoa memproses string, jadi diumpan per potongan agar tak melebihi batas argumen. */
function keBase64(isi: ArrayBuffer): string {
  const bait = new Uint8Array(isi);
  let biner = '';
  for (let i = 0; i < bait.length; i += 0x8000) {
    biner += String.fromCharCode(...bait.subarray(i, i + 0x8000));
  }
  return btoa(biner);
}

/**
 * URL (atau file://) → data URI; null bila gagal (gambar yang tak termuat dilewati, PDF tetap jadi).
 * Diunduh ke cache lalu dibaca dari file — bukan fetch().blob()/FileReader, yang tidak andal di Expo Go.
 */
async function keDataUri(sumber?: string | null): Promise<string | null> {
  if (!sumber) return null;
  let unduhan: File | null = null;
  try {
    const berkas = sumber.startsWith('file:')
      ? new File(sumber)
      : (unduhan = await File.downloadFileAsync(
          sumber,
          new File(Paths.cache, `gambar-bukti-${Date.now()}-${Math.random().toString(36).slice(2)}`),
          { idempotent: true }
        ));
    const ekstensi = (sumber.match(/\.(\w+)(?:\?|$)/)?.[1] ?? '').toLowerCase();
    return `data:${MIME[ekstensi] ?? 'image/jpeg'};base64,${keBase64(await berkas.arrayBuffer())}`;
  } catch (e) {
    console.warn('[bukti-kaizen] gagal memuat gambar', sumber, e);
    return null;
  } finally {
    try {
      unduhan?.delete();
    } catch {}
  }
}

export async function bagikanBuktiKaizen(detail: KaizenDetail): Promise<void> {
  if (!(await Sharing.isAvailableAsync())) {
    throw new Error('Berbagi file tidak tersedia di perangkat ini.');
  }

  const k = detail.kaizen as any;
  const logo = Asset.fromModule(LOGO);
  await logo.downloadAsync();

  const [gLogo, fotoSebelum, fotoSesudah, qr] = await Promise.all([
    keDataUri(logo.localUri ?? logo.uri),
    keDataUri(k.foto_sebelum_url ?? urlFoto(k.foto_sebelum)),
    keDataUri(k.foto_sesudah_url ?? urlFoto(k.foto_sesudah)),
    keDataUri(detail.nilaiPanitia?.qr_code_url),
  ]);

  const html = buatHtmlBuktiKaizen(detail, { logo: gLogo, fotoSebelum, fotoSesudah, qr });
  // A4 pada 72 PPI (bawaan expo-print: US Letter). base64 diminta supaya PDF bisa ditulis ulang
  // ke cache aplikasi dengan nama yang bermakna.
  const hasil = await Print.printToFileAsync({ html, width: 595, height: 842, base64: true });

  // Nama file ikut tampil di WhatsApp dll. File ditulis langsung ke Paths.cache (bukan disalin dari
  // folder Print/): di Expo Go, expo-sharing menolak membaca folder Print/ ("Not allowed to read file").
  // Gagal menulis → pakai file asli hasil expo-print.
  let uriPdf = hasil.uri;
  try {
    const nama = `Bukti-Kaizen-${String(k.nomor ?? k.id).replace(/[^\w-]+/g, '-')}.pdf`;
    const tujuan = new File(Paths.cache, nama);
    if (tujuan.exists) tujuan.delete();
    tujuan.create();
    tujuan.write(hasil.base64 ?? '', { encoding: 'base64' });
    uriPdf = tujuan.uri;
  } catch {}

  const opsi = { mimeType: 'application/pdf', UTI: 'com.adobe.pdf', dialogTitle: 'Bagikan Bukti Kaizen' };
  await Sharing.shareAsync(uriPdf, opsi);
}
