import React, { useContext, useState } from "react";
import { Alert, Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { API_URL } from "../api";
import { UserContext } from "../UserContext";
import Text from "../LocalizedText";

export default function VoucherQRScreen() {
  const { activeVoucher, setCurrentScreen, sendVoucherEmail, user, t } = useContext(UserContext);
  const [sending, setSending] = useState(false);
  if (!activeVoucher) return <View style={styles.container}><Text>Nu există un voucher selectat.</Text></View>;
  const wasSent = activeVoucher.email_status === "sent";
  const handleSendEmail = async () => {
    setSending(true);
    try {
      const email = await sendVoucherEmail();
      Alert.alert("Email trimis", `Voucherul cu QR a fost trimis la ${email}.`);
    } catch (error) {
      Alert.alert("Email netrimis", error.message);
    } finally {
      setSending(false);
    }
  };
  return <View style={styles.container}>
    <Text style={styles.title}>{t("voucher")}</Text>
    <View style={styles.card}>
      <Text style={styles.brand}>{activeVoucher.title}</Text>
      <Text style={styles.desc}>{activeVoucher.description}</Text>
      <Image style={styles.qr} source={{ uri: `${API_URL}/api/vouchers/${activeVoucher.code}/qr` }} />
      <Text style={styles.code}>{t("code")}: {activeVoucher.code}</Text>
      <Text style={styles.hint}>Arată acest cod QR partenerului pentru validare.</Text>
    </View>
    <View style={[styles.emailStatus, wasSent ? styles.sent : styles.pending]}><Text style={styles.emailText}>{wasSent ? `✓ Voucherul cu QR a fost trimis la ${user?.email}.` : `Voucherul este salvat în cont. Îl poți trimite la ${user?.email} după configurarea SMTP.`}</Text></View>
    <TouchableOpacity style={[styles.emailButton, sending && styles.emailButtonDisabled]} onPress={handleSendEmail} disabled={sending}><Text style={styles.buttonText}>{sending ? "..." : t("sendEmail")}</Text></TouchableOpacity>
    <TouchableOpacity style={styles.button} onPress={() => setCurrentScreen("Vouchers")}><Text style={styles.buttonText}>{t("backVouchers")}</Text></TouchableOpacity>
  </View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f4fbf7", padding: 20, alignItems: "center" }, title: { alignSelf: "flex-start", fontSize: 23, fontWeight: "bold", color: "#1b4332", marginBottom: 16 },
  card: { width: "100%", backgroundColor: "#fff", borderRadius: 16, padding: 20, alignItems: "center", borderWidth: 1, borderColor: "#d8f3dc" }, brand: { fontSize: 20, fontWeight: "bold", color: "#1b4332" }, desc: { color: "#666", textAlign: "center", marginTop: 6 }, qr: { width: 220, height: 220, marginVertical: 18 }, code: { fontWeight: "bold", color: "#1b4332" }, hint: { fontSize: 12, color: "#666", textAlign: "center", marginTop: 10 },
  emailStatus: { width: "100%", padding: 12, borderRadius: 10, marginTop: 14 }, sent: { backgroundColor: "#d8f3dc" }, pending: { backgroundColor: "#fefae0" }, emailText: { color: "#355e48", textAlign: "center", fontSize: 13 }, emailButton: { width: "100%", backgroundColor: "#bc6c25", borderRadius: 10, padding: 14, marginTop: 14, alignItems: "center" }, emailButtonDisabled: { opacity: 0.6 }, button: { width: "100%", backgroundColor: "#2d6a4f", borderRadius: 10, padding: 14, marginTop: 10, alignItems: "center" }, buttonText: { color: "#fff", fontWeight: "bold" },
});
