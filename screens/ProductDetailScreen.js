import React, { useContext } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import { UserContext } from "../UserContext";
import Text from "../LocalizedText";

// Importul corect al imaginii din folderul "poze"
import borcaneliaurtel from "../poze/borcaneliaurtel.jpeg";

export default function ProductDetailScreen() {
  const { setCurrentScreen, productData, t } = useContext(UserContext);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{t("scanProduct")}</Text>

      {/* Card Principal cu Poza în Stânga (mai mare) și Detalii în Dreapta */}
      <View style={[styles.card, styles.productCard]}>
        <Image
          source={productData?.image || borcaneliaurtel}
          style={styles.productImage}
        />
        <View style={styles.productInfo}>
          <Text style={styles.prodName}>
            {"Pahar de Iaurt Reciclabil (200g)"}
          </Text>
          <Text style={styles.category}>
            Categorie: {"Plastic (PP-POLIPROPILENA COD5)"}
          </Text>
          <Text style={styles.reward}>
            Recompensă: +{productData?.reward || 30} Bănuți 🪙
          </Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Cum pregătești ambalajul?</Text>
        <Text style={styles.text}>
          1. Îl golești complet de resturile de iaurt.
        </Text>
        <Text style={styles.text}>
          2. Clătești scurt interiorul cu puțină apă călduță.
        </Text>
        <Text style={styles.text}>
          3. Separi capacul de aluminiu (dacă există) de recipientul de plastic.
        </Text>
        <Text style={styles.text}>
          4. Introduci componentele în recipientul dedicat reciclării.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Punct de reciclare apropiat</Text>
        <Text style={styles.loc}>Aparat RER / SGR Kaufland (la 250m)</Text>
      </View>

      <TouchableOpacity
        style={styles.btnPrimary}
        onPress={() => setCurrentScreen("QRScan")}
      >
        <Text style={styles.btnText}>{t("scanThisPoint")}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: "#f4fbf7" },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1b4332",
    marginBottom: 16,
  },
  card: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#d8f3dc",
  },
  productCard: {
    flexDirection: "row",
    alignItems: "center",
  },
  productImage: {
    width: 100, // Dimensiune mărită (în loc de 80)
    height: 100, // Dimensiune mărită (în loc de 80)
    borderRadius: 8,
    marginRight: 14,
    backgroundColor: "#e9ecef",
  },
  productInfo: {
    flex: 1,
  },
  prodName: { fontSize: 18, fontWeight: "bold", color: "#1b4332" },
  category: { color: "#666666", marginTop: 4 },
  reward: { fontSize: 16, fontWeight: "bold", color: "#2d6a4f", marginTop: 8 },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1b4332",
    marginBottom: 8,
  },
  text: { color: "#333333", marginBottom: 4, fontSize: 14 },
  loc: { color: "#d4a373", fontWeight: "bold", marginTop: 4 },
  btnPrimary: {
    backgroundColor: "#2d6a4f",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  btnText: { color: "#ffffff", fontWeight: "bold", fontSize: 16 },
});
