import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
} from "react-native";
import { useRecording } from "./_layout";
import { router } from "expo-router";
import { useRecords } from "../RecordContext";

const LIVE_CHUNKS = [
  "ტექნოლოგიები ყოველდღიურად იცვლება ",
  "და ჩვენს მათთან ერთად ვვითარდებით. ",
  "ბოლო დროს ხელოვნური ინტელექტი ",
  "სულ უფრო და უფრო პოპულარული ხდება. ",
  "მისი გამოყენება შეგვიძლია სხვადასხვა ",
  "სფეროში, მათ შორის მედიცინაში, ",
  "განათლებაში და ბიზნესში. ",
  "ეს ტექნოლოგია ეხმარება ადამიანებს ",
  "სამუშაოს სწრაფად შესრულებაში. ",
  "მაგალითად, ექიმებს დიაგნოზის დასმაში, ",
  "შრომისმოყვარეებს კოდის წერაში, ",
  "მასწავლებლებს მეცადინეობის შექმნაში. ",
  "ბიზნესში AI ანალიზებს მონაცემებს ",
  "და პროგნოზებს აკეთებს გაყიდვებზე. ",
  "განათლებაში პერსონალიზებულ ",
  "საგნებს ქმნის თითოეული მოსწავლისთვის. ",
  "მედიცინაში კიბოს ადრეულ ეტაპზე ",
  "აღმოაჩენს სურათებიდან. ",
  "მომავალში კიდევ უფრო მეტი ",
  "შესაძლებლობები გაჩნდება ჩვენს წინ. ",
  "AI გახდება ჩვენი ყოველდღიური პარტნიორი, ",
  "რომელიც გაამარტივებს ცხოვრებას და მუშაობას. ",
  "ის შეცვლის მანქანებს, რობოტებს, ",
  "ვირტუალურ რეალობას. ",
  "შეუერთდი ჩვენს მოგზაურობას მომავლისკენ! ",
  "იყავი პირველი, ვინც გამოიყენებს ",
  "ამ რევოლუციურ ტექნოლოგიას. ",
];

export default function IndexScreen() {
  const { isRecording } = useRecording();
  const { addRecord, records } = useRecords();

  const [liveText, setLiveText] = useState("");
  const [showParams, setShowParams] = useState(false);
  const [language, setLanguage] = useState("ქართული");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const cursorAnim = useRef(new Animated.Value(1)).current;
  const pulseRef = useRef<Animated.CompositeAnimation | null>(null);
  const chunkIndexRef = useRef(0);
  const chunkTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    const blink = Animated.loop(
      Animated.sequence([
        Animated.timing(cursorAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(cursorAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    );
    blink.start();
    return () => blink.stop();
  }, []);

  const startPulse = () => {
    pulseRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.25,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 500,
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

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  useEffect(() => {
    if (isRecording) {
      setLiveText("");
      setElapsedSeconds(0);
      chunkIndexRef.current = 0;
      startPulse();

      timerRef.current = setInterval(() => {
        setElapsedSeconds((p) => p + 1);
      }, 1000);

      chunkTimerRef.current = setInterval(() => {
        const idx = chunkIndexRef.current;
        if (idx < LIVE_CHUNKS.length) {
          setLiveText((prev) => prev + LIVE_CHUNKS[idx]);
          chunkIndexRef.current += 1;
          setTimeout(
            () => scrollRef.current?.scrollToEnd({ animated: true }),
            50,
          );
        }
      }, 900);
    } else {
      stopPulse();
      if (chunkTimerRef.current) clearInterval(chunkTimerRef.current);
      if (timerRef.current) clearInterval(timerRef.current);

      const trimmed = liveText.trim();
      setLiveText("");

      if (trimmed) {
        const duration = formatTime(elapsedSeconds);
        const date = "ახლა"; // შეგიძლია ნამდვილი თარიღით ჩაანაცვლო

        const rec = addRecord({ text: trimmed, date, duration });

        // სურვილის მიხედვით ერთი ბოლო დამატებული რომ გახსნას:
        router.push("/history");
      }
    }

    return () => {
      if (chunkTimerRef.current) clearInterval(chunkTimerRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRecording]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topBar}>
        <View style={styles.leftInfo}>
          <Ionicons name="mic-outline" size={18} color="#2D7CF6" />
          <Text style={styles.leftInfoText}>
            {isRecording ? "ჩანაწერი მიდის..." : "დაიწყე ჩანაწერა..."}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.settingsOutlineBtn}
          onPress={() => setShowParams(true)}
        >
          <Ionicons name="settings-outline" size={16} color="#2D7CF6" />
          <Text style={styles.settingsOutlineText}>პარამეტრები</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.textArea}>
        <ScrollView
          ref={scrollRef}
          style={styles.textScroll}
          contentContainerStyle={styles.textScrollContent}
          showsVerticalScrollIndicator={true}
        >
          {liveText ? (
            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
              <Text style={styles.liveText}>{liveText}</Text>
              {isRecording && (
                <Animated.View
                  style={[styles.cursor, { opacity: cursorAnim }]}
                />
              )}
            </View>
          ) : (
            <View style={styles.placeholderContainer}>
              <Ionicons name="mic-outline" size={44} color="#C5D5F5" />
              <Text style={styles.placeholderTitle}>
                {isRecording ? "მოსმენა..." : "ჩაიწერეთ ხმა"}
              </Text>
              <Text style={styles.placeholderSub}>
                {isRecording
                  ? "ლაპარაკი გრძელდება, ტექსტი გამოჩნდება..."
                  : "დააჭირეთ ქვემოთ მიკროფონს"}
              </Text>
            </View>
          )}
        </ScrollView>

        <View style={styles.langBadge}>
          <Ionicons name="globe-outline" size={12} color="#2D7CF6" />
          <Text style={styles.langBadgeText}>{language}</Text>
        </View>
      </View>

      <View style={styles.controls} />

      <Modal visible={showParams} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>პარამეტრები</Text>
            <Text style={styles.modalLabel}>ენა</Text>
            <View style={styles.langGrid}>
              {["ქართული", "English", "Русский", "Deutsch", "Français"].map(
                (lang) => (
                  <TouchableOpacity
                    key={lang}
                    style={[
                      styles.langChip,
                      language === lang && styles.langChipActive,
                    ]}
                    onPress={() => setLanguage(lang)}
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
                ),
              )}
            </View>
            <TouchableOpacity
              style={styles.modalClose}
              onPress={() => setShowParams(false)}
            >
              <Text style={styles.modalCloseText}>შენახვა</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F7F9FF" },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  leftInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  leftInfoText: {
    fontSize: 14,
    color: "#1A1A2E",
    fontWeight: "600",
  },
  settingsOutlineBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderColor: "#2D7CF6",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: "#FFFFFF",
  },
  settingsOutlineText: {
    color: "#2D7CF6",
    fontSize: 13,
    fontWeight: "600",
  },
  textArea: {
    flex: 1,
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#D8E8FF",
    overflow: "hidden",
  },
  textScroll: { flex: 1 },
  textScrollContent: { padding: 18, flexGrow: 1 },
  liveText: {
    fontSize: 16,
    color: "#1A1A2E",
    lineHeight: 26,
    fontWeight: "400",
    letterSpacing: 0.2,
  },
  cursor: {
    width: 2,
    height: 20,
    backgroundColor: "#2D7CF6",
    marginTop: 3,
    borderRadius: 1,
  },
  placeholderContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
  },
  placeholderTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1A1A2E",
    marginTop: 14,
  },
  placeholderSub: {
    fontSize: 13,
    color: "#9090A8",
    marginTop: 6,
    textAlign: "center",
    lineHeight: 20,
    maxWidth: 220,
  },
  langBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    position: "absolute",
    bottom: 10,
    right: 12,
    backgroundColor: "#EEF4FF",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  langBadgeText: { fontSize: 11, color: "#2D7CF6", fontWeight: "600" },
  controls: {
    alignItems: "center",
    paddingBottom: 30,
    paddingTop: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: "#FFF",
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
  langChipTextActive: { color: "#FFF" },
  modalClose: {
    backgroundColor: "#2D7CF6",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  modalCloseText: { color: "#FFF", fontSize: 16, fontWeight: "700" },
});
