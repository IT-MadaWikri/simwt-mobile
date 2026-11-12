/**
 * Menyelesaikan "proses mana yang sedang diukur" dari param rute / draf, lalu menurunkan standar
 * pengukuran, drawing, dan label yang dipakai layar input. Detail part dimuat lewat cache persisten.
 *
 * @param idPart       id part dari rute
 * @param idProses     id proses dari rute (boleh kosong saat dibuka dari draf)
 * @param prosesDraf   proses yang berasal dari draf aktif
 */
import { useMemo } from 'react';
import { PROSES_FINAL_INSPECTION } from '../../constants/Pengukuran';
import { useDetailPart } from './useDetailPart';
import {
  ambilIdProsesAngka,
  ambilNamaProses,
  filterStandarPengukuranAktif,
  pilihDrawingSlides,
} from '../utils/pengukuran';
import { buatUrlStorageWeb } from '../utils/storageApi';

export interface ProsesDraf {
  id: number | null;
  nama: string;
}

export function useKonteksPengukuran({
  idPart,
  idProses,
  prosesDraf,
}: {
  idPart?: string;
  idProses?: string;
  prosesDraf: ProsesDraf;
}) {
  const { detailPart, memuat, error, muat } = useDetailPart(idPart);

  const namaProsesTerpilih = useMemo(() => {
    if (prosesDraf.nama) return prosesDraf.nama.trim();
    const idRute = ambilIdProsesAngka(idProses);
    return idRute === null ? '' : (detailPart?.proses?.find((p) => p.id === idRute)?.proses.trim() ?? '');
  }, [prosesDraf.nama, idProses, detailPart]);

  const idProsesTerpilih = useMemo(() => {
    const idRute = ambilIdProsesAngka(idProses);
    if (idRute !== null) return idRute;
    if (prosesDraf.id !== null) return prosesDraf.id;
    if (!namaProsesTerpilih) return null;

    const nama = namaProsesTerpilih.toLowerCase();
    return detailPart?.proses?.find((p) => p.proses.trim().toLowerCase() === nama)?.id ?? null;
  }, [detailPart, idProses, prosesDraf.id, namaProsesTerpilih]);

  const drawingSlides = useMemo(
    () => pilihDrawingSlides({ detailPart, idProsesTerpilih, buatUrl: buatUrlStorageWeb }),
    [detailPart, idProsesTerpilih]
  );

  const standarAktif = useMemo(
    () => filterStandarPengukuranAktif({ detailPart, idProsesTerpilih, namaProsesTerpilih }),
    [detailPart, idProsesTerpilih, namaProsesTerpilih]
  );

  const daftarNamaProsesAktif = useMemo(
    () => (namaProsesTerpilih ? [namaProsesTerpilih] : ambilNamaProses(detailPart?.proses ?? [])),
    [detailPart, namaProsesTerpilih]
  );

  const tipeTitik = (titik: (typeof standarAktif)[number]) => titik.tipe_input || titik.tools[0]?.tipe_input;
  const dimensiStandards = useMemo(() => standarAktif.filter((t) => tipeTitik(t) !== 'textarea'), [standarAktif]);
  const visualStandards = useMemo(() => standarAktif.filter((t) => tipeTitik(t) === 'textarea'), [standarAktif]);

  return {
    detailPart,
    memuat,
    error,
    muat,
    namaProsesTerpilih,
    idProsesTerpilih,
    drawingSlides,
    daftarNamaProsesAktif,
    labelProsesAktif: daftarNamaProsesAktif.join(', ') || '-',
    isFinalInspection: daftarNamaProsesAktif.includes(PROSES_FINAL_INSPECTION),
    dimensiStandards,
    visualStandards,
    totalStandarAktif: dimensiStandards.length + visualStandards.length,
  };
}
