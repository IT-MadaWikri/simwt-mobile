/**
 * Menu Kaizen — layar pertama tumpukan Kaizen. Dibuka dari ikon Kaizen di
 * beranda. Isinya grid menu, ringkasan poin & konsistensi bulanan, dan tiga
 * Kaizen terbaru. "Kaizen Saya" ada di `saya.tsx`, jadi tombol kembali di sana
 * otomatis mundur ke menu ini (satu tumpukan), bukan melompat ke beranda.
 */
import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, RefreshControl, StyleSheet } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppBar from '../../../src/components/common/AppBar';
import Icon from '../../../src/components/common/Icon';
import RekapBulan from '../../../src/components/kaizen/RekapBulan';
import ServiceIcon from '../../../src/components/common/ServiceIcon';
import SectionHeader from '../../../src/components/common/SectionHeader';
import { Skeleton, SkeletonBaris } from '../../../src/components/common/Skeleton';
import Colors, { brand, slate } from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { fonts } from '../../../constants/Typography';
import { gs } from '../../../constants/GlobalStyles';
import { ServiceItem } from '../../../constants/Services';
import { useAuth } from '../../../src/contexts/AuthContext';
import { kaizenService } from '../../../src/services/kaizenService';
import { approvalService } from '../../../src/services/approvalService';
import { Kaizen, KaizenPoin } from '../../../src/types/kaizen';
import { drafKaizen } from '../../../src/utils/drafKaizen';
import { BULAN, urlFoto, warnaStatus } from '../../../src/utils/kaizen';

// Bentuk yang sama dengan grid layanan di beranda, jadi memakai ServiceIcon.
const WARNA = { backgroundColor: Colors.serviceAmber, iconColor: '#ff9a2e' };
const angka = (n: number) => n.toLocaleString('id-ID');

export default function MenuKaizenScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  // Menu & antrean approval hanya untuk user yang punya permission approve_kaizen (aturan yang sama dengan server).
  const bisaApprove = !!user?.permission_names?.includes('approve_kaizen');

  const [profil, setProfil] = useState<KaizenPoin | null>(null);
  const [terbaru, setTerbaru] = useState<Kaizen[] | null>(null);
  const [menunggu, setMenunggu] = useState(0);
  const [jumlahDraf, setJumlahDraf] = useState(0);
  const [menyegarkan, setMenyegarkan] = useState(false);

  // Tiap sumber dimuat sendiri-sendiri: yang gagal cukup tidak tampil, tidak menghalangi yang lain.
  const muat = useCallback(
    () =>
      Promise.all([
        kaizenService.getPoin().then(setProfil).catch(() => {}),
        kaizenService.getList({ page: 1 }).then((h) => setTerbaru(h.data.slice(0, 3))).catch(() => setTerbaru([])),
        bisaApprove ? approvalService.antrean().then((a) => setMenunggu(a.ringkasan.kaizen)).catch(() => {}) : Promise.resolve(),
        drafKaizen.daftar(user?.nik).then((d) => setJumlahDraf(d.length)),
      ]),
    [user?.nik, bisaApprove]
  );
  useFocusEffect(
    useCallback(() => {
      muat();
    }, [muat])
  );
  const segarkan = () => {
    setMenyegarkan(true);
    muat().finally(() => setMenyegarkan(false));
  };

  // Hadiah paling baru (id terbesar) dari katalog plant pengguna.
  const hadiahBaru = [...(profil?.gifts ?? [])].sort((a, b) => b.id - a.id).slice(0, 5);

  const menu: ServiceItem[] = [
    { id: 'kaizen-saya', name: 'Kaizen\nSaya', icon: 'lightbulb-on-outline', route: '/kaizen/saya', description: 'Daftar dan pengajuan Kaizen kamu', ...WARNA },
    { id: 'kaizen-buat', name: 'Buat\nKaizen', icon: 'plus', route: '/kaizen/buat', description: 'Ajukan ide perbaikan Kaizen baru', ...WARNA },
    ...(bisaApprove
      ? [{ id: 'kaizen-approval', name: 'Butuh\nApproval', icon: 'clipboard-check-outline', route: '/(tabs)/activity?jenis=kaizen', description: 'Kaizen yang menunggu keputusanmu', lencana: menunggu, ...WARNA }]
      : []),
    { id: 'kaizen-draf', name: 'Draft\nSaya', icon: 'file-document', route: '/kaizen/draf', description: 'Draf Kaizen yang belum dikirim', lencana: jumlahDraf, ...WARNA },
    { id: 'kaizen-redeem', name: 'Redeem\nHadiah', icon: 'gift', route: '/kaizen/redeem', description: 'Tukar poin dengan hadiah', segera: true, ...WARNA },
  ];

  return (
    <>
      <AppBar judul="Kaizen" />
      <ScrollView
        style={[gs.screen, { backgroundColor: Colors.white }]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: Spacing.lg, paddingBottom: insets.bottom + Spacing.xxl }}
        refreshControl={<RefreshControl refreshing={menyegarkan} onRefresh={segarkan} colors={[Colors.primary]} tintColor={Colors.primary} />}
      >
        <SectionHeader title="Menu Kaizen" />
        <View style={styles.grid}>
          {menu.map((m) => (
            <ServiceIcon key={m.id} service={m} />
          ))}
        </View>

        {profil === null ? (
          <View style={styles.bagian}>
            <SectionHeader title="Ringkasan" />
            <View style={[gs.card, styles.kartuRingkas, { gap: Spacing.sm }]}>
              <View style={styles.barisPoin}>
                <Skeleton w={40} h={40} r={20} />
                <View style={[gs.flex1, { gap: 6 }]}>
                  <Skeleton w="40%" h={10} />
                  <Skeleton w="30%" h={12} />
                </View>
              </View>
              <Skeleton w="100%" h={14} />
              <Skeleton w="80%" h={22} />
            </View>
          </View>
        ) : (
          <View style={styles.bagian}>
            <SectionHeader title="Ringkasan" />
            <View style={[gs.card, styles.kartuRingkas]}>
              <View style={styles.barisPoin}>
                <View style={styles.ikonPoin}>
                  <Icon name="star-circle-outline" size={20} color={Colors.white} />
                </View>
                <View style={gs.flex1}>
                  <Text style={styles.label}>Poin Kaizen kamu</Text>
                  <Text style={styles.nilaiPoin}>{angka(profil.poin)} poin</Text>
                </View>
                <Text style={styles.label}>{profil.jumlah_kaizen} Kaizen</Text>
              </View>

              {profil.hutang ? (
                <>
                  <Text style={[styles.label, { marginTop: Spacing.md }]}>Kaizen Anda {profil.hutang.tahun}</Text>
                  <RekapBulan keadaan={profil.hutang.keadaan} />
                  <View style={[styles.pil, { backgroundColor: profil.hutang.terlewat ? '#fef2f2' : brand[50] }]}>
                    <Text style={[styles.teksPil, { color: profil.hutang.terlewat ? Colors.dangerDark : brand[700] }]}>
                      {profil.hutang.terlewat
                        ? `Anda tidak melakukan Kaizen sebanyak ${profil.hutang.terlewat} bulan di tahun ini`
                        : 'Anda rutin melakukan Kaizen setiap bulan tahun ini'}
                    </Text>
                  </View>
                </>
              ) : null}
            </View>
          </View>
        )}

        <View style={styles.bagian}>
          <SectionHeader title="Kaizen Terbaru" actionText="Lihat Semua" onAction={() => router.push('/kaizen/saya')} />
          {terbaru === null ? (
            <SkeletonBaris jumlah={3} />
          ) : terbaru.length === 0 ? (
            <Text style={[gs.emptyText, gs.containerX]}>Belum ada Kaizen. Ajukan ide perbaikan pertamamu.</Text>
          ) : (
            terbaru.map((k, i) => {
              const warna = warnaStatus(k.status);
              const tgl = new Date(k.created_at);
              return (
                <View key={k.id}>
                  {i > 0 ? <View style={styles.pemisah} /> : null}
                  <TouchableOpacity style={styles.baris} activeOpacity={0.6} onPress={() => router.push(`/kaizen/${k.id}` as any)}>
                    <View style={[styles.logo, { backgroundColor: warna.bg }]}>
                      <Icon name="lightbulb-on-outline" size={18} color={warna.fg} />
                    </View>
                    <View style={gs.flex1}>
                      <Text style={styles.tema} numberOfLines={1}>{k.tema || 'Tanpa tema'}</Text>
                      <Text style={styles.sub} numberOfLines={1}>{k.nomor || `#${k.id}`}</Text>
                    </View>
                    <View style={styles.kanan}>
                      <View style={[styles.badgeStatus, { backgroundColor: warna.bg }]}>
                        <Text style={[styles.teksBadge, { color: warna.fg }]}>{warna.label}</Text>
                      </View>
                      <Text style={styles.sub}>{tgl.getDate()} {BULAN[tgl.getMonth()]} {tgl.getFullYear()}</Text>
                    </View>
                    <Icon name="chevron-right" size={16} color={Colors.textTertiary} />
                  </TouchableOpacity>
                </View>
              );
            })
          )}
        </View>
        <View style={styles.bagian}>
            <SectionHeader title="Hadiah Baru" actionText="Lihat Semua" onAction={() => router.push('/kaizen/redeem')} />
            {profil === null ? (
              <SkeletonBaris jumlah={3} />
            ) : hadiahBaru.length === 0 ? (
              <Text style={[gs.emptyText, gs.containerX]}>Belum ada hadiah untuk plant kamu.</Text>
            ) : (
              hadiahBaru.map((g, i) => {
                const foto = g.gambar_url ?? urlFoto(g.gambar);
                return (
                  <View key={g.id}>
                    {i > 0 ? <View style={styles.pemisahHadiah} /> : null}
                    <TouchableOpacity style={styles.baris} activeOpacity={0.6} onPress={() => router.push('/kaizen/redeem')}>
                      <View style={styles.fotoHadiah}>
                        {foto ? (
                          <Image source={{ uri: foto }} style={StyleSheet.absoluteFill} resizeMode="cover" />
                        ) : (
                          <Icon name="gift" size={22} color={Colors.textTertiary} />
                        )}
                      </View>
                      <View style={gs.flex1}>
                        <Text style={styles.tema} numberOfLines={2}>{g.nama_gift}</Text>
                        <View style={styles.barisHarga}>
                          <Icon name="star-circle-outline" size={14} color={brand[600]} />
                          <Text style={styles.hargaHadiah}>{angka(g.harga_gift)} poin</Text>
                        </View>
                      </View>
                      <Icon name="chevron-right" size={16} color={Colors.textTertiary} />
                    </TouchableOpacity>
                  </View>
                );
              })
            )}
        </View>

      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.md,
  },
  bagian: {
    marginTop: Spacing.xl,
  },
  kartuRingkas: {
    marginHorizontal: Spacing.lg,
    padding: Spacing.md,
  },
  barisPoin: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  ikonPoin: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: Colors.textTertiary,
  },
  nilaiPoin: {
    fontSize: 12,
    fontFamily: fonts.bold,
    color: Colors.textPrimary,
  },
  pil: {
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Spacing.radius.full,
    ...Spacing.curve,
  },
  teksPil: {
    fontSize: 12,
    fontFamily: fonts.regular,
  },
  fotoHadiah: {
    width: 56,
    height: 56,
    borderRadius: Spacing.radius.md,
    ...Spacing.curve,
    backgroundColor: slate[100],
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  barisHarga: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  hargaHadiah: {
    fontSize: 12,
    fontFamily: fonts.bold,
    color: brand[700],
  },
  pemisahHadiah: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.border,
    marginLeft: Spacing.lg + 56 + Spacing.md,
  },
  baris: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  pemisah: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.border,
    marginLeft: Spacing.lg + 42 + Spacing.md,
  },
  logo: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
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
});
