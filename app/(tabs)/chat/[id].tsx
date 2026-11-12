/**
 * Ruang percakapan.
 *
 * Anatomi:
 *  - header terang berisi tombol kembali + avatar + nama + status
 *  - latar abu sangat muda, datar
 *  - pesan masuk polos tanpa gelembung (avatar + nama di awal rangkaian),
 *    pesan keluar gelembung hijau muda rata kanan
 *  - chip tanggal (Hari Ini / Kemarin / 10 Agustus 2026) di tengah
 *  - jam kecil + tanda status di pojok pesan keluar
 *    (jam pasir=menunggu, ✓=terkirim, ✓✓ hijau=dibaca, ⚠=gagal)
 *  - bilah tulis: tombol "+" lampiran, kapsul input outline, tombol kirim bulat
 *
 * Pengiriman lewat `chatService` — Mita dijawab AI, sesama pengguna berstatus
 * jam pasir sampai server chat (WebSocket) dihidupkan. Lihat chatService.ts.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import Animated, { FadeInLeft, FadeInRight } from 'react-native-reanimated';
import Icon from '../../../src/components/common/Icon';
import Avatar from '../../../src/components/common/Avatar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import BottomSheet from '../../../src/components/common/BottomSheet';
import Colors, { brand } from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import Typography, { fonts } from '../../../constants/Typography';
import { gs, inputReset } from '../../../constants/GlobalStyles';
import { useAuth } from '../../../src/contexts/AuthContext';
import { dialog } from '../../../src/components/common/AppDialog';
import { chatService, KONTAK_MITA } from '../../../src/services/chatService';
import { useSetelahTransisi } from '../../../src/utils/useSetelahTransisi';
import { useTinggiKeyboard } from '../../../src/hooks/useTinggiKeyboard';
import { PesanChat } from '../../../src/types/chat';

/** Chip tanggal: "Hari Ini", "Kemarin", atau tanggal lengkap. */
function labelTanggal(waktu: number): string {
  const tanggal = new Date(waktu);
  const sekarang = new Date();
  const awalHariIni = new Date(sekarang.getFullYear(), sekarang.getMonth(), sekarang.getDate());

  if (tanggal >= awalHariIni) return 'Hari Ini';
  if (tanggal >= new Date(awalHariIni.getTime() - 86400000)) return 'Kemarin';
  return tanggal.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

function jam(waktu: number): string {
  return new Date(waktu).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

/** Ikon status di pojok pesan keluar. */
function IkonStatus({ status }: { status: PesanChat['status'] }) {
  if (status === 'menunggu') {
    return <Icon name="clock-outline" size={13} color={Colors.textTertiary} />;
  }
  if (status === 'gagal') {
    return <Icon name="alert-circle-outline" size={13} color={Colors.danger} />;
  }
  return (
    <Icon
      name={status === 'dibaca' ? 'check-all' : 'check'}
      size={14}
      color={status === 'dibaca' ? brand[500] : Colors.textTertiary}
    />
  );
}

/** Item render: pesan, atau penanda tanggal. */
type Baris =
  | { jenis: 'pesan'; pesan: PesanChat; awalRangkaian: boolean }
  | { jenis: 'tanggal'; label: string; id: string };

export default function RuangChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const idPengguna = user?.id ?? 'tamu';

  const kontak = chatService.kontak(id ?? '') ?? KONTAK_MITA;
  const [pesan, setPesan] = useState<PesanChat[]>([]);
  const [ketikan, setKetikan] = useState('');
  const [lampiran, setLampiran] = useState<PesanChat['lampiran']>(null);
  const [mengirim, setMengirim] = useState(false);
  const [pilihanLampiran, setPilihanLampiran] = useState(false);
  const tinggiKeyboard = useTinggiKeyboard();
  const daftarRef = useRef<FlatList>(null);
  // Pesan yang sudah ada saat riwayat dimuat tidak dianimasikan; hanya yang baru muncul sesudahnya.
  const idLama = useRef(new Set<string>());

  // Membaca + mem-parse riwayat ditunda sampai animasi masuk selesai;
  // kalau tidak, keduanya berebut thread JS dan perpindahan ke ruang chat
  // terasa tersendat. Lihat src/utils/useSetelahTransisi.ts.
  useSetelahTransisi(() => {
    chatService.ambilRiwayat(idPengguna, kontak.id).then((riwayat) => {
      riwayat.forEach((p) => idLama.current.add(p.id));
      setPesan(riwayat);
      // Lompat langsung ke pesan terakhir TANPA animasi — menganimasikan
      // gulungan sepanjang riwayat saat layar baru dibuka terasa tersendat.
      setTimeout(() => daftarRef.current?.scrollToEnd({ animated: false }), 60);
    });
  }, [idPengguna, kontak.id]);

  const gulirKeBawah = useCallback(() => {
    // Tunggu satu frame supaya FlatList sudah mengukur baris barunya.
    setTimeout(() => daftarRef.current?.scrollToEnd({ animated: true }), 80);
  }, []);

  // Keyboard naik → daftar menyempit; geser ke pesan terakhir supaya tidak tertutup.
  useEffect(() => {
    if (tinggiKeyboard) gulirKeBawah();
  }, [tinggiKeyboard, gulirKeBawah]);

  const kirim = async () => {
    const teks = ketikan.trim();
    if ((!teks && !lampiran) || mengirim) return;

    const keluar: PesanChat = {
      id: `${Date.now()}-saya`,
      teks,
      pengirim: 'saya',
      waktu: Date.now(),
      status: 'menunggu',
      lampiran,
    };

    // Optimistis: langsung tampil berstatus jam pasir.
    const dgnKeluar = [...pesan, keluar];
    setPesan(dgnKeluar);
    setKetikan('');
    setLampiran(null);
    setMengirim(true);
    gulirKeBawah();

    try {
      const hasil = await chatService.kirimPesan(idPengguna, kontak.id, keluar);

      let akhir = dgnKeluar.map((item) =>
        item.id === keluar.id ? { ...item, status: hasil.status } : item
      );
      if (hasil.balasan) akhir = [...akhir, hasil.balasan];

      setPesan(akhir);
      await chatService.simpanRiwayat(idPengguna, kontak.id, akhir);
      if (hasil.balasan) gulirKeBawah();
    } catch {
      const akhir = dgnKeluar.map((item) =>
        item.id === keluar.id ? { ...item, status: 'gagal' as const } : item
      );
      setPesan(akhir);
      await chatService.simpanRiwayat(idPengguna, kontak.id, akhir);
    } finally {
      setMengirim(false);
    }
  };

  const pilihDokumen = async () => {
    const hasil = await DocumentPicker.getDocumentAsync({
      // Samakan dengan validasi lampiran Mita di sim-mwt (maks 10MB); tipe lain ditolak server (422).
      type: [
        'image/*',
        'application/pdf',
        'text/plain',
        'text/csv',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ],
      copyToCacheDirectory: true,
    });
    if (!hasil.canceled && hasil.assets?.[0]) {
      const berkas = hasil.assets[0];
      setLampiran({
        uri: berkas.uri,
        nama: berkas.name,
        tipe: berkas.mimeType || 'application/octet-stream',
      });
    }
  };

  const pilihGambar = async (sumber: 'kamera' | 'galeri') => {
    const izin =
      sumber === 'kamera'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!izin.granted) {
      dialog.alert('Izin Ditolak', `Aplikasi butuh izin ${sumber === 'kamera' ? 'kamera' : 'galeri'} untuk melampirkan gambar.`);
      return;
    }
    const opsi: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], quality: 0.8 };
    const hasil =
      sumber === 'kamera'
        ? await ImagePicker.launchCameraAsync(opsi)
        : await ImagePicker.launchImageLibraryAsync(opsi);
    const gambar = hasil.canceled ? null : hasil.assets[0];
    if (gambar) {
      setLampiran({
        uri: gambar.uri,
        nama: gambar.fileName || `gambar-${Date.now()}.jpg`,
        tipe: gambar.mimeType || 'image/jpeg',
      });
    }
  };

  /** Tutup sheet dulu, baru buka pemilih — dua layar sekaligus sering macet di Android. */
  const jalankanPilihan = (aksi: () => Promise<void>) => {
    setPilihanLampiran(false);
    setTimeout(() => void aksi(), 300);
  };

  const bersihkan = async () => {
    const setuju = await dialog.confirm({
      title: 'Bersihkan Chat',
      message: `Hapus semua riwayat percakapan dengan ${kontak.nama}?`,
      confirmText: 'Hapus',
      destructive: true,
    });
    if (!setuju) return;
    await chatService.hapusRiwayat(idPengguna, kontak.id);
    setPesan([]);
  };

  // Susun baris: sisipkan chip tanggal tiap pergantian hari, dan tandai
  // pesan pertama tiap rangkaian pengirim (tempat avatar + nama tampil).
  const baris: Baris[] = [];
  let hariTerakhir = '';
  pesan.forEach((item, indeks) => {
    const hari = labelTanggal(item.waktu);
    if (hari !== hariTerakhir) {
      baris.push({ jenis: 'tanggal', label: hari, id: `t-${item.id}` });
      hariTerakhir = hari;
    }
    const sebelumnya = pesan[indeks - 1];
    baris.push({
      jenis: 'pesan',
      pesan: item,
      awalRangkaian:
        !sebelumnya || sebelumnya.pengirim !== item.pengirim || hari !== labelTanggal(sebelumnya.waktu),
    });
  });

  const renderBaris = ({ item }: { item: Baris }) => {
    if (item.jenis === 'tanggal') {
      return (
        <View style={styles.chipWrap}>
          <View style={styles.chip}>
            <Text style={styles.chipTeks}>{item.label}</Text>
          </View>
        </View>
      );
    }

    const milikSaya = item.pesan.pengirim === 'saya';
    const lampiranPesan = item.pesan.lampiran && (
      <View style={[gs.row, gs.gapSm, styles.lampiranBubble]}>
        <Icon
          name={item.pesan.lampiran.tipe.includes('image') ? 'image' : 'file-document'}
          size={20}
          color={brand[700]}
        />
        <Text style={[gs.bodySm, gs.flex1]} numberOfLines={1}>
          {item.pesan.lampiran.nama}
        </Text>
      </View>
    );

    // Pesan baru masuk dengan geser + memudar (keluar dari kanan, masuk dari kiri).
    const baru = !idLama.current.has(item.pesan.id);
    const Pembungkus = baru ? Animated.View : View;
    const masuk = baru ? (milikSaya ? FadeInRight : FadeInLeft).duration(260) : undefined;

    if (milikSaya) {
      return (
        <Pembungkus entering={masuk} style={[styles.barisPesan, { justifyContent: 'flex-end' }]}>
          <View style={styles.gelembungKeluar}>
            {lampiranPesan}
            {item.pesan.teks ? <Text style={styles.teksPesan}>{item.pesan.teks}</Text> : null}
            <View style={styles.metaPesan}>
              <Text style={styles.jam}>{jam(item.pesan.waktu)}</Text>
              <IkonStatus status={item.pesan.status} />
            </View>
          </View>
        </Pembungkus>
      );
    }

    // Pesan masuk: polos; avatar + nama hanya di awal rangkaian.
    return (
      <Pembungkus entering={masuk} style={styles.barisPesan}>
        <View style={styles.kolomAvatar}>
          {item.awalRangkaian &&
            (kontak.ai ? (
              <View style={styles.avatarAi}>
                <Icon name="creation" size={18} color={brand[600]} />
              </View>
            ) : (
              <Avatar nama={kontak.nama} foto={kontak.foto ?? undefined} ukuran={AVATAR_PESAN} />
            ))}
        </View>
        <View style={styles.isiMasuk}>
          {item.awalRangkaian && <Text style={styles.namaPengirim}>{kontak.nama}</Text>}
          {lampiranPesan}
          {item.pesan.teks ? <Text style={styles.teksPesan}>{item.pesan.teks}</Text> : null}
          <Text style={[styles.jam, { marginTop: 2 }]}>{jam(item.pesan.waktu)}</Text>
        </View>
      </Pembungkus>
    );
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Padding bawah setinggi keyboard (bukan KeyboardAvoidingView, yang meleset di Android edge-to-edge). */}
      <View style={[styles.layar, { paddingBottom: tinggiKeyboard }]}>
        {/* ── Header ──────────────────────────────────────────────────── */}
        <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.tombolHeader}
            accessibilityLabel="Kembali"
          >
            <Icon name="chevron-left" size={26} color={Colors.textPrimary} />
          </TouchableOpacity>

          {kontak.ai ? (
            <View style={styles.avatarAiHeader}>
              <Icon name="creation" size={20} color={brand[600]} />
            </View>
          ) : (
            <Avatar nama={kontak.nama} foto={kontak.foto ?? undefined} ukuran={40} />
          )}

          <View style={[gs.flex1, { marginLeft: Spacing.sm }]}>
            <Text style={styles.namaHeader} numberOfLines={1}>
              {kontak.nama}
            </Text>
            <Text style={styles.statusHeader} numberOfLines={1}>
              {kontak.ai
                ? 'Asisten AI · selalu aktif'
                : 'Menunggu server chat tersambung'}
            </Text>
          </View>

          <TouchableOpacity
            onPress={bersihkan}
            style={styles.tombolHeader}
            accessibilityLabel="Bersihkan chat"
          >
            <Icon name="delete-outline" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* ── Percakapan ─────────────────────────────────────────────── */}
        <FlatList
          ref={daftarRef}
          data={baris}
          keyExtractor={(item) => (item.jenis === 'tanggal' ? item.id : item.pesan.id)}
          renderItem={renderBaris}
          style={styles.percakapan}
          contentContainerStyle={{ paddingVertical: Spacing.md }}
          // Penyetelan kelancaran: render bertahap & buang baris di luar
          // layar. Gulir-ke-bawah TIDAK dikaitkan ke onContentSizeChange —
          // memicu animasi gulir di setiap perubahan ukuran (termasuk saat
          // keyboard muncul) membuat daftar terasa tersendat.
          initialNumToRender={16}
          windowSize={9}
          removeClippedSubviews
          ListEmptyComponent={
            <View style={[gs.center, { marginTop: Spacing.xxxl }]}>
              <View style={styles.chip}>
                <Text style={styles.chipTeks}>
                  {kontak.ai
                    ? `Mulai bertanya apa saja kepada ${kontak.nama} 👋`
                    : 'Belum ada pesan. Sapa duluan! 👋'}
                </Text>
              </View>
            </View>
          }
        />

        {/* ── Bilah tulis ────────────────────────────────────────────── */}
        {lampiran && (
          <View style={[gs.row, gs.gapSm, styles.pratinjauLampiran]}>
            <Icon name="paperclip" size={16} color={brand[700]} />
            <Text style={[gs.bodySm, gs.flex1]} numberOfLines={1}>
              {lampiran.nama}
            </Text>
            <TouchableOpacity onPress={() => setLampiran(null)}>
              <Icon name="close" size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
        )}

        {/* Keyboard sudah menutupi area gestur bawah, jadi inset bawah tak perlu lagi. */}
        <View style={[styles.bilahTulis, { paddingBottom: (tinggiKeyboard ? 0 : insets.bottom) + Spacing.sm }]}>
          <TouchableOpacity
            style={styles.tombolTambah}
            onPress={() => setPilihanLampiran(true)}
            accessibilityLabel="Lampirkan berkas"
          >
            <Icon name="plus" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>

          <View style={styles.kapsulInput}>
            <TextInput
              style={styles.input}
              placeholder={`Pesan untuk ${kontak.nama}`}
              placeholderTextColor={Colors.placeholder}
              value={ketikan}
              onChangeText={setKetikan}
              multiline
            />
          </View>

          <TouchableOpacity
            style={[styles.tombolKirim, mengirim && { opacity: 0.6 }]}
            onPress={kirim}
            disabled={mengirim}
            activeOpacity={0.85}
            accessibilityLabel="Kirim pesan"
          >
            <Icon name="send" size={18} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </View>

      <BottomSheet visible={pilihanLampiran} onClose={() => setPilihanLampiran(false)} title="Lampirkan">
        {/* Tiga pilihan sejajar: ubin dengan ikon di atas, label di bawah. */}
        <View style={styles.barisOpsi}>
          {[
            { ikon: 'file-document', label: 'Dokumen', aksi: pilihDokumen },
            { ikon: 'image', label: 'Galeri', aksi: () => pilihGambar('galeri') },
            { ikon: 'camera', label: 'Kamera', aksi: () => pilihGambar('kamera') },
          ].map((opsi) => (
            <TouchableOpacity
              key={opsi.label}
              style={styles.opsiLampiran}
              activeOpacity={0.7}
              onPress={() => jalankanPilihan(opsi.aksi)}
            >
              <View style={styles.ikonOpsi}>
                <Icon name={opsi.ikon} size={22} color={brand[700]} />
              </View>
              <Text style={styles.labelOpsi}>{opsi.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </BottomSheet>
    </>
  );
}

/** Latar ruang chat: abu sangat muda, datar. */
const LATAR_RUANG = Colors.slate[50];
const AVATAR_PESAN = 32;

const styles = {
  layar: {
    flex: 1,
    backgroundColor: LATAR_RUANG,
  },

  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.sm,
    paddingBottom: Spacing.sm,
    gap: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderSubtle,
  },
  tombolHeader: {
    padding: Spacing.sm,
  },
  avatarAiHeader: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderWidth: 2,
    borderColor: brand[400],
  },
  namaHeader: {
    fontFamily: fonts.bold,
    fontSize: Typography.sizes.md,
    color: Colors.textPrimary,
  },
  statusHeader: {
    fontFamily: fonts.regular,
    fontSize: Typography.sizes.xs,
    color: Colors.textTertiary,
  },

  percakapan: {
    flex: 1,
    paddingHorizontal: Spacing.md,
  },
  chipWrap: {
    alignItems: 'center' as const,
    marginVertical: Spacing.sm,
  },
  chip: {
    backgroundColor: Colors.slate[100],
    borderRadius: Spacing.radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  chipTeks: {
    fontFamily: fonts.medium,
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
  },

  barisPesan: {
    flexDirection: 'row' as const,
    marginBottom: Spacing.sm,
  },
  kolomAvatar: {
    width: AVATAR_PESAN,
    marginRight: Spacing.sm,
  },
  avatarAi: {
    width: AVATAR_PESAN,
    height: AVATAR_PESAN,
    borderRadius: AVATAR_PESAN / 2,
    backgroundColor: brand[50],
    borderWidth: 1,
    borderColor: brand[400],
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  isiMasuk: {
    flex: 1,
    maxWidth: '85%' as const,
  },
  namaPengirim: {
    fontFamily: fonts.bold,
    fontSize: Typography.sizes.sm,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  // Pesan keluar: blok hijau muda datar, tanpa bayangan.
  gelembungKeluar: {
    maxWidth: '80%' as const,
    backgroundColor: brand[50],
    borderRadius: Spacing.radius.xl,
    ...Spacing.curve,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: brand[100],
  },
  teksPesan: {
    fontFamily: fonts.regular,
    fontSize: Typography.sizes.md,
    lineHeight: Typography.sizes.md * 1.45,
    color: Colors.textPrimary,
  },
  metaPesan: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    alignSelf: 'flex-end' as const,
    gap: 3,
    marginTop: 2,
  },
  jam: {
    fontFamily: fonts.regular,
    fontSize: Typography.sizes.xs,
    color: Colors.textTertiary,
  },
  lampiranBubble: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: Spacing.radius.md,
    padding: Spacing.sm,
    marginBottom: Spacing.xs,
  },

  barisOpsi: {
    flexDirection: 'row' as const,
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  opsiLampiran: {
    flex: 1,
    alignItems: 'center' as const,
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
    borderRadius: Spacing.radius.xl,
    ...Spacing.curve,
    backgroundColor: Colors.slate[50],
  },
  ikonOpsi: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: brand[50],
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  labelOpsi: {
    fontFamily: fonts.medium,
    fontSize: Typography.sizes.md,
    color: Colors.textPrimary,
  },

  pratinjauLampiran: {
    backgroundColor: brand[50],
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  bilahTulis: {
    flexDirection: 'row' as const,
    alignItems: 'flex-end' as const,
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    backgroundColor: LATAR_RUANG,
  },
  // Tombol "+" lingkaran outline di kiri, kapsul outline di tengah; tinggi
  // semuanya dikunci 40 supaya sejajar.
  tombolTambah: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  kapsulInput: {
    flex: 1,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    minHeight: 40,
    backgroundColor: Colors.white,
    borderRadius: 20,
    paddingHorizontal: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  input: {
    flex: 1,
    maxHeight: 96,
    fontFamily: fonts.regular,
    fontSize: Typography.sizes.md,
    lineHeight: Typography.sizes.md * 1.3,
    color: Colors.textPrimary,
    // Padding kecil saja: tinggi baris sudah dijaga `minHeight` kapsul.
    paddingVertical: Spacing.xs,
    ...inputReset,
    // Di web, TextInput multiline menjadi <textarea> yang membawa pegangan
    // resize bawaan browser (grip kecil di pojok kanan). Matikan.
    ...(Platform.OS === 'web' ? ({ resize: 'none' } as any) : null),
  },
  tombolKirim: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: brand[600],
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
};
