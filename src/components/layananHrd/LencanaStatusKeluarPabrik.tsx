/** Lencana status Form Keluar Pabrik (menunggu, disetujui, ditolak) — presentasional. */
import React from 'react';
import Lencana from '../common/Lencana';
import { lencana } from '../../../constants/Colors';
import { StatusKeluarPabrik } from '../../types/layananHrd';

const WARNA: Record<StatusKeluarPabrik, { bg: string; fg: string }> = {
  menunggu: lencana.kuning,
  disetujui: lencana.hijau,
  ditolak: lencana.merah,
};

export default function LencanaStatusKeluarPabrik({ status, label }: { status: StatusKeluarPabrik; label: string }) {
  return <Lencana label={label} warna={WARNA[status] ?? WARNA.menunggu} style={{ alignSelf: 'flex-start' }} />;
}
