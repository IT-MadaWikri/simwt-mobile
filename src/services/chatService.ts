/**
 * Layanan Chat — penyimpanan riwayat + lapisan transport.
 *
 * ── Arsitektur (disiapkan untuk WebSocket) ───────────────────────────────
 * UI tidak pernah bicara ke jaringan langsung; semua lewat `kirimPesan()`,
 * yang memilih transport berdasarkan kontak:
 *
 *   Mita (AI)        → MitaTransport — POST /mita-chat/send lewat axios `api`
 *                      (sebelumnya layar Mita memakai `fetch` ke URL
 *                      production yang di-hardcode, menerobos base URL lokal).
 *   Sesama pengguna  → BelumTerhubungTransport — pesan disimpan lokal dengan
 *                      status `menunggu`. Saat server chat hidup, ganti kelas
 *                      ini dengan implementasi WebSocket; UI tidak berubah.
 *
 * ── Rencana WebSocket (TODO saat server siap) ────────────────────────────
 *   1. Buat `WebSocketTransport implements ChatTransport` di berkas ini:
 *      sambung ke `wss://…` dengan token Sanctum di query/header, `kirim()`
 *      mem-publish lalu menunggu ack → kembalikan status `terkirim`.
 *   2. Panggil `chatService.setTransportPengguna(transportBaru)` sekali di
 *      AuthContext setelah login.
 *   3. Pesan masuk dari socket → `chatService.terimaPesan(idKontak, pesan)`.
 * Riwayat per kontak tetap di AsyncStorage apa pun transportnya.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';
import { API_CONFIG } from '../../constants/Api';
import { penggunaService, namaDari } from './penggunaService';
import { KontakChat, PesanChat, RingkasanChat, StatusPesan } from '../types/chat';

const KUNCI_RIWAYAT = '@chat_riwayat'; // + _{idPengguna}_{idKontak}

/** Kontak Mita — selalu ada, dipin paling atas (ala Meta AI di WhatsApp). */
export const KONTAK_MITA: KontakChat = {
  id: 'mita',
  nama: 'Mita',
  keterangan: 'Asisten AI SIMWT · tanya apa saja',
  ai: true,
  online: true,
};

/**
 * Kontak sesama pengguna, diambil dari daftar pengguna SIMWT (GET /pengguna).
 *
 * Disimpan di memori modul setelah sekali diambil supaya berpindah antar layar
 * tidak memanggil ulang endpoint yang isinya jarang berubah.
 */
let kontakPengguna: KontakChat[] = [];

/** Kontak yang sudah pernah diajak bicara (punya riwayat) — untuk daftar chat. */
const KUNCI_PERCAKAPAN = '@chat_percakapan'; // + _{idPengguna}

// ─── Lapisan transport ─────────────────────────────────────────────────────

export interface ChatTransport {
  /** Kirim satu pesan; kembalikan status akhir + balasan bila ada. */
  kirim(pesan: PesanChat, idPengirim: string): Promise<{
    status: StatusPesan;
    balasan?: PesanChat;
  }>;
}

/** Transport Mita — memakai endpoint AI yang sudah ada. */
class MitaTransport implements ChatTransport {
  async kirim(pesan: PesanChat, idPengirim: string) {
    const formData = new FormData();
    formData.append('message', pesan.teks);
    formData.append('session_id', `mobile-${idPengirim}`);
    if (pesan.lampiran) {
      formData.append('attachment', {
        uri: pesan.lampiran.uri,
        name: pesan.lampiran.nama,
        type: pesan.lampiran.tipe,
      } as any);
    }

    const response = await api.post(API_CONFIG.ENDPOINTS.MITA_CHAT_SEND, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    const teksBalasan =
      response.data?.reply || response.data?.message || 'Mita telah menerima pesan Anda.';

    const balasan: PesanChat = {
      id: `${Date.now()}-mita`,
      teks: teksBalasan,
      pengirim: KONTAK_MITA.id,
      waktu: Date.now(),
      status: 'dibaca',
    };

    return { status: 'dibaca' as StatusPesan, balasan };
  }
}

/**
 * Transport sesama pengguna SEBELUM server chat ada: tidak mengirim ke mana
 * pun, pesan berstatus `menunggu` (jam pasir) — jujur pada keadaan, dan
 * antreannya siap didorong begitu WebSocketTransport menggantikan kelas ini.
 */
class BelumTerhubungTransport implements ChatTransport {
  async kirim(): Promise<{ status: StatusPesan }> {
    return { status: 'menunggu' };
  }
}

// ─── Layanan utama ─────────────────────────────────────────────────────────

let transportMita: ChatTransport = new MitaTransport();
let transportPengguna: ChatTransport = new BelumTerhubungTransport();

function kunci(idPengguna: string | number, idKontak: string): string {
  return `${KUNCI_RIWAYAT}_${idPengguna}_${idKontak}`;
}

export const chatService = {
  semuaKontak(): KontakChat[] {
    return [KONTAK_MITA, ...kontakPengguna];
  },

  kontak(id: string): KontakChat | undefined {
    return this.semuaKontak().find((kontak) => kontak.id === id);
  },

  /**
   * Tarik daftar pengguna dari server dan jadikan kontak chat.
   * `idSaya` dikeluarkan — tidak ada gunanya mengobrol dengan diri sendiri.
   */
  async muatKontakPengguna(idSaya: number | string): Promise<KontakChat[]> {
    if (kontakPengguna.length > 0) return kontakPengguna;

    const pengguna = await penggunaService.semua();
    kontakPengguna = pengguna
      .filter((item) => String(item.id) !== String(idSaya))
      .map((item) => ({
        id: `u-${item.id}`,
        nama: item.karyawan?.nama_lengkap || item.nama_lengkap || item.username,
        keterangan:
          namaDari(item.karyawan?.jabatan) ||
          namaDari(item.karyawan?.departemen) ||
          item.username,
        foto: item.karyawan?.foto_profil ?? null,
      }))
      .sort((a, b) => a.nama.localeCompare(b.nama));

    return kontakPengguna;
  },

  /** Id kontak yang sudah pernah dibuka percakapannya (selain Mita). */
  async percakapanAktif(idPengguna: string | number): Promise<string[]> {
    try {
      const tersimpan = await AsyncStorage.getItem(`${KUNCI_PERCAKAPAN}_${idPengguna}`);
      return tersimpan ? (JSON.parse(tersimpan) as string[]) : [];
    } catch {
      return [];
    }
  },

  /** Tandai satu kontak sebagai percakapan aktif (muncul di daftar chat). */
  async mulaiPercakapan(idPengguna: string | number, idKontak: string) {
    const aktif = await this.percakapanAktif(idPengguna);
    if (aktif.includes(idKontak)) return;
    await AsyncStorage.setItem(
      `${KUNCI_PERCAKAPAN}_${idPengguna}`,
      JSON.stringify([...aktif, idKontak])
    );
  },

  /** Titik penggantian transport saat WebSocket siap. */
  setTransportPengguna(transport: ChatTransport) {
    transportPengguna = transport;
  },

  async ambilRiwayat(idPengguna: string | number, idKontak: string): Promise<PesanChat[]> {
    try {
      const tersimpan = await AsyncStorage.getItem(kunci(idPengguna, idKontak));
      return tersimpan ? (JSON.parse(tersimpan) as PesanChat[]) : [];
    } catch {
      return [];
    }
  },

  async simpanRiwayat(idPengguna: string | number, idKontak: string, pesan: PesanChat[]) {
    try {
      await AsyncStorage.setItem(kunci(idPengguna, idKontak), JSON.stringify(pesan));
    } catch {
      // Riwayat lokal bersifat nyaman-dimiliki; kegagalan simpan jangan
      // sampai menggagalkan pengiriman pesannya sendiri.
    }
  },

  async hapusRiwayat(idPengguna: string | number, idKontak: string) {
    await AsyncStorage.removeItem(kunci(idPengguna, idKontak));
  },

  /** Kirim lewat transport yang tepat untuk kontak tsb. */
  async kirimPesan(
    idPengguna: string | number,
    idKontak: string,
    pesan: PesanChat
  ): Promise<{ status: StatusPesan; balasan?: PesanChat }> {
    const transport = idKontak === KONTAK_MITA.id ? transportMita : transportPengguna;
    return transport.kirim(pesan, String(idPengguna));
  },

  /**
   * Ringkasan untuk daftar chat.
   *
   * Hanya menampilkan Mita + kontak yang percakapannya sudah dimulai —
   * seperti WhatsApp, daftar chat berisi percakapan, bukan seluruh buku
   * alamat. Kontak lain dijangkau lewat layar "Chat Baru".
   */
  async ringkasan(idPengguna: string | number): Promise<RingkasanChat[]> {
    const aktif = await this.percakapanAktif(idPengguna);
    const tampil = this.semuaKontak().filter(
      (kontak) => kontak.ai || aktif.includes(kontak.id)
    );

    const hasil = await Promise.all(
      tampil.map(async (kontak) => {
        const riwayat = await this.ambilRiwayat(idPengguna, kontak.id);
        const terakhir = riwayat[riwayat.length - 1];
        return {
          kontak,
          cuplikan: terakhir
            ? terakhir.lampiran
              ? `📎 ${terakhir.lampiran.nama}`
              : terakhir.teks
            : kontak.ai
              ? 'Tanya apa saja tentang Kaizen, aset, atau sistem'
              : 'Ketuk untuk mulai percakapan',
          waktu: terakhir?.waktu ?? null,
          belumDibaca: 0, // diisi server chat nanti
        };
      })
    );

    // Mita selalu paling atas; sisanya urut pesan terbaru.
    return hasil.sort((a, b) => {
      if (a.kontak.ai !== b.kontak.ai) return a.kontak.ai ? -1 : 1;
      return (b.waktu ?? 0) - (a.waktu ?? 0);
    });
  },
};

export default chatService;
