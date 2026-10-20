/**
 * KartuPromo — satu baris ajakan: ikon + label di kiri, sisi kanan berlatar
 * gradasi palet dengan kepala maskot menyembul dari bawah. Seluruh kartu
 * bisa ditekan.
 */
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from './Icon';
import Colors from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { fonts } from '../../../constants/Typography';

const KEPALA = {
  putri: require('../../../assets/images/maskot/kepala-putri.png'),
  putra: require('../../../assets/images/maskot/kepala-putra.png'),
};

interface KartuPromoProps {
  ikon: string;
  label: string;
  onPress: () => void;
  tokoh?: keyof typeof KEPALA;
}

export default function KartuPromo({ ikon, label, onPress, tokoh = 'putri' }: KartuPromoProps) {
  return (
    <TouchableOpacity style={styles.kartu} activeOpacity={0.8} onPress={onPress} accessibilityRole="button">
      <View style={styles.kiri}>
        <Icon name={ikon as any} size={20} color={Colors.ink} />
        <Text style={styles.label} numberOfLines={1}>{label}</Text>
      </View>
      <LinearGradient
        colors={['rgba(128,255,204,0)', '#80FFCC', '#FFF280']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.sisiKanan}
      />
      <Image source={KEPALA[tokoh]} style={styles.kepala} resizeMode="contain" accessibilityIgnoresInvertColors />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  kartu: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: Spacing.radius.xl,
    ...Spacing.curve,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
  },
  kiri: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingLeft: Spacing.lg,
    paddingRight: 84,
  },
  label: {
    flexShrink: 1,
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: Colors.textPrimary,
  },
  sisiKanan: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    width: '50%',
  },
  // Kepala dipotong tepi bawah kartu: tampak menyembul dari bawah.
  kepala: {
    position: 'absolute',
    right: Spacing.lg,
    bottom: -14,
    width: 56,
    height: 56,
  },
});
