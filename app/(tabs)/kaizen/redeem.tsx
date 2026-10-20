/**
 * Redeem Hadiah — tukar poin Kaizen akun yang login dengan gift di plant-nya.
 * Aturannya mengikuti halaman redeem di web: poin harus cukup dan gift yang
 * sama tidak boleh punya request yang masih berjalan. Poin baru dipotong
 * saat admin mengubah status request ke "Diterima".
 */
import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, RefreshControl } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '../../../src/components/common/Icon';
import Button from '../../../src/components/common/Button';
import { dialog } from '../../../src/components/common/AppDialog';
import Colors, { brand, slate, gradasiPalet } from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { fonts, ukuranIsi } from '../../../constants/Typography';
import { gs } from '../../../constants/GlobalStyles';
import { kaizenService } from '../../../src/services/kaizenService';
import { KaizenGift, KaizenPoin } from '../../../src/types/kaizen';
import { relatif, urlFoto } from '../../../src/utils/kaizen';
import { SkeletonDasbor } from '../../../src/components/common/Skeleton';

const WARNA_REDEEM: Record<string, { bg: string; fg: string }> = {
  Diproses: { bg: '#fffbeb', fg: '#b45309' },
  'Gift Ready': { bg: '#eff6ff', fg: '#1d4ed8' },
  Diterima: { bg: brand[50], fg: brand[700] },
  Dibatalkan: { bg: '#fef2f2', fg: Colors.dangerDark },
};

const angka = (n: number) => n.toLocaleString('id-ID');

export default function RedeemPoin() {
  const insets = useSafeAreaInsets();
  const [data, setData] = useState<KaizenPoin | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [mengirim, setMengirim] = useState<number | null>(null);

  const muat = useCallback(async () => {
    try {
      setData(await kaizenService.getPoin());
      setError(null);
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Gagal memuat poin.');
    } finally {
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { muat(); }, [muat]));

  const redeem = async (gift: KaizenGift) => {
    const setuju = await dialog.confirm({
      title: 'Redeem gift?',
      message: `${gift.nama_gift} seharga ${angka(gift.harga_gift)} poin. Poin dipotong setelah request disetujui admin.`,
      confirmText: 'Redeem',
    });
    if (!setuju) return;
    setMengirim(gift.id);
    try {
      await kaizenService.redeem(gift.id);
      await dialog.alert('Berhasil', 'Request redeem terkirim. Pantau statusnya di riwayat.', 'success');
      muat();
    } catch (e: any) {
      dialog.alert('Gagal Redeem', e?.response?.data?.message || e?.message || 'Terjadi kesalahan.', 'danger');
    } finally {
      setMengirim(null);
    }
  };

  if (!data && !error) return <View style={gs.screen}><SkeletonDasbor /></View>;

  const poin = data?.poin ?? 0;

  return (
    <ScrollView
      style={gs.screen}
      contentContainerStyle={{ padding: Spacing.lg, paddingBottom: insets.bottom + Spacing.lg }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); muat(); }} colors={[Colors.primary]} tintColor={Colors.primary} />}
    >
      {error ? <Text style={[styles.isi, { color: Colors.danger, marginBottom: Spacing.sm }]}>{error}</Text> : null}

      <LinearGradient
        colors={[...gradasiPalet]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.kartuPoin}
      >
        <View style={styles.ikonPoin}>
          <Icon name="star-circle-outline" size={20} color={Colors.ink} />
        </View>
        <View>
          <Text style={styles.labelPoin}>Poin Kaizen kamu</Text>
          <Text style={styles.nilaiPoin}>{angka(poin)} poin</Text>
        </View>
      </LinearGradient>

      <Text style={styles.judul}>Pilih gift</Text>
      {data && data.gifts.length === 0 ? <Text style={styles.kosong}>Belum ada gift untuk plant kamu.</Text> : null}
      <View style={styles.grid}>
        {data?.gifts.map((g) => {
          const cukup = poin >= g.harga_gift;
          const foto = g.gambar_url ?? urlFoto(g.gambar);
          return (
            <View key={g.id} style={styles.gift}>
              <View style={styles.fotoGift}>
                {foto ? <Image source={{ uri: foto }} style={StyleSheet.absoluteFill} resizeMode="cover" /> : <Icon name="gift" size={28} color={Colors.textTertiary} />}
              </View>
              <Text style={styles.namaGift} numberOfLines={2}>{g.nama_gift}</Text>
              <Text style={styles.harga}>{angka(g.harga_gift)} poin</Text>
              <Button
                label={cukup ? 'Redeem' : 'Poin kurang'}
                variant={cukup ? 'primary' : 'muted'}
                onPress={() => redeem(g)}
                loading={mengirim === g.id}
                disabled={!cukup || mengirim !== null}
                block
                style={{ marginTop: 6 }}
              />
            </View>
          );
        })}
      </View>

      <Text style={styles.judul}>Riwayat redeem</Text>
      {data && data.riwayat.length === 0 ? <Text style={styles.kosong}>Belum pernah redeem.</Text> : null}
      {data?.riwayat.map((r) => {
        const w = WARNA_REDEEM[r.status_redeem] ?? { bg: slate[100], fg: Colors.textSecondary };
        return (
          <View key={r.id} style={styles.riwayat}>
            <View style={gs.flex1}>
              <Text style={styles.namaGift} numberOfLines={1}>{r.gift?.nama_gift ?? 'Gift'}</Text>
              <Text style={styles.caption}>Kode {r.kode_redeem} · {relatif(r.created_at)}</Text>
              {r.status_redeem === 'Dibatalkan' && r.alasan_dibatalkan ? (
                <Text style={[styles.caption, { color: Colors.dangerDark }]}>{r.alasan_dibatalkan}</Text>
              ) : null}
            </View>
            <View style={[styles.badge, { backgroundColor: w.bg }]}>
              <Text style={[styles.teksBadge, { color: w.fg }]}>{r.status_redeem}</Text>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  isi: { fontSize: ukuranIsi, fontFamily: fonts.regular },
  kartuPoin: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderRadius: Spacing.radius.xl,
    ...Spacing.curve,
    padding: Spacing.md,
  },
  ikonPoin: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  labelPoin: { fontSize: 12, fontFamily: fonts.regular, color: Colors.ink },
  nilaiPoin: { fontSize: 12, fontFamily: fonts.bold, color: Colors.ink },
  judul: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
    fontSize: 12,
    fontFamily: fonts.semibold,
    color: Colors.textPrimary,
  },
  kosong: { fontSize: ukuranIsi, fontFamily: fonts.regular, color: Colors.textTertiary },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: Spacing.sm },
  gift: {
    width: '48.5%',
    backgroundColor: Colors.white,
    borderRadius: Spacing.radius.xl,
    ...Spacing.curve,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    padding: Spacing.sm,
  },
  fotoGift: {
    height: 90,
    borderRadius: Spacing.radius.md,
    backgroundColor: slate[100],
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  namaGift: { fontSize: ukuranIsi, fontFamily: fonts.semibold, color: Colors.textPrimary },
  harga: { fontSize: ukuranIsi, fontFamily: fonts.medium, color: Colors.primary, marginTop: 2 },
  riwayat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.white,
    borderRadius: Spacing.radius.xl,
    ...Spacing.curve,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  caption: { fontSize: 12, fontFamily: fonts.regular, color: Colors.textTertiary, marginTop: 2 },
  badge: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 },
  teksBadge: { fontSize: 10, fontFamily: fonts.semibold },
});
