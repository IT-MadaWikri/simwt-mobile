/**
 * Bottom sheet cari karyawan (nama atau NIK) — dipakai untuk Pelaksana,
 * Disarankan oleh, dan PIC manfaat di formulir Buat Kaizen.
 */
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import BottomSheet from '../common/BottomSheet';
import Avatar from '../common/Avatar';
import Icon from '../common/Icon';
import Colors from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { fonts, ukuranIsi } from '../../../constants/Typography';
import { gs, inputReset } from '../../../constants/GlobalStyles';
import { kaizenService } from '../../services/kaizenService';
import { KaryawanRingkas } from '../../types/kaizen';

interface Props {
  visible: boolean;
  judul: string;
  onClose: () => void;
  onPilih: (k: KaryawanRingkas) => void;
}

export default function SheetKaryawan({ visible, judul, onClose, onPilih }: Props) {
  const [q, setQ] = useState('');
  const [hasil, setHasil] = useState<KaryawanRingkas[]>([]);
  const [memuat, setMemuat] = useState(false);
  const [gagal, setGagal] = useState(false);
  const permintaan = useRef(0);

  useEffect(() => {
    if (!visible) {
      setQ('');
      setHasil([]);
    }
  }, [visible]);

  // Tunda 300 ms setelah berhenti mengetik; hasil permintaan lama diabaikan.
  useEffect(() => {
    const kata = q.trim();
    if (kata.length < 2) {
      setHasil([]);
      setMemuat(false);
      return;
    }
    const id = ++permintaan.current;
    setMemuat(true);
    const t = setTimeout(() => {
      kaizenService
        .cariKaryawan(kata)
        .then((d) => id === permintaan.current && (setHasil(d), setGagal(false)))
        .catch(() => id === permintaan.current && setGagal(true))
        .finally(() => id === permintaan.current && setMemuat(false));
    }, 300);
    return () => clearTimeout(t);
  }, [q]);

  const pesan = gagal
    ? 'Gagal mencari. Periksa koneksi lalu coba lagi.'
    : q.trim().length < 2
      ? 'Ketik minimal 2 huruf nama atau NIK.'
      : memuat
        ? null
        : hasil.length === 0
          ? 'Karyawan tidak ditemukan.'
          : null;

  return (
    <BottomSheet visible={visible} onClose={onClose} title={judul} penuh>
      <View style={styles.isi}>
        <View style={[gs.searchBar, styles.cari]}>
          <Icon name="magnify" size={16} color={Colors.textTertiary} />
          <TextInput
            style={styles.input}
            placeholder="Cari nama atau NIK"
            placeholderTextColor={Colors.placeholder}
            value={q}
            onChangeText={setQ}
            autoFocus
            autoCorrect={false}
            returnKeyType="search"
          />
          {q ? (
            <TouchableOpacity onPress={() => setQ('')} hitSlop={10} accessibilityLabel="Hapus pencarian">
              <Icon name="close-circle" size={16} color={Colors.textTertiary} />
            </TouchableOpacity>
          ) : null}
        </View>

        {memuat ? (
          <View style={styles.memuat}>
            <ActivityIndicator size="small" color={Colors.primary} />
            <Text style={styles.teksMemuat}>Mencari karyawan…</Text>
          </View>
        ) : null}

        {pesan ? <Text style={styles.pesan}>{pesan}</Text> : null}

        {!memuat && hasil.map((k, i) => (
          <TouchableOpacity
            key={k.nik}
            style={[styles.baris, i > 0 && styles.garis]}
            activeOpacity={0.6}
            onPress={() => {
              onPilih(k);
              onClose();
            }}
          >
            <Avatar nama={k.nama} ukuran={36} />
            <View style={gs.flex1}>
              <Text style={styles.nama} numberOfLines={1}>{k.nama}</Text>
              <Text style={styles.nik} numberOfLines={1}>{k.nik}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  isi: {
    paddingHorizontal: Spacing.lg,
  },
  cari: {
    marginBottom: Spacing.sm,
  },
  input: {
    flex: 1,
    paddingVertical: 0,
    fontSize: ukuranIsi,
    fontFamily: fonts.regular,
    color: Colors.textPrimary,
    ...inputReset,
  },
  memuat: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
  },
  teksMemuat: {
    fontSize: ukuranIsi,
    fontFamily: fonts.regular,
    color: Colors.textSecondary,
  },
  pesan: {
    paddingVertical: Spacing.lg,
    textAlign: 'center',
    fontSize: ukuranIsi,
    fontFamily: fonts.regular,
    color: Colors.textTertiary,
  },
  baris: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  garis: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
  },
  nama: {
    fontSize: 12,
    fontFamily: fonts.semibold,
    color: Colors.textPrimary,
  },
  nik: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: Colors.textTertiary,
    marginTop: 1,
  },
});
