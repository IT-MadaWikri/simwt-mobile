/**
 * PolaMemphis — hiasan latar kartu bergaya Memphis: gelombang, zigzag, kisi
 * titik, tanda plus, cincin, setengah lingkaran, dan segitiga yang tersebar.
 * Ada beberapa tata letak (`variasi`) supaya tiap jenis kartu tidak kembar.
 * Letak dihitung dari ukuran kartu (pecahan lebar/tinggi), ukuran bentuk
 * mengecil di kartu yang pendek. Taruh sebagai anak pertama kartu yang
 * `overflow: 'hidden'`.
 */
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, G, Line, Path, Pattern, Polygon, Polyline, Rect } from 'react-native-svg';
import Colors, { brand, palet } from '../../../constants/Colors';

const WARNA = {
  ink: Colors.ink,
  hijau: brand[600],
  rose: Colors.rose,
  biru: Colors.info,
  oranye: Colors.warning,
  kuning: palet.kuning,
  putih: '#ffffff',
} as const;

type Bentuk = 'gelombang' | 'zigzag' | 'plus' | 'cincin' | 'cakram' | 'kisi' | 'segitiga' | 'setengah';
interface Item {
  b: Bentuk;
  /** Pusat bentuk sebagai pecahan lebar/tinggi kartu. */
  x: number;
  y: number;
  /** Ukuran dasar (px) pada kartu setinggi 120. */
  u: number;
  w: keyof typeof WARNA;
}

const TATA: Item[][] = [
  [
    { b: 'cakram', x: 0.07, y: 0.14, u: 6, w: 'rose' },
    { b: 'cakram', x: 0.11, y: 0.14, u: 6, w: 'putih' },
    { b: 'gelombang', x: 0.42, y: 0.1, u: 7, w: 'biru' },
    { b: 'kisi', x: 0.04, y: 0.72, u: 7, w: 'hijau' },
    { b: 'plus', x: 0.5, y: 0.52, u: 6, w: 'ink' },
    { b: 'segitiga', x: 0.4, y: 0.88, u: 7, w: 'oranye' },
    { b: 'cincin', x: 0.62, y: 0.2, u: 6, w: 'ink' },
    { b: 'setengah', x: 0.7, y: 0.98, u: 14, w: 'hijau' },
  ],
  [
    { b: 'zigzag', x: 0.3, y: 0.14, u: 5, w: 'rose' },
    { b: 'cincin', x: 0.06, y: 0.2, u: 6, w: 'ink' },
    { b: 'kisi', x: 0.46, y: 0.7, u: 7, w: 'biru' },
    { b: 'plus', x: 0.1, y: 0.82, u: 5, w: 'hijau' },
    { b: 'cakram', x: 0.62, y: 0.2, u: 5, w: 'oranye' },
    { b: 'segitiga', x: 0.2, y: 0.5, u: 5, w: 'ink' },
  ],
  [
    { b: 'gelombang', x: 0.12, y: 0.9, u: 7, w: 'oranye' },
    { b: 'plus', x: 0.34, y: 0.12, u: 6, w: 'ink' },
    { b: 'kisi', x: 0.62, y: 0.78, u: 7, w: 'rose' },
    { b: 'cincin', x: 0.07, y: 0.12, u: 6, w: 'hijau' },
    { b: 'zigzag', x: 0.5, y: 0.5, u: 4, w: 'biru' },
    { b: 'segitiga', x: 0.9, y: 0.1, u: 7, w: 'hijau' },
    { b: 'cakram', x: 0.24, y: 0.62, u: 5, w: 'kuning' },
  ],
];

interface PolaMemphisProps {
  variasi?: number;
}

export default function PolaMemphis({ variasi = 0 }: PolaMemphisProps) {
  const [ukuran, setUkuran] = useState({ w: 0, h: 0 });
  const skala = Math.min(1, ukuran.h / 120);
  const tebal = Math.max(1.5, 2.5 * skala);

  const gambar = ({ b, x, y, u, w }: Item, i: number) => {
    const px = x * ukuran.w;
    const py = y * ukuran.h;
    const s = u * skala;
    const warna = WARNA[w];
    switch (b) {
      case 'cakram':
        return <Circle key={i} cx={px} cy={py} r={s} fill={warna} />;
      case 'cincin':
        return <Circle key={i} cx={px} cy={py} r={s} stroke={warna} strokeWidth={tebal} fill="none" />;
      case 'plus':
        return (
          <G key={i} stroke={warna} strokeWidth={tebal} strokeLinecap="round">
            <Line x1={px - s} y1={py} x2={px + s} y2={py} />
            <Line x1={px} y1={py - s} x2={px} y2={py + s} />
          </G>
        );
      case 'gelombang': {
        const a = s * 0.6;
        const l = s * 4;
        return (
          <Path
            key={i}
            d={`M ${px - l / 2} ${py} q ${l / 8} ${-a} ${l / 4} 0 t ${l / 4} 0 t ${l / 4} 0 t ${l / 4} 0`}
            stroke={warna}
            strokeWidth={tebal}
            strokeLinecap="round"
            fill="none"
          />
        );
      }
      case 'zigzag': {
        const l = s * 4;
        const t = [0, 1, 2, 3, 4].map((k) => `${px - l / 2 + (k * l) / 4},${py + (k % 2 ? s * 0.7 : -s * 0.7)}`);
        return (
          <Polyline key={i} points={t.join(' ')} stroke={warna} strokeWidth={tebal} strokeLinejoin="round" fill="none" />
        );
      }
      case 'segitiga':
        return (
          <Polygon
            key={i}
            points={`${px},${py - s} ${px - s},${py + s * 0.8} ${px + s},${py + s * 0.8}`}
            stroke={warna}
            strokeWidth={tebal}
            strokeLinejoin="round"
            fill="none"
          />
        );
      case 'setengah':
        return <Path key={i} d={`M ${px - s} ${py} A ${s} ${s} 0 0 1 ${px + s} ${py} Z`} fill={warna} />;
      case 'kisi': {
        const jarak = Math.max(5, s);
        return (
          <G key={i}>
            <Defs>
              <Pattern id={`kisi${i}`} width={jarak} height={jarak} patternUnits="userSpaceOnUse">
                <Circle cx={jarak / 2} cy={jarak / 2} r={Math.max(1, jarak * 0.16)} fill={warna} />
              </Pattern>
            </Defs>
            <Rect x={px} y={py} width={jarak * 6} height={jarak * 3.5} fill={`url(#kisi${i})`} />
          </G>
        );
      }
    }
  };

  return (
    <View
      style={StyleSheet.absoluteFill}
      pointerEvents="none"
      onLayout={(e) => setUkuran({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}
    >
      <Svg width={ukuran.w} height={ukuran.h}>
        <G opacity={0.45}>{ukuran.w ? TATA[variasi % TATA.length].map(gambar) : null}</G>
      </Svg>
    </View>
  );
}
