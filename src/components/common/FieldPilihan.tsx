/**
 * FieldPilihan — field berlabel yang tampak seperti input tapi membuka
 * bottom sheet pilihan (`SheetPilihan`). Presentasional.
 */
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import Icon from './Icon';
import Colors from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { gs } from '../../../constants/GlobalStyles';

interface FieldPilihanProps {
  label: string;
  /** Teks pilihan saat ini; null = belum dipilih. */
  nilai: string | null;
  placeholder?: string;
  wajib?: boolean;
  /** Matikan (mis. induknya belum dipilih). */
  nonaktif?: boolean;
  onPress: () => void;
}

export default function FieldPilihan({
  label,
  nilai,
  placeholder = `Pilih ${label.toLowerCase()}`,
  wajib = false,
  nonaktif = false,
  onPress,
}: FieldPilihanProps) {
  return (
    <View style={{ marginBottom: Spacing.lg, opacity: nonaktif ? 0.5 : 1 }}>
      <Text style={gs.label}>
        {label} {wajib ? <Text style={gs.textDanger}>*</Text> : <Text style={gs.caption}>(opsional)</Text>}
      </Text>
      <TouchableOpacity
        style={[gs.fieldWrap, { paddingVertical: 2 }]}
        activeOpacity={0.7}
        disabled={nonaktif}
        onPress={onPress}
      >
        <Text style={[gs.fieldInner, !nilai && { color: Colors.placeholder }]} numberOfLines={1}>
          {nilai ?? placeholder}
        </Text>
        <Icon name="chevron-down" size={22} color={Colors.textTertiary} />
      </TouchableOpacity>
    </View>
  );
}
