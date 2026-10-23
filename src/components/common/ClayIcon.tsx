/**
 * ClayIcon — ilustrasi ikon layanan bergaya claymorphism, digambar sendiri
 * dengan SVG (tanpa aset gambar): bentuk membulat "menggembung", gradasi
 * diagonal terang → gelap, dan kilap putih di sisi kiri atas.
 *
 * Kunci = `ServiceItem.id`. Layanan yang belum punya ilustrasi jatuh ke ikon
 * Lucide biasa lewat `punyaClay(id)`.
 *
 * Kanvas 64×64. Id gradien diberi awalan nama ikon supaya tidak bentrok.
 */
import React from 'react';
import Svg, {
  Circle,
  Defs,
  Ellipse,
  G,
  Line,
  LinearGradient,
  Path,
  Rect,
  Stop,
} from 'react-native-svg';

const grad = (id: string, a: string, b: string) => (
  <LinearGradient id={id} x1="0" y1="0" x2="1" y2="1">
    <Stop offset="0" stopColor={a} />
    <Stop offset="1" stopColor={b} />
  </LinearGradient>
);

/** Kilap putih tipis, penanda khas permukaan tanah liat. */
const Kilap = ({ x, y, w, h = 4 }: { x: number; y: number; w: number; h?: number }) => (
  <Rect x={x} y={y} width={w} height={h} rx={h / 2} fill="#fff" opacity={0.5} />
);

type Gambar = (p: { bg: string }) => React.ReactElement;

const GAMBAR: Record<string, Gambar> = {
  // Tumpukan cakram data.
  'database-aset': () => (
    <>
      <Defs>{grad('db', '#9af2b8', '#16a34a')}</Defs>
      {[36, 23, 10].map((y) => (
        <G key={y}>
          <Rect x={8} y={y} width={48} height={22} rx={11} fill="url(#db)" />
          <Kilap x={16} y={y + 4} w={18} />
          <Circle cx={46} cy={y + 11} r={2.8} fill="#fff" opacity={0.85} />
        </G>
      ))}
    </>
  ),

  // Tiket bertanda seru.
  'tiket-masalah': ({ bg }) => (
    <>
      <Defs>{grad('tk', '#ffa3a3', '#e11d48')}</Defs>
      <Rect x={5} y={14} width={54} height={36} rx={11} fill="url(#tk)" />
      <Circle cx={5} cy={32} r={6} fill={bg} />
      <Circle cx={59} cy={32} r={6} fill={bg} />
      <Line
        x1={21}
        y1={19}
        x2={21}
        y2={45}
        stroke="#fff"
        strokeWidth={2.5}
        strokeDasharray="3 4"
        opacity={0.7}
      />
      <Rect x={34} y={21} width={7} height={15} rx={3.5} fill="#fff" />
      <Circle cx={37.5} cy={42} r={3.8} fill="#fff" />
      <Kilap x={11} y={18} w={20} />
    </>
  ),

  // Papan klip bercentang.
  audit: () => (
    <>
      <Defs>
        {grad('au', '#86c8ff', '#2563eb')}
        {grad('auc', '#dbe4ee', '#64748b')}
      </Defs>
      <Rect x={9} y={10} width={46} height={50} rx={13} fill="url(#au)" />
      <Rect x={15} y={18} width={34} height={36} rx={8} fill="#fff" />
      <Rect x={21} y={5} width={22} height={13} rx={6.5} fill="url(#auc)" />
      <Path
        d="M23 36 L30 43 L42 28"
        stroke="#16a34a"
        strokeWidth={6.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </>
  ),

  // Tiga orang.
  'human-capital': () => (
    <>
      <Defs>
        {grad('hc', '#e6bdff', '#9333ea')}
        {grad('hcb', '#f6dcff', '#c084fc')}
      </Defs>
      <Circle cx={14} cy={27} r={7.5} fill="url(#hcb)" />
      <Rect x={3} y={38} width={22} height={19} rx={9.5} fill="url(#hcb)" />
      <Circle cx={50} cy={27} r={7.5} fill="url(#hcb)" />
      <Rect x={39} y={38} width={22} height={19} rx={9.5} fill="url(#hcb)" />
      <Circle cx={32} cy={22} r={11} fill="url(#hc)" />
      <Rect x={16} y={36} width={32} height={24} rx={14} fill="url(#hc)" />
      <Ellipse cx={28} cy={17.5} rx={4.5} ry={2.8} fill="#fff" opacity={0.55} />
    </>
  ),

  // Bohlam menyala.
  kaizen: () => (
    <>
      <Defs>
        {grad('kz', '#fff3ad', '#f59e0b')}
        {grad('kzb', '#eceff3', '#6b7280')}
      </Defs>
      <G stroke="#f59e0b" strokeWidth={3.5} strokeLinecap="round">
        <Line x1={32} y1={3} x2={32} y2={8} />
        <Line x1={10} y1={11} x2={14} y2={15} />
        <Line x1={54} y1={11} x2={50} y2={15} />
        <Line x1={3} y1={28} x2={8} y2={28} />
        <Line x1={61} y1={28} x2={56} y2={28} />
      </G>
      <Circle cx={32} cy={28} r={18} fill="url(#kz)" />
      <Rect x={24} y={42} width={16} height={9} rx={4} fill="url(#kz)" />
      <Rect x={22} y={49} width={20} height={11} rx={5.5} fill="url(#kzb)" />
      <Ellipse cx={25} cy={21} rx={5.5} ry={3.6} fill="#fff" opacity={0.6} />
    </>
  ),

  // Koran.
  berita: () => (
    <>
      <Defs>{grad('bt', '#92ecf6', '#0891b2')}</Defs>
      <Rect x={5} y={11} width={54} height={43} rx={11} fill="url(#bt)" />
      <Rect x={11} y={17} width={42} height={31} rx={7} fill="#fff" />
      <Rect x={16} y={21} width={32} height={6.5} rx={3.2} fill="#0e7490" />
      <Rect x={16} y={31} width={13} height={11} rx={3.5} fill="#22d3ee" />
      <Rect x={33} y={31} width={15} height={4} rx={2} fill="#94a3b8" />
      <Rect x={33} y={38} width={15} height={4} rx={2} fill="#cbd5e1" />
      <Rect x={16} y={46} width={32} height={3.5} rx={1.8} fill="#cbd5e1" />
    </>
  ),

  // Kalender bercentang.
  kegiatan: () => (
    <>
      <Defs>
        {grad('kg', '#ffbe85', '#ea580c')}
        {grad('kgb', '#ffffff', '#ffe7cf')}
      </Defs>
      <Rect x={7} y={12} width={50} height={47} rx={13} fill="url(#kgb)" />
      <Rect x={7} y={12} width={50} height={19} rx={13} fill="url(#kg)" />
      <Rect x={7} y={22} width={50} height={9} fill="url(#kg)" />
      <Rect x={18} y={5} width={8} height={15} rx={4} fill="#c2410c" />
      <Rect x={38} y={5} width={8} height={15} rx={4} fill="#c2410c" />
      <Path
        d="M21 44 L29 52 L43 36"
        stroke="#16a34a"
        strokeWidth={6.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </>
  ),

  // Router + sinyal.
  'unifi-controller': () => (
    <>
      <Defs>{grad('un', '#b3befc', '#4338ca')}</Defs>
      <Path d="M12 23 Q32 3 52 23" stroke="#818cf8" strokeWidth={5.5} strokeLinecap="round" fill="none" />
      <Path d="M20 30 Q32 18 44 30" stroke="#6366f1" strokeWidth={5.5} strokeLinecap="round" fill="none" />
      <Circle cx={32} cy={36} r={3.8} fill="#4338ca" />
      <Rect x={6} y={42} width={52} height={17} rx={8.5} fill="url(#un)" />
      <Circle cx={19} cy={50.5} r={2.8} fill="#fff" opacity={0.9} />
      <Circle cx={29} cy={50.5} r={2.8} fill="#fff" opacity={0.9} />
      <Kilap x={36} y={46} w={15} h={3.5} />
    </>
  ),

  // Orang + roda gigi.
  pengguna: ({ bg }) => (
    <>
      <Defs>
        {grad('pg', '#86e6d6', '#0f766e')}
        {grad('pgc', '#ffdf96', '#f59e0b')}
      </Defs>
      <Circle cx={25} cy={20} r={11.5} fill="url(#pg)" />
      <Rect x={6} y={34} width={38} height={26} rx={16} fill="url(#pg)" />
      <Ellipse cx={21} cy={16} rx={4.5} ry={2.8} fill="#fff" opacity={0.5} />
      <Circle
        cx={47}
        cy={45}
        r={13}
        stroke="url(#pgc)"
        strokeWidth={5}
        strokeDasharray="5.1 5.1"
        fill="none"
      />
      <Circle cx={47} cy={45} r={11} fill="url(#pgc)" />
      <Circle cx={47} cy={45} r={4.5} fill={bg} />
    </>
  ),

  // Kunci emas.
  'access-token': ({ bg }) => (
    <>
      <Defs>{grad('ak', '#fff3a0', '#ca8a04')}</Defs>
      <G rotation={-40} origin="32, 32">
        <Rect x={24} y={27.5} width={36} height={9} rx={4.5} fill="url(#ak)" />
        <Rect x={44} y={34} width={7} height={11} rx={2.5} fill="url(#ak)" />
        <Rect x={54} y={34} width={6} height={8} rx={2.5} fill="url(#ak)" />
        <Circle cx={17} cy={32} r={14} fill="url(#ak)" />
        <Circle cx={17} cy={32} r={5.5} fill={bg} />
        <Ellipse cx={12} cy={26} rx={4.5} ry={2.8} fill="#fff" opacity={0.55} />
      </G>
    </>
  ),

  // Kardus stok.
  'stok-opname': () => (
    <>
      <Defs>
        {grad('so', '#ffd593', '#d97706')}
        {grad('sol', '#ffe8bd', '#f5a23a')}
      </Defs>
      <Rect x={5} y={30} width={54} height={29} rx={10} fill="url(#so)" />
      <Rect x={5} y={20} width={54} height={15} rx={7.5} fill="url(#sol)" />
      <Rect x={26} y={20} width={12} height={39} rx={2} fill="#fff" opacity={0.5} />
      <Rect x={11} y={41} width={12} height={9} rx={2.5} fill="#fff" opacity={0.92} />
      <Circle cx={50} cy={14} r={10.5} fill="#22c55e" />
      <Path
        d="M45 14 L49 18 L56 10"
        stroke="#fff"
        strokeWidth={3.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </>
  ),

  // Monitor dengan headset bantuan.
  'layanan-it': () => (
    <>
      <Defs>
        {grad('it', '#9cc9ff', '#1d4ed8')}
        {grad('itk', '#e2e8f0', '#64748b')}
      </Defs>
      <Rect x={24} y={46} width={16} height={8} rx={2} fill="url(#itk)" />
      <Rect x={16} y={52} width={32} height={7} rx={3.5} fill="url(#itk)" />
      <Rect x={5} y={9} width={54} height={39} rx={10} fill="url(#it)" />
      <Rect x={11} y={15} width={42} height={27} rx={6} fill="#fff" />
      <Path
        d="M22 32 V29 A10 10 0 0 1 42 29 V32"
        stroke="#1d4ed8"
        strokeWidth={3.4}
        strokeLinecap="round"
        fill="none"
      />
      <Rect x={18.5} y={29} width={6.5} height={9} rx={3} fill="#1d4ed8" />
      <Rect x={39} y={29} width={6.5} height={9} rx={3} fill="#1d4ed8" />
      <Kilap x={11} y={11} w={20} h={3} />
    </>
  ),

  // Tombol "Lainnya": empat titik.
  lainnya: () => (
    <>
      <Defs>
        {grad('ln', '#fafafa', '#d4d4d8')}
        {grad('lnd', '#5b5b66', '#18181b')}
      </Defs>
      <Circle cx={32} cy={32} r={29} fill="url(#ln)" />
      {[
        [23, 23],
        [41, 23],
        [23, 41],
        [41, 41],
      ].map(([cx, cy]) => (
        <G key={`${cx}-${cy}`}>
          <Circle cx={cx} cy={cy} r={7} fill="url(#lnd)" />
          <Ellipse cx={cx - 2} cy={cy - 2.5} rx={2.6} ry={1.6} fill="#fff" opacity={0.4} />
        </G>
      ))}
    </>
  ),
};

// Layanan yang berganti id memakai gambar lamanya.
GAMBAR['layanan-hrd'] = GAMBAR['human-capital'];

export function punyaClay(id: string): boolean {
  return id in GAMBAR;
}

interface ClayIconProps {
  /** `ServiceItem.id`. */
  id: string;
  size?: number;
  /** Warna latar ubin — dipakai untuk lubang/takik pada ilustrasi. */
  bg?: string;
}

export default function ClayIcon({ id, size = 44, bg = '#ffffff' }: ClayIconProps) {
  const Gambar = GAMBAR[id];
  if (!Gambar) return null;
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Gambar bg={bg} />
    </Svg>
  );
}
