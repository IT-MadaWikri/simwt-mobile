/**
 * Detail Kaizen — setara halaman detail website (sim-mwt):
 *   - ringkasan (status, tema, nomor, departemen/plant, pelaksana),
 *   - jejak keputusan (diajukan → disetujui/ditolak oleh siapa, alasan tolak),
 *   - foto sebelum/sesudah (tap untuk memperbesar) dan kondisi,
 *   - manfaat lengkap per kategori PQCDSM,
 *   - bila DISETUJUI: nilai PQCDSM, nilai komite, form penilaian komite
 *     (izin `akses_penilaian_kaizen`) dan pembatalan nilai (`reset_penilaian_kaizen`),
 *   - bila DITERIMA dan berwenang: tombol Setujui / Tolak di bawah.
 * Hak akses dihitung server (`izin`), bukan ditebak dari nama peran.
 */
import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TextInput,
  TouchableOpacity,
  Modal,
  RefreshControl,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '../../../src/components/common/Icon';
import Avatar from '../../../src/components/common/Avatar';
import BottomSheet from '../../../src/components/common/BottomSheet';
import BrandSpinner from '../../../src/components/common/BrandSpinner';
import { dialog } from '../../../src/components/common/AppDialog';
import Colors, { brand, slate } from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { fonts, ukuranIsi } from '../../../constants/Typography';
import { gs, inputReset } from '../../../constants/GlobalStyles';
import { kaizenService } from '../../../src/services/kaizenService';
import { KaizenDetail } from '../../../src/types/kaizen';
import { BULAN, LENCANA, urlFoto, warnaStatus } from '../../../src/utils/kaizen';
import { SkeletonDetail } from '../../../src/components/common/Skeleton';

const PQCDSM = ['Productivity', 'Quality', 'Cost', 'Delivery', 'Safety', 'Morale'];

const tanggal = (iso?: string | null) => {
  if (!iso) return null;
  const t = new Date(iso.replace(' ', 'T'));
  return isNaN(t.getTime()) ? null : `${t.getDate()} ${BULAN[t.getMonth()]} ${t.getFullYear()}`;
};

const pesanGalat = (e: any, cadangan: string) => {
  const errors = e?.response?.data?.errors;
  const pertama = errors ? (Object.values(errors)[0] as string[])?.[0] : null;
  return pertama || e?.response?.data?.message || e?.message || cadangan;
};

export default function KaizenDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const [data, setData] = useState<KaizenDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [gagal, setGagal] = useState(false);
  const [proses, setProses] = useState<null | 'setuju' | 'tolak' | 'nilai' | 'reset'>(null);
  const [fotoBesar, setFotoBesar] = useState<string | null>(null);
  const [sheetTolak, setSheetTolak] = useState(false);
  const [alasan, setAlasan] = useState('');
  const [nilai, setNilai] = useState<Record<string, string>>({});

  const muat = useCallback(() => {
    if (!id) return Promise.resolve();
    return kaizenService
      .getDetail(Number(id))
      .then((d) => {
        setData(d);
        setGagal(false);
      })
      .catch(() => setGagal(true))
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  }, [id]);

  useEffect(() => {
    muat();
  }, [muat]);

  if (loading) {
    return (
      <View style={gs.screen}>
        <SkeletonDetail />
      </View>
    );
  }

  if (!data?.kaizen) {
    return (
      <View style={[gs.screen, gs.centerFill]}>
        <Icon name="alert-circle-outline" size={44} color={Colors.textTertiary} />
        <Text style={gs.emptyTitle}>{gagal ? 'Gagal memuat Kaizen' : 'Kaizen tidak ditemukan'}</Text>
        {gagal ? (
          <TouchableOpacity style={styles.tombolKecil} onPress={() => { setLoading(true); muat(); }}>
            <Text style={styles.teksTombolKecil}>Coba lagi</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    );
  }

  const { kaizen, manfaats = [], kategoriNilai = {}, totalKategoriNilai, nilaiPanitia, kriteriaPenilaian = [] } = data;
  const izin = data.izin ?? { approve: false, nilai: false, reset: false };
  const warna = warnaStatus(kaizen.status);
  const k = kaizen as any;
  const departemen = kaizen.departemen?.nama || k.departemen?.nama_departemen || kaizen.nama_departemen;
  const tags = [departemen, kaizen.plant?.nama].filter(Boolean) as string[];
  const fotos = [
    { label: 'Sebelum', uri: k.foto_sebelum_url ?? urlFoto(kaizen.foto_sebelum || kaizen.foto_kondisi_sebelum) },
    { label: 'Sesudah', uri: k.foto_sesudah_url ?? urlFoto(kaizen.foto_sesudah || kaizen.foto_kondisi_sesudah) },
  ];
  const teksSebelum = kaizen.detail_sebelum || kaizen.kondisi_sebelum;
  const teksSesudah = kaizen.detail_sesudah || kaizen.kondisi_sesudah;
  const bisaPutus = izin.approve && kaizen.status === 'DITERIMA';
  const bisaNilai = izin.nilai && kaizen.status === 'DISETUJUI' && !nilaiPanitia;

  const jalankan = async (jenis: NonNullable<typeof proses>, aksi: () => Promise<void>, sukses: string, gagalTeks: string) => {
    setProses(jenis);
    try {
      await aksi();
      await muat();
      dialog.alert('Berhasil', sukses, 'success');
      return true;
    } catch (e) {
      dialog.alert('Gagal', pesanGalat(e, gagalTeks), 'danger');
      return false;
    } finally {
      setProses(null);
    }
  };

  const setujui = async () => {
    const ya = await dialog.confirm({
      title: 'Setujui Kaizen ini?',
      message: 'Pelaksana akan menerima notifikasi bahwa Kaizen-nya disetujui.',
      confirmText: 'Setujui',
    });
    if (ya) jalankan('setuju', () => kaizenService.setujui(kaizen.id), 'Kaizen disetujui.', 'Gagal menyetujui Kaizen.');
  };

  const tolak = async () => {
    if (!alasan.trim()) {
      dialog.alert('Alasan Kosong', 'Tulis alasan penolakan supaya pelaksana bisa memperbaikinya.');
      return;
    }
    const ok = await jalankan('tolak', () => kaizenService.tolak(kaizen.id, alasan.trim()), 'Kaizen ditolak.', 'Gagal menolak Kaizen.');
    if (ok) {
      setSheetTolak(false);
      setAlasan('');
    }
  };

  const simpanNilai = async () => {
    const isian: Record<string, number> = {};
    for (const kr of kriteriaPenilaian) {
      const v = Number(nilai[kr.nama] ?? 0);
      if (!Number.isInteger(v) || v < 0 || v > kr.nilai_max) {
        dialog.alert('Nilai Tidak Valid', `${kr.kriteria} harus 0 sampai ${kr.nilai_max}.`);
        return;
      }
      isian[kr.nama] = v;
    }
    const total = Object.values(isian).reduce((a, b) => a + b, 0);
    const ya = await dialog.confirm({
      title: 'Simpan nilai komite?',
      message: `Total nilai komite ${total} poin. Poin pelaksana akan langsung bertambah.`,
      confirmText: 'Simpan',
    });
    if (ya) {
      const ok = await jalankan('nilai', () => kaizenService.nilai(kaizen.id, isian), 'Nilai komite tersimpan.', 'Gagal menyimpan nilai.');
      if (ok) setNilai({});
    }
  };

  const batalkanNilai = async () => {
    const ya = await dialog.confirm({
      title: 'Batalkan penilaian?',
      message: 'Nilai komite dihapus dan poin pelaksana dikurangi kembali.',
      confirmText: 'Batalkan nilai',
      destructive: true,
    });
    if (ya) jalankan('reset', () => kaizenService.batalkanNilai(kaizen.id), 'Penilaian dibatalkan.', 'Gagal membatalkan penilaian.');
  };

  // Jejak keputusan, mirip kartu Detail di website.
  const jejak = [
    { ikon: 'send', warna: brand[600], judul: 'Diajukan', ket: tanggal(kaizen.created_at) },
    kaizen.status === 'DITERIMA'
      ? { ikon: 'clock-outline', warna: '#d97706', judul: 'Menunggu persetujuan atasan', ket: null }
      : {
          ikon: kaizen.status === 'DITOLAK' ? 'close-circle' : 'check-circle',
          warna: kaizen.status === 'DITOLAK' ? Colors.danger : brand[600],
          judul: `${kaizen.status === 'DITOLAK' ? 'Ditolak' : 'Disetujui'}${kaizen.approval_oleh ? ` oleh ${kaizen.approval_oleh}` : ''}`,
          ket: tanggal(kaizen.tgl_approve),
        },
    ...(kaizen.status === 'DISETUJUI'
      ? [
          nilaiPanitia
            ? {
                ikon: 'medal',
                warna: '#d97706',
                judul: `Dinilai komite${kaizen.dinilai_oleh || nilaiPanitia.dinilai_oleh ? ` oleh ${kaizen.dinilai_oleh || nilaiPanitia.dinilai_oleh}` : ''}`,
                ket: `+${nilaiPanitia.nilai_final} poin`,
              }
            : { ikon: 'clock-outline', warna: Colors.textTertiary, judul: 'Menunggu penilaian komite', ket: null },
        ]
      : []),
  ];

  return (
    <View style={[gs.screen, { backgroundColor: slate[100] }]}>
      <ScrollView
        contentContainerStyle={[styles.isi, { paddingBottom: (bisaPutus ? Spacing.lg : insets.bottom + Spacing.xxl) }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); muat(); }} colors={[Colors.primary]} tintColor={Colors.primary} />
        }
      >
        {/* Ringkasan */}
        <View style={styles.kartu}>
          <View style={gs.rowBetween}>
            <View style={[styles.pil, { backgroundColor: warna.bg }]}>
              <Text style={[styles.teksPil, { color: warna.fg }]}>{warna.label}</Text>
            </View>
            <Text style={styles.kecil}>{kaizen.nomor || `#${kaizen.id}`}</Text>
          </View>
          <Text style={styles.tema}>{kaizen.tema || 'Tanpa tema'}</Text>
          {tags.length ? <Text style={styles.kecil}>{tags.join('  ·  ')}</Text> : null}

          <View style={styles.garis} />
          <View style={[gs.row, { gap: Spacing.sm }]}>
            <Avatar nama={kaizen.nama_pelaksana} ukuran={34} />
            <View style={gs.flex1}>
              <Text style={styles.nama} numberOfLines={1}>{kaizen.nama_pelaksana || '-'}</Text>
              <Text style={styles.kecil} numberOfLines={1}>Pelaksana · {kaizen.nik_nama_pelaksana || '-'}</Text>
            </View>
          </View>
          {kaizen.disarankan_oleh ? (
            <View style={[gs.row, { gap: 6, marginTop: Spacing.sm }]}>
              <Icon name="lightbulb-on-outline" size={14} color={Colors.textTertiary} />
              <Text style={styles.kecil}>Disarankan oleh {kaizen.disarankan_oleh}</Text>
            </View>
          ) : null}
        </View>

        {/* Jejak keputusan */}
        <View style={styles.kartu}>
          {jejak.map((j, i) => (
            <View key={i} style={styles.jejak}>
              <View style={styles.kolomJejak}>
                <Icon name={j.ikon} size={16} color={j.warna} />
                {i < jejak.length - 1 ? <View style={styles.tiangJejak} /> : null}
              </View>
              <View style={[gs.flex1, { paddingBottom: i < jejak.length - 1 ? Spacing.md : 0 }]}>
                <Text style={styles.judulJejak}>{j.judul}</Text>
                {j.ket ? <Text style={styles.kecil}>{j.ket}</Text> : null}
              </View>
            </View>
          ))}
          {kaizen.status === 'DITOLAK' && kaizen.alasan ? (
            <View style={styles.alasan}>
              <Text style={styles.judulAlasan}>Alasan ditolak</Text>
              <Text style={styles.teksAlasan}>{kaizen.alasan}</Text>
            </View>
          ) : null}
        </View>

        {/* Foto */}
        <View style={styles.kartu}>
        <Text style={styles.judulSeksi}>Foto</Text>
        <View style={[gs.row, { gap: Spacing.sm }]}>
          {fotos.map((f) => (
            <TouchableOpacity
              key={f.label}
              style={styles.ubinFoto}
              activeOpacity={0.85}
              disabled={!f.uri}
              onPress={() => setFotoBesar(f.uri)}
            >
              {f.uri ? (
                <Image source={{ uri: f.uri }} style={styles.gambar} resizeMode="cover" />
              ) : (
                <View style={[styles.gambar, gs.centerFill]}>
                  <Icon name="image" size={22} color={Colors.textTertiary} />
                  <Text style={[styles.kecil, { marginTop: 4 }]}>Tidak ada foto</Text>
                </View>
              )}
              <View style={[styles.tagFoto, f.label === 'Sesudah' && { backgroundColor: Colors.primary }]}>
                <Text style={styles.teksTagFoto}>{f.label}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
        </View>

        {/* Kondisi */}
        <View style={styles.kartu}>
          <Text style={styles.judulSeksi}>Kondisi</Text>
          {[
            { label: 'Sebelum Kaizen', warna: Colors.danger, teks: teksSebelum },
            { label: 'Sesudah Kaizen', warna: brand[600], teks: teksSesudah },
          ].map((s, i) => (
            <View key={s.label} style={i > 0 ? { marginTop: Spacing.md } : null}>
              <View style={[gs.row, { gap: 6, marginBottom: 4 }]}>
                <View style={[styles.titik, { backgroundColor: s.warna }]} />
                <Text style={styles.labelKondisi}>{s.label}</Text>
              </View>
              <Text style={styles.teks}>{s.teks || '-'}</Text>
            </View>
          ))}
        </View>

        {/* Manfaat */}
        <View style={[styles.kartu, { paddingBottom: Spacing.xs }]}>
          <Text style={styles.judulSeksi}>Manfaat ({manfaats.length})</Text>
          {manfaats.length === 0 ? <Text style={[styles.teks, styles.kosong]}>Belum ada manfaat.</Text> : null}
          {manfaats.map((m, i) => {
            const kat = m.manfaat_nilai?.kategori ?? '';
            const l = LENCANA[kat];
            return (
              <View key={m.id ?? i} style={[styles.manfaat, i > 0 && styles.garisAtas]}>
                <View style={[gs.row, { gap: Spacing.sm, marginBottom: 6 }]}>
                  <View style={[styles.logoManfaat, { backgroundColor: l?.warna[1] ?? slate[400] }]}>
                    <Icon name={l?.ikon ?? 'lightbulb-on-outline'} size={14} color={Colors.white} />
                  </View>
                  <Text style={[styles.nama, gs.flex1]}>{kat || 'Manfaat'}</Text>
                  {m.tipe_area ? (
                    <Text style={styles.kecil}>{m.tipe_area === 'Eksternal' ? 'Luar perusahaan' : 'Dalam perusahaan'}</Text>
                  ) : null}
                </View>
                {[
                  ['Sebelum', m.sebelum],
                  ['Sesudah', m.sesudah],
                  ['Penghematan', m.hemat || '—'],
                  ['Area', m.area],
                  ['PIC', m.pic],
                ]
                  .filter(([, v]) => v)
                  .map(([label, v]) => (
                    <View key={label} style={styles.barisManfaat}>
                      <Text style={styles.labelManfaat}>{label}</Text>
                      <Text style={[styles.teks, gs.flex1]}>{v}</Text>
                    </View>
                  ))}
              </View>
            );
          })}
        </View>

        {/* Penilaian — hanya untuk Kaizen yang disetujui, seperti website */}
        {kaizen.status === 'DISETUJUI' ? (
          <>
            <View style={styles.kartu}>
            <View style={[gs.rowBetween, { alignItems: 'flex-end' }]}>
              <Text style={styles.judulSeksi}>Nilai PQCDSM</Text>
              <Text style={[styles.kecil, { marginBottom: Spacing.sm }]}>Total +{totalKategoriNilai || 0} poin</Text>
            </View>
            <View style={styles.gridNilai}>
              {PQCDSM.map((kat) => {
                const l = LENCANA[kat];
                const v = kategoriNilai[kat] ?? 0;
                return (
                  <View key={kat} style={styles.petak}>
                    <View style={[styles.logoManfaat, { backgroundColor: v > 0 ? l.warna[1] : slate[200] }]}>
                      <Icon name={l.ikon} size={14} color={v > 0 ? Colors.white : Colors.textTertiary} />
                    </View>
                    <Text style={[styles.angka, v === 0 && { color: Colors.textTertiary }]}>{v > 0 ? `+${v}` : '—'}</Text>
                    <Text style={styles.kecil} numberOfLines={1}>{kat}</Text>
                  </View>
                );
              })}
            </View>

            </View>

            <View style={styles.kartu}>
              <Text style={styles.judulSeksi}>Penilaian komite</Text>
              {nilaiPanitia ? (
                <>
                  <View style={gs.rowBetween}>
                    <Text style={styles.teks}>Nilai komite</Text>
                    <Text style={styles.nama}>+{nilaiPanitia.nilai_panitia} poin</Text>
                  </View>
                  <View style={[gs.rowBetween, { marginTop: 6 }]}>
                    <Text style={styles.teks}>Nilai akhir (komite + PQCDSM)</Text>
                    <Text style={[styles.nama, { color: brand[700] }]}>+{nilaiPanitia.nilai_final} poin</Text>
                  </View>
                  {izin.reset ? (
                    <TouchableOpacity style={styles.tombolGaris} onPress={batalkanNilai} disabled={!!proses}>
                      {proses === 'reset' ? (
                        <BrandSpinner size={18} color={Colors.danger} />
                      ) : (
                        <Text style={[styles.teksTombolGaris, { color: Colors.danger }]}>Batalkan penilaian</Text>
                      )}
                    </TouchableOpacity>
                  ) : null}
                </>
              ) : bisaNilai ? (
                <>
                  {kriteriaPenilaian.map((kr) => {
                    const v = Number(nilai[kr.nama] ?? 0) || 0;
                    const set = (n: number) => setNilai((d) => ({ ...d, [kr.nama]: String(Math.max(0, Math.min(kr.nilai_max, n))) }));
                    return (
                      <View key={kr.nama} style={styles.kriteria}>
                        <View style={gs.flex1}>
                          <Text style={styles.labelKondisi}>{kr.kriteria}</Text>
                          <Text style={styles.kecil}>Maks {kr.nilai_max} poin</Text>
                        </View>
                        <View style={styles.stepper}>
                          <TouchableOpacity style={styles.tombolStep} onPress={() => set(v - 1)} hitSlop={6}>
                            <Text style={styles.teksStep}>−</Text>
                          </TouchableOpacity>
                          <TextInput
                            style={styles.inputNilai}
                            keyboardType="number-pad"
                            value={nilai[kr.nama] ?? '0'}
                            onChangeText={(t) => setNilai((d) => ({ ...d, [kr.nama]: t.replace(/[^0-9]/g, '') }))}
                            onBlur={() => set(v)}
                          />
                          <TouchableOpacity style={styles.tombolStep} onPress={() => set(v + 1)} hitSlop={6}>
                            <Text style={styles.teksStep}>+</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  })}
                  <TouchableOpacity style={[styles.tombolUtama, { marginTop: Spacing.sm }]} onPress={simpanNilai} disabled={!!proses}>
                    {proses === 'nilai' ? <BrandSpinner size={20} color={Colors.white} /> : <Text style={styles.teksTombolUtama}>Berikan Nilai Komite</Text>}
                  </TouchableOpacity>
                </>
              ) : (
                <Text style={[styles.teks, styles.kosong]}>Belum dinilai oleh komite.</Text>
              )}
            </View>
          </>
        ) : null}
      </ScrollView>

      {bisaPutus ? (
        <View style={[styles.bawah, { paddingBottom: insets.bottom + Spacing.md }]}>
          <TouchableOpacity style={[styles.tombolGaris, gs.flex1, { marginTop: 0 }]} onPress={() => setSheetTolak(true)} disabled={!!proses}>
            <Text style={[styles.teksTombolGaris, { color: Colors.danger }]}>Tolak</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tombolUtama, gs.flex1]} onPress={setujui} disabled={!!proses}>
            {proses === 'setuju' ? <BrandSpinner size={20} color={Colors.white} /> : <Text style={styles.teksTombolUtama}>Setujui</Text>}
          </TouchableOpacity>
        </View>
      ) : null}

      <BottomSheet visible={sheetTolak} onClose={() => setSheetTolak(false)} title="Tolak Kaizen" penuh>
        <View style={{ paddingHorizontal: Spacing.lg }}>
          <Text style={[styles.teks, { marginBottom: Spacing.sm }]}>
            Alasan ini dikirim ke pelaksana supaya Kaizen-nya bisa diperbaiki dan diajukan ulang.
          </Text>
          <TextInput
            style={[styles.input, { minHeight: 110, textAlignVertical: 'top' }]}
            multiline
            maxLength={255}
            placeholder="Tulis alasan penolakan"
            placeholderTextColor={Colors.placeholder}
            value={alasan}
            onChangeText={setAlasan}
            autoFocus
          />
          <Text style={[styles.kecil, { textAlign: 'right', marginTop: 4 }]}>{alasan.length}/255</Text>
          <TouchableOpacity style={[styles.tombolUtama, { backgroundColor: Colors.danger, marginTop: Spacing.md }]} onPress={tolak} disabled={!!proses}>
            {proses === 'tolak' ? <BrandSpinner size={20} color={Colors.white} /> : <Text style={styles.teksTombolUtama}>Tolak Kaizen</Text>}
          </TouchableOpacity>
        </View>
      </BottomSheet>

      <Modal visible={!!fotoBesar} transparent animationType="fade" onRequestClose={() => setFotoBesar(null)} statusBarTranslucent>
        <View style={styles.latarFoto}>
          {fotoBesar ? <Image source={{ uri: fotoBesar }} style={StyleSheet.absoluteFill} resizeMode="contain" /> : null}
          <TouchableOpacity
            style={[styles.tutupFoto, { top: insets.top + Spacing.md }]}
            onPress={() => setFotoBesar(null)}
            accessibilityLabel="Tutup foto"
          >
            <Icon name="close" size={20} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  isi: {
    paddingTop: 0,
  },
  /** Seksi selebar layar (tanpa kartu), dipisah celah abu-abu tipis. */
  kartu: {
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.sm,
  },
  pil: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Spacing.radius.full,
    ...Spacing.curve,
  },
  teksPil: {
    fontSize: 11,
    fontFamily: fonts.semibold,
  },
  tema: {
    marginTop: Spacing.sm,
    marginBottom: 4,
    fontSize: 15,
    fontFamily: fonts.bold,
    color: Colors.textPrimary,
  },
  kecil: {
    fontSize: 11,
    fontFamily: fonts.regular,
    color: Colors.textTertiary,
  },
  garis: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.border,
    marginVertical: Spacing.md,
  },
  nama: {
    fontSize: 13,
    fontFamily: fonts.semibold,
    color: Colors.textPrimary,
  },
  teks: {
    fontSize: ukuranIsi,
    fontFamily: fonts.regular,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  kosong: {
    textAlign: 'center',
    paddingVertical: Spacing.sm,
    color: Colors.textTertiary,
  },
  judulSeksi: {
    fontSize: 11,
    fontFamily: fonts.semibold,
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  jejak: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  kolomJejak: {
    alignItems: 'center',
    width: 18,
  },
  tiangJejak: {
    flex: 1,
    width: 1.5,
    marginVertical: 3,
    backgroundColor: slate[200],
  },
  judulJejak: {
    fontSize: ukuranIsi,
    fontFamily: fonts.semibold,
    color: Colors.textPrimary,
  },
  alasan: {
    marginTop: Spacing.md,
    padding: Spacing.sm,
    borderRadius: Spacing.radius.md,
    ...Spacing.curve,
    backgroundColor: '#fef2f2',
  },
  judulAlasan: {
    fontSize: 11,
    fontFamily: fonts.semibold,
    color: Colors.dangerDark,
    marginBottom: 2,
  },
  teksAlasan: {
    fontSize: ukuranIsi,
    fontFamily: fonts.regular,
    color: Colors.dangerDark,
    lineHeight: 18,
  },
  ubinFoto: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: Spacing.radius.lg,
    ...Spacing.curve,
    overflow: 'hidden',
    backgroundColor: slate[100],
  },
  gambar: {
    width: '100%',
    height: '100%',
  },
  tagFoto: {
    position: 'absolute',
    left: 8,
    bottom: 8,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Spacing.radius.full,
    ...Spacing.curve,
    backgroundColor: 'rgba(15,23,42,0.75)',
  },
  teksTagFoto: {
    fontSize: 10,
    fontFamily: fonts.semibold,
    color: Colors.white,
  },
  titik: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  labelKondisi: {
    fontSize: ukuranIsi,
    fontFamily: fonts.semibold,
    color: Colors.textPrimary,
  },
  manfaat: {
    paddingVertical: Spacing.md,
  },
  garisAtas: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
  },
  logoManfaat: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  barisManfaat: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: 3,
  },
  labelManfaat: {
    width: 84,
    fontSize: 11,
    fontFamily: fonts.medium,
    color: Colors.textTertiary,
    lineHeight: 18,
  },
  gridNilai: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  petak: {
    width: '31.6%',
    flexGrow: 1,
    alignItems: 'center',
    gap: 2,
    paddingVertical: Spacing.sm,
    backgroundColor: slate[50],
    borderRadius: Spacing.radius.lg,
    ...Spacing.curve,
  },
  angka: {
    marginTop: 2,
    fontSize: 14,
    fontFamily: fonts.bold,
    color: Colors.textPrimary,
  },
  kriteria: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Spacing.radius.full,
    ...Spacing.curve,
    backgroundColor: slate[50],
  },
  tombolStep: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  teksStep: {
    fontSize: 16,
    fontFamily: fonts.semibold,
    color: Colors.textPrimary,
  },
  inputNilai: {
    width: 36,
    paddingVertical: 0,
    textAlign: 'center',
    fontSize: 13,
    fontFamily: fonts.semibold,
    color: Colors.textPrimary,
    ...inputReset,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Spacing.radius.md,
    ...Spacing.curve,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    fontSize: ukuranIsi,
    fontFamily: fonts.regular,
    color: Colors.textPrimary,
    backgroundColor: slate[50],
    ...inputReset,
  },
  tombolUtama: {
    height: 46,
    borderRadius: Spacing.radius.full,
    ...Spacing.curve,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  teksTombolUtama: {
    fontSize: 14,
    fontFamily: fonts.semibold,
    color: Colors.white,
  },
  tombolGaris: {
    height: 42,
    marginTop: Spacing.md,
    borderRadius: Spacing.radius.full,
    ...Spacing.curve,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
  },
  teksTombolGaris: {
    fontSize: ukuranIsi,
    fontFamily: fonts.semibold,
    color: Colors.textPrimary,
  },
  tombolKecil: {
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Spacing.radius.full,
    backgroundColor: Colors.primary,
  },
  teksTombolKecil: {
    fontSize: ukuranIsi,
    fontFamily: fonts.semibold,
    color: Colors.white,
  },
  bawah: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.borderSubtle,
  },
  latarFoto: {
    flex: 1,
    backgroundColor: '#000',
  },
  tutupFoto: {
    position: 'absolute',
    right: Spacing.lg,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
