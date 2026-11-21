import React, { useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import { UserContext } from "../UserContext";

export default function HomeScreen() {
  const { setCurrentScreen, t } = useContext(UserContext);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Zona Logo: Imaginea din poze (dreptunghiulară, mai mare) și moto-ul */}
      <View style={styles.logoContainer}>
        <Image
          source={require("../poze/ecoscan-logo.png")}
          style={styles.logoImage}
          resizeMode="contain"
        />
        <Text style={styles.tagline}>{t("tagline")}</Text>
      </View>

      {/* Cardul cu instrucțiuni */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t("howItWorks")}</Text>
        <Text style={styles.step}>{t("step1")}</Text>
        <Text style={styles.step}>{t("step2")}</Text>
        <Text style={styles.step}>{t("step3")}</Text>

        <TouchableOpacity
          style={styles.btnPrimary}
          onPress={() => setCurrentScreen("Guide")}
        >
          <Text style={styles.btnText}>{t("start")}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    alignItems: "center",
    backgroundColor: "#ffffff",
  },

  logoContainer: { alignItems: "center", marginVertical: 20 },
  // Logo dreptunghiular, mai mare
  logoImage: { width: 180, height: 120, borderRadius: 12, marginBottom: 12 },

  // Moto-ul mărit
  tagline: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2d6a4f",
    textAlign: "center",
    marginBottom: 10,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    width: "100%",
    borderWidth: 1,
    borderColor: "#d8f3dc",
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1b4332",
    marginBottom: 14,
  },
  step: { fontSize: 15, color: "#333", marginBottom: 10, lineHeight: 22 },
  btnPrimary: {
    backgroundColor: "#2d6a4f",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 16,
  },
  btnText: { color: "#ffffff", fontWeight: "bold", fontSize: 16 },
});
