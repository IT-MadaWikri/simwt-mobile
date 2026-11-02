/**
 * Sheet Filter Part (proses + bisnis partner). Pilihan disimpan di draf sendiri dan baru berlaku saat
 * "Terapkan filter" ditekan. Presentasional: pencarian opsi dijalankan pemanggil.
 */
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import BottomSheet from '../common/BottomSheet';
import Button from '../common/Button';
import BagianCariPilihan from './BagianCariPilihan';
import Spacing from '../../../constants/Spacing';
import { gs } from '../../../constants/GlobalStyles';
import { ModeFilter, NilaiFilterPart } from '../../hooks/useDaftarPart';
import { MIN_HURUF_OPSI, OpsiCari } from '../../hooks/useOpsiFilterPart';
import { OpsiBisnisPartner, ProsesPart } from '../../types/pengukuran';

const FILTER_AWAL: NilaiFilterPart = { proses: [], bisnisPartner: [] };

interface SheetFilterPartProps {
  visible: boolean;
  aktif: NilaiFilterPart;
  proses: OpsiCari<ProsesPart>;
  bisnisPartner: OpsiCari<OpsiBisnisPartner>;
  /** Mode yang sedang memuat (tombolnya berspinner, tombol lain mati); null = tidak memuat. */
  memuat: null | ModeFilter;
  onTerapkan: (n: NilaiFilterPart, mode: ModeFilter) => void;
  onClose: () => void;
}

const tambahBila = <T,>(daftar: T[], item: T, sama: (a: T) => boolean) => (daftar.some(sama) ? daftar : [...daftar, item]);

export default function SheetFilterPart({ visible, aktif, proses, bisnisPartner, memuat, onTerapkan, onClose }: SheetFilterPartProps) {
  const [draf, setDraf] = useState<NilaiFilterPart>(aktif);

  // Setiap dibuka mulai dari filter yang sedang aktif.
  useEffect(() => {
    if (visible) setDraf(aktif);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Filter Part" penuh>
      <View style={{ paddingHorizontal: Spacing.lg }}>
        <BagianCariPilihan
          judul="Proses"
          placeholder="Cari proses..."
          minHuruf={MIN_HURUF_OPSI}
          kata={proses.kata}
          onKata={proses.setKata}
          memuat={proses.memuat}
          gagal={proses.gagal}
          terpilih={draf.proses.map((p) => ({ kunci: p, label: p }))}
          hasil={proses.hasil.map((p) => ({ kunci: p.proses, label: p.proses }))}
          onPilih={(k) => setDraf((d) => ({ ...d, proses: tambahBila(d.proses, k, (x) => x === k) }))}
          onHapus={(k) => setDraf((d) => ({ ...d, proses: d.proses.filter((x) => x !== k) }))}
        />

        <BagianCariPilihan
          judul="Bisnis partner"
          placeholder="Cari nama perusahaan..."
          minHuruf={MIN_HURUF_OPSI}
          kata={bisnisPartner.kata}
          onKata={bisnisPartner.setKata}
          memuat={bisnisPartner.memuat}
          gagal={bisnisPartner.gagal}
          terpilih={draf.bisnisPartner.map((b) => ({ kunci: String(b.id), label: b.nama }))}
          hasil={bisnisPartner.hasil.map((b) => ({ kunci: String(b.id), label: b.nama }))}
          onPilih={(k) =>
            setDraf((d) => {
              const b = bisnisPartner.hasil.find((x) => String(x.id) === k);
              return b ? { ...d, bisnisPartner: tambahBila(d.bisnisPartner, { id: b.id, nama: b.nama }, (x) => x.id === b.id) } : d;
            })
          }
          onHapus={(k) => setDraf((d) => ({ ...d, bisnisPartner: d.bisnisPartner.filter((x) => String(x.id) !== k) }))}
        />
      </View>

      <View style={[gs.row, { gap: Spacing.sm, paddingHorizontal: Spacing.lg, paddingTop: Spacing.md }]}>
        <Button
          variant="outline"
          icon="restore"
          label="Reset"
          loading={memuat === 'reset'}
          disabled={memuat === 'terapkan'}
          onPress={() => {
            setDraf(FILTER_AWAL);
            onTerapkan(FILTER_AWAL, 'reset');
          }}
        />
        <Button
          icon="check"
          label="Terapkan filter"
          loading={memuat === 'terapkan'}
          disabled={memuat === 'reset'}
          onPress={() => onTerapkan(draf, 'terapkan')}
          style={gs.flex1}
        />
      </View>
    </BottomSheet>
  );
}
