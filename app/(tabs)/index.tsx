import React, { useEffect, useRef, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  Animated,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRecording } from "./_layout";
import { router } from "expo-router";
import { useRecords } from "../RecordContext";
import SettingsModal, { SettingsValues } from "../../components/SettingsModal";

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

// ენის label-ების მაპი badge-სთვის
const LANGUAGE_LABELS: Record<string, string> = {
  ka: "ქართული",
  en: "English",
  ru: "Русский",
  de: "Deutsch",
  fr: "Français",
};

export default function IndexScreen() {
  const { isRecording } = useRecording();
  const { addRecord } = useRecords();

  const [liveText, setLiveText] = useState("");
  const [showParams, setShowParams] = useState(false);
  const [settings, setSettings] = useState<SettingsValues>({
    language: "ka",
    speakerOutput: "diarization",
    sttModel: "stt1",
    microphone: "default",
    punctuation: true,
    autoCorrect: false,
  });
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const cursorAnim = useRef(new Animated.Value(1)).current;
  const pulseRef = useRef<Animated.CompositeAnimation | null>(null);
  const chunkIndexRef = useRef(0);
  const chunkTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  // Cursor blink
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
        const date = "ახლა";
        addRecord({ text: trimmed, date, duration });
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
      {/* Top Bar */}
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

      {/* Text Area */}
      <View style={styles.textArea}>
        <ScrollView
          ref={scrollRef}
          style={styles.textScroll}
          contentContainerStyle={styles.textScrollContent}
          showsVerticalScrollIndicator
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
      </View>

      <View style={styles.controls} />

      {/* Settings Modal — ცალკე კომპონენტი */}
      <SettingsModal
        visible={showParams}
        initialValues={settings}
        onClose={() => setShowParams(false)}
        onSave={(newSettings) => setSettings(newSettings)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FFFFFF" },
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
    borderWidth: 1.2,
    borderColor: "#86b4fa",
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
    borderWidth: 1.2,
    borderColor: "#f0f0f0",
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
});
