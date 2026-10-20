/**
 * Detail berita — judul, baris penulis/waktu baca, foto utama, lalu isi artikel (HTML dari CMS web,
 * sudah disanitasi server) yang dirender dengan gaya aplikasi.
 */
import React from 'react';
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity, Share, useWindowDimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import RenderHTML from 'react-native-render-html';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BarisBerita from '../../../src/components/berita/BarisBerita';
import AppBar from '../../../src/components/common/AppBar';
import { dialog } from '../../../src/components/common/AppDialog';
import Button from '../../../src/components/common/Button';
import Icon from '../../../src/components/common/Icon';
import { SkeletonDetail } from '../../../src/components/common/Skeleton';
import Colors, { slate } from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { fonts } from '../../../constants/Typography';
import { gs } from '../../../constants/GlobalStyles';
import { tanggalBerita, teksBagikanBerita } from '../../../src/adapters/berita';
import { useDetailBerita } from '../../../src/hooks/useDetailBerita';

// Gaya isi artikel: Poppins 12px seperti teks lain; judul bagian memakai varian bold.
const baseStyle = { fontFamily: fonts.regular, fontSize: 12, lineHeight: 20, color: Colors.textSecondary };
const tagsStyles = {
  p: { marginTop: 0, marginBottom: Spacing.md },
  h2: { fontFamily: fonts.bold, fontWeight: 'normal' as const, fontSize: 16, lineHeight: 24, color: Colors.textPrimary, marginTop: Spacing.md, marginBottom: Spacing.sm },
  h3: { fontFamily: fonts.bold, fontWeight: 'normal' as const, fontSize: 14, lineHeight: 22, color: Colors.textPrimary, marginTop: Spacing.md, marginBottom: Spacing.sm },
  strong: { fontFamily: fonts.bold, fontWeight: 'normal' as const },
  b: { fontFamily: fonts.bold, fontWeight: 'normal' as const },
  a: { color: Colors.primary, textDecorationLine: 'underline' as const },
  blockquote: { borderLeftWidth: 3, borderLeftColor: slate[200], paddingLeft: Spacing.md, marginLeft: 0, marginBottom: Spacing.md },
};

export default function BeritaDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { berita, memuat, error, muat, ubahSuka } = useDetailBerita(Number(id));
  const router = useRouter();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const suka = async (idTarget?: number) => {
    if (!(await ubahSuka(idTarget))) dialog.alert('Gagal', 'Suka tidak tersimpan. Periksa koneksi lalu coba lagi.', 'danger');
  };
  const sukaTerkait = (idTarget: number) => suka(idTarget);

  if (memuat) {
    return (
      <View style={gs.screenPlain}>
        <AppBar judul="Berita" />
        <SkeletonDetail />
      </View>
    );
  }

  if (!berita) {
    return (
      <View style={[gs.screenPlain, gs.centerFill]}>
        <AppBar judul="Berita" />
        <Icon name="alert-circle-outline" size={44} color={Colors.textTertiary} />
        <Text style={gs.emptyTitle}>{error ?? 'Berita tidak ditemukan.'}</Text>
        {error !== 'Berita tidak ditemukan.' ? (
          <Button label="Coba lagi" onPress={muat} style={{ marginTop: Spacing.lg }} />
        ) : null}
      </View>
    );
  }

  return (
    <View style={gs.screenPlain}>
      <AppBar
        judul="Berita"
        kanan={
          <TouchableOpacity hitSlop={10} onPress={() => Share.share({ message: teksBagikanBerita(berita) }).catch(() => {})}>
            <Icon name="share-variant" size={20} color={Colors.white} />
          </TouchableOpacity>
        }
      />
      <ScrollView
        contentContainerStyle={[gs.scrollContent, { paddingBottom: Spacing.xxxl + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Judul besar: pengecualian dari aturan 12px, seperti sapaan di puncak beranda. */}
        <Text style={styles.judul}>{berita.judul}</Text>

        <View style={styles.baris}>
          <Text style={styles.meta} numberOfLines={1}>
            {tanggalBerita(berita.terbitPada)}
            {berita.penulis ? ' oleh ' : ''}
            {berita.penulis ? <Text style={styles.penulis}>{berita.penulis}</Text> : null}
          </Text>
          <Text style={styles.meta}>{berita.menitBaca} mnt baca</Text>
        </View>

        <View style={styles.statistik}>
          <View style={styles.butir}>
            <Icon name="eye-outline" size={16} color={Colors.textSecondary} />
            <Text style={styles.meta}>{berita.dilihat}</Text>
          </View>
          <TouchableOpacity style={styles.butir} hitSlop={10} onPress={() => suka()}>
            <Icon
              name="heart"
              size={16}
              color={berita.disukai ? Colors.danger : Colors.textSecondary}
              fill={berita.disukai ? Colors.danger : 'none'}
            />
            <Text style={styles.meta}>{berita.jumlahSuka}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.foto}>
          {berita.sampulUrl ? (
            <Image source={{ uri: berita.sampulUrl }} style={StyleSheet.absoluteFill} resizeMode="cover" />
          ) : (
            <Icon name="image" size={32} color={Colors.textTertiary} />
          )}
        </View>

        <RenderHTML
          contentWidth={width - Spacing.screenPadding * 2}
          source={{ html: berita.isi }}
          baseStyle={baseStyle}
          tagsStyles={tagsStyles}
          // Font Poppins harus didaftarkan, kalau tidak teks HTML jatuh ke font sistem.
          systemFonts={[fonts.regular, fonts.bold]}
        />

        {berita.terkait.length > 0 ? (
          <View style={styles.terkait}>
            <Text style={styles.judulTerkait}>Mungkin Anda suka</Text>
            {berita.terkait.map((t) => (
              <BarisBerita
                key={t.id}
                berita={t}
                onPress={() => router.push(`/services/berita/${t.id}` as any)}
                onSuka={() => sukaTerkait(t.id)}
                onBagikan={() => Share.share({ message: teksBagikanBerita(t) }).catch(() => {})}
              />
            ))}
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  judul: {
    fontFamily: fonts.bold,
    fontSize: 20,
    lineHeight: 28,
    color: Colors.textPrimary,
  },
  baris: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.md,
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
  },
  statistik: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    marginBottom: Spacing.md,
  },
  terkait: {
    marginTop: Spacing.lg,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.borderSubtle,
  },
  judulTerkait: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  butir: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  meta: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: Colors.textSecondary,
    flexShrink: 1,
  },
  penulis: {
    fontFamily: fonts.bold,
    color: Colors.textPrimary,
  },
  foto: {
    width: '100%',
    aspectRatio: 16 / 10,
    borderRadius: Spacing.radius.md,
    ...Spacing.curve,
    backgroundColor: slate[100],
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
});
