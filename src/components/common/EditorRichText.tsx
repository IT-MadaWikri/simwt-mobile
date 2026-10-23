/**
 * EditorRichText — kolom isian teks kaya (tebal, miring, garis bawah, daftar bullet & bernomor) berlabel,
 * bentuk bingkainya sama dengan `FieldTeks`. Editornya tak terkontrol (native, react-native-enriched-html):
 * isinya diambil saat dibutuhkan lewat `editorRef.current?.getHTML()`, bukan disimpan di state.
 * HTML-nya sejenis keluaran TinyMCE di web. Modul native: butuh dev build (tidak ada di Expo Go).
 */
import React, { RefObject, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { EnrichedTextInput, EnrichedTextInputInstance, OnChangeStateEvent } from 'react-native-enriched-html';
import Icon from './Icon';
import Colors, { brand, slate } from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { fonts, ukuranIsi } from '../../../constants/Typography';

interface EditorRichTextProps {
  label: string;
  editorRef: RefObject<EnrichedTextInputInstance | null>;
  wajib?: boolean;
  placeholder?: string;
  /** Isi awal (HTML). */
  nilaiAwal?: string;
}

type Gaya = 'bold' | 'italic' | 'underline' | 'unorderedList' | 'orderedList';

const TOMBOL: { gaya: Gaya; ikon: string; label: string; aksi: (e: EnrichedTextInputInstance) => void }[] = [
  { gaya: 'bold', ikon: 'format-bold', label: 'Tebal', aksi: (e) => e.toggleBold() },
  { gaya: 'italic', ikon: 'format-italic', label: 'Miring', aksi: (e) => e.toggleItalic() },
  { gaya: 'underline', ikon: 'format-underline', label: 'Garis bawah', aksi: (e) => e.toggleUnderline() },
  { gaya: 'unorderedList', ikon: 'format-list-bulleted', label: 'Daftar bullet', aksi: (e) => e.toggleUnorderedList() },
  { gaya: 'orderedList', ikon: 'format-list-numbered', label: 'Daftar bernomor', aksi: (e) => e.toggleOrderedList() },
];

export default function EditorRichText({ label, editorRef, wajib = false, placeholder, nilaiAwal }: EditorRichTextProps) {
  const [aktif, setAktif] = useState<Partial<Record<Gaya, boolean>>>({});

  const saatStatus = (e: { nativeEvent: OnChangeStateEvent }) => {
    const s = e.nativeEvent;
    setAktif({
      bold: s.bold.isActive,
      italic: s.italic.isActive,
      underline: s.underline.isActive,
      unorderedList: s.unorderedList.isActive,
      orderedList: s.orderedList.isActive,
    });
  };

  return (
    <View style={styles.field}>
      <Text style={styles.label}>
        {label}
        {wajib ? <Text style={styles.wajib}> *</Text> : <Text style={styles.opsional}> (opsional)</Text>}
      </Text>

      <View style={styles.bingkai}>
        <View style={styles.bar}>
          {TOMBOL.map((t) => (
            <TouchableOpacity
              key={t.gaya}
              style={[styles.tombol, aktif[t.gaya] && styles.tombolAktif]}
              activeOpacity={0.7}
              hitSlop={4}
              onPress={() => editorRef.current && t.aksi(editorRef.current)}
              accessibilityLabel={t.label}
            >
              <Icon name={t.ikon} size={16} color={aktif[t.gaya] ? brand[700] : Colors.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>
        <EnrichedTextInput
          ref={editorRef}
          style={styles.editor}
          defaultValue={nilaiAwal}
          placeholder={placeholder}
          placeholderTextColor={Colors.placeholder}
          selectionColor={Colors.primary}
          cursorColor={Colors.primary}
          onChangeState={saatStatus}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  field: { marginBottom: Spacing.md },
  label: { fontSize: ukuranIsi, fontFamily: fonts.medium, color: Colors.textPrimary, marginBottom: 6 },
  wajib: { color: Colors.danger },
  opsional: { fontFamily: fonts.regular, color: Colors.textTertiary },
  bingkai: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Spacing.radius.md,
    ...Spacing.curve,
    backgroundColor: slate[50],
    overflow: 'hidden',
  },
  bar: {
    flexDirection: 'row',
    gap: 2,
    padding: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.white,
  },
  tombol: { width: 34, height: 30, borderRadius: Spacing.radius.sm, alignItems: 'center', justifyContent: 'center' },
  tombolAktif: { backgroundColor: brand[50] },
  editor: {
    minHeight: 110,
    maxHeight: 220,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    fontSize: 12,
    fontFamily: fonts.regular,
    color: Colors.textPrimary,
  },
});
