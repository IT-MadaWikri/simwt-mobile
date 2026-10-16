/**
 * Mengunci teks agar tidak mengikuti pengaturan "ukuran font" sistem, supaya 12px
 * di kode benar-benar tampil 12px di semua HP.
 *
 * React 19 menghapus `defaultProps` untuk komponen fungsi, jadi `Text.defaultProps`
 * tidak bisa dipakai. Sebagai gantinya `Text` & `TextInput` di modul `react-native`
 * diganti pembungkus yang menambahkan `allowFontScaling={false}`. Impor `Text`
 * di berkas lain dibaca saat render (`_reactNative.Text`), jadi pembungkus ini
 * berlaku untuk seluruh aplikasi — impor berkas ini PALING AWAL di `app/_layout.tsx`.
 *
 * Konsekuensi: pengguna yang memperbesar font sistem tidak melihat teks aplikasi
 * membesar. Hapus impor di `app/_layout.tsx` untuk mengembalikannya.
 */
import React from 'react';

// `require`, bukan `import * as`: namespace hasil interop adalah salinan, sedangkan
// yang perlu diubah adalah objek ekspor aslinya.
const RN = require('react-native');

function kunci(nama: 'Text' | 'TextInput') {
  const Asli = RN[nama];
  const Pembungkus = React.forwardRef<any, any>((props, ref) =>
    React.createElement(Asli, { allowFontScaling: false, ...props, ref })
  );
  Pembungkus.displayName = nama;
  Object.defineProperty(RN, nama, { configurable: true, enumerable: true, get: () => Pembungkus });
}

kunci('Text');
kunci('TextInput');
