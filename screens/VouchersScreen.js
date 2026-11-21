import React, { useContext, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { UserContext } from "../UserContext";
import Text from "../LocalizedText";

const VOUCHERS = [
  {
    id: "1",
    title: "Steam",
    desc: "10% Reducere la orice Joc Digital",
    cost: 150,
    category: "Gaming",
    image: require("../poze/img1.png"),
  },
  {
    id: "2",
    title: "Nintendo eShop",
    desc: "Cupon Cadou 5€ eShop",
    cost: 200,
    category: "Gaming",
    image: require("../poze/img2.png"),
  },
  {
    id: "3",
    title: "Cinema Palace",
    desc: "1 Bilet Gratuit la Film 2D / 3D",
    cost: 120,
    category: "Divertisment",
    image: require("../poze/img3.png"),
  },
  {
    id: "4",
    title: "Kaufland",
    desc: "Cupon de Cumpărături 15 RON",
    cost: 100,
    category: "Shopping",
    image: require("../poze/img4.png"),
  },
  {
    id: "5",
    title: "Cafenea / Cafea Gratuită",
    desc: "Primești o Cafea (Espresso sau Cappuccino) din partea casei",
    cost: 80,
    category: "Cafenea",
    image: require("../poze/cafea.png"),
  },
  {
    id: "6",
    title: "Croisant Gratis",
    desc: "Un croisant unt gratuit la orice cafea cumpărată",
    cost: 60,
    category: "Cafenea",
    image: require("../poze/croisant.png"),
  },
  {
    id: "7",
    title: "eMAG",
    desc: "10% Reducere la selecția de produse casnice",
    cost: 1800,
    category: "Shopping",
    image: require("../poze/emag.png"),
  },
  {
    id: "8",
    title: "Altex",
    desc: "10% Reducere la accesorii IT & Gadgeturi",
    cost: 1900,
    category: "Shopping",
    image: require("../poze/altex.png"),
  },
  {
    id: "9",
    title: "Netflix",
    desc: "1 lună acces sau reducere partener",
    cost: 3500,
    category: "Divertisment",
    image: require("../poze/netfix.png"),
  },
  {
    id: "10",
    title: "Apple App Store",
    desc: "Credit 25 RON pentru aplicații sau jocuri",
    cost: 3500,
    category: "Gaming",
    image: require("../poze/apple.png"),
  },
  {
    id: "11",
    title: "Sephora",
    desc: "25% Reducere la produse cosmetice selectate",
    cost: 4000,
    category: "Shopping",
    image: require("../poze/sephora.png"),
  },
  {
    id: "12",
    title: "Spotify",
    desc: "1 lună de abonament Premium partener",
    cost: 170,
    category: "Divertisment",
    image: require("../poze/spoty.png"),
  },
];

const CATEGORIES = ["Toate", "Cafenea", "Shopping", "Gaming", "Divertisment"];

export default function VouchersScreen() {
  const { points, redeemVoucher, setCurrentScreen, t } = useContext(UserContext);
  const [selectedCategory, setSelectedCategory] = useState("Toate");

  const handleRedeem = async (voucher) => {
    try {
      await redeemVoucher(voucher);
      setCurrentScreen("VoucherQR");
    } catch (error) {
      Alert.alert(t("unavailable"), error.message);
    }
  };

  const filteredVouchers =
    selectedCategory === "Toate"
      ? VOUCHERS
      : VOUCHERS.filter((v) => v.category === selectedCategory);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{t("vouchersTitle")}</Text>

      {/* Bara de filtrare pe categorii */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContentContainer}
      >
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <TouchableOpacity
              key={cat}
              style={[styles.filterChip, isSelected && styles.filterChipActive]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text
                style={[
                  styles.filterText,
                  isSelected && styles.filterTextActive,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Lista de vouchere filtrate */}
      {filteredVouchers.map((v) => (
        <View key={v.id} style={styles.cardHorizontal}>
          <View style={styles.imageContainer}>
            <Image
              source={v.image}
              style={styles.voucherImage}
              resizeMode="contain" // <-- Aici s-a modificat pentru a prinde tot logo-ul fără zoom
            />
          </View>

          <View style={styles.cardBody}>
            <Text style={styles.brandTitle}>{v.title}</Text>
            <Text style={styles.descText} numberOfLines={2}>
              {v.desc}
            </Text>
            <Text style={styles.costText}>🪙 {v.cost} Bani</Text>
          </View>

          <View style={styles.actionContainer}>
            <TouchableOpacity
              style={[styles.btnRedeem, points < v.cost && styles.btnDisabled]}
              onPress={() => handleRedeem(v)}
            >
              <Text style={styles.btnText}>{t("redeem")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: "#f4fbf7" },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1b4332",
    marginBottom: 14,
  },
  filterContainer: {
    marginBottom: 16,
    maxHeight: 45,
  },
  filterContentContainer: {
    alignItems: "center",
  },
  filterChip: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#d8f3dc",
  },
  filterChipActive: {
    backgroundColor: "#2d6a4f",
    borderColor: "#2d6a4f",
  },
  filterText: {
    color: "#2d6a4f",
    fontWeight: "600",
    fontSize: 13,
  },
  filterTextActive: {
    color: "#ffffff",
  },
  cardHorizontal: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#d8f3dc",
    elevation: 3,
    padding: 12,
  },
  imageContainer: {
    width: 65,
    height: 65,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#ffffff", // Fundal alb curat pentru logo-uri
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  voucherImage: {
    width: "85%", // Lăsat puțin spațiu pe margini să respire
    height: "85%",
  },
  cardBody: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "center",
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1b4332",
  },
  descText: {
    fontSize: 12,
    color: "#666666",
    marginVertical: 2,
  },
  costText: {
    color: "#bc6c25",
    fontWeight: "bold",
    fontSize: 13,
    marginTop: 2,
  },
  actionContainer: {
    justifyContent: "center",
    alignItems: "flex-end",
    marginLeft: 8,
  },
  btnRedeem: {
    backgroundColor: "#2d6a4f",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  btnDisabled: {
    backgroundColor: "#cccccc",
  },
  btnText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 11,
  },
});
