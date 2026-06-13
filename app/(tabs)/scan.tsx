import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import Colors from '../../constants/Colors';
import Spacing from '../../constants/Spacing';

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const router = useRouter();

  if (!permission) {
    return (
      <View style={[styles.permissionContainer, { backgroundColor: '#000' }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.message}>Kami memerlukan izin kamera Anda untuk memindai aset.</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Izinkan Kamera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleBarcodeScanned = ({ type, data }: { type: string; data: string }) => {
    if (scanned) return;
    setScanned(true);

    let nomorAset = data;
    
    // Jika data adalah URL, ekstrak nomornya
    // Contoh: http://localhost/aset/012500320002/scan
    if (data.includes('/aset/')) {
       const parts = data.split('/');
       const asetIndex = parts.indexOf('aset');
       if (asetIndex !== -1 && parts.length > asetIndex + 1) {
           nomorAset = parts[asetIndex + 1];
       }
    }

    // Pindah ke halaman hasil dengan membawa nomor
    router.push({
      pathname: '/scan-result',
      params: { nomor: nomorAset }
    });

    // Reset scanner setelah 3 detik jika user kembali
    setTimeout(() => {
      setScanned(false);
    }, 3000);
  };

  return (
    <View style={styles.container}>
      <CameraView 
        style={StyleSheet.absoluteFillObject} 
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
      />
      
      {/* Gojek Style Overlay */}
      <View style={styles.overlayWrapper}>
        <View style={styles.overlayTop} />
        <View style={styles.overlayMiddle}>
          <View style={styles.overlaySide} />
          
          <View style={styles.scanBoxContainer}>
            <View style={styles.scanBox}>
              {/* Corner brackets for scanner effect */}
              <View style={[styles.corner, styles.cornerTL]} />
              <View style={[styles.corner, styles.cornerTR]} />
              <View style={[styles.corner, styles.cornerBL]} />
              <View style={[styles.corner, styles.cornerBR]} />
            </View>
          </View>
          
          <View style={styles.overlaySide} />
        </View>
        <View style={styles.overlayBottom}>
          <Text style={styles.scanText}>Arahkan kamera ke QR Code Aset</Text>
        </View>
      </View>
    </View>
  );
}

const overlayColor = 'rgba(0, 0, 0, 0.6)'; // Dark overlay for outside
const cornerLength = 30;
const cornerWidth = 4;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
    lineHeight: 24,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: 100,
  },
  buttonText: {
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  overlayWrapper: {
    ...StyleSheet.absoluteFillObject,
  },
  overlayTop: {
    flex: 1,
    backgroundColor: overlayColor,
  },
  overlayBottom: {
    flex: 1,
    backgroundColor: overlayColor,
    alignItems: 'center',
    paddingTop: 40,
  },
  overlayMiddle: {
    flexDirection: 'row',
    height: 250, // Height of the scan box
  },
  overlaySide: {
    flex: 1,
    backgroundColor: overlayColor,
  },
  scanBoxContainer: {
    width: 250,
    height: 250,
    backgroundColor: 'transparent',
  },
  scanBox: {
    flex: 1,
    backgroundColor: 'transparent',
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    borderColor: '#00AA13', // Gojek Green
  },
  cornerTL: {
    top: 0,
    left: 0,
    width: cornerLength,
    height: cornerLength,
    borderTopWidth: cornerWidth,
    borderLeftWidth: cornerWidth,
    borderTopLeftRadius: 12,
  },
  cornerTR: {
    top: 0,
    right: 0,
    width: cornerLength,
    height: cornerLength,
    borderTopWidth: cornerWidth,
    borderRightWidth: cornerWidth,
    borderTopRightRadius: 12,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    width: cornerLength,
    height: cornerLength,
    borderBottomWidth: cornerWidth,
    borderLeftWidth: cornerWidth,
    borderBottomLeftRadius: 12,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    width: cornerLength,
    height: cornerLength,
    borderBottomWidth: cornerWidth,
    borderRightWidth: cornerWidth,
    borderBottomRightRadius: 12,
  },
  scanText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '600',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    overflow: 'hidden',
  }
});
