import React, { useContext } from "react";
import { Text, TouchableOpacity, StyleSheet } from "react-native";
import { UserContext } from "./UserContext";

const LABELS = { ro: "← Înapoi", en: "← Back", pt: "← Voltar" };

// Buton „Înapoi” pentru ecranele de scanare.
// floating = poziționat peste conținut (pentru ecranele cu fundal închis/cameră)
export default function BackButton({ floating = false, dark = false }) {
  const { goBack, language } = useContext(UserContext);

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={LABELS[language] || LABELS.ro}
      onPress={goBack}
      style={[styles.button, floating && styles.floating, dark && styles.dark]}
    >
      <Text style={[styles.text, dark && styles.darkText]}>
        {LABELS[language] || LABELS.ro}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    alignSelf: "flex-start",
    backgroundColor: "#ffffff",
    borderColor: "#2d6a4f",
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginBottom: 12,
  },
  floating: { position: "absolute", top: 16, left: 16, zIndex: 20, marginBottom: 0 },
  dark: { backgroundColor: "rgba(255,255,255,0.12)", borderColor: "#d8f3dc" },
  text: { color: "#2d6a4f", fontWeight: "bold", fontSize: 13 },
  darkText: { color: "#ffffff" },
});
