import React from 'react';
import { Stack } from 'expo-router';
import Colors from '../../../constants/Colors';

export default function KaizenLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.primary,
        },
        headerTintColor: Colors.white,
        headerTitleStyle: {
          fontWeight: '700',
        },
        headerShadowVisible: false,
        animation: 'slide_from_right', // Smooth transition
      }}
    >
      <Stack.Screen 
        name="index" 
        options={{ 
          headerShown: false, // Menu Kaizen uses custom header
        }} 
      />
      <Stack.Screen 
        name="dashboard" 
        options={{ 
          title: 'Dashboard',
          headerBackVisible: true,
        }} 
      />
      <Stack.Screen 
        name="buat" 
        options={{ 
          title: 'Buat',
          headerBackVisible: true,
        }} 
      />
      <Stack.Screen 
        name="list" 
        options={{ 
          title: 'Daftar Kaizen',
          headerBackVisible: true,
        }} 
      />
      <Stack.Screen 
        name="[id]" 
        options={{ 
          title: 'Detail Kaizen',
          headerBackVisible: true,
        }} 
      />
    </Stack>
  );
}
