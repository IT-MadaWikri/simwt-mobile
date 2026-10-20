/**
 * BarisSetelan — satu baris menu setelan: ikon, label, lalu di kanan salah
 * satu dari tombol panah bulat, nilai singkat, atau sakelar.
 */
import { Platform, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import Icon from '../common/Icon';
import Colors, { brand, slate } from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { fonts } from '../../../constants/Typography';

interface BarisSetelanProps {
  ikon: string;
  label: string;
  /** Teks singkat di kiri panah (mis. "Indonesia"). */
  nilai?: string;
  onPress?: () => void;
  /** Bila ada, sisi kanan berupa sakelar, bukan panah. */
  sakelar?: { aktif: boolean; onUbah: (aktif: boolean) => void };
  /** Baris terakhir dalam kelompok: tanpa garis pemisah. */
  terakhir?: boolean;
}

export default function BarisSetelan({ ikon, label, nilai, onPress, sakelar, terakhir }: BarisSetelanProps) {
  return (
    <TouchableOpacity
      style={[styles.baris, !terakhir && styles.garis]}
      activeOpacity={sakelar ? 1 : 0.7}
      disabled={!onPress}
      onPress={onPress}
    >
      <Icon name={ikon as any} size={20} color={Colors.ink} />
      <Text style={styles.label} numberOfLines={2}>{label}</Text>
      {sakelar ? (
        <Switch
          value={sakelar.aktif}
          onValueChange={sakelar.onUbah}
          trackColor={{ false: Colors.border, true: brand[600] }}
          thumbColor={Platform.OS === 'android' ? (sakelar.aktif ? Colors.white : slate[50]) : ''}
        />
      ) : (
        <>
          {nilai ? <Text style={styles.nilai}>{nilai}</Text> : null}
          <View style={styles.panah}>
            <Icon name="arrow-right" size={14} color={Colors.ink} />
          </View>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  baris: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  garis: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderSubtle,
  },
  label: {
    flex: 1,
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: Colors.textPrimary,
  },
  nilai: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: Colors.textTertiary,
  },
  panah: {
    width: 28,
    height: 28,
    borderRadius: Spacing.radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
