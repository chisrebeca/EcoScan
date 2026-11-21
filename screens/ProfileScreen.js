import React, { useContext, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { UserContext } from "../UserContext";
import Text from "../LocalizedText";

export default function ProfileScreen() {
  const { user, points, recycledCount, redeemedVouchers, setActiveVoucher, setCurrentScreen, register, login, logout, isRestoring, t } = useContext(UserContext);
  const [isRegistering, setIsRegistering] = useState(true);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!email.trim() || !password) return Alert.alert("Date lipsă", "Completează emailul și parola.");
    if (isRegistering && !fullName.trim()) return Alert.alert("Date lipsă", "Completează numele tău.");
    setSubmitting(true);
    try {
      if (isRegistering) {
        await register({ fullName, email, password });
        Alert.alert("Cont creat cu succes", "Contul tău a fost creat cu succes.");
      } else {
        await login({ email, password });
        Alert.alert("Reconectare reușită", "Ai fost reconectat cu succes.");
      }
      setPassword("");
    } catch (error) { Alert.alert("Nu am putut continua", error.message); }
    finally { setSubmitting(false); }
  };

  if (isRestoring) return <View style={styles.center}><ActivityIndicator color="#2d6a4f" /></View>;
  if (user) return <ScrollView contentContainerStyle={styles.container}>
    <Text style={styles.title}>{t("account")}</Text>
    <View style={styles.card}><Text style={styles.name}>{user.full_name}</Text><Text style={styles.email}>{user.email}</Text><View style={styles.balance}><Text style={styles.balanceText}>🪙 {points} puncte</Text></View></View>
    <View style={styles.card}><Text style={styles.cardTitle}>{t("statistics")}</Text><Text style={styles.stat}>♻️ {t("recycled")}: {recycledCount}</Text></View>
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{t("redeemed")} ({redeemedVouchers.length})</Text>
      {redeemedVouchers.length === 0 ? <Text style={styles.helper}>{t("noVouchers")}</Text> : redeemedVouchers.map((voucher) => <TouchableOpacity key={voucher.id} style={styles.voucherRow} onPress={() => { setActiveVoucher(voucher); setCurrentScreen("VoucherQR"); }}>
        <View style={styles.voucherInfo}><Text style={styles.voucherTitle}>🎁 {voucher.title}</Text><Text style={styles.voucherDescription} numberOfLines={1}>{voucher.description}</Text><Text style={styles.voucherCode}>{t("code")}: {voucher.code}</Text></View>
        <Text style={styles.voucherAction}>QR ›</Text>
      </TouchableOpacity>)}
    </View>
    <TouchableOpacity style={styles.logout} onPress={logout}><Text style={styles.btnText}>{t("signOut")}</Text></TouchableOpacity>
  </ScrollView>;

  return <View style={styles.container}>
    <Text style={styles.title}>{isRegistering ? t("createAccount") : t("signIn")}</Text>
    <Text style={styles.intro}>Contul îți păstrează punctele, scanările și voucherele.</Text>
    <View style={styles.card}>
      {isRegistering && <><Text style={styles.label}>{t("name")}</Text><TextInput style={styles.input} value={fullName} onChangeText={setFullName} placeholder={t("name")} autoCapitalize="words" /></>}
      <Text style={styles.label}>{t("email")}</Text><TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="nume@email.ro" autoCapitalize="none" autoCorrect={false} keyboardType="email-address" />
      <Text style={styles.label}>{t("password")}</Text><TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder={t("password")} secureTextEntry autoCapitalize="none" />
      <TouchableOpacity style={[styles.primary, submitting && styles.disabled]} onPress={submit} disabled={submitting}><Text style={styles.btnText}>{submitting ? "Se procesează..." : isRegistering ? "Creează cont" : "Conectare"}</Text></TouchableOpacity>
    </View>
    <TouchableOpacity onPress={() => setIsRegistering((value) => !value)}><Text style={styles.switch}>{isRegistering ? "Ai deja cont? Conectează-te" : "Nu ai cont? Creează unul"}</Text></TouchableOpacity>
  </View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f4fbf7" }, center: { flex: 1, justifyContent: "center" }, title: { fontSize: 24, fontWeight: "bold", color: "#1b4332", marginBottom: 8 }, intro: { color: "#666", marginBottom: 16, lineHeight: 20 },
  card: { backgroundColor: "#fff", padding: 16, borderRadius: 14, marginBottom: 16, borderWidth: 1, borderColor: "#d8f3dc" }, label: { fontSize: 12, color: "#666", marginBottom: 4 }, input: { borderWidth: 1, borderColor: "#d8f3dc", borderRadius: 8, padding: 11, marginBottom: 12, backgroundColor: "#fafafa" },
  primary: { backgroundColor: "#2d6a4f", padding: 13, borderRadius: 9, alignItems: "center" }, logout: { backgroundColor: "#bc4749", padding: 13, borderRadius: 9, alignItems: "center" }, btnText: { color: "#fff", fontWeight: "bold" }, disabled: { opacity: 0.6 }, switch: { color: "#2d6a4f", fontWeight: "bold", textAlign: "center" },
  name: { fontSize: 20, color: "#1b4332", fontWeight: "bold" }, email: { color: "#666", marginTop: 3 }, balance: { alignSelf: "flex-start", backgroundColor: "#fefae0", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7, marginTop: 14 }, balanceText: { color: "#99582a", fontWeight: "bold" }, cardTitle: { fontSize: 16, fontWeight: "bold", color: "#1b4332", marginBottom: 10 }, stat: { color: "#333", marginBottom: 10 }, helper: { fontSize: 12, color: "#666", lineHeight: 18 },
  voucherRow: { flexDirection: "row", alignItems: "center", borderTopWidth: 1, borderColor: "#edf6f0", paddingVertical: 11 }, voucherInfo: { flex: 1 }, voucherTitle: { color: "#1b4332", fontWeight: "bold" }, voucherDescription: { color: "#666", fontSize: 12, marginTop: 2 }, voucherCode: { color: "#99582a", fontSize: 12, marginTop: 4, fontWeight: "600" }, voucherAction: { color: "#2d6a4f", fontSize: 17, fontWeight: "bold", paddingLeft: 10 },
});
