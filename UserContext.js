import React, { createContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiRequest } from "./api";
import { translations } from "./translations";

export const UserContext = createContext();
const STORAGE_KEY = "reclar.session.v1";
const LANGUAGE_KEY = "reclar.language.v1";

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [points, setPoints] = useState(0);
  const [recycledCount, setRecycledCount] = useState(0);
  const [currentScreen, setCurrentScreen] = useState("Home");
  const [productData, setProductData] = useState(null);
  const [selectedCollectionPoint, setSelectedCollectionPoint] = useState(null);
  const [activeVoucher, setActiveVoucher] = useState(null);
  const [redeemedVouchers, setRedeemedVouchers] = useState([]);
  const [isRestoring, setIsRestoring] = useState(true);
  const [language, setLanguageState] = useState("ro");

  const setLanguage = async (nextLanguage) => {
    if (!translations[nextLanguage]) return;
    setLanguageState(nextLanguage);
    await AsyncStorage.setItem(LANGUAGE_KEY, nextLanguage);
  };

  const t = (key) => translations[language]?.[key] || translations.ro[key] || key;

  const saveSession = async (nextToken, nextUser) => {
    if (!nextToken || !nextUser) return AsyncStorage.removeItem(STORAGE_KEY);
    return AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ token: nextToken, user: nextUser }));
  };

  const applyUser = async (nextToken, nextUser) => {
    setToken(nextToken);
    setUser(nextUser);
    setPoints(nextUser.points || 0);
    setRecycledCount(nextUser.recycled_count || 0);
    await saveSession(nextToken, nextUser);
  };

  const loadRedeemedVouchers = async (sessionToken = token) => {
    if (!sessionToken) return setRedeemedVouchers([]);
    const data = await apiRequest("/api/vouchers/mine", { token: sessionToken });
    setRedeemedVouchers(data.vouchers);
  };

  useEffect(() => {
    const restore = async () => {
      try {
        const storedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
        if (translations[storedLanguage]) setLanguageState(storedLanguage);
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (!stored) return;
        const session = JSON.parse(stored);
        const data = await apiRequest("/api/me", { token: session.token });
        await applyUser(session.token, data.user);
        await loadRedeemedVouchers(session.token);
      } catch {
        await AsyncStorage.removeItem(STORAGE_KEY);
      } finally {
        setIsRestoring(false);
      }
    };
    restore();
  }, []);

  const register = async ({ fullName, email, password }) => {
    const data = await apiRequest("/api/auth/register", {
      method: "POST", body: { full_name: fullName, email, password },
    });
    await applyUser(data.token, data.user);
    try { await loadRedeemedVouchers(data.token); } catch { setRedeemedVouchers([]); }
    return data.user;
  };

  const login = async ({ email, password }) => {
    const data = await apiRequest("/api/auth/login", { method: "POST", body: { email, password } });
    await applyUser(data.token, data.user);
    // Nu blocăm autentificarea dacă istoricul voucherelor nu poate fi încărcat temporar.
    try { await loadRedeemedVouchers(data.token); } catch { setRedeemedVouchers([]); }
    return data.user;
  };

  const logout = async () => {
    setToken(null); setUser(null); setPoints(0); setRecycledCount(0); setActiveVoucher(null); setRedeemedVouchers([]);
    await saveSession(null, null);
  };

  const recordCollection = async (scanCode) => {
    if (!user || !token) throw new Error("Creează un cont sau conectează-te înainte de scanare.");
    // Scanarea directă din tabul „Scanează” trebuie să poată funcționa și fără
    // alegerea prealabilă a unui punct de pe hartă.
    const collectionPointId = selectedCollectionPoint?.id || "direct-scan";
    const data = await apiRequest("/api/collections/scan", {
      method: "POST", token,
      body: { collection_point_id: collectionPointId, scan_code: scanCode },
    });
    await applyUser(token, data.user);
    return data.awarded_points;
  };

  const redeemVoucher = async (voucher) => {
    if (!user || !token) throw new Error("Conectează-te pentru a revendica un voucher.");
    const data = await apiRequest("/api/vouchers/redeem", {
      method: "POST", token,
      body: { title: voucher.title, description: voucher.desc, cost: voucher.cost },
    });
    await applyUser(token, data.user);
    setActiveVoucher(data.voucher);
    setRedeemedVouchers((vouchers) => [data.voucher, ...vouchers]);
    return data.voucher;
  };

  const sendVoucherEmail = async () => {
    if (!token || !activeVoucher) throw new Error("Nu există un voucher de trimis.");
    const data = await apiRequest(`/api/vouchers/${activeVoucher.code}/send-email`, {
      method: "POST", token,
    });
    setActiveVoucher((voucher) => ({ ...voucher, email_status: data.email_status }));
    return data.email;
  };

  const value = useMemo(() => ({
    user, points, recycledCount, currentScreen, setCurrentScreen, productData,
    setProductData, selectedCollectionPoint, setSelectedCollectionPoint,
    activeVoucher, setActiveVoucher, redeemedVouchers, isRestoring, register, login, logout,
    language, setLanguage, t,
    recordCollection, redeemVoucher, sendVoucherEmail,
  }), [user, points, recycledCount, currentScreen, productData, selectedCollectionPoint, activeVoucher, redeemedVouchers, isRestoring, language]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
