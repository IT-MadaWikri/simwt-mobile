/**
 * Seluruh state form pengukuran (info checker/shift/jam, nilai per sampel, pilihan alat ukur, periode
 * aktif) beserta turunan validasinya. Butuh konteks dari layar: apakah Final Inspection, dan daftar
 * titik dimensi/visual yang sedang aktif.
 */
import { useCallback, useMemo, useState } from 'react';
import {
  DAFTAR_PERIODE_NON_FINAL,
  PETA_KUNCI_JAM_PERIODE,
  POLA_FORMAT_ANGKA_DUA_DESIMAL,
} from '../../constants/Pengukuran';
import {
  adalahPeriodeValid,
  ambilKonfigurasiInput,
  buatFormInfoAwal,
  buatKeyMeasurement,
  buatKeyTool,
  buatPetaInvalidFormatPeriode,
  buatPetaOutOfRangePeriode,
  hitungStatusPeriode,
  jumlahSampelPerTitik,
  normalisasiJam,
} from '../utils/pengukuran';
import {
  DrafPengukuran,
  FormInfo,
  NilaiPengukuran,
  Periode,
  PilihanAlat,
  StandarPengukuran,
} from '../types/pengukuran';

const urutkanPeriode = (daftar: Periode[]) => DAFTAR_PERIODE_NON_FINAL.filter((p) => daftar.includes(p));

export function useFormPengukuran({
  isFinalInspection,
  dimensiStandards,
  visualStandards,
}: {
  isFinalInspection: boolean;
  dimensiStandards: StandarPengukuran[];
  visualStandards: StandarPengukuran[];
}) {
  const [formInfo, setFormInfo] = useState<FormInfo>(buatFormInfoAwal);
  const [daftarPeriodeAktif, setDaftarPeriodeAktif] = useState<Periode[]>([...DAFTAR_PERIODE_NON_FINAL]);
  const [periodeAktif, setPeriodeAktif] = useState<Periode>('Awal');
  const [measurementForm, setMeasurementForm] = useState<NilaiPengukuran>({});
  const [selectedToolIds, setSelectedToolIds] = useState<PilihanAlat>({});

  const totalStandarAktif = dimensiStandards.length + visualStandards.length;

  const daftarPeriodePengisian = useMemo<Periode[]>(() => {
    if (isFinalInspection) return ['Awal'];
    const terurut = urutkanPeriode(daftarPeriodeAktif);
    return terurut.length > 0 ? terurut : ['Awal'];
  }, [daftarPeriodeAktif, isFinalInspection]);

  // Periode yang sedang diisi diturunkan, bukan disinkronkan lewat efek: periode yang baru dimatikan
  // langsung jatuh ke periode pertama yang masih aktif.
  const periodeInputAktif: Periode = isFinalInspection
    ? 'Awal'
    : daftarPeriodePengisian.includes(periodeAktif)
      ? periodeAktif
      : daftarPeriodePengisian[0];

  /** Minimal satu periode harus tetap aktif. */
  const togglePeriodeAktif = useCallback((periode: Periode) => {
    if (!adalahPeriodeValid(periode)) return;
    setDaftarPeriodeAktif((sebelumnya) => {
      if (!sebelumnya.includes(periode)) return urutkanPeriode([...sebelumnya, periode]);
      return sebelumnya.length === 1 ? sebelumnya : sebelumnya.filter((p) => p !== periode);
    });
  }, []);

  const ubahFormInfo = useCallback(<K extends keyof FormInfo>(kunci: K, nilai: FormInfo[K]) => {
    setFormInfo((sebelumnya) => ({ ...sebelumnya, [kunci]: nilai }));
  }, []);

  const ambilJamPeriode = useCallback(
    (periode: Periode) => normalisasiJam(formInfo[PETA_KUNCI_JAM_PERIODE[periode]]),
    [formInfo]
  );

  const ubahJamPeriode = useCallback((periode: Periode, jam: string) => {
    setFormInfo((sebelumnya) => ({ ...sebelumnya, [PETA_KUNCI_JAM_PERIODE[periode]]: jam }));
  }, []);

  const jamPeriodeLengkap = useMemo(
    () => isFinalInspection || daftarPeriodePengisian.every((p) => Boolean(ambilJamPeriode(p))),
    [ambilJamPeriode, daftarPeriodePengisian, isFinalInspection]
  );

  const ubahNilai = useCallback(
    (jenis: 'dimensi' | 'visual') => (periode: Periode, titik: StandarPengukuran, index: number, nilai: string) => {
      setMeasurementForm((sebelumnya) => ({ ...sebelumnya, [buatKeyMeasurement(periode, jenis, index + 1, titik.id)]: nilai }));
    },
    []
  );
  const ubahNilaiDimensi = useMemo(() => ubahNilai('dimensi'), [ubahNilai]);
  const ubahNilaiVisual = useMemo(() => ubahNilai('visual'), [ubahNilai]);

  const ambilNilai = useCallback(
    (jenis: 'dimensi' | 'visual') => (periode: Periode, titik: StandarPengukuran) =>
      Array.from({ length: jumlahSampelPerTitik(titik) }, (_, i) => measurementForm[buatKeyMeasurement(periode, jenis, i + 1, titik.id)] || ''),
    [measurementForm]
  );
  const ambilNilaiPerSampel = useMemo(() => ambilNilai('dimensi'), [ambilNilai]);
  const ambilNilaiVisualPerSampel = useMemo(() => ambilNilai('visual'), [ambilNilai]);

  const ambilToolTerpilihId = useCallback(
    (periode: Periode, titik: StandarPengukuran) =>
      selectedToolIds[buatKeyTool(periode, 'dimensi', 1, titik.id)] || titik.tools[0]?.id || null,
    [selectedToolIds]
  );

  /** Ganti alat satu titik; isian titik itu dikosongkan karena standarnya ikut berubah. */
  const ubahToolDimensi = useCallback((periode: Periode, titik: StandarPengukuran, toolId: number | string) => {
    const jumlah = jumlahSampelPerTitik(titik);
    const sampel = Array.from({ length: jumlah }, (_, i) => i + 1);

    setMeasurementForm((sebelumnya) => {
      const baru = { ...sebelumnya };
      sampel.forEach((i) => delete baru[buatKeyMeasurement(periode, 'dimensi', i, titik.id)]);
      return baru;
    });
    setSelectedToolIds((sebelumnya) => {
      const baru = { ...sebelumnya };
      sampel.forEach((i) => {
        baru[buatKeyTool(periode, 'dimensi', i, titik.id)] = toolId;
      });
      return baru;
    });
  }, []);

  const ambilStatusPeriode = useCallback(
    (periode: Periode) => hitungStatusPeriode({ periode, dimensiStandards, measurementForm, selectedToolIds }),
    [dimensiStandards, measurementForm, selectedToolIds]
  );

  const canDraft = useMemo(() => {
    if (!formInfo.checkerName.trim()) return false;
    return isFinalInspection ? Boolean(formInfo.lotNumber.trim()) : Boolean(formInfo.shift.trim());
  }, [formInfo, isFinalInspection]);

  const canSubmit = useMemo(() => {
    if (!canDraft || totalStandarAktif === 0 || !jamPeriodeLengkap) return false;

    return daftarPeriodePengisian.every((periode) =>
      dimensiStandards.every((titik) =>
        Array.from({ length: jumlahSampelPerTitik(titik) }, (_, i) => i + 1).every((sampel) => {
          const nilai = (measurementForm[buatKeyMeasurement(periode, 'dimensi', sampel, titik.id)] || '').trim();
          if (!nilai) return false;
          const { tipeInput } = ambilKonfigurasiInput({ periode, titik, sampel, selectedToolIds });
          return tipeInput !== 'number' || POLA_FORMAT_ANGKA_DUA_DESIMAL.test(nilai);
        })
      )
    );
  }, [canDraft, totalStandarAktif, jamPeriodeLengkap, daftarPeriodePengisian, dimensiStandards, measurementForm, selectedToolIds]);

  const argIsian = { daftarPeriodePengisian, dimensiStandards, measurementForm, selectedToolIds };
  const invalidFormatAngkaPeriode = useMemo(
    () => buatPetaInvalidFormatPeriode(argIsian),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [daftarPeriodePengisian, dimensiStandards, measurementForm, selectedToolIds]
  );
  const outOfRangePeriode = useMemo(
    () => buatPetaOutOfRangePeriode(argIsian),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [daftarPeriodePengisian, dimensiStandards, measurementForm, selectedToolIds]
  );

  const jumlahPeriodeLengkap = isFinalInspection
    ? 0
    : daftarPeriodePengisian.filter((periode) => ambilStatusPeriode(periode) === 'lengkap').length;

  const hidrasiDariDraf = useCallback((draf: DrafPengukuran) => {
    const info: Partial<FormInfo> = draf.formInfo ?? {};
    const periodeDraf = urutkanPeriode(Array.isArray(draf.activePeriods) ? draf.activePeriods : DAFTAR_PERIODE_NON_FINAL);
    const periodeAman = periodeDraf.length ? periodeDraf : [...DAFTAR_PERIODE_NON_FINAL];
    const aktifDraf = adalahPeriodeValid(draf.activePeriod) ? draf.activePeriod : 'Awal';

    setFormInfo({
      lotNumber: info.lotNumber || '',
      checkerName: info.checkerName || '',
      shift: info.shift || 'Shift 1',
      waktuAwal: normalisasiJam(info.waktuAwal),
      waktuTengah: normalisasiJam(info.waktuTengah),
      waktuAkhir: normalisasiJam(info.waktuAkhir),
    });
    setMeasurementForm(draf.measurements || {});
    setSelectedToolIds(draf.selectedTools || {});
    setDaftarPeriodeAktif(periodeAman);
    setPeriodeAktif(periodeAman.includes(aktifDraf) ? aktifDraf : periodeAman[0]);
  }, []);

  return {
    formInfo,
    measurementForm,
    selectedToolIds,
    periodeInputAktif,
    daftarPeriodePengisian,
    canDraft,
    canSubmit,
    invalidFormatAngkaPeriode,
    outOfRangePeriode,
    jumlahPeriodeLengkap,
    setPeriodeAktif,
    togglePeriodeAktif,
    ubahFormInfo,
    ubahJamPeriode,
    ubahNilaiDimensi,
    ubahNilaiVisual,
    ubahToolDimensi,
    ambilNilaiPerSampel,
    ambilNilaiVisualPerSampel,
    ambilToolTerpilihId,
    ambilStatusPeriode,
    ambilJamPeriode,
    hidrasiDariDraf,
  };
}
