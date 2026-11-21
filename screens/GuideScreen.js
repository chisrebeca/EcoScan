import React, { useContext } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";

import { UserContext } from "../UserContext";
import Text from "../LocalizedText";

export default function GuideScreen() {
  const { setCurrentScreen, t } = useContext(UserContext);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>{t("guide")}</Text>

      <Text style={styles.subtitle}>
        Alege metoda prin care dorești să reciclezi deșeurile.
      </Text>

      <View style={styles.stepCard}>
        <Text style={styles.num}>1</Text>
        <Text style={styles.desc}>
          Alege metoda de scanare potrivită pentru deșeurile tale.
        </Text>
      </View>

      <View style={styles.stepCard}>
        <Text style={styles.num}>2</Text>
        <Text style={styles.desc}>
          Scanează ambalajele sau fotografiază mai multe deșeuri simultan.
        </Text>
      </View>

      <View style={styles.stepCard}>
        <Text style={styles.num}>3</Text>
        <Text style={styles.desc}>
          Verifică materialele identificate și informațiile despre reciclare.
        </Text>
      </View>

      <Text style={styles.sectionTitle}>{t("scanMethods")}</Text>

      {/* Scanare cod de bare */}
      <TouchableOpacity
        style={styles.optionCard}
        activeOpacity={0.8}
        onPress={() => setCurrentScreen("BarcodeScan")}
      >
        <View style={styles.iconContainer}>
          <Text style={styles.optionIcon}>📦</Text>
        </View>

        <View style={styles.optionInfo}>
          <Text style={styles.optionTitle}>{t("scanProduct")}</Text>

          <Text style={styles.optionDescription}>
            {t("scanProductDesc")}
          </Text>

          <Text style={styles.optionAction}>{t("barcode")}</Text>
        </View>
      </TouchableOpacity>

      {/* Scanare AI */}
      <TouchableOpacity
        style={[styles.optionCard, styles.aiCard]}
        activeOpacity={0.8}
        onPress={() => setCurrentScreen("AIScan")}
      >
        <View style={[styles.iconContainer, styles.aiIconContainer]}>
          <Text style={styles.optionIcon}>🤖</Text>
        </View>

        <View style={styles.optionInfo}>
          <Text style={styles.optionTitle}>{t("scanAi")}</Text>

          <Text style={styles.optionDescription}>
            Fotografiază mai multe ambalaje simultan. Inteligența artificială
            încearcă să identifice plasticul, sticla, metalul, hârtia, cartonul
            și materialele biodegradabile.
          </Text>

          <Text style={styles.aiAction}>{t("startAi")}</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>♻️ Știai că?</Text>

        <Text style={styles.infoText}>
          EcoScan te ajută să identifici materialele reciclabile și să înțelegi
          cum trebuie colectate corect.
        </Text>
      </View>
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
    paddingBottom: 35,
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
    marginBottom: 20,
    lineHeight: 21,
  },

  stepCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#d8f3dc",
  },

  num: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2d6a4f",
    backgroundColor: "#e8f5e9",
    width: 36,
    height: 36,
    borderRadius: 18,
    textAlign: "center",
    lineHeight: 36,
    marginRight: 14,
  },

  desc: {
    flex: 1,
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: "bold",
    color: "#1b4332",
    marginTop: 18,
    marginBottom: 14,
  },

  optionCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#d8f3dc",
    elevation: 2,
  },

  aiCard: {
    borderColor: "#95d5b2",
    borderWidth: 1.5,
  },

  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: "#e8f5e9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  aiIconContainer: {
    backgroundColor: "#d8f3dc",
  },

  optionIcon: {
    fontSize: 27,
  },

  optionInfo: {
    flex: 1,
  },

  optionTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#1b4332",
    marginBottom: 6,
  },

  optionDescription: {
    fontSize: 13,
    color: "#555",
    lineHeight: 19,
    marginBottom: 12,
  },

  optionAction: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#2d6a4f",
  },

  aiAction: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#1b4332",
  },

  infoBox: {
    backgroundColor: "#e8f5e9",
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },

  infoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1b4332",
    marginBottom: 6,
  },

  infoText: {
    fontSize: 13,
    color: "#355e48",
    lineHeight: 20,
  },
});
