import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X as CloseIcon, Zap } from 'lucide-react-native';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { setPhotoImage } from '../../services/imageDataService';

const { width } = Dimensions.get('window');
const BUTTON_SIZE = 72;
const FOCUS_BOX_SIZE = width * 0.75;

export default function CameraScreen() {
  const router = useRouter();
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [flash, setFlash] = useState<'on' | 'off'>('off');
  const insets = useSafeAreaInsets();
  const cameraRef = useRef<CameraView>(null);

  if (!permission) return null;
  if (!permission.granted) {
    return (
      <View style={styles.permissionWrapper}>
        <Text style={styles.permissionText}>Camera permission is required.</Text>
        <TouchableOpacity onPress={requestPermission} style={styles.permissionButton}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
      </View>
    );
  }

  const handleTakePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 1, // Start with high quality, will be compressed next
        });

        const compressedImage = await manipulateAsync(
          photo.uri,
          [{ resize: { width: 800 } }], // Resize to a reasonable width
          {
            compress: 0.7,
            format: SaveFormat.JPEG,
            base64: true,
          },
        );
        
        setPhotoImage(compressedImage.base64!);
        router.replace('/(protected)/home');

      } catch (e) {
        console.error('Failed to take picture:', e);
      }
    }
  };

  const renderOverlayCorners = () => {
    const cornerSize = 48;
    const border = 5;
    const positions = [
      { top: 0, left: 0, rotate: '0deg' },
      { top: 0, right: 0, rotate: '90deg' },
      { bottom: 0, left: 0, rotate: '-90deg' },
      { bottom: 0, right: 0, rotate: '180deg' },
    ];
    return positions.map((pos, idx) => (
      <View
        key={idx}
        style={{
          position: 'absolute',
          width: cornerSize,
          height: cornerSize,
          borderLeftWidth: border,
          borderTopWidth: border,
          borderColor: 'rgba(255,255,255,0.85)',
          transform: [{ rotate: pos.rotate }],
          ...pos,
        }}
      />
    ));
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing={facing}
        flash={flash}
        ref={cameraRef}
      />

      {/* Top Controls */}
      <View style={[styles.topBar, { paddingTop: insets.top + 12 }]}>
                <TouchableOpacity
          style={styles.roundButton}
          accessibilityLabel="Close camera"
          onPress={() => router.back()}
        >
          <CloseIcon color="#fff" size={24} />
                </TouchableOpacity>
              </View>

      {/* Focus Overlay */}
      <View style={styles.focusWrapper}>{renderOverlayCorners()}</View>

      {/* Bottom Controls */}
      <View style={[styles.bottomPanel, { paddingBottom: insets.bottom + 24 }]}>
              <TouchableOpacity
          onPress={() => setFlash(flash === 'on' ? 'off' : 'on')}
          style={styles.flashButton}
          accessibilityLabel="Toggle flash"
        >
          <Zap size={24} color={flash === 'on' ? '#facc15' : '#fff'} />
              </TouchableOpacity>
              
        <TouchableOpacity style={styles.shutter} accessibilityLabel="Take photo" onPress={handleTakePicture}>
          <View style={styles.shutterInner} />
        </TouchableOpacity>

        <View style={{ width: 48 }} />
        </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  permissionWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  permissionText: { fontSize: 16, color: '#fff', textAlign: 'center' },
  permissionButton: {
    marginTop: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  permissionButtonText: { color: '#111', fontWeight: '600', fontSize: 15 },
  topBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingHorizontal: 20,
  },
  roundButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  focusWrapper: {
    position: 'absolute',
    top: '25%',
    left: (width - FOCUS_BOX_SIZE) / 2,
    width: FOCUS_BOX_SIZE,
    height: FOCUS_BOX_SIZE,
  },
  bottomPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shutter: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    borderWidth: 6,
    borderColor: '#fff',
    marginHorizontal: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shutterInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'white',
  },
  flashButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 