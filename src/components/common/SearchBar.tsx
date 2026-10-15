/**
 * SearchBar — search bar pil ala Gojek, warna & font mengikuti karir-mwt.
 */
import React from 'react';
import { View, TextInput, TouchableOpacity, type TextStyle, type ViewStyle } from 'react-native';
import Icon from './Icon';
import Colors from '../../../constants/Colors';
import { gs } from '../../../constants/GlobalStyles';

interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  onPress?: () => void;
  editable?: boolean;
  style?: ViewStyle;
  inputStyle?: TextStyle;
}

export default function SearchBar({
  placeholder = 'Cari layanan...',
  value,
  onChangeText,
  onPress,
  editable = true,
  style,
  inputStyle,
}: SearchBarProps) {
  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container style={[gs.searchBar, style]} onPress={onPress} activeOpacity={0.7}>
      <Icon name="magnify" size={22} color={Colors.primary} />
      <TextInput
        style={[gs.fieldInner, inputStyle]}
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
