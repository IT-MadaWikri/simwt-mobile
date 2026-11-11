/**
 * Input Pengukuran — mengisi pengukuran satu proses sebuah part: tab Info (lot/checker/shift/periode),
 * Dimensi, dan Visual. Bisa disimpan sebagai draf atau dikirim. Dibuka dari Pilih Proses, atau dari
 * Draf (param `draf`). Seluruh logika ada di `usePengukuranEntry`.
 */
import React, { useState } from 'react';
import { KeyboardAvoidingView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import AppBar from '../../../src/components/common/AppBar';
import Button from '../../../src/components/common/Button';
import KeadaanKosong from '../../../src/components/common/KeadaanKosong';
import SheetCari from '../../../src/components/common/SheetCari';
import { SkeletonForm } from '../../../src/components/common/Skeleton';
import BarAksiPengukuran from '../../../src/components/pengukuran/BarAksiPengukuran';
import CarouselDrawing from '../../../src/components/pengukuran/CarouselDrawing';
import FormInfoPengukuran from '../../../src/components/pengukuran/FormInfoPengukuran';
import InputTitikDimensi from '../../../src/components/pengukuran/InputTitikDimensi';
import InputTitikVisual from '../../../src/components/pengukuran/InputTitikVisual';
import ModalPreviewGambar from '../../../src/components/pengukuran/ModalPreviewGambar';
import PilihPeriode from '../../../src/components/pengukuran/PilihPeriode';
import SegmenPengukuran, { Segmen } from '../../../src/components/pengukuran/SegmenPengukuran';
import Colors from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { fonts, fontsJudul, ukuranIsi } from '../../../constants/Typography';
import { gs } from '../../../constants/GlobalStyles';
import { usePengukuranEntry } from '../../../src/hooks/usePengukuranEntry';
import Muncul from '../../../src/components/common/Muncul';

export default function InputPengukuranScreen() {
  const { idPart, idProses, draf } = useLocalSearchParams<{ idPart?: string; idProses?: string; draf?: string }>();
  const p = usePengukuranEntry({ idPart, idProses, idDraf: draf });
  const [segmen, setSegmen] = useState<Segmen>('info');
  const { detailPart } = p;

  if (p.memuat || !detailPart) {
    return (
      <View style={[gs.screen, { backgroundColor: Colors.white }]}>
        <AppBar judul="Input Pengukuran" />
        {p.error ? (
          <KeadaanKosong pose="mikir" judul="Gagal memuat" teks={p.error}>
            <Button label="Coba Lagi" onPress={p.muat} style={{ marginTop: Spacing.lg }} />
          </KeadaanKosong>
        ) : (
          <SkeletonForm />
        )}
      </View>
    );
  }

  const periodeInput = p.periodeInputAktif;
  const pilihPeriode = p.isFinalInspection ? null : (
    <PilihPeriode
      daftarPeriode={p.daftarPeriodePengisian}
      periodeAktif={periodeInput}
      ambilStatus={p.ambilStatusPeriode}
      ambilJam={p.ambilJamPeriode}
      onPilih={p.setPeriodeAktif}
      onUbahJam={p.ubahJamPeriode}
    />
  );

  return (
    <Muncul style={{ flex: 1 }}>
      <View style={[gs.screen, { backgroundColor: Colors.white }]}>
        <AppBar judul="Input Pengukuran" />

        <KeyboardAvoidingView style={gs.flex1} behavior="padding">
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: Spacing.xxl }}>
            <CarouselDrawing slides={p.drawingSlides} onPilih={p.bukaGambar} />

            <View style={styles.kepala}>
              <Text style={styles.nama}>{detailPart.nama}</Text>
              <Text style={styles.sub}>
                {[detailPart.kode, detailPart.nama_customer, `${p.totalStandarAktif} titik`].filter(Boolean).join(' · ')}
              </Text>
              <Text style={styles.sub}>Proses: {p.labelProsesAktif}</Text>
            </View>

            <SegmenPengukuran aktif={segmen} onUbah={setSegmen} />

            {segmen === 'info' ? (
              <FormInfoPengukuran
                isFinalInspection={p.isFinalInspection}
                lotNumber={p.formInfo.lotNumber}
                checkerName={p.formInfo.checkerName}
                shift={p.formInfo.shift}
                periodeAktif={p.daftarPeriodePengisian}
                onUbahLot={(lot) => p.ubahFormInfo('lotNumber', lot)}
                onUbahShift={(shift) => p.ubahFormInfo('shift', shift)}
                onTogglePeriode={p.togglePeriodeAktif}
                onBukaChecker={p.bukaChecker}
              />
            ) : null}

            {segmen === 'dimensi' ? (
              <View style={styles.isi}>
                {pilihPeriode}
                <Text style={styles.judul}>Dimensi</Text>
                {p.dimensiStandards.length === 0 ? <Text style={styles.sub}>Tidak ada item pengukuran</Text> : null}
                {p.dimensiStandards.map((titik) => (
                  <InputTitikDimensi
                    key={titik.id}
                    titik={titik}
                    nilaiPerSampel={p.ambilNilaiPerSampel(periodeInput, titik)}
                    toolId={p.ambilToolTerpilihId(periodeInput, titik)}
                    invalidSamples={p.invalidFormatAngkaPeriode[periodeInput]?.[titik.id]}
                    outOfRangeSamples={p.outOfRangePeriode[periodeInput]?.[titik.id]}
                    onUbahNilai={(index, nilai) => p.ubahNilaiDimensi(periodeInput, titik, index, nilai)}
                    onUbahTool={(toolId) => p.ubahToolDimensi(periodeInput, titik, toolId)}
                  />
                ))}
              </View>
            ) : null}

            {segmen === 'visual' ? (
              <View style={styles.isi}>
                {pilihPeriode}
                <Text style={styles.judul}>Visual</Text>
                <Text style={[styles.sub, { marginBottom: Spacing.md }]}>Jika NG, tulis detail pada kolom sample. Kosong = OK.</Text>
                {p.visualStandards.length === 0 ? <Text style={styles.sub}>Tidak ada item pengukuran</Text> : null}
                {p.visualStandards.map((titik) => (
                  <InputTitikVisual
                    key={titik.id}
                    nama={titik.nama_point}
                    drawing={titik.nomor_drawing}
                    alat={titik.tools[0]?.nama ?? ''}
                    nilaiPerSampel={p.ambilNilaiVisualPerSampel(periodeInput, titik)}
                    onUbahNilai={(index, nilai) => p.ubahNilaiVisual(periodeInput, titik, index, nilai)}
                  />
                ))}
              </View>
            ) : null}
          </ScrollView>

          <Button
            icon="image"
            onPress={() => p.bukaGambar(0)}
            style={styles.tombolDrawing}
            accessibilityLabel="Lihat drawing"
            variant="secondary"
          />
        </KeyboardAvoidingView>

        <BarAksiPengukuran
          tanpaPeriode={p.isFinalInspection}
          jumlahPeriodeLengkap={p.jumlahPeriodeLengkap}
          totalPeriode={p.daftarPeriodePengisian.length}
          bisaDraf={p.canDraft}
          bisaKirim={p.canSubmit}
          menyimpanDraf={p.menyimpanDraf}
          mengirim={p.mengirim}
          onDraf={p.simpanDraf}
          onKirim={p.kirimKeApi}
        />

        <ModalPreviewGambar indexAwal={p.indexGambar} slides={p.drawingSlides} onTutup={p.tutupGambar} />

        <SheetCari
          visible={p.checkerTerbuka}
          judul="Pilih checker"
          placeholder="Cari nama checker..."
          q={p.kataCariChecker}
          onChangeQ={p.setKataCariChecker}
          item={p.daftarChecker.map((c) => ({ kunci: c.name, judul: c.name, sub: c.nik, avatar: c.name }))}
          memuat={p.memuatChecker}
          gagal={false}
          minHuruf={0}
          onPilih={(nama) => p.ubahFormInfo('checkerName', nama)}
          onClose={p.tutupChecker}
        />
      </View>
    </Muncul>
  );
}

const styles = StyleSheet.create({
  kepala: { gap: 2, padding: Spacing.screenPadding, backgroundColor: Colors.white },
  nama: { fontFamily: fonts.bold, fontSize: 16, color: Colors.textPrimary },
  sub: { fontFamily: fonts.regular, fontSize: ukuranIsi, color: Colors.textSecondary },
  isi: { padding: Spacing.screenPadding, backgroundColor: Colors.white },
  judul: { marginBottom: Spacing.sm, fontFamily: fontsJudul.bold, fontSize: ukuranIsi, color: Colors.textPrimary },
  tombolDrawing: { position: 'absolute', right: Spacing.lg, bottom: Spacing.lg },
});
