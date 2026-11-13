/**
 * useUbahAkunAman — alur ketat ubah email / password berbasis OTP 6 digit.
 *
 * Tahap:
 *   awal     → tombol "Ubah …": kirim OTP ke email saat ini
 *   otp_lama → pengguna memasukkan OTP email saat ini
 *   terbuka  → isian baru terbuka (email baru, atau password baru)
 *   otp_baru → (khusus email) OTP dikirim ke email baru, dimasukkan untuk konfirmasi
 * Biometrik (bila aktif) diminta layar SEBELUM tahap `awal` dibuka.
 * Semua pemanggilan server lewat `akunService`; hook hanya menyimpan tahap & token.
 */
import { useCallback, useEffect, useState } from 'react';
import { akunService, pesanGalat, TujuanOtp } from '../services/akunService';

export type JenisAman = 'email' | 'password';
export type Tahap = 'awal' | 'otp_lama' | 'terbuka' | 'otp_baru';

const JEDA_KIRIM_ULANG = 60;

export function useUbahAkunAman(jenis: JenisAman, onSelesai: () => void) {
  const [tahap, setTahap] = useState<Tahap>('awal');
  const [memuat, setMemuat] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);
  const [kode, setKode] = useState('');
  const [sisaDetik, setSisaDetik] = useState(0);
  const [token, setToken] = useState('');
  const [emailBaru, setEmailBaru] = useState('');

  const tujuanAwal: TujuanOtp = jenis === 'email' ? 'email_lama' : 'password';

  useEffect(() => {
    if (sisaDetik <= 0) return;
    const t = setTimeout(() => setSisaDetik((d) => d - 1), 1000);
    return () => clearTimeout(t);
  }, [sisaDetik]);

  /** Jalankan satu langkah: loading, tangkap galat jadi teks. Mengembalikan berhasil/tidak. */
  const jalankan = useCallback(async (langkah: () => Promise<void>) => {
    setMemuat(true);
    setGalat(null);
    try {
      await langkah();
      return true;
    } catch (e) {
      setGalat(pesanGalat(e, 'Terjadi kesalahan. Coba lagi.'));
      return false;
    } finally {
      setMemuat(false);
    }
  }, []);

  const bukaOtp = (berikutnya: Tahap) => {
    setKode('');
    setSisaDetik(JEDA_KIRIM_ULANG);
    setTahap(berikutnya);
  };

  const kirimOtpLama = () =>
    jalankan(async () => {
      await akunService.kirimOtp({ tujuan: tujuanAwal });
      bukaOtp('otp_lama');
    });

  const verifikasiOtpLama = () =>
    jalankan(async () => {
      setToken(await akunService.verifikasiOtp({ tujuan: tujuanAwal, kode }));
      setKode('');
      setTahap('terbuka');
    });

  const kirimOtpBaru = (email: string) =>
    jalankan(async () => {
      await akunService.kirimOtp({ tujuan: 'email_baru', email, token });
      setEmailBaru(email);
      bukaOtp('otp_baru');
    });

  const simpanEmail = () =>
    jalankan(async () => {
      await akunService.ubahEmail({ email: emailBaru, kode, token });
      onSelesai();
    });

  const simpanPassword = (password: string, konfirmasi: string) =>
    jalankan(async () => {
      await akunService.ubahPassword({ password, password_confirmation: konfirmasi, token });
      onSelesai();
    });

  const kirimUlang = () => (tahap === 'otp_baru' ? kirimOtpBaru(emailBaru) : kirimOtpLama());

  /** Satu langkah mundur di dalam alur; false bila sudah di awal (layar yang menutup editor). */
  const mundur = (): boolean => {
    setGalat(null);
    if (tahap === 'otp_baru') setTahap('terbuka');
    else if (tahap === 'otp_lama' || tahap === 'terbuka') setTahap('awal');
    else return false;
    setKode('');
    return true;
  };

  return {
    tahap, memuat, galat, kode, setKode, sisaDetik, emailBaru,
    kirimOtpLama, verifikasiOtpLama, kirimOtpBaru, simpanEmail, simpanPassword, kirimUlang, mundur,
  };
}
