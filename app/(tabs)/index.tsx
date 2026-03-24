import { Ionicons } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import {
  Alert,
  Animated,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type RecordItem = {
  id: number;
  title: string;
  date: string;
  duration: string;
  text: string;
};

export default function VoiceToTextScreen() {
  const [isRecording, setIsRecording] = useState(false);
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [showParams, setShowParams] = useState(false);
  const [language, setLanguage] = useState("ქართული");
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseRef = useRef<Animated.CompositeAnimation | null>(null);

  const startPulse = () => {
    pulseRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.18,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    );
    pulseRef.current.start();
  };

  const stopPulse = () => {
    pulseRef.current?.stop();
    Animated.timing(pulseAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const toggleRecording = () => {
    if (!isRecording) {
      setIsRecording(true);
      startPulse();
    } else {
      setIsRecording(false);
      stopPulse();
      const newRecord: RecordItem = {
        id: Date.now(),
        title: `ჩანაწერი ${records.length + 1}`,
        date: "ახლა",
        duration: "0:12",
        text: "ეს არის მაგალითი ტრანსკრიბირებული ტექსტისა...",
      };
      setRecords((prev) => [newRecord, ...prev]);
    }
  };

  const deleteRecord = (id: number) => {
    Alert.alert("წაშლა", "გსურთ ჩანაწერის წაშლა?", [
      { text: "გაუქმება", style: "cancel" },
      {
        text: "წაშლა",
        style: "destructive",
        onPress: () => setRecords((prev) => prev.filter((r) => r.id !== id)),
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Action Row */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.newBtn}
          onPress={toggleRecording}
          activeOpacity={0.85}
        >
          <Ionicons
            name={isRecording ? "stop" : "add"}
            size={18}
            color="#FFFFFF"
            style={{ marginRight: 6 }}
          />
          <Text style={styles.newBtnText}>
            {isRecording ? "შეჩერება" : "ახლის გახსნა"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.paramsBtn}
          onPress={() => setShowParams(true)}
        >
          <Ionicons
            name="settings-outline"
            size={16}
            color="#2D7CF6"
            style={{ marginRight: 6 }}
          />
          <Text style={styles.paramsBtnText}>პარამეტრები</Text>
        </TouchableOpacity>
      </View>

      {/* Recording Hint Row */}
      <View style={styles.recordingHintRow}>
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <Ionicons
            name="mic-outline"
            size={20}
            color={isRecording ? "#E53935" : "#2D7CF6"}
          />
        </Animated.View>
        <Text
          style={[
            styles.recordingHintText,
            isRecording && styles.recordingHintTextActive,
          ]}
        >
          {isRecording ? "ჩაწერა მიმდინარეობს..." : "დაიწყე ჩაწერა..."}
        </Text>
      </View>

      {/* Records List */}
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {records.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons name="mic-outline" size={40} color="#C5D5F5" />
            </View>
            <Text style={styles.emptyTitle}>ჩაიწერეთ ხმა</Text>
            <Text style={styles.emptySubtitle}>
              დააჭირეთ ჩაწერის ღილაკს და დაიწყეთ ლაპარაკი
            </Text>
          </View>
        ) : (
          records.map((record) => (
            <RecordCard
              key={record.id}
              record={record}
              onDelete={() => deleteRecord(record.id)}
            />
          ))
        )}
      </ScrollView>

      {/* Params Modal */}
      <ParamsModal
        visible={showParams}
        language={language}
        onChangeLanguage={setLanguage}
        onClose={() => setShowParams(false)}
      />
    </SafeAreaView>
  );
}

function RecordCard({
  record,
  onDelete,
}: {
  record: RecordItem;
  onDelete: () => void;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardLeft}>
        <View style={styles.cardIcon}>
          <Ionicons name="document-text-outline" size={20} color="#2D7CF6" />
        </View>
        <View style={styles.cardBody}>
          <Text style={styles.cardTitle}>{record.title}</Text>
          <Text style={styles.cardMeta}>
            {record.date} · {record.duration}
          </Text>
          <Text style={styles.cardPreview} numberOfLines={1}>
            {record.text}
          </Text>
        </View>
      </View>
      <TouchableOpacity onPress={onDelete} style={styles.cardDelete}>
        <Ionicons name="trash-outline" size={18} color="#E05555" />
      </TouchableOpacity>
    </View>
  );
}

const LANGUAGES = ["ქართული", "English", "Русский", "Deutsch", "Français"];

function ParamsModal({
  visible,
  language,
  onChangeLanguage,
  onClose,
}: {
  visible: boolean;
  language: string;
  onChangeLanguage: (lang: string) => void;
  onClose: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalSheet}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>პარამეტრები</Text>

          <Text style={styles.modalLabel}>ენა</Text>
          <View style={styles.langGrid}>
            {LANGUAGES.map((lang) => (
              <TouchableOpacity
                key={lang}
                style={[
                  styles.langChip,
                  language === lang && styles.langChipActive,
                ]}
                onPress={() => onChangeLanguage(lang)}
              >
                <Text
                  style={[
                    styles.langChipText,
                    language === lang && styles.langChipTextActive,
                  ]}
                >
                  {lang}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.modalClose} onPress={onClose}>
            <Text style={styles.modalCloseText}>შენახვა</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  newBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2D7CF6",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },
  newBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  paramsBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#D0E2FF",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: "#F0F6FF",
  },
  paramsBtnText: { color: "#2D7CF6", fontSize: 14, fontWeight: "600" },
  recordingHintRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 8,
  },
  recordingHintText: {
    fontSize: 14,
    color: "#9090A8",
    fontWeight: "500",
  },
  recordingHintTextActive: {
    color: "#E53935",
    fontWeight: "600",
  },
  scrollArea: { flex: 1, backgroundColor: "#FFFFFF" },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
    flexGrow: 1,
    backgroundColor: "#FFFFFF",
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    paddingBottom: 40,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#EEF4FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1A2E",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#9090A8",
    textAlign: "center",
    lineHeight: 20,
    maxWidth: 240,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  cardLeft: { flex: 1, flexDirection: "row", alignItems: "center", gap: 12 },
  cardIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#EEF4FF",
    alignItems: "center",
    justifyContent: "center",
  },
  cardBody: { flex: 1 },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1A1A2E",
    marginBottom: 3,
  },
  cardMeta: { fontSize: 12, color: "#9090A8", marginBottom: 4 },
  cardPreview: { fontSize: 13, color: "#606078", lineHeight: 18 },
  cardDelete: { padding: 8, marginLeft: 8 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 40,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E0E0EC",
    alignSelf: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1A1A2E",
    marginBottom: 20,
  },
  modalLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#9090A8",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  langGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 28,
  },
  langChip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: "#F4F4FB",
    borderWidth: 1.5,
    borderColor: "#E8E8F0",
  },
  langChipActive: { backgroundColor: "#2D7CF6", borderColor: "#2D7CF6" },
  langChipText: { fontSize: 14, fontWeight: "600", color: "#444" },
  langChipTextActive: { color: "#FFFFFF" },
  modalClose: {
    backgroundColor: "#2D7CF6",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: "#2D7CF6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  modalCloseText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
});
