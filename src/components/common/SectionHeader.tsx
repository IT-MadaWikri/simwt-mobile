/**
 * SectionHeader — judul blok konten dengan aksi "Lihat Semua" opsional.
 */
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Spacing from '../../../constants/Spacing';
import { gs } from '../../../constants/GlobalStyles';

interface SectionHeaderProps {
  title: string;
  /** Label kecil huruf kapital di atas judul — padanan `.section-eyebrow`. */
  eyebrow?: string;
  actionText?: string;
  onAction?: () => void;
}

export default function SectionHeader({
  title,
  eyebrow,
  actionText = 'Lihat Semua',
  onAction,
}: SectionHeaderProps) {
  return (
    <View
      style={[
        gs.rowBetween,
        gs.containerX,
        { marginBottom: Spacing.md, alignItems: 'flex-end' },
      ]}
    >
      <View style={gs.flex1}>
        {eyebrow ? <Text style={gs.sectionEyebrow}>{eyebrow}</Text> : null}
        <Text style={[gs.sectionTitle, { marginBottom: 0 }]}>{title}</Text>
      </View>

      {onAction ? (
        <TouchableOpacity onPress={onAction} activeOpacity={0.7}>
          <Text style={[gs.bodySm, gs.textSemibold, gs.textBrand]}>{actionText}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
