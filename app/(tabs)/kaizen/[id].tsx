/**
 * Detail Kaizen — setara halaman detail website (sim-mwt):
 *   - ringkasan (status, tema, nomor, departemen/plant, pelaksana),
 *   - jejak keputusan (diajukan → disetujui/ditolak oleh siapa, alasan tolak),
 *   - foto sebelum/sesudah (tap untuk memperbesar) dan kondisi,
 *   - manfaat lengkap per kategori PQCDSM,
 *   - bila DISETUJUI: nilai PQCDSM dan nilai komite (hanya dibaca; penilaian dan
 *     pembatalannya dilakukan lewat website),
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
  useWindowDimensions,
  Share,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '../../../src/components/common/Icon';
import Avatar from '../../../src/components/common/Avatar';
import BottomSheet from '../../../src/components/common/BottomSheet';
import Button from '../../../src/components/common/Button';
import { dialog } from '../../../src/components/common/AppDialog';
import Colors, { brand, slate } from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { fonts, ukuranIsi } from '../../../constants/Typography';
import { gs, inputReset } from '../../../constants/GlobalStyles';
import { kaizenService } from '../../../src/services/kaizenService';
import { KaizenDetail } from '../../../src/types/kaizen';
import { BULAN, LENCANA, teksBagikanKaizen, urlFoto, warnaStatus } from '../../../src/utils/kaizen';
import AppBar from '../../../src/components/common/AppBar';
import BrandSpinner from '../../../src/components/common/BrandSpinner';
import { bagikanBuktiKaizen } from '../../../src/services/buktiKaizenService';
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
  const { width: lebarLayar } = useWindowDimensions();
  const [data, setData] = useState<KaizenDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [gagal, setGagal] = useState(false);
  const [proses, setProses] = useState<null | 'setuju' | 'tolak'>(null);
  const [fotoBesar, setFotoBesar] = useState<string | null>(null);
  const [sheetTolak, setSheetTolak] = useState(false);
  // Kategori manfaat yang rinciannya sedang dibuka di sheet ('' = Manfaat tanpa kategori).
  const [sheetManfaat, setSheetManfaat] = useState<string | null>(null);
  // Kartu manfaat yang sedang terlihat di slider (untuk indikator titik).
  const [butirAktif, setButirAktif] = useState(0);
  // Menu Bagikan (pesan / bukti PDF); `membuatPdf` = PDF sedang dibuat.
  const [sheetBagikan, setSheetBagikan] = useState(false);
  const [membuatPdf, setMembuatPdf] = useState(false);
  const [alasan, setAlasan] = useState('');

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
          <Button label="Coba lagi" onPress={() => { setLoading(true); muat(); }} style={{ marginTop: Spacing.lg }} />
        ) : null}
      </View>
    );
  }

  const { kaizen, manfaats = [], kategoriNilai = {}, totalKategoriNilai, nilaiPanitia } = data;
  const izin = data.izin ?? { approve: false, nilai: false, reset: false };
  // Manfaat dikelompokkan per kategori; rinciannya muncul di sheet saat kartu ditap.
  const kelompokManfaat = Array.from(
    manfaats
      .reduce((peta, m) => {
        const kat = m.manfaat_nilai?.kategori ?? '';
        return peta.set(kat, [...(peta.get(kat) ?? []), m]);
      }, new Map<string, typeof manfaats>())
      .entries()
  );
  const butirSheet = sheetManfaat === null ? [] : manfaats.filter((m) => (m.manfaat_nilai?.kategori ?? '') === sheetManfaat);
  // Satu manfaat: selebar sheet. Lebih dari satu: kartu sedikit lebih sempit supaya yang berikutnya mengintip (bisa digeser).
  const lebarButir = butirSheet.length > 1 ? Math.round(lebarLayar * 0.86) : lebarLayar - Spacing.lg * 2;
  const warna = warnaStatus(kaizen.status);
  const k = kaizen as any;
  const departemen = kaizen.departemen?.nama || k.departemen?.nama_departemen || kaizen.nama_departemen;
  const tags = [departemen, kaizen.plant?.nama].filter(Boolean) as string[];
  const bagikanPesan = () => {
    setSheetBagikan(false);
    Share.share({
      message: teksBagikanKaizen({
        tema: kaizen.tema,
        nomor: kaizen.nomor,
        pelaksana: kaizen.nama_pelaksana,
        kategori: kelompokManfaat.map(([kat]) => kat).filter(Boolean),
      }),
    }).catch(() => {});
  };
  const bagikanPdf = async () => {
    setMembuatPdf(true);
    try {
      await bagikanBuktiKaizen(data);
    } catch (e: any) {
      dialog.alert('Gagal Membuat PDF', e?.message || 'Bukti Kaizen tidak bisa dibuat. Coba lagi.', 'danger');
    } finally {
      setMembuatPdf(false);
      setSheetBagikan(false);
    }
  };
  const fotos = [
    { label: 'Sebelum', uri: k.foto_sebelum_url ?? urlFoto(kaizen.foto_sebelum || kaizen.foto_kondisi_sebelum) },
    { label: 'Sesudah', uri: k.foto_sesudah_url ?? urlFoto(kaizen.foto_sesudah || kaizen.foto_kondisi_sesudah) },
  ];
  const teksSebelum = kaizen.detail_sebelum || kaizen.kondisi_sebelum;
  const teksSesudah = kaizen.detail_sesudah || kaizen.kondisi_sesudah;
  const bisaPutus = izin.approve && kaizen.status === 'DITERIMA';

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
      {/* Hanya Kaizen yang sudah disetujui yang layak dibagikan. Share sheet bawaan OS (WA, FB, dll). */}
      <AppBar
        judul="Detail Kaizen"
        kanan={
          kaizen.status === 'DISETUJUI' ? (
            <TouchableOpacity onPress={() => setSheetBagikan(true)} hitSlop={10} accessibilityLabel="Bagikan">
              <Icon name="share-variant" size={20} color={Colors.white} />
            </TouchableOpacity>
          ) : undefined
        }
      />
      <ScrollView
        contentContainerStyle={styles.isi}
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
        <View style={styles.kartu}>
          <Text style={styles.judulSeksi}>Manfaat ({manfaats.length})</Text>
          {manfaats.length === 0 ? <Text style={[styles.teks, styles.kosong]}>Belum ada manfaat.</Text> : null}
          {kelompokManfaat.map(([kat, butir]) => {
            const l = LENCANA[kat];
            return (
              <TouchableOpacity key={kat || 'x'} style={styles.kartuManfaat} activeOpacity={0.6} onPress={() => setSheetManfaat(kat)}>
                <View style={[styles.logoManfaat, { backgroundColor: l?.warna[1] ?? slate[400] }]}>
                  <Icon name={l?.ikon ?? 'lightbulb-on-outline'} size={14} color={Colors.white} />
                </View>
                <Text style={[styles.nama, gs.flex1]} numberOfLines={1}>{kat || 'Manfaat'}</Text>
                <View style={styles.jumlahManfaat}>
                  <Text style={styles.teksJumlahManfaat}>{butir.length}</Text>
                </View>
                <Icon name="chevron-right" size={16} color={Colors.textTertiary} />
              </TouchableOpacity>
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
                </>
              ) : (
                <Text style={[styles.teks, styles.kosong]}>Belum dinilai oleh komite. Penilaian dilakukan lewat website SIMWT.</Text>
              )}
            </View>
          </>
        ) : null}
        {/* Menutup celah abu-abu di bawah seksi terakhir (marginBottom-nya dibatalkan). */}
        <View style={{ marginTop: -Spacing.sm, height: bisaPutus ? 0 : insets.bottom, backgroundColor: Colors.white }} />
      </ScrollView>

      {bisaPutus ? (
        <View style={[styles.bawah, { paddingBottom: insets.bottom + Spacing.md }]}>
          <Button variant="dangerOutline" label="Tolak" onPress={() => setSheetTolak(true)} disabled={!!proses} style={gs.flex1} />
          <Button label="Setujui" onPress={setujui} loading={proses === 'setuju'} disabled={!!proses} style={gs.flex1} />
        </View>
      ) : null}

      <BottomSheet visible={sheetBagikan} onClose={() => (membuatPdf ? null : setSheetBagikan(false))} title="Bagikan Kaizen">
        <TouchableOpacity style={styles.opsiBagikan} onPress={bagikanPesan} disabled={membuatPdf} activeOpacity={0.7}>
          <View style={styles.ikonBagikan}>
            <Icon name="chat-outline" size={18} color={brand[700]} />
          </View>
          <View style={gs.flex1}>
            <Text style={styles.judulBagikan}>Bagikan sebagai pesan</Text>
            <Text style={styles.ketBagikan}>Teks ringkas ke WhatsApp, Facebook, dan lainnya</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.opsiBagikan} onPress={bagikanPdf} disabled={membuatPdf} activeOpacity={0.7}>
          <View style={styles.ikonBagikan}>
            {membuatPdf ? <BrandSpinner size={18} color={brand[700]} /> : <Icon name="file-document" size={18} color={brand[700]} />}
          </View>
          <View style={gs.flex1}>
            <Text style={styles.judulBagikan}>{membuatPdf ? 'Membuat PDF…' : 'Bagikan bukti Kaizen (PDF)'}</Text>
            <Text style={styles.ketBagikan}>Formulir Bukti Kaizen Digital berisi foto dan penilaian</Text>
          </View>
        </TouchableOpacity>
      </BottomSheet>

      <BottomSheet
        visible={sheetManfaat !== null}
        onClose={() => setSheetManfaat(null)}
        title={`Manfaat ${sheetManfaat || ''}`.trim()}
        subtitle={`${butirSheet.length} manfaat`}
      >
        <ScrollView
          key={sheetManfaat}
          horizontal
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={(e) => setButirAktif(Math.round(e.nativeEvent.contentOffset.x / (lebarButir + Spacing.sm)))}
          snapToInterval={lebarButir + Spacing.sm}
          decelerationRate="fast"
          contentContainerStyle={styles.isiButir}
        >
          {butirSheet.map((m, urut) => {
            const l = LENCANA[m.manfaat_nilai?.kategori ?? ''];
            return (
              <View key={m.id ?? urut} style={[styles.butir, { width: lebarButir }]}>
                <View style={gs.rowBetween}>
                  <View style={[gs.row, { gap: 6 }]}>
                    <Icon name={l?.ikon ?? 'lightbulb-on-outline'} size={16} color={l?.warna[2] ?? Colors.textSecondary} />
                    <Text style={styles.nomorButir}>Manfaat {urut + 1}</Text>
                  </View>
                  {m.tipe_area ? (
                    <View style={styles.chipButir}>
                      <Text style={styles.teksChipButir}>{m.tipe_area === 'Eksternal' ? 'Luar perusahaan' : 'Dalam perusahaan'}</Text>
                    </View>
                  ) : null}
                </View>

                <View style={styles.barisButir}>
                  <View style={styles.kolomLabel}>
                    <Icon name="piggy-bank" size={14} color={Colors.textTertiary} />
                    <Text style={styles.labelButir} numberOfLines={1}>Penghematan</Text>
                  </View>
                  <Text style={[styles.nilaiHemat, { color: l?.warna[2] ?? Colors.textPrimary }]}>{m.hemat || '—'}</Text>
                </View>
                <View style={styles.barisButir}>
                  <View style={styles.kolomLabel}>
                    <Icon name="history" size={14} color={Colors.textTertiary} />
                    <Text style={styles.labelButir} numberOfLines={1}>Sebelum</Text>
                  </View>
                  <Text style={styles.teksButir}>{m.sebelum || '-'}</Text>
                </View>
                <View style={styles.barisButir}>
                  <View style={styles.kolomLabel}>
                    <Icon name="creation" size={14} color={Colors.textTertiary} />
                    <Text style={styles.labelButir} numberOfLines={1}>Sesudah</Text>
                  </View>
                  <Text style={styles.teksButir}>{m.sesudah || '-'}</Text>
                </View>

                {m.area || m.pic ? (
                  <View style={[gs.row, { gap: Spacing.md }]}>
                    {m.area ? (
                      <View style={styles.metaButir}>
                        <Icon name="map-marker-outline" size={14} color={Colors.textTertiary} />
                        <Text style={styles.teksMeta} numberOfLines={1}>{m.area}</Text>
                      </View>
                    ) : null}
                    {m.pic ? (
                      <View style={styles.metaButir}>
                        <Avatar nama={m.pic} ukuran={18} />
                        <Text style={styles.teksMeta} numberOfLines={1}>{m.pic}</Text>
                      </View>
                    ) : null}
                  </View>
                ) : null}
              </View>
            );
          })}
        </ScrollView>
        {butirSheet.length > 1 ? (
          <View style={styles.titikWadah}>
            {butirSheet.map((_, i) => (
              <View key={i} style={[styles.titikSlider, i === butirAktif && styles.titikSliderAktif]} />
            ))}
          </View>
        ) : null}
      </BottomSheet>

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
          <Button
            variant="danger"
            label="Tolak Kaizen"
            onPress={tolak}
            loading={proses === 'tolak'}
            disabled={!!proses}
            block
            style={{ marginTop: Spacing.md }}
          />
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
    fontSize: 10,
    fontFamily: fonts.semibold,
  },
  tema: {
    marginTop: Spacing.sm,
    marginBottom: 4,
    fontSize: 12,
    fontFamily: fonts.bold,
    color: Colors.textPrimary,
  },
  kecil: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: Colors.textTertiary,
  },
  garis: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.border,
    marginVertical: Spacing.md,
  },
  nama: {
    fontSize: 12,
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
    fontSize: 12,
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
    fontSize: 12,
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
    fontSize: 12,
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
  logoManfaat: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kartuManfaat: {
    ...gs.card,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  jumlahManfaat: {
    minWidth: 24,
    height: 24,
    paddingHorizontal: 6,
    borderRadius: 12,
    backgroundColor: brand[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  teksJumlahManfaat: {
    fontSize: ukuranIsi,
    fontFamily: fonts.bold,
    color: brand[700],
  },
  // Tiap manfaat satu kartu sendiri, supaya batas antar-manfaat jelas saat ada lebih dari satu.
  opsiBagikan: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  ikonBagikan: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: brand[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  judulBagikan: {
    fontSize: ukuranIsi,
    fontFamily: fonts.semibold,
    color: Colors.textPrimary,
  },
  ketBagikan: {
    marginTop: 2,
    fontSize: 12,
    fontFamily: fonts.regular,
    color: Colors.textTertiary,
  },
  titikWadah: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.sm,
  },
  titikSlider: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: slate[300],
  },
  titikSliderAktif: {
    width: 16,
    backgroundColor: Colors.primary,
  },
  // Daftar kartu digeser mendatar; lebar tiap kartu diberikan saat dirender.
  isiButir: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  butir: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    gap: 4,
    borderRadius: Spacing.radius.md,
    ...Spacing.curve,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    backgroundColor: slate[50],
  },
  nomorButir: {
    fontSize: ukuranIsi,
    fontFamily: fonts.bold,
    color: Colors.textPrimary,
  },
  chipButir: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Spacing.radius.full,
    ...Spacing.curve,
    backgroundColor: slate[100],
  },
  teksChipButir: {
    fontSize: 10,
    fontFamily: fonts.semibold,
    color: Colors.textSecondary,
  },
  barisButir: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  nilaiHemat: {
    flex: 1,
    fontSize: 12,
    fontFamily: fonts.bold,
  },
  // Lebar tetap + tanpa wrap supaya isi semua baris rata di kolom yang sama.
  kolomLabel: {
    width: 100,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  labelButir: {
    flexShrink: 1,
    fontSize: 12,
    fontFamily: fonts.medium,
    color: Colors.textTertiary,
  },
  teksButir: {
    flex: 1,
    fontSize: ukuranIsi,
    fontFamily: fonts.regular,
    color: Colors.textPrimary,
  },
  metaButir: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  teksMeta: {
    flex: 1,
    fontSize: ukuranIsi,
    fontFamily: fonts.regular,
    color: Colors.textSecondary,
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
    fontSize: 12,
    fontFamily: fonts.bold,
    color: Colors.textPrimary,
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
