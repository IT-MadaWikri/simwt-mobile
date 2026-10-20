/**
 * HomeHeader — bagian atas beranda: logo, notifikasi + avatar, sapaan besar,
 * lalu search bar.
 */
import LencanaAngka from '../common/LencanaAngka';
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors, { gradasiLembut } from "../../../constants/Colors";
import Spacing from "../../../constants/Spacing";
import Typography, { fonts } from "../../../constants/Typography";
import { useAuth } from "../../contexts/AuthContext";
import { notifikasiService } from "../../services/notifikasiService";
import { useCuaca } from "../../hooks/useCuaca";
import Avatar from "../common/Avatar";
import Icon from "../common/Icon";
import SearchBar from "../common/SearchBar";

interface HomeHeaderProps {
  searchQuery: string;
  onChangeSearch: (text: string) => void;
}

export default function HomeHeader({
  searchQuery,
  onChangeSearch,
}: HomeHeaderProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [belumDibaca, setBelumDibaca] = useState(0);

  // Dihitung ulang tiap kembali ke beranda (mis. setelah membaca notifikasi).
  useFocusEffect(
    useCallback(() => {
      notifikasiService
        .jumlahBelumDibaca()
        .then(setBelumDibaca)
        .catch(() => {});
    }, []),
  );
  const { cuaca, loading: loadingCuaca } = useCuaca();
  const insets = useSafeAreaInsets();
  const nama = user?.nama_lengkap || user?.name || user?.username || "Pengguna";

  return (
    <LinearGradient
      colors={[...gradasiLembut]}
      start={{ x: 0, y: 0.5 }}
      end={{ x: 1, y: 0.5 }}
      style={[styles.container, { paddingTop: insets.top + Spacing.md }]}
    >
      {/* Tepi bawah memudar ke putih (tanpa garis potong tegas); di belakang isi agar teks & search bar tidak ikut pudar. */}
      <LinearGradient
        colors={['rgba(255,255,255,0)', Colors.white]}
        pointerEvents="none"
        style={styles.pudar}
      />

      <View style={styles.barisAtas}>
        <Image
          source={require("../../../assets/images/logo-simwt-mobile.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        <View style={styles.aksi}>
          <TouchableOpacity
            style={styles.bell}
            activeOpacity={0.8}
            onPress={() => router.push("/(tabs)/notification")}
          >
            <Icon name="bell-outline" size={24} color={Colors.ink} />
            {belumDibaca > 0 && (
              <LencanaAngka jumlah={belumDibaca} ukuran={18} tepi={Colors.white} style={styles.badge} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push("/(tabs)/profile")}
          >
            <Avatar nama={nama} foto={user?.avatar} ukuran={36} />
          </TouchableOpacity>
        </View>
      </View>

      <View>
        <Text style={styles.title} numberOfLines={1}>
          {getGreeting()}, {nama.split(" ")[0]}
        </Text>
        <View style={styles.cuaca}>
          {cuaca && <Icon name={cuaca.ikon} size={16} color={Colors.primary} />}
          <Text style={styles.subtitle} numberOfLines={1}>
            {cuaca
              ? `${cuaca.suhu}°C · ${cuaca.label} · ${cuaca.lokasi}`
              : loadingCuaca
                ? 'Memuat cuaca...'
                : 'Temukan layanan yang kamu butuhkan'}
          </Text>
        </View>
      </View>

      <SearchBar
        placeholder="Cari layanan..."
        value={searchQuery}
        onChangeText={onChangeSearch}
        style={styles.searchBar}
        inputStyle={styles.text}
      />
    </LinearGradient>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Selamat pagi";
  if (hour < 15) return "Selamat siang";
  if (hour < 18) return "Selamat sore";
  return "Selamat malam";
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.screenPadding,
    paddingBottom: Spacing.lg,
    gap: Spacing.lg,
  },
  pudar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 120,
  },
  barisAtas: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  // Ukuran eksplisit (rasio gambar 1382:143); aspectRatio saja membuatnya melar di dalam row.
  logo: {
    width: 106,
    height: 11,
  },
  aksi: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  bell: {
    width: 36,
    height: 36,
    borderRadius: Spacing.radius.full,
    ...Spacing.curve,
    backgroundColor: Colors.white,
    justifyContent: "center",
    alignItems: "center",
  },
  searchBar: {
    height: 48,
    paddingVertical: 0,
  },
  text: {
    fontSize: Typography.sizes.sm,
    paddingVertical: 0,
  },
  // Sapaan besar: pengecualian dari aturan 12px, khusus puncak beranda.
  title: {
    fontFamily: fonts.bold,
    fontSize: 24,
    color: Colors.textPrimary,
  },
  cuaca: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
  },
  badge: {
    position: "absolute",
    top: 0,
    right: 0,
  },
});
