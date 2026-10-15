/**
 * Buat tiket baru.
 *
 * Field wajib mengikuti validasi server (BuatRequest di api-simwt):
 * judul, jenis, departemen tujuan, detail. Plant & nama pengaju diambil dari
 * akun login. Pilihan jenis/departemen memakai bottom sheet daftar — pola
 * pilih-opsi yang lazim di aplikasi native, bukan <select> web.
 */
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Easing,
} from 'react-native';
import { useRouter } from 'expo-router';
import Icon from '../../../src/components/common/Icon';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors, { brand } from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { gs } from '../../../constants/GlobalStyles';
import BrandSpinner from '../../../src/components/common/BrandSpinner';
import { dialog } from '../../../src/components/common/AppDialog';
import { useAuth } from '../../../src/contexts/AuthContext';
import { tiketService, OpsiRef } from '../../../src/services/tiketService';
import { SkeletonForm } from '../../../src/components/common/Skeleton';

export default function BuatTiketScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const [memuat, setMemuat] = useState(true);
  const [mengirim, setMengirim] = useState(false);
  const [jenisOpsi, setJenisOpsi] = useState<OpsiRef[]>([]);
  const [departemenOpsi, setDepartemenOpsi] = useState<OpsiRef[]>([]);

  const [judul, setJudul] = useState('');
  const [detail, setDetail] = useState('');
  const [jenis, setJenis] = useState<OpsiRef | null>(null);
  const [departemen, setDepartemen] = useState<OpsiRef | null>(null);

  /** Bottom sheet pilihan: null = tertutup. */
  const [pilih, setPilih] = useState<'jenis' | 'departemen' | null>(null);

  // Panel digeser terpisah dari lapisan gelapnya, supaya latar muncul seketika
  // sementara panelnya saja yang naik dari bawah.
  const naikPanel = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (pilih === null) {
      naikPanel.setValue(0);
      return;
    }
    Animated.timing(naikPanel, {
      toValue: 1,
      duration: 260,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [pilih]);

  const geserPanel = naikPanel.interpolate({ inputRange: [0, 1], outputRange: [340, 0] });

  useEffect(() => {
    tiketService
      .masterBuat()
      .then((master) => {
        setJenisOpsi(master.jenisTicket);
        setDepartemenOpsi(master.daftarDepartemen);
      })
      .catch(() => {
        dialog.alert('Gagal Memuat', 'Data formulir tidak bisa diambil dari server.', 'danger');
      })
      .finally(() => setMemuat(false));
  }, []);

  const kirim = async () => {
    if (!judul.trim() || !detail.trim() || !jenis || !departemen) {
      dialog.alert(
        'Belum Lengkap',
        'Judul, jenis, departemen tujuan, dan detail masalah wajib diisi.'
      );
      return;
    }

    setMengirim(true);
    try {
      await tiketService.buat({
        judul_masalah: judul.trim(),
        detail_masalah: detail.trim(),
        id_ticket_jenis: jenis.id,
        id_departemen: departemen.id,
        id_plant: Number(user?.plant) || 1,
        diajukan_oleh: user?.nama_lengkap || user?.name || user?.username || 'Pengguna',
      });
      await dialog.alert('Tiket Terkirim', 'Tiket Anda sudah masuk antrean penanganan.', 'success');
      router.back();
    } catch (err: any) {
      dialog.alert(
        'Gagal Mengirim',
        err?.response?.data?.message || err?.message || 'Terjadi kesalahan.',
        'danger'
      );
    } finally {
      setMengirim(false);
    }
  };

  if (memuat) {
    return (
      <View style={gs.screen}>
        <SkeletonForm />
      </View>
    );
  }

  const opsiAktif = pilih === 'jenis' ? jenisOpsi : departemenOpsi;

  /** Field pemilih: tampak seperti input, membuka bottom sheet. */
  const Pemilih = ({
    label,
    nilai,
    onPress,
  }: {
    label: string;
    nilai: string | null;
    onPress: () => void;
  }) => (
    <View style={{ marginBottom: Spacing.lg }}>
      <Text style={gs.label}>
        {label} <Text style={gs.textDanger}>*</Text>
      </Text>
      <TouchableOpacity style={[gs.fieldWrap, { paddingVertical: 2 }]} onPress={onPress}>
        <Text style={[gs.fieldInner, !nilai && { color: Colors.placeholder }]}>
          {nilai ?? `Pilih ${label.toLowerCase()}`}
        </Text>
        <Icon name="chevron-down" size={22} color={Colors.textTertiary} />
      </TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={gs.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[gs.scrollContent, { paddingBottom: insets.bottom + Spacing.xxl }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[gs.cardBrand, gs.row, gs.gapSm, { marginBottom: Spacing.lg }]}>
          <Icon name="information-outline" size={18} color={brand[700]} />
          <Text style={[gs.bodySm, gs.flex1, { color: brand[800] }]}>
            Jelaskan masalah sedetail mungkin agar tim terkait bisa langsung menindaklanjuti.
          </Text>
        </View>

        <View style={{ marginBottom: Spacing.lg }}>
          <Text style={gs.label}>
            Judul Masalah <Text style={gs.textDanger}>*</Text>
          </Text>
          <TextInput
            style={gs.field}
            placeholder="Contoh: Printer tidak bisa mencetak"
            placeholderTextColor={Colors.placeholder}
            value={judul}
            onChangeText={setJudul}
          />
        </View>

        <Pemilih label="Jenis Tiket" nilai={jenis?.nama ?? null} onPress={() => setPilih('jenis')} />
        <Pemilih
          label="Departemen Tujuan"
          nilai={departemen?.nama ?? null}
          onPress={() => setPilih('departemen')}
        />

        <View style={{ marginBottom: Spacing.xl }}>
          <Text style={gs.label}>
            Detail Masalah <Text style={gs.textDanger}>*</Text>
          </Text>
          <TextInput
            style={[gs.field, { minHeight: 110, textAlignVertical: 'top' }]}
            placeholder="Ceritakan kronologi, lokasi, dan dampaknya..."
            placeholderTextColor={Colors.placeholder}
            value={detail}
            onChangeText={setDetail}
            multiline
          />
        </View>

        <TouchableOpacity
          style={[gs.btn, gs.btnPrimary, gs.btnBlock, mengirim && gs.btnDisabled]}
          onPress={kirim}
          disabled={mengirim}
          activeOpacity={0.85}
        >
          {mengirim ? (
            <BrandSpinner size={22} color={Colors.white} />
          ) : (
            <>
              <Icon name="send" size={18} color={Colors.white} />
              <Text style={[gs.btnText, gs.btnTextOnBrand]}>Kirim Tiket</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom sheet pilihan jenis/departemen. */}
      {/*
        `animationType="slide"` menggeser SELURUH isi modal — termasuk lapisan
        gelapnya — sehingga latar ikut merayap naik dari bawah bersama panelnya.
        Dipakai `fade` supaya latar langsung muncul di tempat, lalu panelnya
        saja yang digeser lewat animasi tersendiri di bawah.
      */}
      <Modal visible={pilih !== null} transparent animationType="fade" onRequestClose={() => setPilih(null)}>
        <View style={styles.sheetOverlay}>
          <TouchableOpacity style={gs.flex1} activeOpacity={1} onPress={() => setPilih(null)} />
          <Animated.View
            style={[
              styles.sheet,
              { paddingBottom: insets.bottom + Spacing.lg, transform: [{ translateY: geserPanel }] },
            ]}
          >
            <Text style={[gs.h3, { marginBottom: Spacing.md }]}>
              {pilih === 'jenis' ? 'Pilih Jenis Tiket' : 'Pilih Departemen Tujuan'}
            </Text>
            <FlatList
              data={opsiAktif}
              keyExtractor={(item) => String(item.id)}
              style={{ maxHeight: 380 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[gs.row, gs.gapMd, styles.opsi]}
                  onPress={() => {
                    if (pilih === 'jenis') setJenis(item);
                    else setDepartemen(item);
                    setPilih(null);
                  }}
                >
                  <Text style={[gs.textBase, gs.flex1]}>{item.nama}</Text>
                  {((pilih === 'jenis' && jenis?.id === item.id) ||
                    (pilih === 'departemen' && departemen?.id === item.id)) && (
                    <Icon name="check" size={20} color={brand[600]} />
                  )}
                </TouchableOpacity>
              )}
            />
          </Animated.View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = {
  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(4, 61, 35, 0.55)',
    justifyContent: 'flex-end' as const,
  },
  sheet: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: Spacing.radius.xxl,
    borderTopRightRadius: Spacing.radius.xxl,
    padding: Spacing.xl,
  },
  opsi: {
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderSubtle,
  },
};
