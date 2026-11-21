import React, { useContext, useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  Linking,
  Alert,
  ActivityIndicator,
} from "react-native";
import { UserContext } from "../UserContext";
import Text from "../LocalizedText";

// Puncte partenere (Kaufland & Lidl) din România. Sunt afișate primele când
// orașul căutat se află în listă; restul punctelor vin din OpenStreetMap.
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

// ---------------------------------------------------------------------------
// OpenStreetMap: Nominatim (oraș -> coordonate) + Overpass (puncte de reciclare)
// Ambele servicii sunt gratuite; Nominatim cere max. 1 căutare pe secundă, de
// aceea căutăm doar la apăsarea butonului / Enter, nu la fiecare literă.
// ---------------------------------------------------------------------------
const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const OVERPASS_URLS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];
const SEARCH_RADIUS_M = 3000;
const MAX_RESULTS = 40;

const QUICK_CITIES = ["Oradea", "București", "Cluj", "Lisboa", "Porto"];

// Filtre pe material -> tag-urile OpenStreetMap corespunzătoare
const MATERIALS = [
  { key: "all", icon: "♻️", tags: [] },
  { key: "plastic", icon: "🧴", tags: ["plastic", "plastic_bottles", "plastic_packaging", "PET"] },
  { key: "glass", icon: "🍾", tags: ["glass", "glass_bottles"] },
  { key: "paper", icon: "📄", tags: ["paper", "cardboard", "paper_packaging", "beverage_cartons"] },
  { key: "metal", icon: "🥫", tags: ["cans", "metal", "scrap_metal", "aluminium"] },
  { key: "batteries", icon: "🔋", tags: ["batteries"] },
];

const TEXT = {
  ro: {
    title: "Puncte de colectare",
    search: "Caută oraș, din orice țară (ex: Lisboa, Oradea)...",
    searchBtn: "Caută",
    locate: "📍 Unde reciclez lângă mine?",
    locating: "⏳ Se caută poziția ta...",
    loading: "Se caută puncte de colectare...",
    notFound: "Nu am găsit orașul",
    noPoints: "Nu am găsit puncte de colectare pentru filtrul ales în această zonă.",
    error: "Nu am putut încărca punctele. Verifică internetul și încearcă din nou.",
    partner: "Partener EcoScan",
    container: "Container de reciclare",
    centre: "Centru de reciclare",
    bottleReturn: "Aparat returnare ambalaje",
    point: "Punct de reciclare",
    accepts: "Acceptă",
    source: "Date: © OpenStreetMap",
    materials: { all: "Toate", plastic: "Plastic", glass: "Sticlă", paper: "Hârtie/Carton", metal: "Metal", batteries: "Baterii" },
    names: { plastic: "plastic", glass: "sticlă", paper: "hârtie/carton", metal: "metal", batteries: "baterii" },
  },
  en: {
    title: "Collection points",
    search: "Search any city, any country (e.g. Lisbon, Oradea)...",
    searchBtn: "Search",
    locate: "📍 Where can I recycle nearby?",
    locating: "⏳ Finding your location...",
    loading: "Looking for collection points...",
    notFound: "City not found",
    noPoints: "No collection points found for this filter in this area.",
    error: "Could not load points. Check your connection and try again.",
    partner: "EcoScan partner",
    container: "Recycling container",
    centre: "Recycling centre",
    bottleReturn: "Bottle return machine",
    point: "Recycling point",
    accepts: "Accepts",
    source: "Data: © OpenStreetMap",
    materials: { all: "All", plastic: "Plastic", glass: "Glass", paper: "Paper/Cardboard", metal: "Metal", batteries: "Batteries" },
    names: { plastic: "plastic", glass: "glass", paper: "paper/cardboard", metal: "metal", batteries: "batteries" },
  },
  pt: {
    title: "Pontos de recolha",
    search: "Pesquise qualquer cidade (ex.: Lisboa, Porto)...",
    searchBtn: "Pesquisar",
    locate: "📍 Onde posso reciclar perto de mim?",
    locating: "⏳ A procurar a sua localização...",
    loading: "A procurar pontos de recolha...",
    notFound: "Cidade não encontrada",
    noPoints: "Não foram encontrados pontos de recolha para este filtro nesta zona.",
    error: "Não foi possível carregar os pontos. Verifique a ligação e tente novamente.",
    partner: "Parceiro EcoScan",
    container: "Ecoponto",
    centre: "Ecocentro",
    bottleReturn: "Máquina de devolução de embalagens",
    point: "Ponto de reciclagem",
    accepts: "Aceita",
    source: "Dados: © OpenStreetMap",
    materials: { all: "Todos", plastic: "Plástico", glass: "Vidro", paper: "Papel/Cartão", metal: "Metal", batteries: "Pilhas" },
    names: { plastic: "plástico", glass: "vidro", paper: "papel/cartão", metal: "metal", batteries: "pilhas" },
  },
};

// "București" -> "bucuresti", "Cluj-Napoca" -> "cluj"
const normalize = (text) =>
  text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/-napoca$/, "")
    .replace(/^bucharest$/, "bucuresti");

const distanceKm = (a, b) => {
  const R = 6371;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};

const withTimeout = (promise, ms) =>
  Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), ms)),
  ]);

// Pe Android/iOS putem trimite User-Agent (cerut de Nominatim); în browser
// acest header este interzis, iar browserul trimite automat Referer.
const OSM_HEADERS =
  Platform.OS === "web" ? {} : { "User-Agent": "EcoScanApp/1.0 (student project)" };

async function geocodeCity(query, language) {
  const url =
    `${NOMINATIM_URL}?format=jsonv2&limit=1&addressdetails=1` +
    `&accept-language=${language}&q=${encodeURIComponent(query)}`;
  const response = await withTimeout(fetch(url, { headers: OSM_HEADERS }), 15000);
  if (!response.ok) throw new Error(`Nominatim ${response.status}`);
  const results = await response.json();
  if (!results.length) return null;
  const place = results[0];
  return {
    lat: parseFloat(place.lat),
    lng: parseFloat(place.lon),
    label: place.address?.city || place.address?.town || place.name || query,
    country: place.address?.country || "",
  };
}

async function fetchOsmPoints(center) {
  const around = `around:${SEARCH_RADIUS_M},${center.lat},${center.lng}`;
  const query =
    `[out:json][timeout:25];(` +
    `nwr(${around})[amenity=recycling];` +
    `nwr(${around})[vending=bottle_return];` +
    `);out center tags;`;

  let lastError;
  for (const url of OVERPASS_URLS) {
    try {
      const response = await withTimeout(
        fetch(url, {
          method: "POST",
          headers: { ...OSM_HEADERS, "Content-Type": "application/x-www-form-urlencoded" },
          body: `data=${encodeURIComponent(query)}`,
        }),
        30000,
      );
      if (!response.ok) throw new Error(`Overpass ${response.status}`);
      const data = await response.json();
      return data.elements;
    } catch (error) {
      lastError = error; // încercăm serverul de rezervă
    }
  }
  throw lastError;
}

function materialsOf(tags) {
  return MATERIALS.filter(
    (material) =>
      material.key !== "all" &&
      material.tags.some((tag) => tags[`recycling:${tag}`] === "yes"),
  ).map((material) => material.key);
}

function toCollectionPoint(element, center, text) {
  const tags = element.tags || {};
  const lat = element.lat ?? element.center?.lat;
  const lng = element.lon ?? element.center?.lon;
  if (lat == null || lng == null) return null;

  const isBottleReturn = tags.vending === "bottle_return";
  const kind = isBottleReturn
    ? text.bottleReturn
    : tags.recycling_type === "centre"
      ? text.centre
      : tags.recycling_type === "container"
        ? text.container
        : text.point;

  const street = [tags["addr:street"], tags["addr:housenumber"]].filter(Boolean).join(" ");
  const materials = isBottleReturn ? ["plastic", "glass", "metal"] : materialsOf(tags);
  const point = { lat, lng };

  return {
    id: `osm-${element.type}-${element.id}`,
    name: tags.name || tags.operator || kind,
    address: street || tags.description || kind,
    status: materials.length
      ? `${text.accepts}: ${materials.map((m) => text.names[m]).join(", ")}`
      : kind,
    materials,
    lat,
    lng,
    distance: distanceKm(center, point),
    isPartner: false,
  };
}

function partnerPoints(cityKey, center, text) {
  return (CITIES_DATA[cityKey] || []).map((loc) => ({
    ...loc,
    status: `⭐ ${text.partner} · ${loc.status}`,
    // Aparatele SGR primesc PET, sticlă și doze
    materials: ["plastic", "glass", "metal"],
    distance: center ? distanceKm(center, loc) : null,
    isPartner: true,
  }));
}

export default function MapScreen() {
  const {
    selectedCollectionPoint,
    setSelectedCollectionPoint,
    setCurrentScreen,
    language,
    t,
  } = useContext(UserContext);
  const text = TEXT[language] || TEXT.ro;

  const [searchQuery, setSearchQuery] = useState("");
  const [areaLabel, setAreaLabel] = useState("Oradea");
  const [locations, setLocations] = useState(partnerPoints("oradea", null, TEXT.ro));
  const [materialFilter, setMaterialFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Coordonate pentru vizualizarea pe hartă
  const [selectedCoord, setSelectedCoord] = useState({ lat: 47.0465, lng: 21.9542 });

  // Locația utilizatorului
  const [userLocation, setUserLocation] = useState(null);
  const [isLocating, setIsLocating] = useState(false);

  // Încărcăm punctele pentru o zonă: partenerii (dacă există) + OpenStreetMap
  const loadArea = async (center, label, cityKey) => {
    setIsLoading(true);
    setErrorMessage("");
    setSelectedCoord(center);
    setAreaLabel(label);

    const partners = partnerPoints(cityKey, center, text);
    setLocations(partners);

    try {
      const elements = await fetchOsmPoints(center);
      const osmPoints = elements
        .map((element) => toCollectionPoint(element, center, text))
        .filter(Boolean)
        .sort((a, b) => a.distance - b.distance)
        .slice(0, MAX_RESULTS);
      setLocations([...partners, ...osmPoints]);
    } catch (error) {
      console.log("Eroare OpenStreetMap:", error);
      setErrorMessage(text.error);
    } finally {
      setIsLoading(false);
    }
  };

  // Căutare după oraș (orice țară)
  const handleSearch = async (value = searchQuery) => {
    const query = value.trim();
    if (!query || isLoading) return;
    setSearchQuery(query);

    const cityKey = normalize(query);
    setIsLoading(true);
    setErrorMessage("");
    try {
      const place = await geocodeCity(query, language);
      if (!place) {
        setLocations([]);
        setErrorMessage(`${text.notFound}: „${query}”.`);
        setIsLoading(false);
        return;
      }
      const label = place.country ? `${place.label}, ${place.country}` : place.label;
      await loadArea({ lat: place.lat, lng: place.lng }, label, cityKey);
    } catch (error) {
      console.log("Eroare la căutarea orașului:", error);
      // Fără internet: măcar punctele partenere, dacă orașul e în listă
      if (CITIES_DATA[cityKey]) {
        setLocations(partnerPoints(cityKey, null, text));
        setSelectedCoord({ lat: CITIES_DATA[cityKey][0].lat, lng: CITIES_DATA[cityKey][0].lng });
      } else {
        setLocations([]);
      }
      setErrorMessage(text.error);
      setIsLoading(false);
    }
  };

  // La deschiderea ecranului încărcăm și punctele OSM din Oradea
  useEffect(() => {
    loadArea({ lat: 47.0465, lng: 21.9542 }, "Oradea, România", "oradea");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Locația curentă -> puncte din jurul utilizatorului
  const handleGetUserLocation = () => {
    setIsLocating(true);

    if (typeof navigator !== "undefined" && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userPos = { lat: position.coords.latitude, lng: position.coords.longitude };
          setUserLocation(userPos);
          setIsLocating(false);
          loadArea(userPos, "📍", null);
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

  // Când apeși pe un punct din listă, harta se mută pe el
  const handleSelectLocation = (loc) => {
    setSelectedCoord({ lat: loc.lat, lng: loc.lng });
    setSelectedCollectionPoint(loc);
  };

  // Traseu în Google Maps (de la utilizator, dacă îi știm locația)
  const openNavigation = (destLat, destLng, name) => {
    const label = encodeURIComponent(name);
    const url = userLocation
      ? `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${destLat},${destLng}&travelmode=walking`
      : Platform.select({
          ios: `maps:0,0?q=${label}@${destLat},${destLng}`,
          android: `geo:0,0?q=${destLat},${destLng}(${label})`,
          default: `https://www.google.com/maps/search/?api=1&query=${destLat},${destLng}`,
        });

    Linking.openURL(url);
  };

  const filteredLocations =
    materialFilter === "all"
      ? locations
      : locations.filter((loc) => loc.materials?.includes(materialFilter));

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>{text.title}</Text>

      {/* Căutare oraș */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.input}
            placeholder={text.search}
            placeholderTextColor="#888"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={() => handleSearch()}
            returnKeyType="search"
          />
        </View>
        <TouchableOpacity
          style={[styles.btnSearch, isLoading && styles.btnDisabled]}
          onPress={() => handleSearch()}
          disabled={isLoading}
        >
          <Text style={styles.btnSearchText}>{text.searchBtn}</Text>
        </TouchableOpacity>
      </View>

      {/* Orașe rapide */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow}>
        {QUICK_CITIES.map((city) => (
          <TouchableOpacity
            key={city}
            style={styles.cityChip}
            onPress={() => handleSearch(city)}
            disabled={isLoading}
          >
            <Text style={styles.cityChipText}>{city}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Locația curentă */}
      <TouchableOpacity
        style={styles.btnLocation}
        onPress={handleGetUserLocation}
        disabled={isLocating || isLoading}
      >
        <Text style={styles.btnLocationText}>{isLocating ? text.locating : text.locate}</Text>
      </TouchableOpacity>

      {/* Harta */}
      <View style={styles.mapContainer}>
        {Platform.OS === "web" ? (
          <iframe
            key={`${selectedCoord.lat}-${selectedCoord.lng}`}
            title="Harta EcoScan"
            width="100%"
            height="100%"
            style={{ border: 0, borderRadius: 12 }}
            loading="lazy"
            allowFullScreen
            src={`https://maps.google.com/maps?q=${selectedCoord.lat},${selectedCoord.lng}&t=&z=16&ie=UTF8&iwloc=&output=embed`}
          />
        ) : (
          <TouchableOpacity
            style={styles.mobileMapFallback}
            onPress={() => openNavigation(selectedCoord.lat, selectedCoord.lng, text.point)}
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

      {/* Filtre pe material */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow}>
        {MATERIALS.map((material) => {
          const active = materialFilter === material.key;
          return (
            <TouchableOpacity
              key={material.key}
              style={[styles.filterChip, active && styles.filterChipActive]}
              onPress={() => setMaterialFilter(material.key)}
            >
              <Text style={[styles.filterText, active && styles.filterTextActive]}>
                {material.icon} {text.materials[material.key]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <Text style={styles.subTitle}>
        {areaLabel} · {filteredLocations.length}
      </Text>

      {isLoading && (
        <View style={styles.loadingRow}>
          <ActivityIndicator color="#2d6a4f" />
          <Text style={styles.loadingText}>{text.loading}</Text>
        </View>
      )}

      {errorMessage !== "" && <Text style={styles.errorText}>{errorMessage}</Text>}

      {!isLoading && errorMessage === "" && filteredLocations.length === 0 && (
        <Text style={styles.emptyText}>{text.noPoints}</Text>
      )}

      {/* Lista punctelor */}
      {filteredLocations.map((loc) => (
        <TouchableOpacity
          key={loc.id}
          style={[
            styles.card,
            loc.isPartner && styles.cardPartner,
            selectedCollectionPoint?.id === loc.id && styles.cardSelected,
          ]}
          onPress={() => handleSelectLocation(loc)}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.locName}>📍 {loc.name}</Text>
            <Text style={styles.locAddr}>
              {loc.address}
              {loc.distance != null ? ` · ${loc.distance.toFixed(1)} km` : ""}
            </Text>
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

      <Text style={styles.sourceText}>{text.source}</Text>
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
    marginTop: 4,
  },
  searchRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#d8f3dc",
    paddingHorizontal: 12,
    height: 48,
    elevation: 1,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  input: { flex: 1, fontSize: 14, color: "#333" },
  btnSearch: {
    backgroundColor: "#2d6a4f",
    borderRadius: 10,
    height: 48,
    paddingHorizontal: 14,
    justifyContent: "center",
    marginLeft: 8,
  },
  btnSearchText: { color: "#ffffff", fontWeight: "bold", fontSize: 13 },
  btnDisabled: { opacity: 0.6 },

  chipsRow: { flexGrow: 0, marginBottom: 10 },
  cityChip: {
    backgroundColor: "#ffffff",
    borderColor: "#d4a373",
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  cityChipText: { color: "#bc6c25", fontWeight: "bold", fontSize: 12 },
  filterChip: {
    backgroundColor: "#ffffff",
    borderColor: "#d8f3dc",
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  filterChipActive: { backgroundColor: "#2d6a4f", borderColor: "#2d6a4f" },
  filterText: { color: "#2d6a4f", fontWeight: "600", fontSize: 12 },
  filterTextActive: { color: "#ffffff" },

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

  loadingRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  loadingText: { color: "#2d6a4f", marginLeft: 8, fontSize: 13 },
  errorText: { color: "#9b2226", fontSize: 13, marginBottom: 10 },
  emptyText: { color: "#666666", fontSize: 13, marginBottom: 10 },
  sourceText: { color: "#999999", fontSize: 11, textAlign: "center", marginTop: 6 },

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
  cardPartner: { borderColor: "#d4a373" },
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
    marginLeft: 8,
  },
  btnRouteText: { color: "#ffffff", fontSize: 12, fontWeight: "bold" },
});
