/** Detail Pengukuran Terkirim — info, part, status approval, dan sampel per titik ukur. */
import React from 'react';
import { ScrollView, RefreshControl } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Button from '../../../../src/components/common/Button';
import KeadaanKosong from '../../../../src/components/common/KeadaanKosong';
import { SkeletonDetail } from '../../../../src/components/common/Skeleton';
import IsiDetailTerkirim from '../../../../src/components/pengukuran/IsiDetailTerkirim';
import Colors from '../../../../constants/Colors';
import Spacing from '../../../../constants/Spacing';
import { gs } from '../../../../constants/GlobalStyles';
import { useDetailTerkirim } from '../../../../src/hooks/useDetailTerkirim';

export default function DetailTerkirimScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const d = useDetailTerkirim(id);

  if (d.memuat) return <SkeletonDetail />;

  return (
    <ScrollView
      style={[gs.screen, { backgroundColor: Colors.white }]}
      contentContainerStyle={{ flexGrow: 1, paddingBottom: insets.bottom + Spacing.xxl }}
      refreshControl={<RefreshControl refreshing={d.menyegarkan} onRefresh={d.segarkan} colors={[Colors.primary]} tintColor={Colors.primary} />}
    >
      {d.detail ? (
        <IsiDetailTerkirim detail={d.detail} />
      ) : (
        <KeadaanKosong pose="mikir" judul="Gagal memuat" teks={d.error ?? 'Detail pengukuran tidak ditemukan.'}>
          <Button label="Coba Lagi" onPress={d.cobaLagi} style={{ marginTop: Spacing.lg }} />
        </KeadaanKosong>
      )}
    </ScrollView>
  );
}
