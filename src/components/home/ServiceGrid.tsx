/**
 * ServiceGrid — grid layanan 4 kolom di beranda.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ServiceIcon from '../common/ServiceIcon';
import SectionHeader from '../common/SectionHeader';
import { SERVICES } from '../../../constants/Services';
import Spacing from '../../../constants/Spacing';
import { gs } from '../../../constants/GlobalStyles';

interface ServiceGridProps {
  searchQuery?: string;
}

export default function ServiceGrid({ searchQuery = '' }: ServiceGridProps) {
  const filteredServices = SERVICES.filter((service) =>
    service.name.toLowerCase().replace(/\n/g, ' ').includes(searchQuery.toLowerCase())
  );

  return (
    <View style={gs.section}>
      <SectionHeader title="Layanan" />

      {filteredServices.length === 0 ? (
        <Text style={[gs.emptyText, gs.containerX]}>
          Tidak ada layanan yang cocok dengan pencarianmu.
        </Text>
      ) : (
        <View style={styles.grid}>
          {filteredServices.map((service) => (
            <ServiceIcon key={service.id} service={service} />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    paddingHorizontal: Spacing.md,
  },
});
