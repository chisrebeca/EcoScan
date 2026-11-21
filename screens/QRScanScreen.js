import React, { useState, useEffect, useRef, useContext } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Platform,
  Alert,
} from "react-native";
import { UserContext } from "../UserContext";
import Text from "../LocalizedText";
import BackButton from "../BackButton";

// Importăm din expo-camera în mod sigur (evitând eroarea pe Web)
let CameraView = null;
let useCameraPermissions = null;

if (Platform.OS !== "web") {
  try {
    const ExpoCamera = require("expo-camera");
    CameraView = ExpoCamera.CameraView;
    useCameraPermissions = ExpoCamera.useCameraPermissions;
  } catch (e) {
    console.log("Expo camera not available");
  }
}

export default function QRScanScreen() {
  const { recordCollection, selectedCollectionPoint, setCurrentScreen, t } = useContext(UserContext);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [awardedPoints, setAwardedPoints] = useState(0);

  // Hook-ul de permisiuni (returnează [permission, requestPermission])
  const [permission, requestPermission] = useCameraPermissions
    ? useCameraPermissions()
    : [null, null];

  // Valoare animată pentru linia de scanare
  const scanAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnim, {
          toValue: 200,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(scanAnim, {
          toValue: 0,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
      ]),
    ).start();
  }, [scanAnim]);

  // Dacă suntem pe mobil, verificăm dacă avem permisiunea de cameră
  if (Platform.OS !== "web" && useCameraPermissions) {
    if (!permission) {
      // Încă se încarcă starea permisiunii
      return <View style={styles.container} />;
    }

    if (!permission.granted) {
      // Ecranul care cere explicit acordul utilizatorului pentru cameră
      return (
        <View style={styles.permissionContainer}>
          <BackButton floating dark />
          <Text style={styles.permissionTitle}>📷 Acces la Cameră</Text>
          <Text style={styles.permissionText}>
            Această aplicație are nevoie de acces la camera foto pentru a putea
            scana codurile QR ale aparatelor de reciclare SGR.
          </Text>
          <TouchableOpacity
            style={styles.btnPrimary}
            onPress={requestPermission}
          >
            <Text style={styles.btnText}>Permite Accesul la Cameră</Text>
          </TouchableOpacity>
        </View>
      );
    }
  }

  const completeScan = async (data) => {
    if (isSuccess || isSubmitting) return;
    setIsSubmitting(true);
    try {
      // Aparatele SGR folosesc formate QR diferite. Păstrăm codul primit, dar îl
      // legăm de punctul ales pentru a preveni folosirea lui la alt aparat.
      const pointId = selectedCollectionPoint?.id || "direct-scan";
      const scanCode = `POINT:${pointId}:${String(data).trim().slice(0, 220)}`;
      const points = await recordCollection(scanCode);
      setAwardedPoints(points);
      setIsSuccess(true);
    } catch (error) {
      Alert.alert("Scanare nevalidă", error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBarCodeScanned = ({ data }) => completeScan(data);
  const handleFinishScan = () => {
    completeScan(`DEMO-${Date.now()}`);
  };

  return (
    <View style={styles.container}>
      {!isSuccess && <BackButton floating dark />}
      {!isSuccess ? (
        // Dacă suntem pe mobil și avem permisiune, pornim camera reală în spate
        Platform.OS !== "web" && CameraView ? (
          <CameraView
            style={StyleSheet.absoluteFillObject}
            facing="back"
            onBarcodeScanned={handleBarCodeScanned}
            barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
          >
            <View style={styles.overlay}>
              <Text style={styles.title}>{t("scanThisPoint")}</Text>
              <View style={styles.qrSimulator}>
                <View style={[styles.corner, styles.topLeft]} />
                <View style={[styles.corner, styles.topRight]} />
                <View style={[styles.corner, styles.bottomLeft]} />
                <View style={[styles.corner, styles.bottomRight]} />
                <Animated.View
                  style={[
                    styles.scanLine,
                    { transform: [{ translateY: scanAnim }] },
                  ]}
                />
              </View>
              <TouchableOpacity
                style={styles.btnAccent}
                onPress={handleFinishScan}
              >
                <Text style={styles.btnDarkText}>
                  Simulează / Forțează Scanarea
                </Text>
              </TouchableOpacity>
            </View>
          </CameraView>
        ) : (
          // Varianta pentru Web (sau dacă nu e disponibilă camera)
          <View style={styles.scannerWrapper}>
            <Text style={styles.title}>
              {t("scanThisPoint")}
            </Text>
            <Text style={styles.pointName}>{selectedCollectionPoint ? `Punct selectat: ${selectedCollectionPoint.name}` : "Scanare directă: punctul va fi asociat automat."}</Text>
            <View style={styles.qrSimulator}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
              <Animated.View
                style={[
                  styles.scanLine,
                  { transform: [{ translateY: scanAnim }] },
                ]}
              />
              <Text style={styles.qrText}>[ Scanner QR Activ ]</Text>
            </View>
            <TouchableOpacity
              style={styles.btnAccent}
              onPress={handleFinishScan}
            >
                <Text style={styles.btnDarkText}>{isSubmitting ? "Se verifică..." : "📷 Simulează Scanarea QR"}</Text>
            </TouchableOpacity>
          </View>
        )
      ) : (
        // Ecranul de Succes / Felicitări
        <View style={styles.successBox}>
          <View style={styles.iconContainer}>
            <Text style={styles.successEmoji}>🎉</Text>
          </View>
          <Text style={styles.successTitle}>Felicitări!</Text>
          <Text style={styles.successSubtitle}>
            Ai reciclat cu succes ambalajul!
          </Text>
          <View style={styles.rewardBadge}>
            <Text style={styles.rewardText}>
              +{awardedPoints} puncte adăugate în cont 🪙
            </Text>
          </View>
          <TouchableOpacity
            style={styles.btnPrimary}
            onPress={() => setCurrentScreen("Vouchers")}
          >
            <Text style={styles.btnText}>{t("vouchers")}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.btnSecondary}
            onPress={() => setCurrentScreen("Home")}
          >
            <Text style={styles.btnSecondaryText}>{t("home")}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: "#121212",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  permissionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 12,
    textAlign: "center",
  },
  permissionText: {
    color: "#cccccc",
    fontSize: 15,
    textAlign: "center",
    marginBottom: 25,
    lineHeight: 22,
  },
  scannerWrapper: { alignItems: "center", width: "100%" },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 18,
    color: "#ffffff",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 25,
  },
  pointName: { color: "#d8f3dc", textAlign: "center", marginTop: -15, marginBottom: 15, fontSize: 12 },
  qrSimulator: {
    width: 250,
    height: 250,
    borderWidth: 1,
    borderColor: "transparent",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
    position: "relative",
    overflow: "hidden",
  },
  scanLine: {
    position: "absolute",
    top: 20,
    left: 10,
    right: 10,
    height: 3,
    backgroundColor: "#38b000",
    shadowColor: "#38b000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
    elevation: 5,
  },
  corner: {
    position: "absolute",
    width: 20,
    height: 20,
    borderColor: "#38b000",
  },
  topLeft: { top: 10, left: 10, borderTopWidth: 3, borderLeftWidth: 3 },
  topRight: { top: 10, right: 10, borderTopWidth: 3, borderRightWidth: 3 },
  bottomLeft: {
    bottom: 10,
    left: 10,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
  },
  bottomRight: {
    bottom: 10,
    right: 10,
    borderBottomWidth: 3,
    borderRightWidth: 3,
  },
  qrText: { color: "#ffffff", fontSize: 14, fontWeight: "bold", marginTop: 10 },
  btnAccent: {
    backgroundColor: "#d4a373",
    padding: 16,
    borderRadius: 12,
    marginTop: 35,
    width: "100%",
    alignItems: "center",
  },
  btnDarkText: { color: "#121212", fontWeight: "bold", fontSize: 15 },
  successBox: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 30,
    borderRadius: 20,
    elevation: 5,
    width: "100%",
  },
  iconContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#e8f5e9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  successEmoji: { fontSize: 45 },
  successTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#1b4332",
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 15,
    color: "#555555",
    textAlign: "center",
    marginBottom: 20,
  },
  rewardBadge: {
    backgroundColor: "#fefae0",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#dda15e",
    marginBottom: 25,
  },
  rewardText: { color: "#bc6c25", fontWeight: "bold", fontSize: 15 },
  btnPrimary: {
    backgroundColor: "#2d6a4f",
    padding: 14,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
    marginBottom: 10,
  },
  btnText: { color: "#ffffff", fontWeight: "bold", fontSize: 15 },
  btnSecondary: {
    backgroundColor: "#e8f5e9",
    padding: 14,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
  },
  btnSecondaryText: { color: "#2d6a4f", fontWeight: "bold", fontSize: 15 },
});
