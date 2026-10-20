/**
 * ServiceGrid — grid layanan 4 kolom di beranda, maksimal 2 baris.
 * Layanan yang tidak muat dimasukkan ke bottom sheet lewat tombol "Lainnya".
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import BottomSheet from '../common/BottomSheet';
import ServiceIcon from '../common/ServiceIcon';
import SectionHeader from '../common/SectionHeader';
import { SERVICES, ServiceItem } from '../../../constants/Services';
import { brand } from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { gs } from '../../../constants/GlobalStyles';

const KOLOM = 4;
const MAKS_BARIS = 2;
const MAKS_ITEM = KOLOM * MAKS_BARIS;

const TOMBOL_LAINNYA: ServiceItem = {
  id: 'lainnya',
  name: 'Lainnya',
  icon: 'layout-grid-circles',
  backgroundColor: brand[50],
  iconColor: '#1fc2a8',
  route: '',
  description: 'Layanan lainnya',
};

interface ServiceGridProps {
  searchQuery?: string;
}

export default function ServiceGrid({ searchQuery = '' }: ServiceGridProps) {
  const router = useRouter();
  const [sheetTerbuka, setSheetTerbuka] = useState(false);

  const filteredServices = SERVICES.filter((service) =>
    service.name.toLowerCase().replace(/\n/g, ' ').includes(searchQuery.toLowerCase())
  );

  // Kalau muat di 2 baris tampilkan semua; kalau tidak, sisakan satu slot
  // untuk tombol "Lainnya" dan lempar sisanya ke sheet.
  const muat = filteredServices.length <= MAKS_ITEM;
  const tampil = muat ? filteredServices : filteredServices.slice(0, MAKS_ITEM - 1);
  const sisa = muat ? [] : filteredServices.slice(MAKS_ITEM - 1);

  const bukaLayanan = (service: ServiceItem) => {
    setSheetTerbuka(false);
    router.push(service.route as any);
  };

  return (
    <View style={styles.section}>
      <SectionHeader title="Layanan" />

      {filteredServices.length === 0 ? (
        <Text style={[gs.emptyText, gs.containerX]}>
          Tidak ada layanan yang cocok dengan pencarianmu.
        </Text>
      ) : (
        <View style={styles.grid}>
          {tampil.map((service) => (
            <ServiceIcon key={service.id} service={service} />
          ))}
          {sisa.length > 0 && (
            <ServiceIcon service={TOMBOL_LAINNYA} onPress={() => setSheetTerbuka(true)} />
          )}
        </View>
      )}

      <BottomSheet
        visible={sheetTerbuka}
        onClose={() => setSheetTerbuka(false)}
        title="Layanan Lainnya"
      >
        <View style={styles.grid}>
          {sisa.map((service) => (
            <ServiceIcon
              key={service.id}
              service={service}
              onPress={() => bukaLayanan(service)}
            />
          ))}
        </View>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: Spacing.lg,
  },
  grid: {
    // Baris terakhir membawa margin bawah sendiri; dibatalkan agar jarak antar section rata.
    marginBottom: -Spacing.xl,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    paddingHorizontal: Spacing.md,
  },
});
