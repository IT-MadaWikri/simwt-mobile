/**
 * Kalender bawaan OS — membuka form "tambah acara" milik sistem yang sudah terisi, jadi pengguna
 * menyimpannya sendiri di aplikasi kalender pilihannya. Modul native: butuh dev build (tidak ada di Expo Go).
 */
import * as Calendar from 'expo-calendar';
import { isRunningInExpoGo } from 'expo';

export interface AcaraKalender {
  judul: string;
  mulai: Date;
  selesai: Date;
  lokasi?: string;
  catatan?: string;
}

/** Mengembalikan false bila izin kalender ditolak; selebihnya melempar galat (tidak ada kalender yang bisa ditulis, dll). */
export async function tambahKeKalenderOs(acara: AcaraKalender): Promise<boolean> {
  // Di Expo Go modul ini hanya stub (fungsinya undefined), jadi beri pesan yang jelas.
  if (isRunningInExpoGo()) throw new Error('Fitur kalender butuh aplikasi hasil build (npm run android); tidak tersedia di Expo Go.');
  const { status } = await Calendar.requestCalendarPermissions();
  if (status !== 'granted') return false;

  const daftar = await Calendar.getCalendars(Calendar.EntityTypes.EVENT);
  const kalender = daftar.find((k) => k.allowsModifications && k.isPrimary) ?? daftar.find((k) => k.allowsModifications);
  if (!kalender) throw new Error('Tidak ada kalender di perangkat yang bisa diisi.');

  await kalender.addEventWithForm({
    title: acara.judul,
    startDate: acara.mulai,
    endDate: acara.selesai,
    location: acara.lokasi,
    notes: acara.catatan,
  });
  return true;
}
