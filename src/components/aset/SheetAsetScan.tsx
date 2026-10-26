/**
 * Bottom sheet ringkasan aset hasil pindai QR. Presentasional: data dimuat
 * pemanggil lewat `useAsetScan`.
 */
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import BottomSheet from '../common/BottomSheet';
import Icon from '../common/Icon';
import { Skeleton } from '../common/Skeleton';
import Colors, { brand } from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { fonts, ukuranIsi } from '../../../constants/Typography';
import { DetailAset } from '../../types/aset';

interface SheetAsetScanProps {
  visible: boolean;
  data: DetailAset | null;
  memuat: boolean;
  error: string;
  onLihatDetail: () => void;
  onBuatTiket: () => void;
  /** Hanya untuk aset Mesin: laporkan kerusakan dies yang terpasang. */
  onLaporDies: () => void;
  /** Hanya untuk aset Mesin dan Dies: catat Pencapaian Produksi. */
  onProduksi: () => void;
  onClose: () => void;
}

type IdMenu = 'detail' | 'tiket' | 'dies' | 'produksi';
type WarnaMenu = readonly [string, string];

const WARNA_BIRU: WarnaMenu = ['#60a5fa', '#3b82f6'];
const WARNA_ORANYE: WarnaMenu = ['#fb923c', '#f97316'];
const WARNA_MERAH: WarnaMenu = ['#f87171', '#ef4444'];
const WARNA_AZURE: WarnaMenu = ['#38bdf8', '#0ea5e9'];

/** Menu mengikuti kategori aset, sama dengan Menu Scan di web (`aset/scan.blade.php`). */
function menuUntuk(kode?: string): { id: IdMenu; ikon: string; label: string; warna: WarnaMenu }[] {
  const mesin = kode === 'MESIN';
  return [
    { id: 'detail', ikon: 'file-document', label: 'Lihat Detail', warna: WARNA_BIRU },
    { id: 'tiket', ikon: 'ticket-outline', label: mesin ? 'Lapor Kerusakan Mesin' : 'Buat Tiket Masalah', warna: WARNA_ORANYE },
    ...(mesin ? [{ id: 'dies' as const, ikon: 'wrench', label: 'Lapor Kerusakan Dies', warna: WARNA_MERAH }] : []),
    ...(mesin || kode === 'DIES' ? [{ id: 'produksi' as const, ikon: 'gauge', label: 'Pencapaian Produksi', warna: WARNA_AZURE }] : []),
  ];
}

export default function SheetAsetScan({
  visible,
  data,
  memuat,
  error,
  onLihatDetail,
  onBuatTiket,
  onLaporDies,
  onProduksi,
  onClose,
}: SheetAsetScanProps) {
  const aset = data?.dataAsset;
  const lencana = [aset?.asset_condition, aset?.asset_use].filter(Boolean);
  const menu = menuUntuk(aset?.aset_kategori?.kode);
  const aksi: Record<IdMenu, () => void> = { detail: onLihatDetail, tiket: onBuatTiket, dies: onLaporDies, produksi: onProduksi };
  const keterangan = [aset?.aset_kategori?.asset_category_name, aset?.plant?.nama].filter(Boolean).join(' · ');

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Aset Terdeteksi">
      <View style={styles.isi}>
        {memuat ? (
          <View style={styles.kartu}>
            <Skeleton w="70%" h={14} />
            <Skeleton w="40%" h={12} style={{ marginTop: Spacing.md }} />
            <Skeleton w="55%" h={12} style={{ marginTop: Spacing.md }} />
          </View>
        ) : error || !aset ? (
          <View style={styles.galat}>
            <Icon name="alert-circle-outline" size={40} color={Colors.danger} />
            <Text style={styles.teksGalat}>{error || 'Data aset tidak ditemukan.'}</Text>
          </View>
        ) : (
          <View style={styles.kartu}>
            <Text style={styles.nama} numberOfLines={2}>{aset.alias || aset.asset_name || '-'}</Text>
            {aset.alias && aset.asset_name ? <Text style={styles.nomor} numberOfLines={1}>{aset.asset_name}</Text> : null}
            <Text style={styles.nomor}>{aset.asset_number || '-'}</Text>
            {keterangan ? <Text style={styles.keterangan}>{keterangan}</Text> : null}
            {lencana.length > 0 ? (
              <View style={styles.lencanaBaris}>
                {lencana.map((teks) => (
                  <View key={teks} style={styles.lencana}>
                    <Text style={styles.teksLencana}>{teks}</Text>
                  </View>
                ))}
              </View>
            ) : null}
          </View>
        )}

        {aset && !memuat ? (
          <View style={styles.menu}>
            {menu.map((m) => (
              <TouchableOpacity key={m.id} style={styles.ubin} activeOpacity={0.85} onPress={aksi[m.id]}>
                <LinearGradient colors={m.warna} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.isiUbin}>
                  <View style={styles.lingkarIkon}>
                    <Icon name={m.ikon} size={18} color={Colors.white} strokeWidth={1.8} />
                  </View>
                  <Text style={styles.labelUbin}>{m.label}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        ) : null}
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  isi: { paddingHorizontal: Spacing.lg },
  kartu: {
    backgroundColor: Colors.white,
    borderRadius: Spacing.radius.xl,
    ...Spacing.curve,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    padding: Spacing.lg,
  },
  nama: { fontFamily: fonts.bold, fontSize: 12, color: Colors.textPrimary },
  nomor: { fontFamily: fonts.regular, fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  keterangan: { fontFamily: fonts.regular, fontSize: 12, color: Colors.textSecondary, marginTop: Spacing.sm },
  lencanaBaris: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md },
  lencana: {
    backgroundColor: brand[50],
    borderRadius: Spacing.radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
  },
  teksLencana: { fontFamily: fonts.semibold, fontSize: 12, color: brand[700] },
  galat: { alignItems: 'center', paddingVertical: Spacing.xl },
  teksGalat: { fontFamily: fonts.regular, fontSize: 12, color: Colors.textSecondary, textAlign: 'center', marginTop: Spacing.md },
  menu: { rowGap: Spacing.sm, marginTop: Spacing.lg },
  ubin: { height: 52, borderRadius: Spacing.radius.full, ...Spacing.curve, overflow: 'hidden' },
  isiUbin: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingHorizontal: Spacing.sm },
  lingkarIkon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.22)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  labelUbin: { flex: 1, fontSize: ukuranIsi, fontFamily: fonts.bold, color: Colors.white },
});
