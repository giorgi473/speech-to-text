import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type TranscriptItem = {
  id: number;
  url: string;
  title: string;
  preview: string;
  time: string;
};

export default function YouTubeLinkScreen() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [transcripts, setTranscripts] = useState<TranscriptItem[]>([]);

  const isValid = url.includes("youtube.com") || url.includes("youtu.be");

  const handleProcess = () => {
    if (!isValid) {
      Alert.alert("არასწორი URL", "გთხოვთ შეიყვანოთ სწორი YouTube ბმული");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setTranscripts((prev) => [
        {
          id: Date.now(),
          url,
          title: "YouTube ვიდეო",
          preview: "ტრანსკრიბირებული ტექსტი გამოჩნდება აქ...",
          time: "ახლა",
        },
        ...prev,
      ]);
      setUrl("");
    }, 2000);
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Input Card */}
      <View style={styles.inputSection}>
        <Text style={styles.sectionLabel}>YouTube ბმული</Text>
        <View
          style={[
            styles.inputWrap,
            url.length > 0 &&
              (isValid ? styles.inputWrapValid : styles.inputWrapInvalid),
          ]}
        >
          <Ionicons
            name="link-outline"
            size={18}
            color={url.length > 0 && !isValid ? "#E05555" : "#9090A8"}
            style={{ marginRight: 10 }}
          />
          <TextInput
            style={styles.input}
            placeholder="https://youtube.com/watch?v=..."
            placeholderTextColor="#C0C0D0"
            value={url}
            onChangeText={setUrl}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
          />
          {url.length > 0 && (
            <TouchableOpacity onPress={() => setUrl("")} style={{ padding: 4 }}>
              <Ionicons name="close-circle" size={18} color="#C0C0D0" />
            </TouchableOpacity>
          )}
        </View>

        {url.length > 0 && !isValid && (
          <Text style={styles.errorHint}>⚠ სწორი YouTube URL არ არის</Text>
        )}

        <TouchableOpacity
          style={[
            styles.processBtn,
            (!isValid || loading) && styles.processBtnDisabled,
          ]}
          onPress={handleProcess}
          disabled={!isValid || loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <Ionicons
                name="arrow-forward-circle"
                size={20}
                color="#FFFFFF"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.processBtnText}>ტრანსკრიბირება</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Results */}
      <ScrollView
        style={styles.list}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        showsVerticalScrollIndicator={false}
      >
        {transcripts.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconWrap}>
              <Ionicons name="logo-youtube" size={40} color="#FFD5D5" />
            </View>
            <Text style={styles.emptyTitle}>YouTube ვიდეოს ტრანსკრიბირება</Text>
            <Text style={styles.emptyText}>
              ჩასვით ბმული და მიიღეთ ტექსტი ნებისმიერი ვიდეოდან
            </Text>
          </View>
        ) : (
          transcripts.map((item) => (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardYtBadge}>
                  <Ionicons name="logo-youtube" size={16} color="#FF0000" />
                </View>
                <Text style={styles.cardTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={styles.cardTime}>{item.time}</Text>
              </View>
              <Text style={styles.cardPreview} numberOfLines={2}>
                {item.preview}
              </Text>
              <TouchableOpacity
                style={styles.openLink}
                onPress={() => Linking.openURL(item.url).catch(() => {})}
              >
                <Ionicons name="open-outline" size={14} color="#2D7CF6" />
                <Text style={styles.openLinkText}> ორიგინალი</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 0,
    borderBottomWidth: 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
  },
  ytBadge: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: "#FFF0F0",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 17, fontWeight: "700", color: "#1A1A2E" },
  inputSection: {
    backgroundColor: "#FFFFFF",
    margin: 16,
    borderRadius: 20,
    padding: 20,
    gap: 12,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#9090A8",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7F8FC",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: "#EEEEF5",
  },
  inputWrapValid: { borderColor: "#4CAF50" },
  inputWrapInvalid: { borderColor: "#FFCDD2" },
  input: { flex: 1, fontSize: 14, color: "#1A1A2E", fontWeight: "500" },
  errorHint: { fontSize: 12, color: "#E05555", marginTop: -4 },
  processBtn: {
    backgroundColor: "#FF0000",
    borderRadius: 14,
    paddingVertical: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  processBtnDisabled: {
    backgroundColor: "#D0D0E0",
    shadowOpacity: 0,
    elevation: 0,
  },
  processBtnText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
  list: { flex: 1 },
  emptyState: {
    alignItems: "center",
    paddingTop: 40,
    gap: 12,
    paddingHorizontal: 20,
  },
  emptyIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FFF5F5",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A2E",
    textAlign: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#9090A8",
    textAlign: "center",
    lineHeight: 20,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    gap: 8,
    marginBottom: 12,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  cardYtBadge: {
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: "#FFF0F0",
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: { flex: 1, fontSize: 14, fontWeight: "700", color: "#1A1A2E" },
  cardTime: { fontSize: 12, color: "#9090A8" },
  cardPreview: { fontSize: 13, color: "#606078", lineHeight: 19 },
  openLink: { flexDirection: "row", alignItems: "center" },
  openLinkText: { fontSize: 13, color: "#2D7CF6", fontWeight: "600" },
});
