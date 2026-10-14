/**
 * Stok Opname — daftar periode & lembar.
 *
 * Membaca endpoint `/api/sto/*` di api-simwt (metode STO yang berjalan
 * sekarang). Layar ini sengaja BACA SAJA: memasukkan hitungan dari HP baru
 * mungkin setelah alur scan dibangun di server.
 */
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors, { brand } from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { fonts } from '../../../constants/Typography';
import { gs } from '../../../constants/GlobalStyles';
import LoadingSpinner from '../../../src/components/common/LoadingSpinner';
import { stoService, StoLembar, StoPeriode } from '../../../src/services/stoService';
import { useSetelahTransisi } from '../../../src/utils/useSetelahTransisi';
import TombolKembali from '../../../src/components/common/TombolKembali';

/** Rupa lencana per status periode. */
const STATUS: Record<string, { label: string; badge: any; text: any }> = {
  in_progress: { label: 'Berjalan', badge: gs.badgeBrand, text: gs.badgeTextBrand },
  draft: { label: 'Draft', badge: gs.badgeMuted, text: gs.badgeTextMuted },
  completed: { label: 'Selesai', badge: gs.badgeMuted, text: gs.badgeTextMuted },
};

export default function StoScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [periode, setPeriode] = useState<StoPeriode[]>([]);
  const [dipilih, setDipilih] = useState<number | null>(null);
  const [lembar, setLembar] = useState<StoLembar[]>([]);
  const [memuat, setMemuat] = useState(true);
  const [menyegarkan, setMenyegarkan] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);

  const muat = useCallback(async () => {
    try {
      setGalat(null);
      const data = await stoService.periode();
      setPeriode(data);

      // Buka otomatis periode yang sedang berjalan — itu yang paling mungkin
      // dicari PIC saat membuka layar ini.
      const berjalan = data.find((item) => item.status === 'in_progress') ?? data[0];
      if (berjalan) {
        setDipilih(berjalan.id);
        const isi = await stoService.lembar(berjalan.id);
        setLembar(isi.lembar);
      } else {
        setDipilih(null);
        setLembar([]);
      }
    } catch (err: any) {
      setGalat(
        err?.response?.data?.message ||
          err?.message ||
          'Gagal memuat data Stok Opname.'
      );
    } finally {
      setMemuat(false);
      setMenyegarkan(false);
    }
  }, []);

  // Ditunda sampai animasi masuk selesai — lihat useSetelahTransisi.ts.
  useSetelahTransisi(() => {
    muat();
  }, [muat]);

  const pilihPeriode = async (item: StoPeriode) => {
    if (item.id === dipilih) return;
    setDipilih(item.id);
    setLembar([]);
    try {
      const isi = await stoService.lembar(item.id);
      setLembar(isi.lembar);
    } catch {
      setLembar([]);
    }
  };

  const layar = (
    <Stack.Screen
      options={{
        headerShown: true,
        headerTitle: 'Stok Opname',
        headerLeft: () => <TombolKembali />,
        headerStyle: { backgroundColor: Colors.primary },
        headerTintColor: Colors.white,
        headerTitleStyle: { fontFamily: fonts.semibold },
        headerShadowVisible: false,
      }}
    />
  );

  if (memuat) {
    return (
      <>
        {layar}
        <View style={gs.screen}>
          <LoadingSpinner message="Memuat data Stok Opname..." />
        </View>
      </>
    );
  }

  return (
    <>
      {layar}
      <ScrollView
        style={gs.screen}
        contentContainerStyle={[gs.scrollContent, { paddingBottom: insets.bottom + Spacing.xxl }]}
        refreshControl={
          <RefreshControl
            refreshing={menyegarkan}
            onRefresh={() => {
              setMenyegarkan(true);
              muat();
            }}
            colors={[Colors.primary]}
          />
        }
      >
        {galat ? (
          <View style={[gs.card, gs.center]}>
            <MaterialCommunityIcons
              name="alert-circle-outline"
              size={44}
              color={Colors.textTertiary}
            />
            <Text style={gs.emptyTitle}>Gagal memuat</Text>
            <Text style={gs.emptyText}>{galat}</Text>
            <TouchableOpacity
              style={[gs.btn, gs.btnPrimary, gs.btnSm, { marginTop: Spacing.lg }]}
              onPress={muat}
            >
              <Text style={[gs.btnText, gs.btnTextOnBrand, gs.btnTextSm]}>Coba Lagi</Text>
            </TouchableOpacity>
          </View>
        ) : periode.length === 0 ? (
          <View style={[gs.card, gs.center]}>
            <MaterialCommunityIcons
              name="clipboard-text-off-outline"
              size={44}
              color={Colors.textTertiary}
            />
            <Text style={gs.emptyTitle}>Belum ada periode</Text>
            <Text style={gs.emptyText}>
              Belum ada dokumen Stok Opname untuk plant Anda.
            </Text>
          </View>
        ) : (
          <>
            <Text style={gs.sectionEyebrow}>Periode</Text>
            <Text style={gs.sectionTitle}>Dokumen Stok Opname</Text>

            {periode.map((item) => {
              const aktif = item.id === dipilih;
              const status = STATUS[item.status] ?? STATUS.draft;

              return (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.85}
                  onPress={() => pilihPeriode(item)}
                  style={[
                    gs.card,
                    { marginBottom: Spacing.md },
                    aktif && { borderColor: brand[300], backgroundColor: brand[50] },
                  ]}
                >
                  <View style={gs.rowBetween}>
                    <Text style={[gs.title, gs.flex1]} numberOfLines={1}>
                      {item.judul}
                    </Text>
                    <View style={[gs.badge, status.badge]}>
                      <Text style={[gs.badgeText, status.text]}>{status.label}</Text>
                    </View>
                  </View>

                  <Text style={[gs.bodySm, { marginTop: Spacing.xs }]}>
                    {item.plant?.nama ?? 'Plant tidak diketahui'}
                    {item.departemen ? ` · ${item.departemen}` : ''}
                  </Text>

                  <View style={[gs.rowWrap, gs.gapMd, { marginTop: Spacing.md }]}>
                    <Ringkas label="Lembar" nilai={String(item.jumlah_lembar)} />
                    <Ringkas label="Item" nilai={item.total_item?.toLocaleString('id-ID') ?? '-'} />
                    <Ringkas
                      label="Akurasi"
                      nilai={item.akurasi !== null ? `${item.akurasi}%` : '-'}
                    />
                  </View>
                </TouchableOpacity>
              );
            })}

            {dipilih !== null && (
              <>
                <Text style={[gs.sectionTitle, { marginTop: Spacing.lg }]}>
                  Lembar & Progres
                </Text>

                {lembar.length === 0 ? (
                  <Text style={gs.emptyText}>Periode ini belum punya lembar.</Text>
                ) : (
                  lembar.map((item) => {
                    const persen =
                      item.jumlah_baris > 0
                        ? Math.round((item.sudah_dihitung / item.jumlah_baris) * 100)
                        : 0;

                    return (
                      <TouchableOpacity
                        key={item.id}
                        style={[gs.card, { marginBottom: Spacing.md }]}
                        activeOpacity={0.75}
                        onPress={() => router.push(`/services/sto/${item.id}` as any)}
                      >
                        <View style={gs.rowBetween}>
                          <View style={[gs.row, gs.gapMd, gs.flex1]}>
                            <View style={gs.iconTile}>
                              <MaterialCommunityIcons
                                name="file-table-outline"
                                size={20}
                                color={brand[600]}
                              />
                            </View>
                            <View style={gs.flex1}>
                              <Text style={gs.title}>{item.kode}</Text>
                              <Text style={gs.caption} numberOfLines={1}>
                                {item.kode_gudang ?? item.nama ?? '—'}
                              </Text>
                            </View>
                          </View>
                          <Text style={[gs.metric, { fontSize: 18 }]}>{persen}%</Text>
                        </View>

                        {/* Bilah progres — sepadan dengan yang ada di web,
                            supaya PIC melihat angka yang sama di dua tempat. */}
                        <View
                          style={{
                            height: 6,
                            borderRadius: Spacing.radius.full,
                            backgroundColor: Colors.borderSubtle,
                            marginTop: Spacing.md,
                            overflow: 'hidden',
                          }}
                        >
                          <View
                            style={{
                              width: `${persen}%`,
                              height: '100%',
                              backgroundColor: brand[500],
                            }}
                          />
                        </View>

                        <View style={[gs.rowBetween, { marginTop: Spacing.sm }]}>
                          <Text style={[gs.bodySm, gs.flex1]}>
                            Dihitung {item.sudah_dihitung.toLocaleString('id-ID')} dari{' '}
                            {item.jumlah_baris.toLocaleString('id-ID')} baris
                            {item.belum_dihitung > 0
                              ? ` · ${item.belum_dihitung.toLocaleString('id-ID')} belum dihitung`
                              : ''}
                          </Text>
                          <MaterialCommunityIcons
                            name="chevron-right"
                            size={20}
                            color={Colors.textTertiary}
                          />
                        </View>
                      </TouchableOpacity>
                    );
                  })
                )}
              </>
            )}
          </>
        )}
      </ScrollView>
    </>
  );
}

function Ringkas({ label, nilai }: { label: string; nilai: string }) {
  return (
    <View>
      <Text style={gs.caption}>{label}</Text>
      <Text style={[gs.bodySm, gs.textSemibold, { color: Colors.textPrimary }]}>{nilai}</Text>
    </View>
  );
}
