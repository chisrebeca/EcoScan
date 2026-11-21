import React, { useContext, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  Linking,
  Alert,
} from "react-native";
import { UserContext } from "../UserContext";
import Text from "../LocalizedText";

// Bază de date cu locații Kaufland & Lidl pe orașe
const CITIES_DATA = {
  oradea: [
    {
      id: "1",
      name: "Aparat SGR Kaufland Nufărul",
      address: "Str. Nufărului Nr. 30",
      status: "Deschis (Punct Colectare)",
      lat: 47.0465,
      lng: 21.9542,
    },
    {
      id: "2",
      name: "Punct Colectare Lidl Decebal",
      address: "Bulevardul Decebal Nr. 74",
      status: "Deschis (Punct Colectare)",
      lat: 47.0612,
      lng: 21.9198,
    },
    {
      id: "3",
      name: "Aparat SGR Kaufland Borșului",
      address: "Calea Borșului Nr. 6",
      status: "Deschis (Punct Colectare)",
      lat: 47.0781,
      lng: 21.8985,
    },
  ],
  bucuresti: [
    {
      id: "4",
      name: "Aparat SGR Kaufland Barbu Văcărescu",
      address: "Str. Barbu Văcărescu Nr. 120",
      status: "Deschis (Punct Colectare)",
      lat: 44.46,
      lng: 26.105,
    },
    {
      id: "5",
      name: "Aparat Colectare Lidl Mihai Bravu",
      address: "Șos. Mihai Bravu Nr. 321",
      status: "Deschis (Punct Colectare)",
      lat: 44.432,
      lng: 26.134,
    },
    {
      id: "6",
      name: "Aparat SGR Kaufland Rahova",
      address: "Str. Mihail Sebastiani Nr. 88",
      status: "Deschis (Punct Colectare)",
      lat: 44.4172,
      lng: 26.0745,
    },
  ],
  cluj: [
    {
      id: "7",
      name: "Aparat SGR Kaufland Mărăști",
      address: "Str. Fabricii Nr. 7",
      status: "Deschis (Punct Colectare)",
      lat: 46.778,
      lng: 23.602,
    },
    {
      id: "8",
      name: "Aparat Colectare Lidl Grigorescu",
      address: "Str. 1 Decembrie 1918 Nr. 135",
      status: "Deschis (Punct Colectare)",
      lat: 46.771,
      lng: 23.565,
    },
    {
      id: "9",
      name: "Aparat SGR Kaufland Manăștur",
      address: "Str. Câmpului Nr. 9-11",
      status: "Deschis (Punct Colectare)",
      lat: 46.7552,
      lng: 23.5581,
    },
  ],
};

export default function MapScreen() {
  const { selectedCollectionPoint, setSelectedCollectionPoint, setCurrentScreen, t } = useContext(UserContext);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentLocations, setCurrentLocations] = useState(
    CITIES_DATA["oradea"],
  );

  // Coordonate pentru vizualizarea pe hartă
  const [selectedCoord, setSelectedCoord] = useState({
    lat: 47.0465,
    lng: 21.9542,
  });

  // Stare pentru locația curentă a utilizatorului
  const [userLocation, setUserLocation] = useState(null);
  const [isLocating, setIsLocating] = useState(false);

  // Funcție de solicitare și obținere a locației actuale în timp real
  const handleGetUserLocation = () => {
    setIsLocating(true);

    if (typeof navigator !== "undefined" && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const userPos = { lat: latitude, lng: longitude };

          setUserLocation(userPos);
          setSelectedCoord(userPos);
          setIsLocating(false);
        },
        (error) => {
          console.log("Eroare la preluarea locației:", error);
          Alert.alert(
            "Permisiune refuzată",
            "Nu am putut accesa locația. Asigură-te că ai oferit permisiunea în browser/dispozitiv.",
          );
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
      );
    } else {
      Alert.alert(
        "Geolocație indisponibilă",
        "Dispozitivul sau browserul tău nu suportă localizarea GPS.",
      );
      setIsLocating(false);
    }
  };

  // Funcție de căutare după oraș
  const handleSearch = (text) => {
    setSearchQuery(text);
    const query = text.toLowerCase().trim();

    if (CITIES_DATA[query]) {
      setCurrentLocations(CITIES_DATA[query]);
      setSelectedCoord({
        lat: CITIES_DATA[query][0].lat,
        lng: CITIES_DATA[query][0].lng,
      });
    } else if (query === "") {
      setCurrentLocations(CITIES_DATA["oradea"]);
    }
  };

  // Când apeși pe un punct din listă, harta se mută pe el
  const handleSelectLocation = (loc) => {
    setSelectedCoord({ lat: loc.lat, lng: loc.lng });
    setSelectedCollectionPoint(loc);
  };

  // Deschidere traseu în Google Maps (dacă avem locația utilizatorului, face ruta de la EL la MAGAZIN)
  const openNavigation = (destLat, destLng, name) => {
    let url = "";

    if (userLocation) {
      // Traseu de la coordonatele mele la destinație
      url = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${destLat},${destLng}&travelmode=driving`;
    } else {
      // Deschide doar destinația în aplicația externă
      url = Platform.select({
        ios: `maps:0,0?q=${name}@${destLat},${destLng}`,
        android: `geo:0,0?q=${destLat},${destLng}(${name})`,
        web: `https://www.google.com/maps/search/?api=1&query=${destLat},${destLng}`,
      });
    }

    Linking.openURL(url);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{t("mapTitle")}</Text>

      {/* Bara de căutare oraș */}
      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.input}
          placeholder={t("searchCity")}
          placeholderTextColor="#888"
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>

      {/* Buton de activare locație curentă */}
      <TouchableOpacity
        style={styles.btnLocation}
        onPress={handleGetUserLocation}
        disabled={isLocating}
      >
        <Text style={styles.btnLocationText}>
          {isLocating
            ? "⏳ Se caută poziția ta..."
            : userLocation
              ? "📍 Locație actualizată (Apasă din nou pt. refresh)"
              : "🎯 Permite accesul & Vezi unde ești pe hartă"}
        </Text>
      </TouchableOpacity>

      {/* Harta dinamică Google Maps */}
      <View style={styles.mapContainer}>
        {Platform.OS === "web" ? (
          <iframe
            key={`${selectedCoord.lat}-${selectedCoord.lng}`}
            title="Google Maps EcoScan Dinamic"
            width="100%"
            height="100%"
            style={{ border: 0, borderRadius: 12 }}
            loading="lazy"
            allowFullScreen
            src={`https://maps.google.com/maps?q=${selectedCoord.lat},${selectedCoord.lng}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
          />
        ) : (
          <TouchableOpacity
            style={styles.mobileMapFallback}
            onPress={() =>
              openNavigation(
                selectedCoord.lat,
                selectedCoord.lng,
                "Punct Reciclare",
              )
            }
          >
            <Text style={styles.mapIcon}>🗺️</Text>
            <Text style={styles.mapText}>Deschide harta în Google Maps</Text>
          </TouchableOpacity>
        )}
      </View>

      {selectedCollectionPoint && (
        <View style={styles.selectedBox}>
          <Text style={styles.selectedLabel}>{t("selectedPoint")}</Text>
          <Text style={styles.selectedName}>📍 {selectedCollectionPoint.name}</Text>
          <Text style={styles.selectedAddress}>{selectedCollectionPoint.address}</Text>
          <TouchableOpacity style={styles.btnScanPoint} onPress={() => setCurrentScreen("QRScan")}>
            <Text style={styles.btnScanPointText}>{t("scanThisPoint")}</Text>
          </TouchableOpacity>
        </View>
      )}

      <Text style={styles.subTitle}>
        {t("locations")} ({currentLocations.length}):
      </Text>

      {/* Lista punctelor Kaufland / Lidl */}
      {currentLocations.map((loc) => (
        <TouchableOpacity
          key={loc.id}
          style={[styles.card, selectedCollectionPoint?.id === loc.id && styles.cardSelected]}
          onPress={() => handleSelectLocation(loc)}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.locName}>📍 {loc.name}</Text>
            <Text style={styles.locAddr}>{loc.address}</Text>
            <Text style={styles.locStatus}>{loc.status}</Text>
          </View>
          <TouchableOpacity
            style={styles.btnRoute}
            onPress={() => openNavigation(loc.lat, loc.lng, loc.name)}
          >
            <Text style={styles.btnRouteText}>{t("route")}</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: "#f4fbf7" },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1b4332",
    marginBottom: 12,
  },
  subTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#2d6a4f",
    marginBottom: 10,
    marginTop: 8,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#d8f3dc",
    paddingHorizontal: 12,
    marginBottom: 10,
    height: 48,
    elevation: 1,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  input: { flex: 1, fontSize: 14, color: "#333" },

  btnLocation: {
    backgroundColor: "#e8f5e9",
    borderColor: "#2d6a4f",
    borderWidth: 1,
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 14,
  },
  btnLocationText: {
    color: "#1b4332",
    fontWeight: "bold",
    fontSize: 13,
  },

  mapContainer: {
    height: 220,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#d8f3dc",
    backgroundColor: "#e8f5e9",
    elevation: 2,
  },
  mobileMapFallback: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  mapIcon: { fontSize: 35, marginBottom: 6 },
  mapText: {
    color: "#2d6a4f",
    fontWeight: "bold",
    fontSize: 14,
    textAlign: "center",
  },
  selectedBox: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: "#2d6a4f",
  },
  selectedLabel: { color: "#2d6a4f", fontWeight: "bold", fontSize: 12, marginBottom: 5 },
  selectedName: { color: "#1b4332", fontWeight: "bold", fontSize: 15 },
  selectedAddress: { color: "#666", fontSize: 12, marginTop: 3 },
  btnScanPoint: { backgroundColor: "#d4a373", borderRadius: 8, marginTop: 12, padding: 11, alignItems: "center" },
  btnScanPointText: { color: "#1b4332", fontWeight: "bold", fontSize: 12 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#d8f3dc",
    elevation: 2,
  },
  cardSelected: { borderColor: "#2d6a4f", borderWidth: 2 },
  locName: { fontWeight: "bold", color: "#1b4332", fontSize: 15 },
  locAddr: { color: "#666666", fontSize: 12, marginTop: 2 },
  locStatus: {
    color: "#2d6a4f",
    fontSize: 12,
    fontWeight: "bold",
    marginTop: 4,
  },
  btnRoute: {
    backgroundColor: "#2d6a4f",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  btnRouteText: { color: "#ffffff", fontSize: 12, fontWeight: "bold" },
});
