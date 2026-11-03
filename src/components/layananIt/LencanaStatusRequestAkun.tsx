/** Lencana status Request Akun (menunggu Kabag / Tim IT, selesai, ditolak) — presentasional. */
import React from 'react';
import Lencana from '../common/Lencana';
import { lencana } from '../../../constants/Colors';
import { StatusRequestAkun } from '../../types/layananIt';

const WARNA: Record<StatusRequestAkun, { bg: string; fg: string }> = {
  pending_kabag: lencana.kuning,
  pending_it: lencana.biru,
  selesai: lencana.hijau,
  ditolak: lencana.merah,
};

export default function LencanaStatusRequestAkun({ status, label }: { status: StatusRequestAkun; label: string }) {
  return <Lencana label={label} warna={WARNA[status] ?? WARNA.pending_kabag} style={{ alignSelf: 'flex-start' }} />;
}
