/**
 * SheetBooking — rincian satu booking: kepala (ikon jenis rapat berwarna ruangan, judul kegiatan, lencana
 * status), baris ikon tanggal/jam/tempat/peminjam, jumlah peserta (ketuk → sheet daftar peserta), link
 * meeting (bisa dibuka) dan tombol tambah ke kalender OS dan bagikan. Presentasional.
 */
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Avatar from '../common/Avatar';
import BottomSheet from '../common/BottomSheet';
import Button from '../common/Button';
import Icon from '../common/Icon';
import { IKON, WARNA_STATUS } from './BarisBooking';
import Colors from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { gs } from '../../../constants/GlobalStyles';
import { fonts } from '../../../constants/Typography';

interface SheetBookingProps {
  visible: boolean;
  onClose: () => void;
  judul: string;
  jenis: keyof typeof IKON;
  /** Mis. "Di Ruangan". */
  jenisLabel: string;
  /** Warna ruangan (sama dengan titik di kalender). */
  warna: string;
  status: number;
  statusLabel: string;
  /** Mis. "Rabu, 21 Oktober 2026". */
  tanggal: string;
  /** Mis. "09:00 - 10:00". */
  jam: string;
  /** Mis. "Sarbini · Plant 1"; null = baris tempat tidak tampil (rapat online). */
  tempat: string | null;
  peminjam: string;
  departemen: string | null;
  peserta: string[];
  /** Ada = tampilkan tombol "Buka Link Meeting". */
  onBukaLink?: () => void;
  onTambahKalender: () => void;
  onBagikan: () => void;
}

interface BarisInfoProps {
  ikon: string;
  warna: string;
  label: string;
  nilai: string;
  sub?: string | null;
  /** Ada = baris bisa diketuk dan menampilkan chevron kanan. */
  onPress?: () => void;
}

function BarisInfo({ ikon, warna, label, nilai, sub, onPress }: BarisInfoProps) {
  return (
    <TouchableOpacity style={styles.barisInfo} activeOpacity={0.6} disabled={!onPress} onPress={onPress}>
      <View style={[styles.ikonInfo, { backgroundColor: `${warna}26` }]}>
        <Icon name={ikon} size={16} color={warna} />
      </View>
      <View style={styles.teksInfo}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.nilai}>{nilai}</Text>
        {sub ? <Text style={styles.label}>{sub}</Text> : null}
      </View>
      {onPress ? <Icon name="chevron-right" size={18} color={Colors.textTertiary} /> : null}
    </TouchableOpacity>
  );
}

export default function SheetBooking({
  visible,
  onClose,
  judul,
  jenis,
  jenisLabel,
  warna,
  status,
  statusLabel,
  tanggal,
  jam,
  tempat,
  peminjam,
  departemen,
  peserta,
  onBukaLink,
  onTambahKalender,
  onBagikan,
}: SheetBookingProps) {
  const lencana = WARNA_STATUS[status] ?? WARNA_STATUS[0];
  const [daftarPeserta, setDaftarPeserta] = useState(false);
  return (
    <>
      <BottomSheet visible={visible} onClose={onClose}>
        <View style={styles.isi}>
          <View style={styles.kepala}>
            <View style={[styles.ikonJenis, { backgroundColor: `${warna}26` }]}>
              <Icon name={IKON[jenis]} size={20} color={warna} />
            </View>
            <View style={styles.teksInfo}>
              <Text style={styles.judul} numberOfLines={2}>{judul}</Text>
              <View style={styles.barisLencana}>
                <View style={[styles.lencana, { backgroundColor: lencana.bg }]}>
                  <Text style={[styles.teksLencana, { color: lencana.fg }]}>{statusLabel}</Text>
                </View>
                <Text style={styles.label}>{jenisLabel}</Text>
              </View>
            </View>
          </View>

          <BarisInfo ikon="calendar-blank-outline" warna="#ff9a2e" label="Tanggal" nilai={tanggal} />
          <BarisInfo ikon="clock-outline" warna="#4a98ff" label="Waktu" nilai={jam} />
          {tempat ? <BarisInfo ikon="map-marker-outline" warna="#ff6a5c" label="Tempat" nilai={tempat} /> : null}
          <BarisInfo ikon="account-outline" warna="#9a6bff" label="Peminjam" nilai={peminjam} sub={departemen} />

          {peserta.length > 0 ? (
            <BarisInfo ikon="account-group-outline" warna="#1fc2a8" label="Peserta" nilai={`${peserta.length} orang`} onPress={() => setDaftarPeserta(true)} />
          ) : null}

          {onBukaLink ? <Button variant="outline" icon="open-in-new" label="Buka Link Meeting" onPress={onBukaLink} block /> : null}
          <View style={styles.barisTombol}>
            <Button variant="outline" icon="calendar" label="Tambah ke Kalender" onPress={onTambahKalender} style={gs.flex1} />
            <Button icon="share-variant" label="Bagikan Undangan" onPress={onBagikan} style={gs.flex1} />
          </View>
        </View>
      </BottomSheet>

      <BottomSheet visible={visible && daftarPeserta} onClose={() => setDaftarPeserta(false)} title={`Peserta (${peserta.length})`}>
        <View style={styles.daftar}>
          {peserta.map((nama, i) => (
            <View key={nama} style={[styles.barisPeserta, i > 0 && styles.garis]}>
              <Avatar nama={nama} ukuran={32} />
              <Text style={styles.namaPeserta} numberOfLines={1}>{nama}</Text>
            </View>
          ))}
        </View>
      </BottomSheet>
    </>
  );
}

const styles = StyleSheet.create({
  isi: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.lg, gap: Spacing.md },
  kepala: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  ikonJenis: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  judul: { fontFamily: fonts.bold, fontSize: 14, color: Colors.textPrimary },
  barisLencana: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: 4 },
  lencana: { paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: Spacing.radius.full },
  teksLencana: { fontFamily: fonts.semibold, fontSize: 11 },
  barisInfo: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  ikonInfo: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  teksInfo: { flex: 1 },
  label: { fontFamily: fonts.regular, fontSize: 12, color: Colors.textTertiary },
  nilai: { fontFamily: fonts.semibold, fontSize: 12, color: Colors.textPrimary },
  barisTombol: { flexDirection: 'row', gap: Spacing.sm },
  daftar: { paddingHorizontal: Spacing.lg },
  barisPeserta: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.sm },
  garis: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: Colors.border },
  namaPeserta: { flex: 1, fontFamily: fonts.medium, fontSize: 12, color: Colors.textPrimary },
});
