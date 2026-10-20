/**
 * BarAtasBeranda — baris logo di kiri, lonceng notifikasi + avatar di kanan.
 * Dipakai dua kali di beranda: di dalam header, dan di bar putih yang turun
 * saat header sudah tergulir lewat.
 */
import { useRouter } from 'expo-router';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import Colors from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { useAuth } from '../../contexts/AuthContext';
import Avatar from '../common/Avatar';
import Icon from '../common/Icon';
import LencanaAngka from '../common/LencanaAngka';

interface BarAtasBerandaProps {
  belumDibaca: number;
}

export default function BarAtasBeranda({ belumDibaca }: BarAtasBerandaProps) {
  const { user } = useAuth();
  const router = useRouter();
  const nama = user?.nama_lengkap || user?.name || user?.username || 'Pengguna';

  return (
    <View style={styles.baris}>
      <Image
        source={require('../../../assets/images/logo-simwt-mobile.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      <View style={styles.aksi}>
        <TouchableOpacity
          style={styles.bell}
          activeOpacity={0.8}
          onPress={() => router.push('/(tabs)/notification')}
          accessibilityLabel="Notifikasi"
        >
          <Icon name="bell-outline" size={24} color={Colors.ink} />
          {belumDibaca > 0 && (
            <LencanaAngka jumlah={belumDibaca} ukuran={18} tepi={Colors.white} style={styles.badge} />
          )}
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={0.8} onPress={() => router.push('/(tabs)/profile')} accessibilityLabel="Setelan">
          <Avatar nama={nama} foto={user?.avatar} ukuran={36} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  baris: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  // Ukuran eksplisit (rasio gambar 1382:143); aspectRatio saja membuatnya melar di dalam row.
  logo: {
    width: 106,
    height: 11,
  },
  aksi: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  bell: {
    width: 36,
    height: 36,
    borderRadius: Spacing.radius.full,
    ...Spacing.curve,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
});
