import React, { useContext, useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";

import * as ImagePicker from "expo-image-picker";
import { UserContext } from "../UserContext";
import Text from "../LocalizedText";
import BackButton from "../BackButton";

// Adresa backend-ului pentru testarea pe calculator
const API_URL = "http://127.0.0.1:8000";

const CATEGORIES = [
  { key: "BIODEGRADABLE", label: "Biodegradabil", icon: "🌱" },
  { key: "CARDBOARD", label: "Carton", icon: "📦" },
  { key: "GLASS", label: "Sticlă", icon: "🍾" },
  { key: "METAL", label: "Metal", icon: "🥫" },
  { key: "PAPER", label: "Hârtie", icon: "📄" },
  { key: "PLASTIC", label: "Plastic", icon: "🧴" },
];

export default function AIScanScreen() {
  const { t } = useContext(UserContext);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  // Selectare imagine din galerie
  const selectImage = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Permisiune necesară",
          "Trebuie să permiți accesul la galerie.",
        );
        return;
      }

      const response = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: false,
        quality: 0.85,
      });

      if (!response.canceled && response.assets?.length > 0) {
        setImage(response.assets[0]);
        setResult(null);
        setErrorMessage("");
      }
    } catch (error) {
      Alert.alert("Eroare", "Nu am putut deschide galeria.");
    }
  };

  // Fotografiere cu camera
  const takePhoto = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Permisiune necesară",
          "Trebuie să permiți accesul la cameră.",
        );
        return;
      }

      const response = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        allowsEditing: false,
        quality: 0.85,
      });

      if (!response.canceled && response.assets?.length > 0) {
        setImage(response.assets[0]);
        setResult(null);
        setErrorMessage("");
      }
    } catch (error) {
      Alert.alert("Eroare", "Nu am putut deschide camera.");
    }
  };

  // Construiește FormData compatibil cu Web și React Native
  const createFormData = async () => {
    const formData = new FormData();

    const fileName = image.fileName || `ecoscan_${Date.now()}.jpg`;

    const mimeType = image.mimeType || "image/jpeg";

    if (Platform.OS === "web") {
      // În browser trimitem fotografia ca Blob
      let blob;

      if (image.file) {
        blob = image.file;
      } else {
        const imageResponse = await fetch(image.uri);

        if (!imageResponse.ok) {
          throw new Error("Nu am putut încărca fotografia selectată.");
        }

        blob = await imageResponse.blob();
      }

      formData.append("file", blob, fileName);
    } else {
      // Pe Android/iOS folosim obiectul React Native
      formData.append("file", {
        uri: image.uri,
        name: fileName,
        type: mimeType,
      });
    }

    return formData;
  };

  // Extragerea mesajului de eroare din FastAPI
  const getErrorMessage = (detail) => {
    if (typeof detail === "string") {
      return detail;
    }

    if (Array.isArray(detail)) {
      return detail.map((item) => item.msg || JSON.stringify(item)).join(", ");
    }

    if (detail && typeof detail === "object") {
      return JSON.stringify(detail);
    }

    return "A apărut o eroare la analiza fotografiei.";
  };

  // Trimiterea fotografiei către FastAPI
  const analyzeImage = async () => {
    if (!image) {
      Alert.alert("Atenție", "Selectează sau fotografiază o imagine.");
      return;
    }

    setLoading(true);
    setResult(null);
    setErrorMessage("");

    try {
      const formData = await createFormData();

      const response = await fetch(`${API_URL}/api/ai/detect`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(getErrorMessage(data.detail || data.error));
      }

      if (data.success === false) {
        throw new Error(data.error || "Analiza AI nu a reușit.");
      }

      setResult(data);
    } catch (error) {
      console.error("EcoScan AI error:", error);

      setErrorMessage(error.message || "Nu am putut contacta serverul EcoScan.");
    } finally {
      setLoading(false);
    }
  };

  // Resetarea scanării
  const resetScan = () => {
    setImage(null);
    setResult(null);
    setErrorMessage("");
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <BackButton />
      <Text style={styles.title}>{t("scanAi")}</Text>

      <Text style={styles.subtitle}>
        Fotografiază mai multe deșeuri simultan. Inteligența artificială EcoScan
        va încerca să identifice materialele reciclabile.
      </Text>

      {/* Fotografia selectată */}
      <View style={styles.imageContainer}>
        {image ? (
          <Image
            source={{ uri: image.uri }}
            style={styles.preview}
            resizeMode="contain"
          />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.cameraIcon}>📸</Text>

            <Text style={styles.placeholderTitle}>
              Nicio fotografie selectată
            </Text>

            <Text style={styles.placeholderText}>
              Fotografiază deșeurile sau alege o imagine din galerie.
            </Text>
          </View>
        )}
      </View>

      {/* Cameră și galerie */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={takePhoto}
          disabled={loading}
        >
          <Text style={styles.secondaryButtonText}>📷 Cameră</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={selectImage}
          disabled={loading}
        >
          <Text style={styles.secondaryButtonText}>🖼️ Galerie</Text>
        </TouchableOpacity>
      </View>

      {/* Buton analiză */}
      <TouchableOpacity
        style={[
          styles.primaryButton,
          (!image || loading) && styles.disabledButton,
        ]}
        onPress={analyzeImage}
        disabled={!image || loading}
      >
        {loading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color="#ffffff" />

            <Text style={styles.primaryButtonText}>
              Se analizează fotografia...
            </Text>
          </View>
        ) : (
          <Text style={styles.primaryButtonText}>🤖 ANALIZEAZĂ CU AI</Text>
        )}
      </TouchableOpacity>

      {/* Mesaj eroare */}
      {errorMessage !== "" && (
        <View style={styles.errorBox}>
          <Text style={styles.errorTitle}>
            ⚠️ Nu am putut analiza fotografia
          </Text>

          <Text style={styles.errorText}>{errorMessage}</Text>

          <Text style={styles.errorHint}>
            Verifică dacă serverul FastAPI este pornit și dacă adresa API este
            configurată corect.
          </Text>
        </View>
      )}

      {/* Rezultatele AI */}
      {result && (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>♻️ Rezultatele scanării</Text>

          <View style={styles.totalCard}>
            <Text style={styles.totalLabel}>Total obiecte detectate</Text>

            <Text style={styles.totalNumber}>{result.total_objects ?? 0}</Text>
          </View>

          <Text style={styles.categoryTitle}>Materiale identificate</Text>

          {CATEGORIES.map((category) => {
            const count = result.counts?.[category.key] ?? 0;

            return (
              <View key={category.key} style={styles.categoryRow}>
                <Text style={styles.categoryIcon}>{category.icon}</Text>

                <Text style={styles.categoryName}>{category.label}</Text>

                <Text style={styles.categoryCount}>{count}</Text>
              </View>
            );
          })}

          <View style={styles.noticeBox}>
            <Text style={styles.noticeTitle}>ℹ️ Informație importantă</Text>

            <Text style={styles.noticeText}>
              Rezultatele sunt estimări realizate de inteligența artificială.
              Verifică materialele înainte de reciclare. Scanarea nu acordă
              automat puncte.
            </Text>
          </View>

          <TouchableOpacity style={styles.resetButton} onPress={resetScan}>
            <Text style={styles.resetButtonText}>SCANEAZĂ ALTE DEȘEURI</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4fbf7",
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  title: {
    fontSize: 25,
    fontWeight: "bold",
    color: "#1b4332",
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 14,
    color: "#666",
    lineHeight: 21,
    marginBottom: 20,
  },

  imageContainer: {
    height: 240,
    backgroundColor: "#ffffff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#d8f3dc",
    overflow: "hidden",
    marginBottom: 14,
  },

  preview: {
    width: "100%",
    height: "100%",
  },

  placeholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  cameraIcon: {
    fontSize: 48,
    marginBottom: 12,
  },

  placeholderTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1b4332",
    marginBottom: 6,
  },

  placeholderText: {
    fontSize: 13,
    color: "#777",
    textAlign: "center",
    lineHeight: 19,
  },

  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 14,
  },

  secondaryButton: {
    flex: 1,
    backgroundColor: "#d8f3dc",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },

  secondaryButtonText: {
    color: "#1b4332",
    fontWeight: "bold",
    fontSize: 14,
  },

  primaryButton: {
    backgroundColor: "#2d6a4f",
    padding: 17,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 18,
  },

  disabledButton: {
    opacity: 0.5,
  },

  primaryButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 15,
  },

  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  errorBox: {
    backgroundColor: "#fff0f0",
    borderRadius: 12,
    padding: 15,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#ffcaca",
  },

  errorTitle: {
    color: "#a12626",
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 8,
  },

  errorText: {
    color: "#8b2525",
    fontSize: 13,
    lineHeight: 19,
  },

  errorHint: {
    color: "#8b2525",
    fontSize: 12,
    marginTop: 8,
  },

  resultsContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#d8f3dc",
  },

  resultsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1b4332",
    marginBottom: 16,
  },

  totalCard: {
    backgroundColor: "#e8f5e9",
    borderRadius: 12,
    padding: 18,
    alignItems: "center",
    marginBottom: 20,
  },

  totalLabel: {
    fontSize: 14,
    color: "#355e48",
  },

  totalNumber: {
    fontSize: 38,
    fontWeight: "bold",
    color: "#1b4332",
    marginTop: 5,
  },

  categoryTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1b4332",
    marginBottom: 10,
  },

  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#edf5ef",
  },

  categoryIcon: {
    fontSize: 22,
    width: 38,
  },

  categoryName: {
    flex: 1,
    fontSize: 14,
    color: "#333",
  },

  categoryCount: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2d6a4f",
  },

  noticeBox: {
    backgroundColor: "#f4fbf7",
    padding: 14,
    borderRadius: 10,
    marginTop: 18,
  },

  noticeTitle: {
    fontWeight: "bold",
    color: "#1b4332",
    marginBottom: 6,
  },

  noticeText: {
    fontSize: 12,
    color: "#555",
    lineHeight: 19,
  },

  resetButton: {
    backgroundColor: "#1b4332",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 18,
  },

  resetButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 13,
  },
});
