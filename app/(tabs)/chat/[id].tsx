/**
 * Ruang percakapan — tata letak mengikuti WhatsApp.
 *
 * Anatomi yang ditiru:
 *  - header brand berisi tombol kembali + avatar + nama + status, satu bilah
 *  - latar krem lembut khas ruang chat
 *  - gelembung: keluar hijau muda rata kanan, masuk putih rata kiri,
 *    dengan "ekor" pada gelembung pertama tiap rangkaian
 *  - chip tanggal (Hari Ini / Kemarin / 10 Agustus 2026) di tengah
 *  - jam kecil + tanda status di pojok gelembung keluar
 *    (jam pasir=menunggu, ✓=terkirim, ✓✓ hijau=dibaca, ⚠=gagal)
 *  - bilah tulis: kapsul input + lampiran, tombol kirim bulat
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
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'react-native';
import Icon from '../../../src/components/common/Icon';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import Colors, { brand } from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import Typography, { fonts } from '../../../constants/Typography';
import { gs, inputReset } from '../../../constants/GlobalStyles';
import { useAuth } from '../../../src/contexts/AuthContext';
import { dialog } from '../../../src/components/common/AppDialog';
import { chatService, KONTAK_MITA } from '../../../src/services/chatService';
import { useSetelahTransisi } from '../../../src/utils/useSetelahTransisi';
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

/** Ikon status di pojok gelembung keluar. */
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
  | { jenis: 'pesan'; pesan: PesanChat; berEkor: boolean }
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
  const daftarRef = useRef<FlatList>(null);

  // Membaca + mem-parse riwayat ditunda sampai animasi masuk selesai;
  // kalau tidak, keduanya berebut thread JS dan perpindahan ke ruang chat
  // terasa tersendat. Lihat src/utils/useSetelahTransisi.ts.
  useSetelahTransisi(() => {
    chatService.ambilRiwayat(idPengguna, kontak.id).then((riwayat) => {
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

    // Optimistis: langsung tampil berstatus jam pasir, seperti WhatsApp.
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

  const pilihLampiran = async () => {
    const hasil = await DocumentPicker.getDocumentAsync({
      type: '*/*',
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
  // gelembung pertama tiap rangkaian pengirim untuk diberi "ekor".
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
      berEkor: !sebelumnya || sebelumnya.pengirim !== item.pengirim || hari !== labelTanggal(sebelumnya.waktu),
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
    return (
      <View
        style={[
          styles.barisPesan,
          { justifyContent: milikSaya ? 'flex-end' : 'flex-start' },
        ]}
      >
        <View
          style={[
            styles.gelembung,
            milikSaya ? styles.gelembungKeluar : styles.gelembungMasuk,
            item.berEkor &&
              (milikSaya ? styles.ekorKeluar : styles.ekorMasuk),
          ]}
        >
          {item.pesan.lampiran && (
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
          )}

          {item.pesan.teks ? <Text style={styles.teksPesan}>{item.pesan.teks}</Text> : null}

          <View style={styles.metaPesan}>
            <Text style={styles.jam}>{jam(item.pesan.waktu)}</Text>
            {milikSaya && <IkonStatus status={item.pesan.status} />}
          </View>
        </View>
      </View>
    );
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <KeyboardAvoidingView
        style={styles.layar}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* ── Header ala WhatsApp ─────────────────────────────────────── */}
        <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.tombolHeader}
            accessibilityLabel="Kembali"
          >
            <Icon name="arrow-left" size={24} color={Colors.white} />
          </TouchableOpacity>

          <View style={styles.avatarHeader}>
            {kontak.ai ? (
              <Icon name="creation" size={20} color={brand[600]} />
            ) : (
              <Text style={styles.avatarHeaderTeks}>
                {kontak.nama
                  .split(' ')
                  .slice(0, 2)
                  .map((kata) => kata[0] ?? '')
                  .join('')
                  .toUpperCase()}
              </Text>
            )}
          </View>

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
            <Icon name="delete-outline" size={22} color={Colors.white} />
          </TouchableOpacity>
        </View>

        {/* ── Percakapan ─────────────────────────────────────────────── */}
        {/* Watermark logo samar di tengah ruang — padanan doodle latar
            WhatsApp, memberi karakter tanpa aset gambar tambahan. */}
        <View style={styles.watermarkWrap} pointerEvents="none">
          <Image source={LOGO} style={styles.watermark} resizeMode="contain" />
        </View>

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

        <View style={[styles.bilahTulis, { paddingBottom: insets.bottom + Spacing.sm }]}>
          <View style={styles.kapsulInput}>
            <TouchableOpacity onPress={pilihLampiran} accessibilityLabel="Lampirkan berkas">
              <Icon name="paperclip" size={20} color={Colors.textTertiary} />
            </TouchableOpacity>
            <TextInput
              style={styles.input}
              placeholder="Ketik pesan"
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
      </KeyboardAvoidingView>
    </>
  );
}

/** Latar ruang chat: krem lembut khas WhatsApp, dibelokkan sedikit ke brand. */
const LATAR_RUANG = '#eaf2ea';
const HIJAU_KELUAR = '#d9f5dd';

const LOGO = require('../../../assets/images/logo-loader.png');

const styles = {
  layar: {
    flex: 1,
    backgroundColor: LATAR_RUANG,
  },

  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: brand[700],
    paddingHorizontal: Spacing.sm,
    paddingBottom: Spacing.md,
    gap: Spacing.xs,
    // Sudut bawah membulat + bayangan supaya bilah terasa "duduk" di atas
    // ruang percakapan, bukan garis datar yang menempel ke status bar.
    borderBottomLeftRadius: Spacing.radius.xl,
    borderBottomRightRadius: Spacing.radius.xl,
  },
  tombolHeader: {
    padding: Spacing.sm,
  },
  avatarHeader: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.white,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderWidth: 2,
    borderColor: brand[400],
  },
  avatarHeaderTeks: {
    fontFamily: fonts.semibold,
    fontSize: Typography.sizes.sm,
    color: brand[700],
  },
  namaHeader: {
    fontFamily: fonts.semibold,
    fontSize: Typography.sizes.lg,
    color: Colors.white,
  },
  statusHeader: {
    fontFamily: fonts.regular,
    fontSize: Typography.sizes.xs,
    color: 'rgba(255,255,255,0.75)',
  },

  percakapan: {
    flex: 1,
    paddingHorizontal: Spacing.md,
  },
  watermarkWrap: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  watermark: {
    width: 220,
    height: 220,
    opacity: 0.05,
    tintColor: brand[700],
  },
  chipWrap: {
    alignItems: 'center' as const,
    marginVertical: Spacing.sm,
  },
  chip: {
    backgroundColor: Colors.white,
    borderRadius: Spacing.radius.md,
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
    marginBottom: 3,
  },
  // Tanpa bayangan per gelembung — menggambar bayangan untuk ratusan view
  // sekaligus membebani render iOS; garis tepi tipis memberi pemisahan yang
  // sama murahnya.
  gelembung: {
    maxWidth: '80%' as const,
    borderRadius: Spacing.radius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
  },
  gelembungKeluar: {
    backgroundColor: HIJAU_KELUAR,
  },
  gelembungMasuk: {
    backgroundColor: Colors.white,
  },
  // "Ekor": pojok atas sisi pengirim dibuat lancip pada gelembung pertama
  // tiap rangkaian — persis penanda arah di WhatsApp.
  ekorKeluar: {
    borderTopRightRadius: Spacing.radius.sm / 2,
  },
  ekorMasuk: {
    borderTopLeftRadius: Spacing.radius.sm / 2,
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
    fontSize: 10,
    color: Colors.textTertiary,
  },
  lampiranBubble: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: Spacing.radius.md,
    padding: Spacing.sm,
    marginBottom: Spacing.xs,
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
  // Tinggi minimum kapsul = tinggi tombol kirim, supaya keduanya duduk
  // sejajar rapi; saat mengetik panjang, kapsul tumbuh ke atas.
  // Tinggi kapsul dikunci sama dengan tombol kirim (40) supaya keduanya
  // sejajar rapi dan bilahnya tidak terlihat gemuk.
  kapsulInput: {
    flex: 1,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: Spacing.sm,
    minHeight: 40,
    backgroundColor: Colors.white,
    borderRadius: 20,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  input: {
    flex: 1,
    maxHeight: 96,
    fontFamily: fonts.regular,
    fontSize: Typography.sizes.md,
    lineHeight: Typography.sizes.md * 1.3,
    color: Colors.textPrimary,
    // Padding kecil saja: tinggi baris sudah dijaga `minHeight` kapsul.
    // Sebelumnya padding besar membuat kapsul menggelembung.
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
