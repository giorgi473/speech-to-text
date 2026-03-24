import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type AudioFile = {
  id: number;
  name: string;
  size: string;
  duration: string;
  status: "done" | "processing";
};

const MOCK_FILES: AudioFile[] = [
  {
    id: 1,
    name: "meeting_2024.mp3",
    size: "4.2 MB",
    duration: "12:30",
    status: "done",
  },
  {
    id: 2,
    name: "lecture.wav",
    size: "18.7 MB",
    duration: "45:12",
    status: "processing",
  },
];

export default function AudioFileScreen() {
  const [files, setFiles] = useState<AudioFile[]>([]);

  const handleUpload = () => {
    Alert.alert("ფაილის არჩევა", "აირჩიეთ აუდიო ფაილი", [
      { text: "გაუქმება", style: "cancel" },
      {
        text: "სიმულაცია",
        onPress: () => {
          const mock = MOCK_FILES[files.length % 2];
          setFiles((prev) => [...prev, { ...mock, id: Date.now() }]);
        },
      },
    ]);
  };

  const removeFile = (id: number) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.uploadZone}>
        <TouchableOpacity
          style={styles.uploadBtn}
          onPress={handleUpload}
          activeOpacity={0.85}
        >
          <View style={styles.uploadIconWrap}>
            <Ionicons name="cloud-upload-outline" size={36} color="#2D7CF6" />
          </View>
          <Text style={styles.uploadTitle}>ფაილის ატვირთვა</Text>
          <Text style={styles.uploadSub}>
            MP3 · WAV · M4A · OGG · მაქს. 200MB
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.list}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        showsVerticalScrollIndicator={false}
      >
        {files.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="document-outline" size={48} color="#D0D8F0" />
            <Text style={styles.emptyText}>ჯერ ფაილი არ არის ატვირთული</Text>
          </View>
        ) : (
          files.map((file) => (
            <View key={file.id} style={styles.fileCard}>
              <View style={styles.fileIconWrap}>
                <Ionicons name="musical-notes" size={22} color="#2D7CF6" />
              </View>
              <View style={styles.fileInfo}>
                <Text style={styles.fileName} numberOfLines={1}>
                  {file.name}
                </Text>
                <Text style={styles.fileMeta}>
                  {file.size} · {file.duration}
                </Text>
                <View
                  style={[
                    styles.badge,
                    file.status === "done"
                      ? styles.badgeDone
                      : styles.badgeProc,
                  ]}
                >
                  <Text
                    style={[
                      styles.badgeText,
                      file.status === "done"
                        ? styles.badgeTextDone
                        : styles.badgeTextProc,
                    ]}
                  >
                    {file.status === "done" ? "✓ დასრულდა" : "⏳ მუშავდება"}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => removeFile(file.id)}
                style={styles.removeBtn}
              >
                <Ionicons name="close-circle" size={22} color="#C0C0D0" />
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
  headerTitle: { fontSize: 17, fontWeight: "700", color: "#1A1A2E" },
  uploadZone: { padding: 20 },
  uploadBtn: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#D8E8FF",
    borderStyle: "dashed",
    alignItems: "center",
    paddingVertical: 32,
    gap: 10,
  },
  uploadIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#EEF4FF",
    alignItems: "center",
    justifyContent: "center",
  },
  uploadTitle: { fontSize: 16, fontWeight: "700", color: "#1A1A2E" },
  uploadSub: { fontSize: 13, color: "#9090A8" },
  list: { flex: 1 },
  emptyState: { alignItems: "center", paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 15, color: "#B0B0C8", fontWeight: "500" },
  fileCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  fileIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#EEF4FF",
    alignItems: "center",
    justifyContent: "center",
  },
  fileInfo: { flex: 1, gap: 4 },
  fileName: { fontSize: 14, fontWeight: "700", color: "#1A1A2E" },
  fileMeta: { fontSize: 12, color: "#9090A8" },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 2,
  },
  badgeDone: { backgroundColor: "#E8F5E9" },
  badgeProc: { backgroundColor: "#FFF8E1" },
  badgeText: { fontSize: 12, fontWeight: "600" },
  badgeTextDone: { color: "#2E7D32" },
  badgeTextProc: { color: "#F57F17" },
  removeBtn: { padding: 4 },
});
