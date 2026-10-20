/**
 * TimelineHari — garis waktu satu hari: label jam di kiri, kartu booking di
 * kanan yang posisi & tingginya mengikuti jam mulai–selesai. Booking yang
 * waktunya beririsan dibagi ke kolom berdampingan. Garis putus-putus
 * menandai saat ini bila tanggalnya hari ini. Presentasional.
 */
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from '../common/Icon';
import Colors, { brand } from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { fonts } from '../../../constants/Typography';
import { sama } from '../../utils/kalender';
import { rentangJamTampil, susunKolom } from '../../utils/timelineBooking';

const TINGGI_JAM = 64;
const LEBAR_LABEL = 48;
const IKON = { offline: 'door-open', online: 'video-outline', luar: 'map-marker-outline' } as const;

export interface ItemTimeline {
  id: number;
  mulai: Date;
  selesai: Date;
  judul: string;
  /** Mis. "Di Ruangan · Sarbini". */
  kategori: string;
  /** Mis. "09:00 - 10:00". */
  jam: string;
  warna: string;
  jenis: keyof typeof IKON;
}

interface TimelineHariProps {
  tanggal: Date;
  items: ItemTimeline[];
  onPilih: (id: number) => void;
}

const menit = (d: Date) => d.getHours() * 60 + d.getMinutes();
const labelJam = (j: number) => `${String(j % 24).padStart(2, '0')}.00`;

export default function TimelineHari({ tanggal, items, onPilih }: TimelineHariProps) {
  const { awal, akhir } = rentangJamTampil(items);
  const tinggiTotal = (akhir - awal) * TINGGI_JAM;
  const posisi = (m: number) => ((m - awal * 60) / 60) * TINGGI_JAM;
  const sekarang = new Date();
  const tampilSekarang = sama(tanggal, sekarang) && menit(sekarang) >= awal * 60 && menit(sekarang) <= akhir * 60;

  return (
    <View style={[styles.wadah, { height: tinggiTotal + Spacing.lg }]}>
      {Array.from({ length: akhir - awal + 1 }, (_, i) => (
        <View key={i} style={[styles.barisJam, { top: i * TINGGI_JAM }]}>
          <Text style={styles.labelJam}>{labelJam(awal + i)}</Text>
          <View style={styles.garis} />
        </View>
      ))}

      <View style={styles.area}>
        {susunKolom(items).map(({ item, kolom, jumlahKolom }) => {
          const mulai = menit(item.mulai);
          // Lintas tengah malam dipotong di 24.00 supaya kartu tidak keluar dari garis waktu.
          const selesai = item.selesai.getDate() !== item.mulai.getDate() ? 24 * 60 : menit(item.selesai);
          const tinggi = Math.max(((selesai - mulai) / 60) * TINGGI_JAM - 4, 40);
          return (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.8}
              onPress={() => onPilih(item.id)}
              style={[
                styles.kartu,
                {
                  top: posisi(mulai) + 2,
                  height: tinggi,
                  left: `${(kolom / jumlahKolom) * 100}%`,
                  width: `${100 / jumlahKolom}%`,
                  backgroundColor: `${item.warna}26`,
                },
              ]}
            >
              <View style={styles.kartuDalam}>
                <View style={styles.flex1}>
                  <Text style={styles.judul} numberOfLines={tinggi >= 72 ? 2 : 1}>{item.judul}</Text>
                  {tinggi >= 72 ? <Text style={styles.kategori} numberOfLines={1}>{item.kategori}</Text> : null}
                </View>
                {jumlahKolom === 1 ? <Icon name={IKON[item.jenis]} size={16} color={item.warna} /> : null}
              </View>
              {tinggi >= 52 ? (
                <View style={styles.baris}>
                  <Icon name="clock-outline" size={12} color={Colors.textSecondary} />
                  <Text style={styles.jam} numberOfLines={1}>{item.jam}</Text>
                </View>
              ) : null}
            </TouchableOpacity>
          );
        })}

        {tampilSekarang ? (
          <View pointerEvents="none" style={[styles.sekarang, { top: posisi(menit(sekarang)) }]}>
            <View style={styles.titikSekarang} />
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  wadah: { marginTop: Spacing.sm, marginHorizontal: Spacing.screenPadding },
  barisJam: { position: 'absolute', left: 0, right: 0, flexDirection: 'row', alignItems: 'center' },
  labelJam: { width: LEBAR_LABEL, marginTop: -8, fontFamily: fonts.regular, fontSize: 12, color: Colors.textTertiary },
  garis: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: Colors.border },
  area: { position: 'absolute', top: 0, bottom: 0, left: LEBAR_LABEL, right: 0 },
  kartu: {
    position: 'absolute',
    padding: Spacing.sm,
    borderRadius: Spacing.radius.md,
    ...Spacing.curve,
    overflow: 'hidden',
    justifyContent: 'space-between',
  },
  kartuDalam: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.xs },
  judul: { fontFamily: fonts.bold, fontSize: 12, color: Colors.ink },
  kategori: { fontFamily: fonts.regular, fontSize: 12, color: Colors.textSecondary },
  baris: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  jam: { flexShrink: 1, fontFamily: fonts.regular, fontSize: 12, color: Colors.textSecondary },
  sekarang: { position: 'absolute', left: 0, right: 0, borderTopWidth: 1.5, borderStyle: 'dashed', borderColor: brand[600] },
  titikSekarang: { position: 'absolute', left: -4, top: -5, width: 8, height: 8, borderRadius: 4, backgroundColor: brand[600] },
});
