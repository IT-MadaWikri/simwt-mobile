/** Lencana OK / NG / Pending untuk hasil pengukuran. */
import React from 'react';
import Lencana from '../common/Lencana';
import { lencana } from '../../../constants/Colors';
import { Judgement } from '../../types/pengukuran';

const WARNA = {
  OK: { label: 'OK', ikon: 'check-circle', warna: lencana.hijau },
  NG: { label: 'NG', ikon: 'close-circle', warna: lencana.merah },
  Pending: { label: 'Pending', ikon: 'clock-outline', warna: lencana.kuning },
};

export default function LencanaJudgment({ judgment }: { judgment: Judgement | null }) {
  const w = WARNA[judgment ?? 'Pending'];
  return <Lencana label={w.label} ikon={w.ikon} warna={w.warna} style={{ alignSelf: 'flex-start' }} />;
}
