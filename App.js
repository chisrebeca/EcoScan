import React, { useContext, useState } from "react";
import {
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from "react-native";

import { UserProvider, UserContext } from "./UserContext";
import Text from "./LocalizedText";
import { languageFlags, languageLabels } from "./translations";

// Ecranele aplicației
import HomeScreen from "./screens/HomeScreen";
import GuideScreen from "./screens/GuideScreen";
import BarcodeScanScreen from "./screens/BarcodeScanScreen";
import ProductDetailScreen from "./screens/ProductDetailScreen";
import QRScanScreen from "./screens/QRScanScreen";
import AIScanScreen from "./screens/AIScanScreen";
import MapScreen from "./screens/MapScreen";
import VouchersScreen from "./screens/VouchersScreen";
import ProfileScreen from "./screens/ProfileScreen";
import VoucherQRScreen from "./screens/VoucherQRScreen";

function MainApp() {
  const { points, currentScreen, setCurrentScreen, language, setLanguage, t } =
    useContext(UserContext);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);

  const changeLanguage = (code) => {
    setLanguage(code);
    setIsLanguageMenuOpen(false);
  };

  const navigateTo = (screen) => {
    setCurrentScreen(screen);
    setIsLanguageMenuOpen(false);
  };

  // Verificăm dacă utilizatorul se află în zona de scanare
  const isScanActive = [
    "Guide",
    "BarcodeScan",
    "ProductDetail",
    "QRScan",
    "AIScan",
  ].includes(currentScreen);

  // Afișăm ecranul selectat
  const renderScreen = () => {
    switch (currentScreen) {
      case "Home":
        return <HomeScreen />;

      case "Guide":
        return <GuideScreen />;

      case "BarcodeScan":
        return <BarcodeScanScreen />;

      case "ProductDetail":
        return <ProductDetailScreen />;

      case "QRScan":
        return <QRScanScreen />;

      case "AIScan":
        return <AIScanScreen />;

      case "Map":
        return <MapScreen />;

      case "Vouchers":
        return <VouchersScreen />;

      case "Profile":
        return <ProfileScreen />;

      case "VoucherQR":
        return <VoucherQRScreen />;

      default:
        return <HomeScreen />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.languageMenuWrapper}>
          <TouchableOpacity
            accessibilityLabel={t("language")}
            accessibilityRole="button"
            accessibilityState={{ expanded: isLanguageMenuOpen }}
            style={styles.menuButton}
            onPress={() => setIsLanguageMenuOpen((open) => !open)}
          >
            <Image
              source={require("./poze/language-globe.png")}
              style={styles.menuIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>

          {isLanguageMenuOpen && (
            <View style={styles.languageMenu}>
              <Text style={styles.languageMenuTitle}>{t("language")}</Text>
              {Object.keys(languageLabels).map((code) => (
                <TouchableOpacity
                  key={code}
                  accessibilityRole="button"
                  style={[
                    styles.languageOption,
                    language === code && styles.languageOptionActive,
                  ]}
                  onPress={() => changeLanguage(code)}
                >
                  <Text
                    style={[
                      styles.languageOptionText,
                      language === code && styles.languageOptionTextActive,
                    ]}
                  >
                    {languageFlags[code]} {languageLabels[code]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={styles.badge}>
          <Text style={styles.badgeText}>🪙 {points} {t("points")}</Text>
        </View>
      </View>

      {/* Conținutul aplicației */}
      <View style={styles.content}>{renderScreen()}</View>

      {/* Bara de navigare */}
      <View style={styles.tabBar}>
        {/* Acasă */}
        <TouchableOpacity
          style={[
            styles.tabButton,
            currentScreen === "Home" && styles.tabActive,
          ]}
          onPress={() => navigateTo("Home")}
        >
          <Text style={styles.tabIcon}>🏠</Text>
          <Text
            style={[
              styles.tabText,
              currentScreen === "Home" && styles.tabTextActive,
            ]}
          >
            {t("home")}
          </Text>
        </TouchableOpacity>

        {/* Hartă */}
        <TouchableOpacity
          style={[
            styles.tabButton,
            currentScreen === "Map" && styles.tabActive,
          ]}
          onPress={() => navigateTo("Map")}
        >
          <Text style={styles.tabIcon}>🗺️</Text>
          <Text
            style={[
              styles.tabText,
              currentScreen === "Map" && styles.tabTextActive,
            ]}
          >
            {t("map")}
          </Text>
        </TouchableOpacity>

        {/* Scanare */}
        <TouchableOpacity
          style={[styles.tabButton, isScanActive && styles.tabActive]}
          onPress={() => navigateTo("Guide")}
        >
          <Text style={styles.tabIcon}>📷</Text>
          <Text style={[styles.tabText, isScanActive && styles.tabTextActive]}>
            {t("scan")}
          </Text>
        </TouchableOpacity>

        {/* Vouchere */}
        <TouchableOpacity
          style={[
            styles.tabButton,
            currentScreen === "Vouchers" && styles.tabActive,
          ]}
          onPress={() => navigateTo("Vouchers")}
        >
          <Text style={styles.tabIcon}>🎁</Text>
          <Text
            style={[
              styles.tabText,
              currentScreen === "Vouchers" && styles.tabTextActive,
            ]}
          >
            {t("vouchers")}
          </Text>
        </TouchableOpacity>

        {/* Profil */}
        <TouchableOpacity
          style={[
            styles.tabButton,
            currentScreen === "Profile" && styles.tabActive,
          ]}
          onPress={() => navigateTo("Profile")}
        >
          <Text style={styles.tabIcon}>👤</Text>
          <Text
            style={[
              styles.tabText,
              currentScreen === "Profile" && styles.tabTextActive,
            ]}
          >
            {t("profile")}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <UserProvider>
      <MainApp />
    </UserProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4fbf7",
  },

  header: {
    height: 60,
    backgroundColor: "#ffffff",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderColor: "#e0f2e9",
    elevation: 2,
    zIndex: 10,
  },

  languageMenuWrapper: {
    position: "relative",
    zIndex: 20,
  },

  menuButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e8f5e9",
  },

  menuIcon: {
    width: 27,
    height: 27,
  },

  languageMenu: {
    position: "absolute",
    top: 42,
    left: 0,
    width: 156,
    padding: 8,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#d8f3dc",
    elevation: 8,
    shadowColor: "#000000",
    shadowOpacity: 0.16,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },

  languageMenuTitle: {
    color: "#52796f",
    fontSize: 12,
    fontWeight: "600",
    marginHorizontal: 8,
    marginVertical: 6,
  },

  languageOption: {
    paddingHorizontal: 10,
    paddingVertical: 9,
    borderRadius: 8,
  },

  languageOptionActive: {
    backgroundColor: "#2d6a4f",
  },

  languageOptionText: {
    color: "#1b4332",
    fontSize: 14,
    fontWeight: "600",
  },

  languageOptionTextActive: {
    color: "#ffffff",
  },

  badge: {
    backgroundColor: "#d4a373",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },

  badgeText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 13,
  },

  content: {
    flex: 1,
    backgroundColor: "#f4fbf7",
  },

  tabBar: {
    height: 65,
    backgroundColor: "#1b4332",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },

  tabButton: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    paddingVertical: 6,
  },

  tabActive: {
    backgroundColor: "#2d6a4f",
    borderRadius: 10,
    marginHorizontal: 4,
  },

  tabIcon: {
    fontSize: 18,
  },

  tabText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#d8f3dc",
    marginTop: 2,
  },

  tabTextActive: {
    color: "#ffffff",
    fontWeight: "bold",
  },
});
