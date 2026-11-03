import { Feather } from "@expo/vector-icons";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const PURPLE = "#731F94";

// Full-height loader shown the first time a tab loads.
export function LoadingState({ label = "Loading your data..." }) {
  return (
    <View style={styles.loading}>
      <ActivityIndicator size="large" color={PURPLE} />
      <Text style={styles.loadingText}>{label}</Text>
    </View>
  );
}

// Friendly card for "nothing here yet" or "couldn't load" situations.
export function EmptyCard({ icon = "inbox", title, message, ctaLabel, onPress, style }) {
  return (
    <View style={[styles.card, style]}>
      <View style={styles.iconWrap}>
        <Feather name={icon} size={20} color={PURPLE} />
      </View>
      {!!title && <Text style={styles.title}>{title}</Text>}
      {!!message && <Text style={styles.message}>{message}</Text>}
      {!!ctaLabel && (
        <TouchableOpacity style={styles.cta} onPress={onPress} activeOpacity={0.85}>
          <Text style={styles.ctaText}>{ctaLabel}</Text>
          <Feather name="arrow-right" size={14} color="#FFFFFF" />
        </TouchableOpacity>
      )}
    </View>
  );
}

// Thin banner when some (not all) requests failed.
export function ErrorBanner({ message, onRetry }) {
  if (!message) return null;
  return (
    <TouchableOpacity style={styles.banner} onPress={onRetry} activeOpacity={0.8}>
      <Feather name="wifi-off" size={14} color="#9A3412" />
      <Text style={styles.bannerText}>{message}</Text>
      {onRetry ? <Text style={styles.bannerRetry}>Retry</Text> : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    gap: 12,
  },
  loadingText: { fontSize: 13, color: "#7B6F84", fontWeight: "600" },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 20,
    marginBottom: 14,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#F5EEFC",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  title: { fontSize: 15, fontWeight: "800", color: "#131B2A", textAlign: "center" },
  message: {
    fontSize: 12,
    color: "#7B6F84",
    textAlign: "center",
    lineHeight: 17,
    marginTop: 6,
  },
  cta: {
    marginTop: 14,
    backgroundColor: PURPLE,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  ctaText: { color: "#FFFFFF", fontWeight: "700", fontSize: 13 },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFF7ED",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  bannerText: { flex: 1, fontSize: 11, color: "#9A3412", fontWeight: "600" },
  bannerRetry: { fontSize: 11, color: "#9A3412", fontWeight: "800" },
});
