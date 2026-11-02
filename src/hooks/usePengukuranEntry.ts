/**
 * Orkestrator layar input pengukuran: menyatukan konteks part/proses, state form, draf, pilihan checker,
 * pratinjau drawing, dan alur kirim, lalu mengembalikan satu objek datar untuk layar.
 *
 * @param idPart    id part dari rute
 * @param idProses  id proses dari rute (boleh kosong saat dibuka dari draf)
 * @param idDraf    id draf bila layar dibuka dari daftar draf
 */
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { dialog } from '../components/common/AppDialog';
import { useAuth } from '../contexts/AuthContext';
import { buatPayloadPengukuran, pengukuranService } from '../services/pengukuranService';
import { drafPengukuran } from '../utils/drafPengukuran';
import { ambilIdProsesAngka, ambilNamaProsesDraft, cekAdaNilaiOutOfRange } from '../utils/pengukuran';
import { ProsesDraf, useKonteksPengukuran } from './useKonteksPengukuran';
import { useFormPengukuran } from './useFormPengukuran';
import { useDrafEntri } from './useDrafEntri';
import { useCariChecker } from './useCariChecker';

export function usePengukuranEntry({ idPart, idProses, idDraf }: { idPart?: string; idProses?: string; idDraf?: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const nik = user?.nik;

  const [prosesDraf, setProsesDraf] = useState<ProsesDraf>({ id: null, nama: '' });
  const [mengirim, setMengirim] = useState(false);
  const [indexGambar, setIndexGambar] = useState<number | null>(null);
  const [checkerTerbuka, setCheckerTerbuka] = useState(false);

  const konteks = useKonteksPengukuran({ idPart, idProses, prosesDraf });
  const form = useFormPengukuran({
    isFinalInspection: konteks.isFinalInspection,
    dimensiStandards: konteks.dimensiStandards,
    visualStandards: konteks.visualStandards,
  });
  const checker = useCariChecker(checkerTerbuka);
  const { detailPart } = konteks;

  const kumpulkanDraf = useCallback(() => {
    if (!detailPart) return null;
    return {
      partId: detailPart.id,
      partCode: detailPart.kode,
      partName: detailPart.nama,
      customer: detailPart.nama_customer || '-',
      processId: konteks.idProsesTerpilih,
      processName: konteks.namaProsesTerpilih || konteks.daftarNamaProsesAktif[0] || '',
      process: konteks.daftarNamaProsesAktif.join(', '),
      formInfo: form.formInfo,
      activePeriod: form.periodeInputAktif,
      activePeriods: form.daftarPeriodePengisian,
      measurements: form.measurementForm,
      selectedTools: form.selectedToolIds,
    };
  }, [detailPart, konteks, form]);

  const ringkasPeriode = konteks.isFinalInspection ? 'Final' : form.daftarPeriodePengisian.join('+');
  const draf = useDrafEntri({
    nik,
    namaDefault: `Draf ${detailPart?.kode || idPart || ''} - ${ringkasPeriode}`,
    kumpulkan: kumpulkanDraf,
  });

  // Dibuka dari daftar draf: isi form dari draf itu.
  const { hidrasiDariDraf } = form;
  const { hidrasi: hidrasiDrafAktif } = draf;
  useEffect(() => {
    if (!idDraf) return;
    let batal = false;
    drafPengukuran.ambil(nik, idDraf).then((ditemukan) => {
      if (batal) return;
      if (!ditemukan) {
        dialog.alert('Draf tidak ditemukan', 'Draf mungkin sudah dihapus atau kedaluwarsa.', 'danger');
        return;
      }
      hidrasiDariDraf(ditemukan);
      hidrasiDrafAktif(ditemukan);
      setProsesDraf({ id: ambilIdProsesAngka(ditemukan.processId), nama: ambilNamaProsesDraft(ditemukan) });
    });
    return () => {
      batal = true;
    };
  }, [idDraf, nik, hidrasiDariDraf, hidrasiDrafAktif]);

  const kirimKeApi = useCallback(async () => {
    if (mengirim || !detailPart) return;

    const adaDiLuarRange = cekAdaNilaiOutOfRange({
      daftarPeriodePengisian: form.daftarPeriodePengisian,
      dimensiStandards: konteks.dimensiStandards,
      measurementForm: form.measurementForm,
      selectedToolIds: form.selectedToolIds,
    });
    const lanjut = await dialog.confirm({
      title: 'Konfirmasi pengiriman',
      message: adaDiLuarRange
        ? 'Ada nilai pengukuran di luar range standar. Apakah Anda yakin ingin melanjutkan pengiriman?'
        : 'Anda yakin ingin mengirim data pengukuran ini? Harap cek kembali sebelum mengirim.',
      confirmText: 'Kirim',
      destructive: adaDiLuarRange,
    });
    if (!lanjut) return;

    setMengirim(true);
    try {
      const hasil = await pengukuranService.kirim(
        buatPayloadPengukuran({
          isFinalInspection: konteks.isFinalInspection,
          detailPart,
          idProses: konteks.idProsesTerpilih,
          formInfo: form.formInfo,
          daftarPeriodePengisian: form.daftarPeriodePengisian,
          dimensiStandards: konteks.dimensiStandards,
          visualStandards: konteks.visualStandards,
          measurementForm: form.measurementForm,
          selectedToolIds: form.selectedToolIds,
        })
      );
      await draf.hapusAktif();
      queryClient.invalidateQueries({ queryKey: ['pengukuran', 'terkirim'] });
      await dialog.alert('Berhasil', `Data pengukuran berhasil dikirim. Nomor: ${hasil.kode_unik || '-'}`, 'success');
      router.replace('/services/pengukuran/terkirim' as never);
    } catch (e) {
      await dialog.alert('Gagal mengirim', e instanceof Error ? e.message : 'Terjadi kesalahan saat mengirim data.', 'danger');
    } finally {
      setMengirim(false);
    }
  }, [mengirim, detailPart, konteks, form, draf, queryClient, router]);

  const { reset: resetChecker } = checker;
  const bukaChecker = useCallback(() => setCheckerTerbuka(true), []);
  const tutupChecker = useCallback(() => {
    setCheckerTerbuka(false);
    resetChecker();
  }, [resetChecker]);
  const tutupGambar = useCallback(() => setIndexGambar(null), []);

  return {
    // konteks
    memuat: konteks.memuat,
    error: konteks.error,
    muat: konteks.muat,
    detailPart,
    isFinalInspection: konteks.isFinalInspection,
    dimensiStandards: konteks.dimensiStandards,
    visualStandards: konteks.visualStandards,
    drawingSlides: konteks.drawingSlides,
    labelProsesAktif: konteks.labelProsesAktif,
    totalStandarAktif: konteks.totalStandarAktif,
    // form
    formInfo: form.formInfo,
    daftarPeriodePengisian: form.daftarPeriodePengisian,
    periodeInputAktif: form.periodeInputAktif,
    canDraft: form.canDraft,
    canSubmit: form.canSubmit,
    invalidFormatAngkaPeriode: form.invalidFormatAngkaPeriode,
    outOfRangePeriode: form.outOfRangePeriode,
    jumlahPeriodeLengkap: form.jumlahPeriodeLengkap,
    ambilStatusPeriode: form.ambilStatusPeriode,
    ambilJamPeriode: form.ambilJamPeriode,
    ambilNilaiPerSampel: form.ambilNilaiPerSampel,
    ambilNilaiVisualPerSampel: form.ambilNilaiVisualPerSampel,
    ambilToolTerpilihId: form.ambilToolTerpilihId,
    ubahFormInfo: form.ubahFormInfo,
    ubahJamPeriode: form.ubahJamPeriode,
    ubahNilaiDimensi: form.ubahNilaiDimensi,
    ubahNilaiVisual: form.ubahNilaiVisual,
    ubahToolDimensi: form.ubahToolDimensi,
    togglePeriodeAktif: form.togglePeriodeAktif,
    setPeriodeAktif: form.setPeriodeAktif,
    // draf
    menyimpanDraf: draf.menyimpan,
    simpanDraf: draf.simpan,
    // pratinjau drawing
    indexGambar,
    bukaGambar: setIndexGambar,
    tutupGambar,
    // checker
    checkerTerbuka,
    bukaChecker,
    tutupChecker,
    daftarChecker: checker.daftarChecker,
    kataCariChecker: checker.kataCari,
    setKataCariChecker: checker.setKataCari,
    memuatChecker: checker.memuat,
    // kirim
    mengirim,
    kirimKeApi,
  };
}
