/**
 * Semua berita — daftar penuh dengan gulir tanpa batas dan tarik-untuk-segarkan.
 */
import React from 'react';
import { ActivityIndicator, FlatList, RefreshControl, Share, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppBar from '../../../src/components/common/AppBar';
import { dialog } from '../../../src/components/common/AppDialog';
import Button from '../../../src/components/common/Button';
import Icon from '../../../src/components/common/Icon';
import { SkeletonDaftar } from '../../../src/components/common/Skeleton';
import BarisBerita from '../../../src/components/berita/BarisBerita';
import Colors from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { gs } from '../../../constants/GlobalStyles';
import { teksBagikanBerita } from '../../../src/adapters/berita';
import { useDaftarBerita } from '../../../src/hooks/useDaftarBerita';

export default function DaftarBeritaScreen() {
  const router = useRouter();
  const h = useDaftarBerita();
  const insets = useSafeAreaInsets();

  const ubahSuka = async (id: number) => {
    if (!(await h.ubahSuka(id))) dialog.alert('Gagal', 'Suka tidak tersimpan. Periksa koneksi lalu coba lagi.', 'danger');
  };

  if (h.memuat) {
    return (
      <View style={gs.screenPlain}>
        <AppBar judul="Berita" />
        <SkeletonDaftar jumlah={6} style={{ padding: Spacing.screenPadding }} />
      </View>
    );
  }

  if (h.error && h.berita.length === 0) {
    return (
      <View style={[gs.screenPlain, gs.centerFill]}>
        <AppBar judul="Berita" />
        <Icon name="alert-circle-outline" size={44} color={Colors.textTertiary} />
        <Text style={gs.emptyTitle}>{h.error}</Text>
        <Button label="Coba lagi" onPress={h.cobaLagi} style={{ marginTop: Spacing.lg }} />
      </View>
    );
  }

  return (
    <View style={gs.screenPlain}>
      <AppBar judul="Berita" />
      <FlatList
        data={h.berita}
        keyExtractor={(b) => String(b.id)}
        contentContainerStyle={[styles.isi, { paddingBottom: Spacing.xxxl + insets.bottom }]}
        refreshControl={<RefreshControl refreshing={h.menyegarkan} onRefresh={h.segarkan} />}
        onEndReached={h.muatBerikutnya}
        onEndReachedThreshold={0.4}
        ListEmptyComponent={<Text style={[gs.emptyTitle, styles.kosong]}>Belum ada berita.</Text>}
        ListFooterComponent={h.memuatLebih ? <ActivityIndicator style={styles.footer} color={Colors.primary} /> : null}
        renderItem={({ item }) => (
          <BarisBerita
            berita={item}
            onPress={() => router.push(`/services/berita/${item.id}` as any)}
            onSuka={() => ubahSuka(item.id)}
            onBagikan={() => Share.share({ message: teksBagikanBerita(item) }).catch(() => {})}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  isi: {
    paddingHorizontal: Spacing.screenPadding,
    paddingBottom: Spacing.xxxl,
  },
  kosong: {
    textAlign: 'center',
    marginTop: Spacing.xxxl,
  },
  footer: {
    paddingVertical: Spacing.lg,
  },
});
