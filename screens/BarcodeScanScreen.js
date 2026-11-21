import React, { useEffect, useRef, useContext } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
} from "react-native";
import { UserContext } from "../UserContext";
import Text from "../LocalizedText";

export default function BarcodeScanScreen() {
  const { setCurrentScreen, setProductData, t } = useContext(UserContext);

  // Valoare animată pentru linia de laser a scannerului
  const scanAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animație continuă Sus - Jos pentru linia laser
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnim, {
          toValue: 200, // Distanța adaptată pentru cadrul pătrat
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

  const handleScan = () => {
    setProductData({
      name: "Sticluță Deșeu Reciclabil (0.5L)",
      category: "Plastic / PET",
      reward: 50,
    });
    setCurrentScreen("ProductDetail");
  };

  return (
    <View style={styles.container}>
      <View style={styles.scannerWrapper}>
        <Text style={styles.title}>{t("barcode")}</Text>

        {/* Cadrul PĂTRAT identic cu cel de la QRScanScreen */}
        <View style={styles.qrSimulator}>
          {/* Colțuri vizuale pentru cadru */}
          <View style={[styles.corner, styles.topLeft]} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />

          {/* Linia animată de laser verde neon */}
          <Animated.View
            style={[styles.scanLine, { transform: [{ translateY: scanAnim }] }]}
          />

          <Text style={styles.qrText}>[ Scanner Cod de Bare ]</Text>
          <Text style={styles.qrSubText}>
            Îndreaptă camera spre codul de bare
          </Text>
        </View>

        <TouchableOpacity style={styles.btnPrimary} onPress={handleScan}>
          <Text style={styles.btnText}>{t("scanProduct")}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    justifyContent: "center",
    padding: 20,
  },
  scannerWrapper: { alignItems: "center", width: "100%" },
  title: {
    fontSize: 18,
    color: "#ffffff",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 25,
  },

  // Cadrul PĂTRAT (250x250 - exact ca cel de la QR Scanner)
  qrSimulator: {
    width: 250,
    height: 250,
    borderWidth: 1,
    borderColor: "#2d6a4f",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1e1e1e",
    position: "relative",
    overflow: "hidden",
  },

  // Linia laser animată verde neon
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

  // Colțurile verzi de ghidaj
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
  qrSubText: {
    color: "#888888",
    fontSize: 11,
    marginTop: 4,
    textAlign: "center",
  },

  btnPrimary: {
    backgroundColor: "#2d6a4f",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 35,
    width: "100%",
  },
  btnText: { color: "#ffffff", fontWeight: "bold", fontSize: 15 },
});
