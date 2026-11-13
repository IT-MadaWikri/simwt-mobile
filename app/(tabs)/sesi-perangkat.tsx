/**
 * Perangkat & Sesi — daftar perangkat yang sedang masuk dengan akun ini. Perangkat
 * lain bisa dikeluarkan satu per satu atau sekaligus; sesi ini hanya bisa
 * diakhiri lewat tombol Keluar di Setelan.
 */
import React from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import AppBar from '../../src/components/common/AppBar';
import Button from '../../src/components/common/Button';
import Icon from '../../src/components/common/Icon';
import KeadaanKosong from '../../src/components/common/KeadaanKosong';
import Lencana from '../../src/components/common/Lencana';
import { SkeletonBaris } from '../../src/components/common/Skeleton';
import { dialog } from '../../src/components/common/AppDialog';
import Colors, { brand, lencana, slate } from '../../constants/Colors';
import Spacing from '../../constants/Spacing';
import { fonts, ukuranCatatan, ukuranIsi } from '../../constants/Typography';
import { useSesiPerangkat } from '../../src/hooks/useSesiPerangkat';
import { SesiPerangkat } from '../../src/services/sesiService';
import { NAMA_BULAN } from '../../src/utils/kalender';

const dua = (n: number) => String(n).padStart(2, '0');

function formatWaktu(iso: string | null): string {
  if (!iso) return '-';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '-';
  return `${d.getDate()} ${NAMA_BULAN[d.getMonth()]} ${d.getFullYear()}, ${dua(d.getHours())}.${dua(d.getMinutes())}`;
}

export default function SesiPerangkatScreen() {
  const h = useSesiPerangkat();
  const lain = h.sesi.filter((s) => !s.saatIni);

  const keluarkan = async (s: SesiPerangkat) => {
    const setuju = await dialog.confirm({
      title: 'Keluarkan Perangkat',
      message: `${s.perangkat ?? 'Perangkat ini'} akan keluar dari akun Anda dan harus masuk lagi.`,
      confirmText: 'Keluarkan',
      destructive: true,
    });
    if (!setuju) return;
    h.cabut(s.id).catch((e) => dialog.alert('Gagal', e.message, 'danger'));
  };

  const keluarkanSemua = async () => {
    const setuju = await dialog.confirm({
      title: 'Keluar dari Perangkat Lain',
      message: `${lain.length} perangkat lain akan keluar dari akun Anda. Sesi di perangkat ini tetap aktif.`,
      confirmText: 'Keluarkan Semua',
      destructive: true,
    });
    if (!setuju) return;
    h.cabut('semua').catch((e) => dialog.alert('Gagal', e.message, 'danger'));
  };

  return (
    <View style={styles.container}>
      <AppBar judul="Perangkat & Sesi" />

      {h.memuat ? (
        <SkeletonBaris jumlah={3} style={{ padding: Spacing.lg }} />
      ) : (
        <ScrollView
          contentContainerStyle={styles.isi}
          refreshControl={<RefreshControl refreshing={h.menyegarkan} onRefresh={h.segarkan} colors={[brand[600]]} />}
        >
          {h.error ? (
            <KeadaanKosong pose="mikir" judul="Gagal memuat" teks={h.error}>
              <Button label="Coba Lagi" onPress={h.muat} style={{ marginTop: Spacing.lg }} />
            </KeadaanKosong>
          ) : (
            <>
              <Text style={styles.ket}>
                Perangkat yang sedang masuk dengan akun Anda. Keluarkan perangkat yang tidak Anda kenali.
              </Text>

              {h.sesi.map((s) => (
                <View key={s.id} style={styles.kartu}>
                  <Icon name="cellphone" size={22} color={Colors.textSecondary} />
                  <View style={styles.info}>
                    <View style={styles.baris}>
                      <Text style={styles.nama} numberOfLines={1}>{s.perangkat ?? 'Perangkat lama'}</Text>
                      {s.saatIni ? <Lencana label="Perangkat ini" warna={lencana.hijau} /> : null}
                    </View>
                    <Text style={styles.meta}>Masuk {formatWaktu(s.loginPada)}</Text>
                    <Text style={styles.meta}>Terakhir dipakai {formatWaktu(s.terakhirDipakai)}</Text>
                  </View>
                  {!s.saatIni ? (
                    <Button
                      variant="dangerOutline"
                      icon="logout"
                      onPress={() => keluarkan(s)}
                      loading={h.mencabut === s.id}
                      disabled={h.mencabut !== null}
                      accessibilityLabel={`Keluarkan ${s.perangkat ?? 'perangkat'}`}
                    />
                  ) : null}
                </View>
              ))}

              {lain.length > 0 ? (
                <Button
                  variant="dangerOutline"
                  label="Keluar dari semua perangkat lain"
                  onPress={keluarkanSemua}
                  loading={h.mencabut === -1}
                  disabled={h.mencabut !== null}
                  style={{ marginTop: Spacing.md }}
                />
              ) : null}
            </>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: slate[100] },
  isi: { padding: Spacing.lg, gap: Spacing.md, paddingBottom: Spacing.xxxl * 2 },
  ket: { fontFamily: fonts.regular, fontSize: ukuranIsi, color: Colors.textSecondary },
  kartu: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.lg,
    backgroundColor: Colors.white,
    borderRadius: Spacing.radius.xl,
    ...Spacing.curve,
  },
  info: { flex: 1, gap: 2 },
  baris: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  nama: { flexShrink: 1, fontFamily: fonts.bold, fontSize: ukuranIsi, color: Colors.textPrimary },
  meta: { fontFamily: fonts.regular, fontSize: ukuranCatatan, color: Colors.textTertiary },
});
