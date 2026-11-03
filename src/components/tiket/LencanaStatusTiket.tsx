/** Lencana status tiket (PENDING, PROSES, RESOLVED, OK, …) — presentasional. */
import React from 'react';
import Lencana from '../common/Lencana';
import { lencana } from '../../../constants/Colors';
import { STATUS_TIKET } from '../../adapters/tiket';
import { StatusTiket } from '../../types/tiket';

export const WARNA_STATUS_TIKET: Record<StatusTiket, { bg: string; fg: string }> = {
  PENDING: lencana.kuning,
  NEED_APPROVAL: lencana.kuning,
  PROSES: lencana.biru,
  RESOLVED: lencana.hijau,
  OK: lencana.abu,
  FATAL: lencana.merah,
  CANCEL: lencana.abu,
};

interface LencanaStatusTiketProps {
  status: StatusTiket;
  /** Tampilkan keterangan panjang ("Sedang diproses") alih-alih label singkat. */
  panjang?: boolean;
}

export default function LencanaStatusTiket({ status, panjang = false }: LencanaStatusTiketProps) {
  const meta = STATUS_TIKET[status];
  return <Lencana label={panjang ? meta.keterangan : meta.label} warna={WARNA_STATUS_TIKET[status]} ikon={meta.ikon} />;
}
