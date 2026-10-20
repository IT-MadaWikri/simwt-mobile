/**
 * AppDialog — dialog lintas-platform pengganti `Alert.alert`.
 *
 * ── Kenapa ini ada ───────────────────────────────────────────────────────
 * `Alert` bawaan React Native TIDAK diimplementasikan di react-native-web —
 * isinya benar-benar `class Alert { static alert() {} }`, sebuah fungsi
 * kosong. Akibatnya setiap `Alert.alert(...)` diam total saat aplikasi
 * dibuka di web: tombol ditekan, tidak ada apa pun yang terjadi, tanpa error.
 * Itu persis gejala tombol Keluar yang tidak berfungsi.
 *
 * Komponen ini memakai `<Modal>` biasa sehingga berperilaku sama di Android,
 * iOS, maupun web, dan tampilannya mengikuti kelas global (`gs`).
 *
 * ── Cara pakai ───────────────────────────────────────────────────────────
 *   import { dialog } from '../src/components/common/AppDialog';
 *
 *   dialog.alert('Judul', 'Pesan');                       // sekadar memberi tahu
 *
 *   const setuju = await dialog.confirm({                 // minta konfirmasi
 *     title: 'Keluar dari Aplikasi',
 *     message: 'Apakah Anda yakin ingin keluar?',
 *     confirmText: 'Keluar',
 *     destructive: true,
 *   });
 *   if (!setuju) return;
 *
 * `<DialogHost />` cukup dipasang SEKALI di `app/_layout.tsx`. Tanpa itu,
 * pemanggilan `dialog.*` tidak akan menampilkan apa pun.
 */
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Modal, Animated, TextInput } from 'react-native';
import Icon from './Icon';
import Button from './Button';
import Colors, { brand } from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { gs } from '../../../constants/GlobalStyles';

type DialogTone = 'info' | 'success' | 'danger';

/** Konfigurasi kolom isian pada dialog `prompt`. */
interface KonfigIsian {
  placeholder?: string;
  multiline?: boolean;
  /** Tombol utama mati sampai isian tidak kosong. Default: true. */
  wajib?: boolean;
  maxLength?: number;
  /** Sembunyikan ketikan (kata sandi). */
  rahasia?: boolean;
}

interface DialogRequest {
  title: string;
  message?: string;
  confirmText: string;
  cancelText?: string;
  tone: DialogTone;
  /** Bila ada, dialog menampilkan kolom isian dan menghasilkan teksnya. */
  isian?: KonfigIsian;
  resolve: (value: any) => void;
}

// ── Saluran sederhana antara API imperatif dan komponen host ──────────────
let emit: ((req: DialogRequest | null) => void) | null = null;

/** Apakah ada dialog yang sedang tampil? Slot dialog hanya satu: dialog baru menimpa yang lama. */
let terbuka = false;
export const adaDialogTerbuka = () => terbuka;

function request(req: Omit<DialogRequest, 'resolve'>): Promise<any> {
  return new Promise((resolve) => {
    if (!emit) {
      // Host belum terpasang — jangan menggantung Promise-nya.
      console.warn('<DialogHost /> belum dipasang di app/_layout.tsx');
      resolve(req.isian ? null : false);
      return;
    }
    emit({ ...req, resolve });
  });
}

export const dialog = {
  /** Pesan satu tombol. Promise selesai saat pengguna menutupnya. */
  alert(title: string, message?: string, tone: DialogTone = 'info') {
    return request({ title, message, confirmText: 'OK, Mengerti', tone });
  },

  /** Konfirmasi dua tombol. Menghasilkan `true` kalau tombol utama ditekan. */
  confirm(options: {
    title: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
    destructive?: boolean;
  }) {
    return request({
      title: options.title,
      message: options.message,
      confirmText: options.confirmText ?? 'Ya',
      cancelText: options.cancelText ?? 'Batal',
      tone: options.destructive ? 'danger' : 'info',
    }) as Promise<boolean>;
  },

  /**
   * Minta pengguna mengetik sesuatu — mis. alasan penolakan.
   *
   * Menghasilkan teks yang diketik, atau `null` bila dibatalkan. Selama
   * `wajib` (default) dan kolomnya masih kosong, tombol utama dinonaktifkan,
   * jadi pemanggil tidak perlu memvalidasi kekosongan lagi.
   */
  prompt(options: {
    title: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
    destructive?: boolean;
    isian?: KonfigIsian;
  }) {
    return request({
      title: options.title,
      message: options.message,
      confirmText: options.confirmText ?? 'Kirim',
      cancelText: options.cancelText ?? 'Batal',
      tone: options.destructive ? 'danger' : 'info',
      isian: options.isian ?? {},
    }) as Promise<string | null>;
  },
};

const TONES: Record<DialogTone, { icon: string; color: string; bg: string }> = {
  info: { icon: 'information', color: brand[600], bg: brand[50] },
  success: { icon: 'check-circle', color: brand[600], bg: brand[50] },
  danger: { icon: 'alert-circle', color: Colors.danger, bg: Colors.serviceRed },
};

export function DialogHost() {
  const [req, setReq] = useState<DialogRequest | null>(null);
  const [teks, setTeks] = useState('');
  const scale = useRef(new Animated.Value(0.9)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    emit = setReq;
    return () => {
      emit = null;
    };
  }, []);

  useEffect(() => {
    terbuka = req !== null;
  }, [req]);

  useEffect(() => {
    if (!req) return;
    // Kolom isian selalu mulai kosong — sisa ketikan dialog sebelumnya tidak
    // boleh terbawa ke keputusan berikutnya.
    setTeks('');
    scale.setValue(0.9);
    opacity.setValue(0);
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 90, friction: 9 }),
      Animated.timing(opacity, { toValue: 1, duration: 160, useNativeDriver: true }),
    ]).start();
  }, [req]);

  /**
   * Dialog ber-isian menghasilkan TEKS (atau null saat dibatalkan);
   * dialog biasa menghasilkan boolean.
   */
  const close = (setuju: boolean) => {
    if (req?.isian) req.resolve(setuju ? teks.trim() : null);
    else req?.resolve(setuju);
    setReq(null);
  };

  if (!req) return null;
  const tone = TONES[req.tone];
  const wajibDiisi = req.isian?.wajib !== false;
  const belumSah = !!req.isian && wajibDiisi && teks.trim().length === 0;

  return (
    <Modal transparent visible animationType="none" onRequestClose={() => close(false)}>
      <Animated.View style={[styles.overlay, { opacity }]}>
        <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
          <View style={[styles.iconCircle, { backgroundColor: tone.bg }]}>
            <Icon name={tone.icon as any} size={36} color={tone.color} />
          </View>

          <Text style={[gs.h3, gs.textCenter]}>{req.title}</Text>
          {req.message ? (
            <Text style={[gs.body, gs.textCenter, { marginTop: Spacing.sm }]}>{req.message}</Text>
          ) : null}

          {req.isian ? (
            <TextInput
              style={[
                gs.field,
                req.isian.multiline && { minHeight: 96, textAlignVertical: 'top' },
                { marginTop: Spacing.lg },
              ]}
              placeholder={req.isian.placeholder ?? 'Tulis di sini...'}
              placeholderTextColor={Colors.placeholder}
              value={teks}
              onChangeText={setTeks}
              multiline={req.isian.multiline}
              maxLength={req.isian.maxLength}
              secureTextEntry={req.isian.rahasia}
              autoCapitalize={req.isian.rahasia ? 'none' : undefined}
              autoFocus
            />
          ) : null}

          <View style={[gs.row, gs.gapSm, styles.actions]}>
            {req.cancelText ? (
              <Button variant="muted" label={req.cancelText} onPress={() => close(false)} style={gs.flex1} />
            ) : null}

            {/* Isian wajib yang masih kosong: tombol dimatikan, bukan
                dibiarkan ditekan lalu ditolak server dengan 422. */}
            <Button
              variant={req.tone === 'danger' ? 'danger' : 'primary'}
              label={req.confirmText}
              onPress={() => close(true)}
              disabled={belumSah}
              style={gs.flex1}
            />
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = {
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(4, 61, 35, 0.55)',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    padding: Spacing.xxl,
  },
  card: {
    width: '100%' as const,
    maxWidth: 340,
    backgroundColor: Colors.card,
    borderRadius: Spacing.radius.xxl,
    padding: Spacing.xxl,
    alignItems: 'center' as const,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: Spacing.radius.full,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginBottom: Spacing.lg,
  },
  actions: {
    marginTop: Spacing.xl,
    alignSelf: 'stretch' as const,
  },
};

export default DialogHost;
