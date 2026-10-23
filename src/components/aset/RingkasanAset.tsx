/**
 * RingkasanAset — kartu lebar berdonat persentase aset aktif di puncak halaman Aset (plus maintenance,
 * tidak aktif, aset baru, dan perlu peremajaan yang bergulir bergantian), angkanya sama dengan dashboard
 * IT di web. Presentasional: `ringkasan` null = belum dimuat.
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Icon from '../common/Icon';
import TeksBergulir from '../common/TeksBergulir';
import Colors, { brand } from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { fonts } from '../../../constants/Typography';
import { RingkasanAsetData } from '../../types/aset';

interface RingkasanAsetProps {
  ringkasan: RingkasanAsetData | null;
}

const UKURAN_DONAT = 52;
const TEBAL_DONAT = 5;
const JARI = (UKURAN_DONAT - TEBAL_DONAT) / 2;
const KELILING = 2 * Math.PI * JARI;

const angka = (n?: number) => (n === undefined ? '–' : n.toLocaleString('id-ID'));

export default function RingkasanAset({ ringkasan }: RingkasanAsetProps) {
  const persen = Math.round(ringkasan?.persen_aktif ?? 0);

  return (
    <View style={styles.pembungkus}>
      {/* Pil lebar: ikon dalam cincin persentase aktif, angka + rincian bergulir, persen besar di kanan. */}
      <View style={styles.kartuLebar}>
        <View style={styles.cincinBesar}>
          <Svg width={UKURAN_DONAT} height={UKURAN_DONAT}>
            <Circle cx={UKURAN_DONAT / 2} cy={UKURAN_DONAT / 2} r={JARI} stroke={brand[100]} strokeWidth={TEBAL_DONAT} fill={Colors.white} />
            <Circle
              cx={UKURAN_DONAT / 2}
              cy={UKURAN_DONAT / 2}
              r={JARI}
              stroke={brand[600]}
              strokeWidth={TEBAL_DONAT}
              strokeLinecap="round"
              fill="none"
              strokeDasharray={`${(KELILING * persen) / 100} ${KELILING}`}
              rotation={-90}
              origin={`${UKURAN_DONAT / 2}, ${UKURAN_DONAT / 2}`}
            />
          </Svg>
          <View style={styles.ikonCincin}>
            <Icon name="shield-lock-outline" size={20} color={brand[600]} />
          </View>
        </View>

        <View style={styles.isiLebar}>
          <Text style={styles.judulLebar} numberOfLines={1}>
            {ringkasan ? `${angka(ringkasan.aktif)} dari ${angka(ringkasan.total)}` : '–'}
            <Text style={styles.labelBiasa}> aset aktif</Text>
          </Text>
          <TeksBergulir
            style={styles.subLebar}
            teks={
              ringkasan
                ? [
                    `${angka(ringkasan.maintenance)} maintenance`,
                    `${angka(ringkasan.tidak_aktif)} tidak aktif`,
                    `${angka(ringkasan.baru_bulan_ini)} baru bulan ini`,
                    `${angka(ringkasan.perlu_peremajaan)} perlu peremajaan`,
                  ]
                : ['Memuat…']
            }
          />
        </View>

        <View style={styles.nilaiKanan}>
          <Text style={styles.persenBesar}>{ringkasan ? `${persen}%` : '–'}</Text>
          <Text style={styles.label}>aktif</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pembungkus: { paddingHorizontal: Spacing.screenPadding, marginBottom: Spacing.xl },
  ikonCincin: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  labelBiasa: { fontFamily: fonts.regular, fontSize: 12, color: Colors.textSecondary },
  label: { fontFamily: fonts.regular, fontSize: 12, color: Colors.textSecondary },
  kartuLebar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
    paddingLeft: Spacing.sm,
    paddingRight: Spacing.lg,
    borderRadius: Spacing.radius.full,
    ...Spacing.curve,
    backgroundColor: Colors.serviceGreen,
  },
  cincinBesar: { width: UKURAN_DONAT, height: UKURAN_DONAT },
  isiLebar: { flex: 1, gap: 2 },
  judulLebar: { fontFamily: fonts.bold, fontSize: 14, color: Colors.textPrimary },
  subLebar: { fontFamily: fonts.regular, fontSize: 12, color: Colors.textSecondary },
  nilaiKanan: { alignItems: 'flex-end' },
  // Angka hero di kanan: pengecualian aturan 12px.
  persenBesar: { fontFamily: fonts.bold, fontSize: 20, color: brand[700] },
});
