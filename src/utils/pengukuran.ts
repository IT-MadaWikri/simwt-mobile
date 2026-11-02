/**
 * Logika murni Pengukuran QC: kunci isian, jam, jumlah sampel, judgement OK/NG,
 * validasi format & range, dan penyusunan `measurements` untuk dikirim.
 * Tanpa React, api, atau storage.
 */
import {
  DAFTAR_PERIODE_NON_FINAL,
  FORM_INFO_AWAL,
  POLA_FORMAT_ANGKA_DUA_DESIMAL,
} from '../../constants/Pengukuran';
import {
  AlatUkur,
  DetailPart,
  DrafPengukuran,
  DrawingPart,
  FormInfo,
  JenisTitik,
  Judgement,
  KonfigurasiInput,
  MeasurementGroup,
  NilaiPengukuran,
  Periode,
  PilihanAlat,
  StandarPengukuran,
  StatusPeriode,
} from '../types/pengukuran';

const polaJam = /^([01]\d|2[0-3]):([0-5]\d)$/;

const samakanId = (nilai: unknown) => String(nilai ?? '');
const nilaiKeLower = (nilai: unknown) => String(nilai ?? '').trim().toLowerCase();

export const buatFormInfoAwal = (): FormInfo => ({ ...FORM_INFO_AWAL });

export const buatKeyMeasurement = (periode: Periode, jenis: JenisTitik, sampel: number, idTitik: number) =>
  `${periode}-${jenis}-${sampel}-${idTitik}`;

export const buatKeyTool = (periode: Periode, jenis: JenisTitik, sampel: number, idTitik: number) =>
  `${periode}-${jenis}-${sampel}-${idTitik}-tool`;

/** Terima `HH:mm` atau `HH:mm:ss`; selain itu kosong. */
export const normalisasiJam = (nilai: unknown): string => {
  if (typeof nilai !== 'string') return '';
  const lima = nilai.trim().slice(0, 5);
  return polaJam.test(lima) ? lima : '';
};

export const konversiJamKeTanggal = (nilaiJam: string): Date => {
  const tanggal = new Date();
  const jamNormal = normalisasiJam(nilaiJam);
  if (!jamNormal) {
    tanggal.setSeconds(0, 0);
    return tanggal;
  }
  const [jam, menit] = jamNormal.split(':').map(Number);
  tanggal.setHours(jam, menit, 0, 0);
  return tanggal;
};

export const formatTanggalKeJam = (tanggal: Date): string =>
  `${String(tanggal.getHours()).padStart(2, '0')}:${String(tanggal.getMinutes()).padStart(2, '0')}`;

type NamaProsesMentah = string | { proses?: unknown; nama?: unknown } | null | undefined;

export const ambilNamaProses = (proses: NamaProsesMentah | NamaProsesMentah[]): string[] => {
  const namaDari = (item: NamaProsesMentah) =>
    typeof item === 'string' ? item.trim() : item && typeof item === 'object' ? String(item.proses || item.nama || '').trim() : '';

  return (Array.isArray(proses) ? proses : [proses]).map(namaDari).filter(Boolean);
};

export const ambilIdProsesAngka = (nilai: unknown): number | null => {
  if (nilai === null || nilai === undefined || nilai === '') return null;
  const angka = Number(nilai);
  return Number.isFinite(angka) ? angka : null;
};

export const ambilNamaProsesDraft = (draft: Partial<Pick<DrafPengukuran, 'processName' | 'process'>> = {}): string => {
  const spesifik = String(draft.processName || '').trim();
  if (spesifik) return spesifik;

  const gabungan = String(draft.process || '').trim();
  return (
    gabungan
      .split(',')
      .map((item) => item.trim())
      .find(Boolean) || ''
  );
};

export const adalahPeriodeValid = (periode: unknown): periode is Periode =>
  (DAFTAR_PERIODE_NON_FINAL as string[]).includes(String(periode || ''));

type TitikSampel = Pick<StandarPengukuran, 'sample_count' | 'is_critical'>;

export const adalahTitikCritical = (titik: TitikSampel) => Boolean(titik?.is_critical) || Number(titik?.sample_count) >= 5;

/** Titik critical minimal 5 sampel (aturan QC); selain itu `sample_count` atau 3. */
export const jumlahSampelPerTitik = (titik: TitikSampel): number => {
  const dariApi = Number(titik?.sample_count);
  if (adalahTitikCritical(titik)) return Math.max(dariApi > 0 ? dariApi : 0, 5);
  return dariApi > 0 ? dariApi : 3;
};

/** Terima koma desimal; NaN bila bukan angka. */
export const parseAngka = (nilai: unknown): number => {
  if (nilai === null || nilai === undefined) return NaN;
  const teks = String(nilai).trim().replace(',', '.');
  if (!teks) return NaN;
  const angka = Number(teks);
  return Number.isFinite(angka) ? angka : NaN;
};

const bersihkanDaftar = (daftar: unknown[]) => daftar.map((item) => String(item ?? '').trim()).filter((item) => item.length > 0);

export const parseOpsiRadio = (nilai: unknown): string[] => {
  if (Array.isArray(nilai)) return bersihkanDaftar(nilai);

  if (typeof nilai === 'string' && nilai.trim()) {
    try {
      const hasil: unknown = JSON.parse(nilai);
      if (Array.isArray(hasil)) return bersihkanDaftar(hasil);
    } catch {
      return bersihkanDaftar(nilai.split(/[|,;/]+/));
    }
  }

  return [];
};

const tokenKeStatus = (nilai: unknown): Judgement | null => {
  const token = nilaiKeLower(nilai).replace(/\s+/g, '');
  if (['ok', 'go', 'pass', 'good', 'accept', 'accepted'].includes(token)) return 'OK';
  if (['ng', 'nogo', 'fail', 'failed', 'reject', 'rejected', 'notok'].includes(token)) return 'NG';
  return null;
};

const hitungJudgementRadio = (valueInput: string, opsiRadio: string[]): Judgement => {
  const nilaiInput = valueInput.trim();
  if (!nilaiInput) return 'NG';

  const indeks = opsiRadio.findIndex((item) => nilaiKeLower(item) === nilaiKeLower(nilaiInput));
  if (indeks >= 0) {
    const dariToken = tokenKeStatus(opsiRadio[indeks]);
    if (dariToken) return dariToken;
    // Tanpa token OK/NG di label: opsi pertama = OK, sisanya NG.
    return indeks === 0 ? 'OK' : 'NG';
  }

  return tokenKeStatus(nilaiInput) ?? 'NG';
};

const hitungJudgementNonAngka = (valueInput: string, targetString: string): Judgement => {
  const nilaiInput = nilaiKeLower(valueInput);
  if (!nilaiInput) return 'NG';

  const target = nilaiKeLower(targetString);
  if (target) return nilaiInput === target ? 'OK' : 'NG';

  if (nilaiInput === 'ng') return 'NG';
  return 'OK';
};

export const ambilToolAktif = ({
  titik,
  selectedToolIds,
  periode,
  sampel,
  jenis = 'dimensi',
}: {
  titik: Pick<StandarPengukuran, 'id' | 'tools'>;
  selectedToolIds?: PilihanAlat | null;
  periode?: Periode | null;
  sampel?: number | null;
  jenis?: JenisTitik;
}): AlatUkur | null => {
  const daftarTools = Array.isArray(titik?.tools) ? titik.tools : [];
  if (!daftarTools.length) return null;

  const keyTool = periode && sampel ? buatKeyTool(periode, jenis, sampel, titik.id) : null;
  const idToolAktif = (keyTool && selectedToolIds?.[keyTool]) || daftarTools[0]?.id;

  return daftarTools.find((tool) => samakanId(tool.id) === samakanId(idToolAktif)) || daftarTools[0];
};

export const ambilKonfigurasiInput = ({
  periode,
  titik,
  sampel,
  selectedToolIds,
}: {
  periode: Periode;
  titik: StandarPengukuran;
  sampel: number;
  selectedToolIds: PilihanAlat;
}): KonfigurasiInput => {
  const toolAktif = ambilToolAktif({ periode, titik, sampel, selectedToolIds });
  const tipeInput = nilaiKeLower(toolAktif?.tipe_input || titik?.tipe_input);

  return {
    tipeInput,
    standarMin: parseAngka(titik?.standar_min),
    standarMax: parseAngka(titik?.standar_max),
    targetString: tipeInput === 'radio' ? (toolAktif?.target_string ?? '') : (titik?.target_string ?? ''),
    opsiRadio: parseOpsiRadio(toolAktif?.opsi_radio),
  };
};

const ambilNamaProsesItem = (item: StandarPengukuran) => {
  const p = item?.proses;
  return nilaiKeLower(typeof p === 'object' && p ? p.proses || p.nama : p || '');
};

/** Standar pengukuran milik proses terpilih (cocok `proses_id`, atau nama bila id tak ada). */
export const filterStandarPengukuranAktif = ({
  detailPart,
  idProsesTerpilih,
  namaProsesTerpilih,
}: {
  detailPart: DetailPart | null | undefined;
  idProsesTerpilih: number | null;
  namaProsesTerpilih: string;
}): StandarPengukuran[] => {
  const daftarStandar = Array.isArray(detailPart?.standar_pengukuran) ? detailPart.standar_pengukuran : [];
  if (idProsesTerpilih === null && !namaProsesTerpilih) return daftarStandar;

  const namaDipilih = nilaiKeLower(namaProsesTerpilih);

  return daftarStandar.filter((item) => {
    const idStandar = Number(item?.proses_id);
    if (idProsesTerpilih !== null && Number.isFinite(idStandar) && idStandar === idProsesTerpilih) return true;
    return Boolean(namaDipilih) && ambilNamaProsesItem(item) === namaDipilih;
  });
};

export interface SlideDrawing {
  id: number | string;
  url: string;
}

/**
 * Drawing untuk proses terpilih (semua drawing bila tak ada yang cocok); jatuh ke `gambar_part`,
 * lalu satu slide kosong. `buatUrl` mengubah path storage relatif menjadi URL penuh.
 */
export const pilihDrawingSlides = ({
  detailPart,
  idProsesTerpilih,
  buatUrl,
}: {
  detailPart: DetailPart | null | undefined;
  idProsesTerpilih: number | null;
  buatUrl: (path: string) => string;
}): SlideDrawing[] => {
  const daftarDrawing: DrawingPart[] = Array.isArray(detailPart?.drawings) ? detailPart.drawings : [];

  if (!daftarDrawing.length) {
    return detailPart?.gambar_part ? [{ id: 'gambar-part', url: buatUrl(detailPart.gambar_part) }] : [{ id: 'tanpa-gambar', url: '' }];
  }

  let terpilih = daftarDrawing;
  if (idProsesTerpilih !== null) {
    const cocok = daftarDrawing.filter((d) => Number(d?.proses_id) === idProsesTerpilih);
    if (cocok.length) terpilih = cocok;
  }

  return terpilih.map((drawing, index) => {
    const path = String(drawing?.drawing_path || '').trim();
    return {
      id: drawing?.id || `drawing-${index}`,
      url: !path ? '' : /^https?:\/\//i.test(path) ? path : buatUrl(path),
    };
  });
};

interface ArgIsian {
  daftarPeriodePengisian: Periode[];
  dimensiStandards: StandarPengukuran[];
  measurementForm: NilaiPengukuran;
  selectedToolIds: PilihanAlat;
}

/** `hasil[periode][idTitik][sampel-1]` = apakah sampel itu melanggar `aturan`. */
const petakanSampel = (
  { daftarPeriodePengisian, dimensiStandards, measurementForm, selectedToolIds }: ArgIsian,
  aturan: (nilai: string, konfigurasi: KonfigurasiInput) => boolean
) => {
  const hasil: Record<string, Record<number, boolean[]>> = {};

  daftarPeriodePengisian.forEach((periode) => {
    hasil[periode] = {};
    dimensiStandards.forEach((titik) => {
      hasil[periode][titik.id] = Array.from({ length: jumlahSampelPerTitik(titik) }, (_, idx) => {
        const sampel = idx + 1;
        const nilai = String(measurementForm[buatKeyMeasurement(periode, 'dimensi', sampel, titik.id)] || '').trim();
        if (!nilai) return false;
        const konfigurasi = ambilKonfigurasiInput({ periode, titik, sampel, selectedToolIds });
        return konfigurasi.tipeInput === 'number' && aturan(nilai, konfigurasi);
      });
    });
  });

  return hasil;
};

const diLuarRange = (nilai: string, { standarMin, standarMax }: KonfigurasiInput) => {
  const angka = parseAngka(nilai);
  if (Number.isNaN(angka) || Number.isNaN(standarMin) || Number.isNaN(standarMax)) return false;
  return angka < standarMin || angka > standarMax;
};

export const buatPetaInvalidFormatPeriode = (arg: ArgIsian) =>
  petakanSampel(arg, (nilai) => !POLA_FORMAT_ANGKA_DUA_DESIMAL.test(nilai));

export const buatPetaOutOfRangePeriode = (arg: ArgIsian) =>
  petakanSampel(arg, (nilai, konfigurasi) => POLA_FORMAT_ANGKA_DUA_DESIMAL.test(nilai) && diLuarRange(nilai, konfigurasi));

export const hitungStatusPeriode = ({
  periode,
  dimensiStandards,
  measurementForm,
  selectedToolIds,
}: Omit<ArgIsian, 'daftarPeriodePengisian'> & { periode: Periode }): StatusPeriode => {
  let jumlahWajib = 0;
  let jumlahValid = 0;
  let adaNilai = false;

  dimensiStandards.forEach((titik) => {
    for (let i = 1; i <= jumlahSampelPerTitik(titik); i += 1) {
      jumlahWajib += 1;
      const nilai = String(measurementForm[buatKeyMeasurement(periode, 'dimensi', i, titik.id)] || '').trim();
      if (!nilai) continue;
      adaNilai = true;

      const { tipeInput } = ambilKonfigurasiInput({ periode, titik, sampel: i, selectedToolIds });
      if (tipeInput === 'number' && !POLA_FORMAT_ANGKA_DUA_DESIMAL.test(nilai)) continue;
      jumlahValid += 1;
    }
  });

  if (!adaNilai) return 'kosong';
  return jumlahWajib > 0 && jumlahValid === jumlahWajib ? 'lengkap' : 'sebagian';
};

export const cekAdaNilaiOutOfRange = (arg: ArgIsian): boolean =>
  Object.values(petakanSampel(arg, (nilai, konfigurasi) => diLuarRange(nilai, konfigurasi))).some((perTitik) =>
    Object.values(perTitik).some((sampel) => sampel.some(Boolean))
  );

/** Susun `measurements` satu periode untuk payload kirim; nilai kosong dinilai NG, visual NG bila terisi. */
export const buatMeasurementsPerPeriode = ({
  periode,
  dimensiStandards,
  visualStandards,
  measurementForm,
  selectedToolIds,
}: {
  periode: Periode;
  dimensiStandards: StandarPengukuran[];
  visualStandards: StandarPengukuran[];
  measurementForm: NilaiPengukuran;
  selectedToolIds: PilihanAlat;
}): MeasurementGroup[] => {
  const measurements: MeasurementGroup[] = [];

  dimensiStandards.forEach((titik) => {
    const group: MeasurementGroup = { standar_pengukuran_id: titik.id, values: [] };

    for (let i = 1; i <= jumlahSampelPerTitik(titik); i += 1) {
      const valueInput = measurementForm[buatKeyMeasurement(periode, 'dimensi', i, titik.id)] || '';
      const toolId = selectedToolIds[buatKeyTool(periode, 'dimensi', i, titik.id)] || titik.tools?.[0]?.id || 1;
      const { tipeInput, standarMin, standarMax, targetString, opsiRadio } = ambilKonfigurasiInput({
        periode,
        titik,
        sampel: i,
        selectedToolIds,
      });

      let judgement: Judgement = 'NG';
      if (valueInput.trim()) {
        if (tipeInput === 'number') {
          const angka = parseAngka(valueInput);
          if (!Number.isNaN(angka) && !Number.isNaN(standarMin) && !Number.isNaN(standarMax)) {
            judgement = angka < standarMin || angka > standarMax ? 'NG' : 'OK';
          }
        } else if (tipeInput === 'radio') {
          judgement = hitungJudgementRadio(valueInput, opsiRadio);
        } else {
          judgement = hitungJudgementNonAngka(valueInput, targetString);
        }
      }

      group.values.push({ value_input: valueInput, judgement, alat_ukur_id: toolId });
    }

    measurements.push(group);
  });

  visualStandards.forEach((titik) => {
    const group: MeasurementGroup = { standar_pengukuran_id: titik.id, values: [] };

    for (let i = 1; i <= jumlahSampelPerTitik(titik); i += 1) {
      const nilai = measurementForm[buatKeyMeasurement(periode, 'visual', i, titik.id)] || '';
      group.values.push({
        value_input: nilai,
        judgement: nilai.trim() ? 'NG' : 'OK',
        alat_ukur_id: titik.tools?.[0]?.id || 1,
      });
    }

    measurements.push(group);
  });

  return measurements;
};
