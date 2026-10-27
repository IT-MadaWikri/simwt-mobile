/**
 * Peramban dalam aplikasi — membuka tautan (mis. dari notifikasi) di WebView
 * dengan AppBar SIMMWT, bukan Custom Tabs bawaan sistem yang headernya tidak bisa diubah.
 */
import React, { useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Share } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { WebView } from 'react-native-webview';
import BottomSheet from '../src/components/common/BottomSheet';
import { dialog } from '../src/components/common/AppDialog';
import AppBar from '../src/components/common/AppBar';
import TombolKembali from '../src/components/common/TombolKembali';
import Icon from '../src/components/common/Icon';
import Colors, { slate } from '../constants/Colors';
import Spacing from '../constants/Spacing';
import { fonts } from '../constants/Typography';

const Aksi = ({ ikon, label, aktif = true, onPress }: { ikon: string; label: string; aktif?: boolean; onPress: () => void }) => (
  <TouchableOpacity style={styles.aksiMenu} disabled={!aktif} activeOpacity={0.6} onPress={onPress}>
    <View style={styles.lingkar}>
      <Icon name={ikon} size={20} color={aktif ? Colors.textPrimary : Colors.textTertiary} />
    </View>
    <Text style={[styles.labelAksi, !aktif && { color: Colors.textTertiary }]}>{label}</Text>
  </TouchableOpacity>
);

export default function BrowserScreen() {
  const { url } = useLocalSearchParams<{ url: string }>();
  const router = useRouter();
  const webView = useRef<WebView>(null);
  const [judul, setJudul] = useState('');
  const [progres, setProgres] = useState(0);
  const [urlSaatIni, setUrlSaatIni] = useState(url);
  const [menu, setMenu] = useState(false);
  const [bisaMundur, setBisaMundur] = useState(false);
  const [bisaMaju, setBisaMaju] = useState(false);
  const [tersalin, setTersalin] = useState(false);

  // Dimemo supaya setState lain (menu, progres, salin) tidak merender ulang WebView — render
  // ulangnya berat di Android dan bikin animasi sheet patah-patah saat halaman masih memuat.
  const web = useMemo(
    () => (
      <WebView
        ref={webView}
        source={{ uri: url }}
        onLoadProgress={({ nativeEvent }) => setProgres(Math.round(nativeEvent.progress * 10) / 10)}
        onNavigationStateChange={(s) => {
          setJudul(s.title || '');
          setUrlSaatIni(s.url);
          setBisaMundur(s.canGoBack);
          setBisaMaju(s.canGoForward);
        }}
        // Hanya http(s); skema lain (intent://, file://, …) tidak ikut terbuka.
        onShouldStartLoadWithRequest={(r) => /^https?:\/\//i.test(r.url)}
      />
    ),
    [url]
  );

  const salin = async () => {
    await Clipboard.setStringAsync(urlSaatIni);
    setTersalin(true);
    setTimeout(() => setTersalin(false), 1500);
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.white }}>
      <AppBar
        judul={judul || 'Memuat…'}
        kanan={
          <View style={styles.aksi}>
            <TouchableOpacity onPress={() => webView.current?.reload()} hitSlop={10} accessibilityLabel="Muat ulang">
              <Icon name="refresh" size={20} color={Colors.white} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.replace('/(tabs)')} hitSlop={10} accessibilityLabel="Beranda">
              <Icon name="home" size={20} color={Colors.white} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setMenu(true)} hitSlop={10} accessibilityLabel="Menu">
              <Icon name="dots-vertical" size={20} color={Colors.white} />
            </TouchableOpacity>
          </View>
        }
      />
      {/* Menimpa tombol kembali bawaan AppBar dengan tombol tutup. */}
      <Stack.Screen options={{ headerLeft: () => <TombolKembali ikon="close" /> }} />
      {progres < 1 && <View style={[styles.progres, { width: `${progres * 100}%` }]} />}
      {web}
      <BottomSheet visible={menu} onClose={() => setMenu(false)} title="Menu">
        <View style={styles.barisAksi}>
          <Aksi ikon="refresh" label="Muat Ulang" onPress={() => { setMenu(false); webView.current?.reload(); }} />
          <Aksi ikon="chevron-left" label="Kembali" aktif={bisaMundur} onPress={() => webView.current?.goBack()} />
          <Aksi ikon="chevron-right" label="Teruskan" aktif={bisaMaju} onPress={() => webView.current?.goForward()} />
          <Aksi ikon={tersalin ? 'check' : 'link'} label={tersalin ? 'Tersalin' : 'Salin tautan'} onPress={salin} />
        </View>
        <TouchableOpacity
          style={styles.baris}
          activeOpacity={0.6}
          onPress={() => {
            setMenu(false);
            Share.share({ message: urlSaatIni }).catch(() => dialog.alert('Gagal Membagikan', 'Tautan tidak bisa dibagikan.'));
          }}
        >
          <Icon name="share-variant" size={18} color={Colors.textPrimary} />
          <Text style={styles.label}>Bagikan</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.baris}
          activeOpacity={0.6}
          onPress={() => {
            setMenu(false);
            Linking.openURL(urlSaatIni).catch(() => dialog.alert('Gagal Membuka', 'Tautan tidak bisa dibuka di browser.'));
          }}
        >
          <Icon name="open-in-new" size={18} color={Colors.textPrimary} />
          <Text style={styles.label}>Buka di browser eksternal</Text>
        </TouchableOpacity>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  progres: { height: 2, backgroundColor: Colors.primary },
  baris: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md },
  label: { fontFamily: fonts.regular, fontSize: 12, color: Colors.textPrimary },
  barisAksi: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: Spacing.md },
  aksiMenu: { alignItems: 'center', gap: Spacing.xs, width: 72 },
  lingkar: { width: 44, height: 44, borderRadius: 22, backgroundColor: slate[100], alignItems: 'center', justifyContent: 'center' },
  labelAksi: { fontFamily: fonts.regular, fontSize: 12, color: Colors.textPrimary, textAlign: 'center' },
  aksi: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg, paddingHorizontal: Spacing.lg },
});
