/**
 * ServiceGrid — Gojek-style grid layout for 10 services
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import ServiceIcon from '../common/ServiceIcon';
import SectionHeader from '../common/SectionHeader';
import { SERVICES } from '../../../constants/Services';
import Colors from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';

interface ServiceGridProps {
  searchQuery?: string;
}

export default function ServiceGrid({ searchQuery = '' }: ServiceGridProps) {
  const filteredServices = SERVICES.filter(service => 
    service.name.toLowerCase().replace(/\n/g, ' ').includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <SectionHeader title="Layanan" />
      <View style={styles.grid}>
        {filteredServices.map((service) => (
          <ServiceIcon key={service.id} service={service} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.sectionGap,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    paddingHorizontal: Spacing.md, // Add a bit of padding for the edges
  },
});
