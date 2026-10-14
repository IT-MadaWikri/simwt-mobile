/**
 * SearchBar — search bar pil ala Gojek, warna & font mengikuti karir-mwt.
 */
import React from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Colors from '../../../constants/Colors';
import { gs } from '../../../constants/GlobalStyles';

interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  onPress?: () => void;
  editable?: boolean;
}

export default function SearchBar({
  placeholder = 'Cari layanan...',
  value,
  onChangeText,
  onPress,
  editable = true,
}: SearchBarProps) {
  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container style={gs.searchBar} onPress={onPress} activeOpacity={0.7}>
      <MaterialCommunityIcons name="magnify" size={22} color={Colors.primary} />
      <TextInput
        style={gs.fieldInner}
        placeholder={placeholder}
        placeholderTextColor={Colors.placeholder}
        value={value}
        onChangeText={onChangeText}
        editable={editable && !onPress}
        pointerEvents={onPress ? 'none' : 'auto'}
      />
    </Container>
  );
}
