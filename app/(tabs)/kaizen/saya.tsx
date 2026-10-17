/**
 * Kaizen Saya — layar utama modul Kaizen di mobile.
 *
 * Pola aplikasi native: cari di atas, chip status yang bisa digeser, daftar
 * kartu dengan tarik-untuk-segarkan & gulir tanpa batas, dan tombol mengambang
 * "Buat Kaizen". Isinya hanya Kaizen milik akun yang login (dibatasi server,
 * `GET /kaizen/list`). Urutan dipilih dari ikon di app bar.
 */
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Animated,
  Easing,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from '../../../src/components/common/Icon';
import Button from '../../../src/components/common/Button';
import RekapBulan from '../../../src/components/kaizen/RekapBulan';
import FieldTanggal from '../../../src/components/common/FieldTanggal';
import AppBar from '../../../src/components/common/AppBar';
import BottomSheet from '../../../src/components/common/BottomSheet';
import Avatar from '../../../src/components/common/Avatar';
import { useKaizenSaya } from '../../../src/hooks/useKaizenSaya';
import { NilaiFilter } from '../../../src/hooks/useDaftarKaizen';
import Colors, { brand, slate } from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { fonts, ukuranIsi } from '../../../constants/Typography';
import { gs, inputReset } from '../../../constants/GlobalStyles';
import { Kaizen, KaizenPeringkat } from '../../../src/types/kaizen';
import { BULAN, LENCANA, relatif, warnaStatus } from '../../../src/utils/kaizen';
import { SkeletonBaris } from '../../../src/components/common/Skeleton';

type Opsi = { label: string; value: string };

const STATUS: Opsi[] = [
  { label: 'Semua', value: '' },
  { label: 'Diterima', value: 'DITERIMA' },
  { label: 'Disetujui', value: 'DISETUJUI' },
  { label: 'Ditolak', value: 'DITOLAK' },
];

// Lencana arah Kaizen: kategori PQCDSM dengan total nilai manfaat terbesar.
// Disembunyikan sementara; ubah ke true untuk menampilkannya lagi.
const TAMPILKAN_LENCANA = false;
// warna: [terang (bingkai), utama (muka), gelap (sisi & ikon)] — gaya koin Duolingo, warna rata tanpa gradasi.
const PQCDSM = Object.keys(LENCANA);

/** Koin gaya Duolingo: sisi tebal gelap di bawah, bingkai terang, muka berwarna utama, ikon gelap, titik kilap; berputar pada sumbu Y. */
function KoinLencana({ ikon, warna }: { ikon: string; warna: readonly [string, string, string] }) {
  const [terang, utama, gelap] = warna;
  const putar = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(putar, { toValue: 1, duration: 1600, easing: Easing.inOut(Easing.cubic), useNativeDriver: true }),
        Animated.delay(1400),
        Animated.timing(putar, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [putar]);
  const rotateY = putar.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  return (
    <Animated.View style={{ width: 52, height: 57, transform: [{ perspective: 400 }, { rotateY }] }}>
      <View style={[styles.koin, { top: 5, backgroundColor: gelap }]} />
      <View style={[styles.koin, { top: 0, backgroundColor: terang }]}>
        <View style={[styles.mukaKoin, { backgroundColor: utama }]}>
          <Icon name={ikon} size={20} color={gelap} strokeWidth={2.6} />
        </View>
        <View style={styles.kilapKoin} />
      </View>
    </Animated.View>
  );
}

/** Pantulan cahaya yang berjalan dari kiri ke kanan di atas kartu (induknya wajib overflow: hidden). */
function Kilau() {
  const geser = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(geser, { toValue: 1, duration: 1800, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.delay(1200),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [geser]);
  const translateX = geser.interpolate({ inputRange: [0, 1], outputRange: [-120, 420] });
  return (
    <Animated.View pointerEvents="none" style={[styles.kilau, { transform: [{ translateX }, { skewX: '-20deg' }] }]}>
      <LinearGradient
        colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.75)', 'rgba(255,255,255,0)']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={StyleSheet.absoluteFill}
      />
    </Animated.View>
  );
}

// Medali peringkat 1–3: emas, perak, perunggu.
const MEDALI = [
  { fg: '#d4a017', bg: '#fef6d8' },
  { fg: '#8a94a6', bg: '#eef1f5' },
  { fg: '#b5703a', bg: '#fbeee3' },
];

/** Satu kartu Top 5 (karyawan atau departemen). Tinggi mengikuti kartu tertinggi di barisnya. */
function KartuTop({ judul, data, lebar }: { judul: string; data: KaizenPeringkat[]; lebar: number }) {
  return (
    <View style={[styles.kartuTop, { width: lebar }]}>
      <View style={[gs.row, { gap: 6 }]}>
        <Icon name="trophy" size={16} color={MEDALI[0].fg} />
        <Text style={styles.judulTop} numberOfLines={1}>{judul}</Text>
      </View>
      {data.length === 0 ? (
        <Text style={styles.kosongTop}>Belum ada Kaizen disetujui tahun ini.</Text>
      ) : (
        data.map((r, i) => {
          const m = MEDALI[i];
          return (
            <View key={i} style={[gs.row, styles.barisTop, i > 0 && styles.garisTop]}>
              <View style={[styles.peringkat, { backgroundColor: m?.bg ?? slate[100] }]}>
                {m ? <Icon name="medal" size={14} color={m.fg} /> : <Text style={styles.nomorPeringkat}>{i + 1}</Text>}
              </View>
              <Text style={styles.namaTop} numberOfLines={1}>{r.nama}</Text>
              <Text style={[styles.jumlahTop, m && { color: m.fg }]}>{r.jumlah} kaizen</Text>
            </View>
          );
        })
      )}
    </View>
  );
}

export default function KaizenSaya() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width: lebarLayar } = useWindowDimensions();
  // Kartu Top 5 sedikit lebih sempit dari layar supaya kartu berikutnya mengintip (tanda bisa digeser).
  const lebarKartuTop = Math.round(lebarLayar * 0.86);

  const {
    user, kaizens, error, awal, refreshing, loadingMore, memuatDaftar,
    search, setSearch, status, urutkan, gantiUrutan, tanggalDari, tanggalSampai, adaFilter,
    filterTerbuka, bukaFilter, tutupFilter, memuatFilter, terapkanFilter,
    segarkan, cobaLagi, muatBerikutnya,
    profil, top, jumlahDraf, pengingat,
  } = useKaizenSaya();

  // UI murni: sheet menu & tab Top 5.
  const [sheetMenu, setSheetMenu] = useState(false);
  // Pengingat bisa ditutup; muncul lagi saat aplikasi dibuka ulang.
  const [pengingatDitutup, setPengingatDitutup] = useState(false);
  const daftarRef = useRef<FlatList<Kaizen>>(null);

  // Menu lain di bar bawah. Sheet ditutup dulu sebelum aksi supaya dua sheet tidak bertumpuk.
  const MENU = [
    { ikon: 'gift', label: 'Redeem Hadiah', warna: ['#fb923c', '#f97316'] as const, aksi: () => router.push('/kaizen/redeem') },
    {
      ikon: 'file-document',
      label: 'Draft Kaizen Anda',
      warna: ['#60a5fa', '#3b82f6'] as const,
      jumlah: jumlahDraf,
      aksi: () => router.push('/kaizen/draf'),
    },
  ];

  const renderKaizen = ({ item }: { item: Kaizen }) => {
    const warna = warnaStatus(item.status);
    const tgl = new Date(item.created_at);

    return (
      <TouchableOpacity
        style={styles.baris}
        activeOpacity={0.6} onPress={() => router.push(`/kaizen/${item.id}`)}>
        <View style={[styles.logo, { backgroundColor: warna.bg }]}>
          <Icon name="lightbulb-on-outline" size={18} color={warna.fg} />
        </View>
        <View style={styles.judulKolom}>
          <Text style={styles.tema} numberOfLines={1}>{item.tema || 'Tanpa tema'}</Text>
          <Text style={styles.sub} numberOfLines={1}>
            {item.nomor || `#${item.id}`}
          </Text>
        </View>
        <View style={styles.kanan}>
          <View style={[styles.badgeStatus, { backgroundColor: warna.bg }]}>
            <Text style={[styles.teksBadge, { color: warna.fg }]}>{warna.label}</Text>
          </View>
          <Text style={styles.tanggal}>{tgl.getDate()} {BULAN[tgl.getMonth()]} {tgl.getFullYear()}</Text>
        </View>
        <Icon name="chevron-right" size={16} color={Colors.textTertiary} />
      </TouchableOpacity>
    );
  };

  const kosong = (
    <View style={styles.kosong}>
      <View style={styles.kosongIkon}>
        <Icon name={error ? 'alert-circle-outline' : 'lightbulb-on-outline'} size={36} color={error ? Colors.danger : brand[600]} />
      </View>
      <Text style={gs.emptyTitle}>{error ? 'Gagal memuat' : adaFilter ? 'Tidak ditemukan' : 'Belum ada Kaizen'}</Text>
      <Text style={[gs.emptyText, gs.textCenter]}>
        {error ||
          (adaFilter
            ? 'Coba kata kunci, status, atau tanggal lain.'
            : 'Punya ide perbaikan? Ajukan Kaizen pertamamu sekarang.')}
      </Text>
      {error ? (
        <Button label="Coba lagi" onPress={cobaLagi} style={{ marginTop: Spacing.lg }} />
      ) : null}
    </View>
  );

  return (
    <View style={[gs.screen, { backgroundColor: slate[100] }]}>
      <AppBar judul="Kaizen Saya" />

      {awal ? (
        <SkeletonBaris jumlah={8} />
      ) : (
        <FlatList
          ref={daftarRef}
          data={memuatDaftar ? [] : kaizens}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderKaizen}
          ItemSeparatorComponent={() => (
            <View style={styles.wadahPemisah}>
              <View style={styles.pemisah} />
            </View>
          )}
          contentContainerStyle={[styles.listContent, { paddingBottom: 0 }]}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={segarkan} colors={[Colors.primary]} tintColor={Colors.primary} />}
          onEndReached={muatBerikutnya}
          onEndReachedThreshold={0.4}
          ListHeaderComponent={
            <>
              <View style={styles.profil}>
                <View style={[gs.row, { gap: Spacing.sm }]}>
                  <Avatar nama={user?.nama_lengkap || user?.name || user?.username} ukuran={40} />
                  <View style={gs.flex1}>
                    <Text style={styles.namaProfil} numberOfLines={1}>{user?.nama_lengkap || user?.name || '-'}</Text>
                    <Text style={styles.nikProfil} numberOfLines={1}>{user?.nik || user?.department || ''}</Text>
                  </View>
                </View>
                <View style={styles.statProfil}>
                  {[
                    { label: 'Total Kaizen', nilai: profil?.jumlah_kaizen },
                    { label: 'Nilai tertinggi', nilai: profil?.nilai_tertinggi },
                    { label: 'Poin', nilai: profil?.poin },
                  ].map((st, i) => (
                    <View key={st.label} style={[styles.selStat, i > 0 && styles.garisStat]}>
                      <Text style={styles.angkaStat}>{st.nilai == null ? '-' : st.nilai.toLocaleString('id-ID')}</Text>
                      <Text style={styles.labelStat}>{st.label}</Text>
                    </View>
                  ))}
                </View>
                {profil?.hutang ? (
                  <View style={styles.hutang}>
                    <Text style={styles.judulHutang}>Kaizen Anda {profil.hutang.tahun}</Text>
                    <RekapBulan keadaan={profil.hutang.keadaan} />
                    <View style={[styles.pilHutang, { backgroundColor: profil.hutang.terlewat ? '#fef2f2' : brand[50] }]}>
                      <Text style={[styles.teksPilHutang, { color: profil.hutang.terlewat ? Colors.dangerDark : brand[700] }]}>
                        {profil.hutang.terlewat
                          ? `Anda tidak melakukan Kaizen sebanyak ${profil.hutang.terlewat} bulan di tahun ini`
                          : 'Anda rutin melakukan Kaizen setiap bulan tahun ini'}
                      </Text>
                    </View>
                  </View>
                ) : null}
                {TAMPILKAN_LENCANA && (() => {
                  const data = profil?.pqcdsm ?? {};
                  const utama = PQCDSM.reduce((a, b) => ((data[b] ?? 0) > (data[a] ?? 0) ? b : a));
                  if (!data[utama]) return null;
                  const l = LENCANA[utama];
                  return (
                    <View style={styles.lencana}>
                      <KoinLencana ikon={l.ikon} warna={l.warna} />
                      <View style={gs.flex1}>
                        <Text style={styles.labelLencana}>Lencana Kaizen kamu</Text>
                        <Text style={[styles.gelarLencana, { color: l.warna[2] }]}>{l.gelar}</Text>
                        <Text style={styles.ketLencana}>Kaizen kamu paling banyak ke arah {utama}</Text>
                      </View>
                      <Kilau />
                    </View>
                  );
                })()}
              </View>
              {pengingat && !pengingatDitutup ? (
                <View style={[styles.pengingat, pengingat.sudah ? styles.pengingatSudah : styles.pengingatBelum]}>
                  <Icon
                    name={pengingat.sudah ? 'check-circle' : 'calendar-clock-outline'}
                    size={18}
                    color={pengingat.sudah ? brand[700] : '#b45309'}
                  />
                  <Text style={[styles.teksPengingat, { color: pengingat.sudah ? brand[700] : '#b45309' }]} numberOfLines={2}>
                    {pengingat.sudah
                      ? `Kaizen ${pengingat.bulan} sudah masuk. Mantap!`
                      : `Kaizen ${pengingat.bulan} belum ada. Yuk ajukan sebelum periodenya habis.`}
                  </Text>
                  {pengingat.sudah ? null : (
                    <Button label="Buat" onPress={() => router.push('/kaizen/buat')} style={{ backgroundColor: '#d97706' }} />
                  )}
                  <TouchableOpacity onPress={() => setPengingatDitutup(true)} hitSlop={10} accessibilityLabel="Tutup pengingat">
                    <Icon name="close" size={16} color={pengingat.sudah ? brand[700] : '#b45309'} />
                  </TouchableOpacity>
                </View>
              ) : null}
              {top ? (
                // Dua kartu sejajar, digeser mendatar; snap per kartu. Bleed ke tepi layar (induk berpadding lg).
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  snapToInterval={lebarKartuTop + Spacing.sm}
                  decelerationRate="fast"
                  style={styles.barisTopGeser}
                  contentContainerStyle={styles.isiTopGeser}
                >
                  <KartuTop judul={`Top 5 Karyawan ${top.tahun}`} data={top.pelaksana} lebar={lebarKartuTop} />
                  <KartuTop judul={`Top 5 Departemen ${top.tahun}`} data={top.departemen} lebar={lebarKartuTop} />
                </ScrollView>
              ) : null}
              {!error ? (
                <View style={styles.headerDaftar}>
                  <View style={gs.rowBetween}>
                    <Text style={styles.judulDaftar}>Kaizen kamu</Text>
                  </View>
                  <View style={{ marginTop: Spacing.sm }}>
                  <View style={gs.row}>
                    <View style={[gs.searchBar, gs.flex1, styles.kotakCari]}>
                      <Icon name="magnify" size={16} color={Colors.textTertiary} />
                      <TextInput
                        style={styles.cari}
                        placeholder="Cari tema atau nomor"
                        placeholderTextColor={Colors.placeholder}
                        value={search}
                        onChangeText={setSearch}
                        returnKeyType="search"
                      />
                      {search ? (
                        <TouchableOpacity onPress={() => setSearch('')} hitSlop={10}>
                          <Icon name="close-circle" size={16} color={Colors.textTertiary} />
                        </TouchableOpacity>
                      ) : null}
                    </View>
                    <TouchableOpacity style={styles.tombolFilter} onPress={bukaFilter} accessibilityLabel="Filter">
                      <Icon name="filter-outline" size={16} color={Colors.textPrimary} />
                    </TouchableOpacity>
                    {/* Urutan menurut tanggal dibuat; tap untuk berganti terbaru ⇄ terlama. */}
                    <TouchableOpacity
                      style={styles.tombolFilter}
                      onPress={gantiUrutan}
                      accessibilityLabel={urutkan === 'TERBARU' ? 'Urutan: terbaru dulu' : 'Urutan: terlama dulu'}
                    >
                      <Icon name={urutkan === 'TERBARU' ? 'sort-descending' : 'sort-ascending'} size={16} color={Colors.textPrimary} />
                    </TouchableOpacity>
                  </View>
                  </View>
                </View>
              ) : null}
            </>
          }
          ListEmptyComponent={memuatDaftar ? <SkeletonBaris jumlah={8} style={styles.skeletonDaftar} /> : kosong}
          ListFooterComponent={loadingMore ? <SkeletonBaris jumlah={2} style={styles.skeletonDaftar} /> : null}
        />
      )}

      {/* Bar bawah tetap: tombol tidak menutupi isi daftar */}
      <View style={[styles.barBawah, { paddingBottom: insets.bottom + Spacing.sm }]}>
        <Button variant="secondary" icon="layout-grid-circles" onPress={() => setSheetMenu(true)} accessibilityLabel="Menu Kaizen" />
        <Button icon="plus" label="Buat Kaizen" onPress={() => router.push('/kaizen/buat')} style={gs.flex1} />
      </View>

      <BottomSheet visible={sheetMenu} onClose={() => setSheetMenu(false)} title="Menu Kaizen">
        <View style={styles.gridMenu}>
          {MENU.map((m) => (
            <TouchableOpacity
              key={m.label}
              style={styles.ubinMenu}
              activeOpacity={0.85}
              onPress={() => {
                setSheetMenu(false);
                m.aksi();
              }}
            >
              <LinearGradient colors={m.warna} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.isiUbin}>
                <View style={styles.lingkarIkon}>
                  <Icon name={m.ikon} size={18} color={Colors.white} strokeWidth={1.8} />
                </View>
                <Text style={[styles.labelUbin, gs.flex1]}>{m.label}</Text>
                {'jumlah' in m ? (
                  <View style={styles.jumlahUbin}>
                    <Text style={styles.teksJumlah}>{m.jumlah}</Text>
                  </View>
                ) : null}
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>
      </BottomSheet>

      <SheetFilter
        visible={filterTerbuka}
        onClose={tutupFilter}
        aktif={{ status, dari: tanggalDari, sampai: tanggalSampai }}
        memuat={memuatFilter}
        onTerapkan={terapkanFilter}
      />
    </View>
  );
}

const FILTER_AWAL: NilaiFilter = { status: '', dari: '', sampai: '' };

/**
 * Sheet Filter. Pilihannya disimpan di state sendiri (draf) supaya mengetuk chip
 * hanya merender sheet ini, bukan seluruh daftar Kaizen, dan baru berlaku saat diterapkan.
 */
function SheetFilter({
  visible,
  onClose,
  aktif,
  memuat,
  onTerapkan,
}: {
  visible: boolean;
  onClose: () => void;
  aktif: NilaiFilter;
  memuat: null | 'terapkan' | 'reset';
  onTerapkan: (n: NilaiFilter, mode: 'terapkan' | 'reset') => void;
}) {
  const [draf, setDraf] = useState<NilaiFilter>(aktif);
  // Setiap dibuka mulai dari filter yang sedang aktif.
  useEffect(() => {
    if (visible) setDraf(aktif);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);
  const ubah = (k: keyof NilaiFilter, v: string) => setDraf((d) => ({ ...d, [k]: v }));

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Filter">
      <View style={{ paddingHorizontal: Spacing.lg }}>
        <Text style={styles.judulSeksi}>Status</Text>
        <View style={styles.chips}>
          {STATUS.map((s) => {
            const on = s.value === draf.status;
            return (
              <TouchableOpacity
                key={s.value}
                style={[styles.chip, on && styles.chipAktif]}
                onPress={() => ubah('status', s.value)}
                activeOpacity={0.8}
              >
                <Text style={[styles.chipText, on && styles.chipTextAktif]}>{s.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <Text style={styles.judulSeksi}>Tanggal diajukan</Text>
        <View style={[gs.row, { gap: Spacing.sm, alignItems: 'flex-start' }]}>
          <FieldTanggal label="Dari" value={draf.dari} max={draf.sampai || undefined} onChange={(v) => ubah('dari', v)} />
          <FieldTanggal label="Sampai" value={draf.sampai} min={draf.dari || undefined} onChange={(v) => ubah('sampai', v)} />
        </View>
      </View>
      <View style={[gs.row, { gap: Spacing.sm, paddingHorizontal: Spacing.lg, paddingTop: Spacing.md }]}>
        <Button
          variant="outline"
          icon="restore"
          label="Reset"
          loading={memuat === 'reset'}
          disabled={memuat === 'terapkan'}
          onPress={() => {
            setDraf(FILTER_AWAL);
            onTerapkan(FILTER_AWAL, 'reset');
          }}
        />
        <Button
          icon="check"
          label="Terapkan filter"
          loading={memuat === 'terapkan'}
          disabled={memuat === 'reset'}
          onPress={() => onTerapkan(draf, 'terapkan')}
          style={gs.flex1}
        />
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  atas: {
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    borderBottomLeftRadius: Spacing.radius.xl,
    borderBottomRightRadius: Spacing.radius.xl,
  },
  kotakCari: {
    height: 36,
    paddingVertical: 0,
    paddingHorizontal: Spacing.md,
    gap: 6,
  },
  cari: {
    flex: 1,
    paddingVertical: 0,
    fontSize: ukuranIsi,
    fontFamily: fonts.regular,
    color: Colors.textPrimary,
    ...inputReset,
  },
  tombolFilter: {
    width: 36,
    height: 36,
    marginLeft: Spacing.sm,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  judulSeksi: {
    marginTop: Spacing.sm,
    fontSize: ukuranIsi,
    fontFamily: fonts.semibold,
    color: Colors.textPrimary,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingTop: 6,
    paddingBottom: Spacing.sm,
    gap: 6,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  chipAktif: {
    backgroundColor: Colors.textPrimary,
    borderColor: Colors.textPrimary,
  },
  chipText: {
    fontSize: ukuranIsi,
    fontFamily: fonts.medium,
    color: Colors.textSecondary,
  },
  chipTextAktif: {
    color: Colors.white,
    fontFamily: fonts.semibold,
  },
  baris: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    marginHorizontal: -Spacing.lg,
    backgroundColor: Colors.white,
  },
  kanan: {
    alignItems: 'flex-end',
    gap: 4,
    flexShrink: 0,
  },
  badgeStatus: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Spacing.radius.full,
    ...Spacing.curve,
  },
  teksBadge: {
    fontSize: 10,
    fontFamily: fonts.semibold,
  },
  tanggal: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: Colors.textSecondary,
  },
  pemisah: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.border,
    marginLeft: 42 + Spacing.md,
  },
  // Skeleton di dalam FlatList: lebarkan ke tepi layar seperti baris asli.
  skeletonDaftar: {
    marginHorizontal: -Spacing.lg,
  },
  listContent: {
    padding: Spacing.lg,
    flexGrow: 1,
  },
  pengingat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    paddingLeft: Spacing.md,
    paddingRight: Spacing.sm,
    minHeight: 44,
    borderRadius: Spacing.radius.full,
    ...Spacing.curve,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  pengingatBelum: {
    backgroundColor: '#fffbeb',
    borderColor: '#fde68a',
  },
  pengingatSudah: {
    backgroundColor: brand[50],
    borderColor: brand[100],
  },
  teksPengingat: {
    flex: 1,
    fontSize: ukuranIsi,
    fontFamily: fonts.medium,
  },
  kartuTop: {
    backgroundColor: Colors.white,
    borderRadius: Spacing.radius.xl,
    ...Spacing.curve,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
  },
  barisTopGeser: {
    marginHorizontal: -Spacing.lg,
    marginBottom: Spacing.md,
    flexGrow: 0,
  },
  isiTopGeser: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  judulTop: {
    fontSize: 12,
    fontFamily: fonts.semibold,
    color: Colors.textPrimary,
  },
  kosongTop: {
    marginTop: Spacing.sm,
    fontSize: ukuranIsi,
    fontFamily: fonts.regular,
    color: Colors.textTertiary,
  },
  barisTop: {
    gap: Spacing.sm,
    paddingVertical: 6,
  },
  garisTop: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.borderSubtle,
  },
  peringkat: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nomorPeringkat: {
    fontSize: 12,
    fontFamily: fonts.semibold,
    color: Colors.textSecondary,
  },
  namaTop: {
    flex: 1,
    fontSize: ukuranIsi,
    fontFamily: fonts.medium,
    color: Colors.textPrimary,
  },
  jumlahTop: {
    fontSize: ukuranIsi,
    fontFamily: fonts.semibold,
    color: Colors.textSecondary,
  },
  // "Kaizen kamu" + baris-barisnya tampil sebagai satu blok putih bersudut:
  // judul membawa sudut atas; bawahnya menempel ke bar tombol.
  headerDaftar: {
    marginHorizontal: -Spacing.lg,
    backgroundColor: Colors.white,
    borderTopLeftRadius: Spacing.radius.xl,
    borderTopRightRadius: Spacing.radius.xl,
    ...Spacing.curve,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xs,
  },
  wadahPemisah: {
    marginHorizontal: -Spacing.lg,
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.lg,
  },
  judulDaftar: {
    fontSize: 12,
    fontFamily: fonts.semibold,
    color: Colors.textPrimary,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: Spacing.radius.xl,
    ...Spacing.curve,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  logo: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
  judulKolom: {
    flex: 1,
  },
  tema: {
    fontSize: 12,
    fontFamily: fonts.semibold,
    color: Colors.textPrimary,
  },
  sub: {
    marginTop: 2,
    fontSize: 12,
    fontFamily: fonts.regular,
    color: Colors.textSecondary,
  },
  nilai: {
    fontSize: 12,
    fontFamily: fonts.bold,
    color: Colors.textPrimary,
  },
  nilaiKecil: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: Colors.textTertiary,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: Spacing.sm,
  },
  tag: {
    maxWidth: '60%',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: Spacing.radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tagText: {
    fontSize: 12,
    fontFamily: fonts.medium,
    color: Colors.textSecondary,
  },
  kaki: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderSubtle,
  },
  kakiItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  kakiText: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: Colors.textSecondary,
  },
  status: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Spacing.radius.full,
  },
  statusText: {
    fontSize: 12,
    fontFamily: fonts.bold,
    letterSpacing: 0.4,
  },
  kosong: {
    alignItems: 'center',
    paddingTop: Spacing.xxxl,
    paddingHorizontal: Spacing.xl,
  },
  kosongIkon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: brand[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  barBawah: {
    flexDirection: 'row',
    gap: Spacing.sm,
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderSubtle,
  },
  profil: {
    marginBottom: Spacing.md,
    padding: Spacing.md,
    borderRadius: Spacing.radius.xl,
    ...Spacing.curve,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  namaProfil: {
    fontSize: 12,
    fontFamily: fonts.semibold,
    color: Colors.textPrimary,
  },
  nikProfil: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: Colors.textTertiary,
  },
  statProfil: {
    flexDirection: 'row',
    marginTop: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Spacing.radius.md,
    ...Spacing.curve,
    backgroundColor: slate[50],
  },
  selStat: {
    flex: 1,
    alignItems: 'center',
  },
  garisStat: {
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderLeftColor: Colors.border,
  },
  angkaStat: {
    fontSize: 12,
    fontFamily: fonts.bold,
    color: Colors.textPrimary,
  },
  labelStat: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  hutang: {
    marginTop: Spacing.md,
  },
  judulHutang: {
    fontSize: ukuranIsi,
    fontFamily: fonts.semibold,
    color: Colors.textSecondary,
  },
  pilHutang: {
    marginTop: Spacing.sm,
    borderRadius: Spacing.radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    alignItems: 'center',
  },
  teksPilHutang: {
    fontSize: 12,
    fontFamily: fonts.regular,
  },
  lencana: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginTop: Spacing.md,
    padding: Spacing.sm,
    borderRadius: Spacing.radius.md,
    ...Spacing.curve,
    backgroundColor: slate[50],
    overflow: 'hidden',
  },
  koin: {
    position: 'absolute',
    left: 0,
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  mukaKoin: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  kilapKoin: {
    position: 'absolute',
    top: 6,
    right: 9,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
  kilau: {
    position: 'absolute',
    top: -20,
    bottom: -20,
    left: 0,
    width: 60,
  },
  labelLencana: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: Colors.textTertiary,
  },
  gelarLencana: {
    fontSize: 12,
    fontFamily: fonts.bold,
  },
  ketLencana: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: Colors.textSecondary,
  },
  gridMenu: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  ubinMenu: {
    width: '100%',
    height: 52,
    borderRadius: Spacing.radius.full,
    ...Spacing.curve,
    overflow: 'hidden',
  },
  isiUbin: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.sm,
  },
  lingkarIkon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.22)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  labelUbin: {
    fontSize: ukuranIsi,
    fontFamily: fonts.bold,
    color: Colors.white,
    textAlign: 'left',
  },
  jumlahUbin: {
    minWidth: 24,
    height: 24,
    marginRight: Spacing.xs,
    paddingHorizontal: 6,
    borderRadius: 12,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  teksJumlah: {
    fontSize: ukuranIsi,
    fontFamily: fonts.bold,
    color: Colors.textPrimary,
  },
});
