/**
 * Akun — ubah email & password dengan verifikasi OTP 6 digit.
 *
 * KONTRAK API (belum ada di sim-mwt `/api/mobile`; harus dibuat di backend):
 *   POST /akun/otp/kirim       {tujuan, email?, token?}   → kirim OTP ke email
 *   POST /akun/otp/verifikasi  {tujuan, kode}             → {data:{token}} token sekali pakai
 *   POST /akun/email           {email, kode, token}       → ubah email (kode = OTP email baru)
 *   POST /akun/password        {password, password_confirmation, token}
 *
 * `tujuan`: 'email_lama' (OTP ke email saat ini, awal ubah email), 'password'
 * (OTP ke email saat ini, awal ubah password), 'email_baru' (OTP ke `email`
 * baru; wajib menyertakan `token` dari verifikasi email_lama).
 * OTP dibuat, dikirim, dan dicek HANYA di server (kedaluwarsa & batas percobaan
 * di sana); aplikasi hanya meneruskan kode yang diketik pengguna.
 */
import api from './api';

export type TujuanOtp = 'email_lama' | 'email_baru' | 'password';

/** Teks galat yang layak ditampilkan: pesan server bila ada, selain itu pesan axios. */
export function pesanGalat(e: any, cadangan: string): string {
  return e?.response?.data?.message || e?.message || cadangan;
}

export const akunService = {
  async kirimOtp(p: { tujuan: TujuanOtp; email?: string; token?: string }): Promise<void> {
    await api.post('/akun/otp/kirim', p);
  },

  /** Mengembalikan token verifikasi untuk langkah berikutnya. */
  async verifikasiOtp(p: { tujuan: TujuanOtp; kode: string }): Promise<string> {
    const response = await api.post('/akun/otp/verifikasi', p);
    const token = response.data?.data?.token ?? response.data?.token;
    if (!token) throw new Error('Verifikasi gagal. Coba lagi.');
    return String(token);
  },

  async ubahEmail(p: { email: string; kode: string; token: string }): Promise<void> {
    await api.post('/akun/email', p);
  },

  async ubahPassword(p: { password: string; password_confirmation: string; token: string }): Promise<void> {
    await api.post('/akun/password', p);
  },
};

export default akunService;
