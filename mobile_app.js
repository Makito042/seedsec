import React, { useState } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export default function App() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [diagnostics, setDiagnostics] = useState(null);

  // Trigger Image selection from Camera Roll
  const pickImage = async () => {
    let permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert("Permission Denied", "Camera roll permissions are required to scan seeds.");
      return;
    }

    let pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!pickerResult.canceled) {
      setSelectedImage(pickerResult.assets[0].uri);
      setDiagnostics(null); // Reset metrics
    }
  };

  // Run mock inference corresponding to Online and Offline specs
  const runInference = () => {
    if (!selectedImage) {
      Alert.alert("No Image Selected", "Please take or pick a seed image first.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (isOnline) {
        setDiagnostics({
          engine: "YOLOv8 Vigor Model (Online Cloud)",
          class: "Germinated (Vigor 3)",
          confidence: "96.2%",
          latency: "31.2 ms",
          size: "6.3 MB",
          advisory: "This maize seed shows healthy root emergence. Recommended for field planting. Apply initial DAP fertilizer during standard sowing."
        });
      } else {
        setDiagnostics({
          engine: "YOLOv8 Edge Model (Offline TFLite)",
          class: "Germinating (Vigor 2)",
          confidence: "89.5%",
          latency: "78.5 ms",
          size: "3.1 MB",
          advisory: "Offline local model identifies moderate vigor. Seed is viable, but check soil moisture before field sowing."
        });
      }
    }, 800);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🌱 SeedSec Rwanda</Text>
        <Text style={styles.subtitle}>Hybrid Diagnostics (Offline/Online)</Text>
      </View>

      {/* Network Switch Toggle */}
      <TouchableOpacity 
        style={[styles.toggleBtn, !isOnline && styles.toggleBtnOffline]} 
        onPress={() => {
          setIsOnline(!isOnline);
          setDiagnostics(null);
        }}
      >
        <Text style={styles.toggleText}>
          {isOnline ? "🟢 Running Online (FastAPI Cloud)" : "🟡 Running Offline (TFLite Edge)"}
        </Text>
        <Text style={styles.toggleSubtext}>Tap to toggle networks</Text>
      </TouchableOpacity>

      {/* Camera / Upload Area */}
      <TouchableOpacity style={styles.imageCard} onPress={pickImage}>
        {selectedImage ? (
          <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
        ) : (
          <View style={styles.placeholderContainer}>
            <Text style={styles.placeholderIcon}>📸</Text>
            <Text style={styles.placeholderText}>Tap to Select Seed Sample Photo</Text>
            <Text style={styles.placeholderSubtext}>Supports Maize and Vegetable Species</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Action CTA Button */}
      <TouchableOpacity style={styles.actionBtn} onPress={runInference}>
        <Text style={styles.actionBtnText}>⚡ Start Scan Diagnosis</Text>
      </TouchableOpacity>

      {/* Loader */}
      {loading && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#67c23a" />
          <Text style={styles.loaderText}>Processing Seed Inference...</Text>
        </View>
      )}

      {/* Diagnostics Results card */}
      {diagnostics && !loading && (
        <View style={styles.resultsCard}>
          <Text style={styles.resultsTitle}>📊 Scan Evaluation Results</Text>
          
          <View style={styles.metricsGrid}>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Detected Class</Text>
              <Text style={styles.metricValue}>{diagnostics.class}</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Confidence</Text>
              <Text style={styles.metricValue}>{diagnostics.confidence}</Text>
            </View>
          </View>

          <View style={styles.advisoryBox}>
            <Text style={styles.advisoryTitle}>💡 Action Advisory</Text>
            <Text style={styles.advisoryText}>{diagnostics.advisory}</Text>
          </View>

          <View style={styles.specsBox}>
            <Text style={styles.specText}>Engine: {diagnostics.engine}</Text>
            <Text style={styles.specText}>Model Weight Size: {diagnostics.size}</Text>
            <Text style={styles.specText}>Local Inference Latency: {diagnostics.latency}</Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b1308',
  },
  contentContainer: {
    padding: 20,
    alignItems: 'center',
  },
  header: {
    marginTop: 40,
    marginBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#f0f7ed',
  },
  subtitle: {
    fontSize: 14,
    color: '#a6c09b',
    marginTop: 4,
  },
  toggleBtn: {
    backgroundColor: 'rgba(103, 194, 58, 0.15)',
    borderWidth: 1,
    borderColor: '#67c23a',
    borderRadius: 12,
    padding: 12,
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  toggleBtnOffline: {
    backgroundColor: 'rgba(230, 162, 60, 0.15)',
    borderColor: '#e6a23c',
  },
  toggleText: {
    color: '#f0f7ed',
    fontWeight: 'bold',
    fontSize: 15,
  },
  toggleSubtext: {
    color: '#a6c09b',
    fontSize: 11,
    marginTop: 2,
  },
  imageCard: {
    width: '100%',
    height: 250,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 2,
    borderColor: 'rgba(94, 153, 71, 0.2)',
    borderStyle: 'dashed',
    borderRadius: 20,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  placeholderContainer: {
    alignItems: 'center',
    padding: 20,
  },
  placeholderIcon: {
    fontSize: 48,
    marginBottom: 10,
  },
  placeholderText: {
    color: '#f0f7ed',
    fontWeight: '600',
    fontSize: 16,
    textAlign: 'center',
  },
  placeholderSubtext: {
    color: '#a6c09b',
    fontSize: 12,
    marginTop: 5,
    textAlign: 'center',
  },
  actionBtn: {
    backgroundColor: '#67c23a',
    borderRadius: 15,
    paddingVertical: 15,
    paddingHorizontal: 30,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#67c23a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
    marginBottom: 20,
  },
  actionBtnText: {
    color: '#0b1308',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loaderContainer: {
    marginVertical: 20,
    alignItems: 'center',
  },
  loaderText: {
    color: '#a6c09b',
    fontSize: 14,
    marginTop: 10,
  },
  resultsCard: {
    width: '100%',
    backgroundColor: 'rgba(22, 38, 18, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(94, 153, 71, 0.2)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 40,
  },
  resultsTitle: {
    color: '#f0f7ed',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  metricItem: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 5,
  },
  metricLabel: {
    color: '#a6c09b',
    fontSize: 11,
    textTransform: 'uppercase',
  },
  metricValue: {
    color: '#f0f7ed',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 4,
  },
  advisoryBox: {
    backgroundColor: 'rgba(103, 194, 58, 0.05)',
    borderLeftWidth: 4,
    borderColor: '#67c23a',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
  },
  advisoryTitle: {
    color: '#67c23a',
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 4,
  },
  advisoryText: {
    color: '#f0f7ed',
    fontSize: 13,
    lineHeight: 18,
  },
  specsBox: {
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    paddingTop: 10,
  },
  specText: {
    color: '#a6c09b',
    fontSize: 11,
    marginBottom: 4,
  },
});
