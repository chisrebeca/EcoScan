import { Platform } from "react-native";

// Pentru telefon fizic setează EXPO_PUBLIC_API_URL cu IP-ul Mac-ului, de exemplu
// EXPO_PUBLIC_API_URL=http://192.168.1.20:8000 . 127.0.0.1 funcționează pe web.
export const API_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  (Platform.OS === "web" ? "http://127.0.0.1:8000" : "http://127.0.0.1:8000");

export async function apiRequest(path, { method = "GET", token, body } = {}) {
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
  } catch {
    throw new Error("Nu pot contacta serverul EcoScan. Pornește backendul și verifică API_URL.");
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.detail || "A apărut o eroare la server.");
  return data;
}
