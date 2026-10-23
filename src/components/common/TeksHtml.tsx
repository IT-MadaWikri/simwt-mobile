/**
 * TeksHtml — menampilkan HTML (mis. isian editor teks kaya / TinyMCE di web) dengan gaya aplikasi:
 * Poppins 12px, tebal lewat varian bold, daftar dan judul rapat. Presentasional.
 */
import React from 'react';
import RenderHTML from 'react-native-render-html';
import Colors from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { fonts } from '../../../constants/Typography';

const baseStyle = { fontFamily: fonts.semibold, fontSize: 12, lineHeight: 18, color: Colors.textPrimary };
const tagsStyles = {
  p: { marginTop: 0, marginBottom: Spacing.xs },
  h1: { fontFamily: fonts.bold, fontWeight: 'normal' as const, fontSize: 14, marginTop: 0, marginBottom: Spacing.xs },
  h2: { fontFamily: fonts.bold, fontWeight: 'normal' as const, fontSize: 14, marginTop: 0, marginBottom: Spacing.xs },
  h3: { fontFamily: fonts.bold, fontWeight: 'normal' as const, fontSize: 13, marginTop: 0, marginBottom: Spacing.xs },
  strong: { fontFamily: fonts.bold, fontWeight: 'normal' as const },
  b: { fontFamily: fonts.bold, fontWeight: 'normal' as const },
  ul: { marginTop: 0, marginBottom: Spacing.xs },
  ol: { marginTop: 0, marginBottom: Spacing.xs },
  a: { color: Colors.primary, textDecorationLine: 'underline' as const },
};

interface TeksHtmlProps {
  html: string;
  /** Lebar area teks dalam dp, supaya gambar/tabel di dalam HTML tidak melebihi layar. */
  lebar: number;
}

export default function TeksHtml({ html, lebar }: TeksHtmlProps) {
  return (
    <RenderHTML
      contentWidth={lebar}
      source={{ html }}
      baseStyle={baseStyle}
      tagsStyles={tagsStyles}
      // Font Poppins harus didaftarkan, kalau tidak teks HTML jatuh ke font sistem.
      systemFonts={[fonts.regular, fonts.semibold, fonts.bold]}
    />
  );
}
