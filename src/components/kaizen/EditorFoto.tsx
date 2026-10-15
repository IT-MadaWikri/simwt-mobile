/**
 * Layar atur foto Kaizen (layar penuh): crop dengan geser & cubit di dalam
 * bingkai berasio tetap, pilihan rasio, dan tag Sebelum / Sesudah.
 *
 * Posisi & zoom disimpan relatif terhadap bingkai (bukan piksel layar),
 * jadi foto yang dibuka ulang kembali ke potongan yang sama. Hasil crop
 * dirender lewat expo-image-manipulator: dipotong, diperkecil ke sisi
 * terpanjang 1600 px, dan dikompres JPEG supaya di bawah batas 2 MB server.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import Icon from '../common/Icon';
import Colors from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { fonts, ukuranIsi } from '../../../constants/Typography';

export type TagFoto = 'sebelum' | 'sesudah';

export interface FotoKaizen {
  /** Foto asli dari kamera/galeri. */
  uri: string;
  width: number;
  height: number;
  rasio: string;
  /** Zoom ≥ 1 (1 = foto pas menutupi bingkai); geser relatif lebar/tinggi bingkai. */
  zoom: number;
  nx: number;
  ny: number;
  tag: TagFoto;
  /** Hasil crop & kompres yang dikirim ke server. */
  hasil?: { uri: string; width: number; height: number };
}

export const RASIO: { label: string; value: string }[] = [
  { label: 'Asli', value: 'asli' },
  { label: '1:1', value: '1:1' },
  { label: '4:3', value: '4:3' },
  { label: '3:4', value: '3:4' },
  { label: '16:9', value: '16:9' },
];

const nilaiRasio = (f: FotoKaizen) => {
  if (f.rasio === 'asli') return f.width / f.height;
  const [a, b] = f.rasio.split(':').map(Number);
  return a / b;
};

const ZOOM_MAKS = 4;
const SISI_MAKS = 1600;

/** Geometri: ukuran bingkai di layar, skala tampil foto, dan batas geser. */
function hitung(f: FotoKaizen, kotak: { w: number; h: number }) {
  const r = nilaiRasio(f);
  const margin = Spacing.lg;
  const maxW = Math.max(1, kotak.w - margin * 2);
  const maxH = Math.max(1, kotak.h - margin * 2);
  const fw = maxW / maxH > r ? maxH * r : maxW;
  const fh = fw / r;
  const s = Math.max(fw / f.width, fh / f.height) * f.zoom;
  const dw = f.width * s;
  const dh = f.height * s;
  return { fw, fh, s, dw, dh, batasX: (dw - fw) / 2, batasY: (dh - fh) / 2 };
}

const jepit = (v: number, b: number) => Math.max(-b, Math.min(b, v));

/** Render crop sesuai posisi tersimpan. */
export async function renderFoto(f: FotoKaizen): Promise<NonNullable<FotoKaizen['hasil']>> {
  // Kotak acuan apa pun memberi rasio crop yang sama; pakai ukuran foto sendiri.
  const g = hitung(f, { w: f.width + Spacing.lg * 2, h: f.height + Spacing.lg * 2 });
  const tx = f.nx * g.fw;
  const ty = f.ny * g.fh;
  const kiri = g.fw / 2 + tx - g.dw / 2;
  const atas = g.fh / 2 + ty - g.dh / 2;
  const crop = {
    originX: Math.max(0, Math.round(-kiri / g.s)),
    originY: Math.max(0, Math.round(-atas / g.s)),
    width: Math.round(g.fw / g.s),
    height: Math.round(g.fh / g.s),
  };
  crop.width = Math.min(crop.width, f.width - crop.originX);
  crop.height = Math.min(crop.height, f.height - crop.originY);

  const ctx = ImageManipulator.manipulate(f.uri).crop(crop);
  if (Math.max(crop.width, crop.height) > SISI_MAKS) {
    ctx.resize(crop.width >= crop.height ? { width: SISI_MAKS } : { height: SISI_MAKS });
  }
  const ref = await ctx.renderAsync();
  const out = await ref.saveAsync({ compress: 0.7, format: SaveFormat.JPEG });
  return { uri: out.uri, width: out.width, height: out.height };
}

interface Props {
  visible: boolean;
  fotos: FotoKaizen[];
  awal?: number;
  onBatal: () => void;
  onSelesai: (fotos: FotoKaizen[]) => void;
}

export default function EditorFoto({ visible, fotos, awal = 0, onBatal, onSelesai }: Props) {
  const insets = useSafeAreaInsets();
  const [daftar, setDaftar] = useState<FotoKaizen[]>(fotos);
  const [aktif, setAktif] = useState(awal);
  const [kotak, setKotak] = useState({ w: 0, h: 0 });
  const [menyimpan, setMenyimpan] = useState(false);

  useEffect(() => {
    if (visible) {
      setDaftar(fotos);
      setAktif(Math.min(awal, Math.max(0, fotos.length - 1)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const f = daftar[aktif];
  const g = useMemo(() => (f && kotak.w ? hitung(f, kotak) : null), [f, kotak]);

  const ubah = (sebagian: Partial<FotoKaizen>, i = aktif) =>
    setDaftar((d) => d.map((x, j) => (j === i ? { ...x, ...sebagian, hasil: undefined } : x)));

  // Gestur geser (1 jari) & cubit (2 jari). Nilai terkini dibaca lewat ref
  // karena PanResponder dibuat sekali.
  const kini = useRef({ f, g, aktif });
  kini.current = { f, g, aktif };
  const dasar = useRef({ nx: 0, ny: 0, zoom: 1, jarak: 0, jari: 0, dx: 0, dy: 0 });

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        const { f: x } = kini.current;
        if (x) dasar.current = { nx: x.nx, ny: x.ny, zoom: x.zoom, jarak: 0, jari: 0, dx: 0, dy: 0 };
      },
      onPanResponderMove: (e, gs) => {
        const { f: x, g: geo } = kini.current;
        if (!x || !geo) return;
        const t = e.nativeEvent.touches;
        const b = dasar.current;
        // Jumlah jari berubah: jadikan posisi sekarang titik awal baru.
        if (t.length !== b.jari) {
          b.jari = t.length;
          b.nx = x.nx;
          b.ny = x.ny;
          b.zoom = x.zoom;
          b.dx = gs.dx;
          b.dy = gs.dy;
          b.jarak = t.length >= 2 ? Math.hypot(t[0].pageX - t[1].pageX, t[0].pageY - t[1].pageY) : 0;
          return;
        }
        let zoom = x.zoom;
        if (t.length >= 2 && b.jarak > 0) {
          const jarak = Math.hypot(t[0].pageX - t[1].pageX, t[0].pageY - t[1].pageY);
          zoom = Math.max(1, Math.min(ZOOM_MAKS, (b.zoom * jarak) / b.jarak));
        }
        const geoBaru = hitung({ ...x, zoom }, { w: geo.fw + Spacing.lg * 2, h: geo.fh + Spacing.lg * 2 });
        const tx = jepit(b.nx * geo.fw + (gs.dx - b.dx), geoBaru.batasX);
        const ty = jepit(b.ny * geo.fh + (gs.dy - b.dy), geoBaru.batasY);
        const i = kini.current.aktif;
        // Perbarui ref segera supaya gerakan berikutnya (sebelum render) membaca nilai terbaru.
        const baru = { ...x, zoom, nx: tx / geo.fw, ny: ty / geo.fh, hasil: undefined };
        kini.current.f = baru;
        setDaftar((d) => d.map((y, j) => (j === i ? baru : y)));
      },
    })
  ).current;

  const pilihTag = (tag: TagFoto) =>
    setDaftar((d) =>
      d.map((x, j) =>
        j === aktif ? { ...x, tag } : x.tag === tag ? { ...x, tag: tag === 'sebelum' ? 'sesudah' : 'sebelum' } : x
      )
    );

  const selesai = async () => {
    setMenyimpan(true);
    try {
      const jadi = await Promise.all(daftar.map(async (x) => (x.hasil ? x : { ...x, hasil: await renderFoto(x) })));
      onSelesai(jadi);
    } finally {
      setMenyimpan(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onBatal} statusBarTranslucent>
      <View style={[styles.layar, { paddingTop: insets.top }]}>
        <View style={styles.atas}>
          <TouchableOpacity onPress={onBatal} hitSlop={12} disabled={menyimpan}>
            <Icon name="close" size={22} color={Colors.white} />
          </TouchableOpacity>
          <Text style={styles.judul}>Atur Foto</Text>
          <TouchableOpacity style={styles.tombolSelesai} onPress={selesai} disabled={menyimpan} activeOpacity={0.85}>
            {menyimpan ? (
              <ActivityIndicator size="small" color={Colors.white} />
            ) : (
              <Text style={styles.teksSelesai}>Selesai</Text>
            )}
          </TouchableOpacity>
        </View>

        <View
          style={styles.area}
          onLayout={(e) => setKotak({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}
          {...pan.panHandlers}
        >
          {f && g ? (
            <View style={{ width: g.fw, height: g.fh }}>
              <Image
                source={{ uri: f.uri }}
                style={{
                  position: 'absolute',
                  width: g.dw,
                  height: g.dh,
                  left: g.fw / 2 + f.nx * g.fw - g.dw / 2,
                  top: g.fh / 2 + f.ny * g.fh - g.dh / 2,
                }}
              />
              {/* Bingkai + garis sepertiga */}
              <View style={[StyleSheet.absoluteFill, styles.bingkai]} pointerEvents="none">
                <View style={[styles.garisV, { left: '33.33%' }]} />
                <View style={[styles.garisV, { left: '66.66%' }]} />
                <View style={[styles.garisH, { top: '33.33%' }]} />
                <View style={[styles.garisH, { top: '66.66%' }]} />
              </View>
            </View>
          ) : null}
        </View>

        <View style={[styles.bawah, { paddingBottom: insets.bottom + Spacing.md }]}>
          {daftar.length > 1 ? (
            <View style={styles.barisThumb}>
              {daftar.map((x, i) => (
                <TouchableOpacity key={x.uri} onPress={() => setAktif(i)} activeOpacity={0.8}>
                  <Image source={{ uri: x.uri }} style={[styles.thumb, i === aktif && styles.thumbAktif]} />
                  <Text style={[styles.labelThumb, i === aktif && { color: Colors.white }]}>
                    {x.tag === 'sebelum' ? 'Sebelum' : 'Sesudah'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : null}

          <Text style={styles.labelBagian}>Tandai sebagai</Text>
          <View style={styles.segmen}>
            {(['sebelum', 'sesudah'] as TagFoto[]).map((t) => {
              const on = f?.tag === t;
              return (
                <TouchableOpacity key={t} style={[styles.ruas, on && styles.ruasAktif]} onPress={() => pilihTag(t)}>
                  <Text style={[styles.teksRuas, on && styles.teksRuasAktif]}>{t === 'sebelum' ? 'Sebelum' : 'Sesudah'}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.labelBagian}>Rasio</Text>
          <View style={styles.barisRasio}>
            {RASIO.map((r) => {
              const on = f?.rasio === r.value;
              return (
                <TouchableOpacity
                  key={r.value}
                  style={[styles.chip, on && styles.chipAktif]}
                  onPress={() => ubah({ rasio: r.value, zoom: 1, nx: 0, ny: 0 })}
                >
                  <Text style={[styles.teksChip, on && styles.teksChipAktif]}>{r.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <Text style={styles.petunjuk}>Geser untuk memposisikan, cubit untuk memperbesar.</Text>
        </View>
      </View>
    </Modal>
  );
}

const putihPudar = 'rgba(255,255,255,0.6)';

const styles = StyleSheet.create({
  layar: {
    flex: 1,
    backgroundColor: '#0b0f0d',
  },
  atas: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  judul: {
    fontSize: 14,
    fontFamily: fonts.bold,
    color: Colors.white,
  },
  tombolSelesai: {
    minWidth: 76,
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Spacing.radius.full,
    ...Spacing.curve,
    backgroundColor: Colors.primary,
  },
  teksSelesai: {
    fontSize: ukuranIsi,
    fontFamily: fonts.semibold,
    color: Colors.white,
  },
  area: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  bingkai: {
    borderWidth: 1.5,
    borderColor: Colors.white,
  },
  garisV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: StyleSheet.hairlineWidth,
    backgroundColor: putihPudar,
  },
  garisH: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: putihPudar,
  },
  bawah: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  barisThumb: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  thumb: {
    width: 48,
    height: 48,
    borderRadius: Spacing.radius.sm,
    ...Spacing.curve,
    opacity: 0.5,
  },
  thumbAktif: {
    opacity: 1,
    borderWidth: 2,
    borderColor: Colors.white,
  },
  labelThumb: {
    marginTop: 2,
    textAlign: 'center',
    fontSize: 10,
    fontFamily: fonts.medium,
    color: putihPudar,
  },
  labelBagian: {
    marginTop: Spacing.sm,
    marginBottom: 6,
    fontSize: 11,
    fontFamily: fonts.semibold,
    color: putihPudar,
  },
  segmen: {
    flexDirection: 'row',
    padding: 3,
    borderRadius: Spacing.radius.full,
    ...Spacing.curve,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  ruas: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 7,
    borderRadius: Spacing.radius.full,
    ...Spacing.curve,
  },
  ruasAktif: {
    backgroundColor: Colors.white,
  },
  teksRuas: {
    fontSize: ukuranIsi,
    fontFamily: fonts.semibold,
    color: putihPudar,
  },
  teksRuasAktif: {
    color: Colors.textPrimary,
  },
  barisRasio: {
    flexDirection: 'row',
    gap: 6,
  },
  chip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    borderRadius: Spacing.radius.full,
    ...Spacing.curve,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  chipAktif: {
    backgroundColor: Colors.white,
    borderColor: Colors.white,
  },
  teksChip: {
    fontSize: ukuranIsi,
    fontFamily: fonts.medium,
    color: Colors.white,
  },
  teksChipAktif: {
    color: Colors.textPrimary,
    fontFamily: fonts.semibold,
  },
  petunjuk: {
    marginTop: Spacing.md,
    textAlign: 'center',
    fontSize: 11,
    fontFamily: fonts.regular,
    color: 'rgba(255,255,255,0.45)',
  },
});
