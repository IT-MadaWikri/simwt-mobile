/**
 * HomeHeader — bagian atas beranda: logo, notifikasi + avatar, sapaan besar,
 * lalu search bar.
 */
import { LinearGradient } from "expo-linear-gradient";
import { Animated, ImageBackground, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "../../../constants/Colors";
import Spacing from "../../../constants/Spacing";
import Typography, { fonts } from "../../../constants/Typography";
import { useAuth } from "../../contexts/AuthContext";
import { useCuaca } from "../../hooks/useCuaca";
import Icon from "../common/Icon";
import SearchBar from "../common/SearchBar";
import BarAtasBeranda from "./BarAtasBeranda";

interface HomeHeaderProps {
  searchQuery: string;
  onChangeSearch: (text: string) => void;
  /** Posisi gulir layar beranda; menggerakkan efek paralaks. */
  scrollY: Animated.Value;
  belumDibaca: number;
}

export default function HomeHeader({
  searchQuery,
  onChangeSearch,
  scrollY,
  belumDibaca,
}: HomeHeaderProps) {
  const { user } = useAuth();
  const { cuaca, loading: loadingCuaca } = useCuaca();
  const insets = useSafeAreaInsets();
  const nama = user?.nama_lengkap || user?.name || user?.username || "Pengguna";

  // Paralaks: seluruh header turun setengah dari jarak gulir, jadi bergerak
  // setengah kecepatan konten. Konten di bawahnya (opak) menutupinya. Saat
  // ditarik ke bawah di iOS (gulir negatif) tidak ikut bergeser.
  const geser = scrollY.interpolate({ inputRange: [0, 1], outputRange: [0, 0.5], extrapolateLeft: 'clamp' });

  return (
    <Animated.View style={{ transform: [{ translateY: geser }] }}>
    <ImageBackground
      source={require('../../../assets/images/latar-beranda.png')}
      resizeMode="cover"
      style={[styles.container, { paddingTop: insets.top + Spacing.md }]}
    >
      {/* Tepi bawah memudar ke putih (tanpa garis potong tegas); di belakang isi agar teks & search bar tidak ikut pudar. */}
      <LinearGradient
        colors={['rgba(255,255,255,0)', Colors.white]}
        pointerEvents="none"
        style={styles.pudar}
      />

      <BarAtasBeranda belumDibaca={belumDibaca} tanpaLogo />

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
    </ImageBackground>
    </Animated.View>
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
    fontSize: 18,
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
});
