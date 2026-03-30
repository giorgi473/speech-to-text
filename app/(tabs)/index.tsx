import SettingsModal, { SettingsValues } from "@/components/settings";
import { useRecords } from "@/context/RecordContext";
import { useTheme } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
    Animated,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRecording } from "./_layout";

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
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const [liveText, setLiveText] = useState("");
  const [showParams, setShowParams] = useState(false);
  const [settings, setSettings] = useState<SettingsValues>({
    language: "ka",
    speakerOutput: "diarization",
    sttModel: "stt1",
    microphone: "default",
    punctuation: true,
    autoCorrect: false,
    theme: theme,
  });

  useEffect(() => {
    setSettings((p) => ({ ...p, theme }));
  }, [theme]);
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
        const date = "ახლა";
        addRecord({ text: trimmed, date, duration });
        router.push("/history");
      }
    }

    return () => {
      if (chunkTimerRef.current) clearInterval(chunkTimerRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  return (
    <View className="flex-1 bg-white dark:bg-[#121212]" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center justify-between px-4 pt-0 pb-2" style={{ marginTop: -12 }}>
        <View className="flex-row items-center">
          <Ionicons name="mic-outline" size={18} color="#2D7CF6" />
          <Text className="ml-1.5 text-[14px] font-semibold text-[#1A1A2E] dark:text-[#E0E0E0]">
            {isRecording ? "ჩანაწერი მიდის..." : "დაიწყე ჩანაწერა..."}
          </Text>
        </View>
        <TouchableOpacity
          className="flex-row items-center rounded-md border border-[#86b4fa] bg-white dark:bg-[#1E1E2E] px-3 py-1.5"
          onPress={() => setShowParams(true)}
        >
          <Ionicons name="settings-outline" size={16} color="#2D7CF6" />
          <Text className="ml-1 text-[13px] font-semibold text-[#2D7CF6]">
            პარამეტრები
          </Text>
        </TouchableOpacity>
      </View>
      <View className="mx-4 mb-1 flex-1 overflow-hidden rounded-xl border border-[#f0f0f0] dark:border-[#2D2D3F] bg-white dark:bg-[#1E1E2E]">
        <ScrollView
          ref={scrollRef}
          className="flex-1"
          contentContainerStyle={{
            padding: 18,
            paddingBottom: 8,
            flexGrow: 1
          }}
          showsVerticalScrollIndicator
        >
          {liveText ? (
            <View className="flex-row flex-wrap">
              <Text className="text-[16px] font-normal leading-[26px] text-[#1A1A2E] dark:text-[#E0E0E0]">
                {liveText}
              </Text>
              {isRecording && (
                <Animated.View
                  style={{
                    opacity: cursorAnim,
                    width: 2,
                    height: 20,
                    marginTop: 3,
                    borderRadius: 1,
                    backgroundColor: "#2D7CF6",
                  }}
                />
              )}
            </View>
          ) : (
            <View className="flex-1 items-center justify-start pt-10">
              <View className="flex-row items-center gap-2">
                <Ionicons name="mic-outline" size={24} color="#C5D5F5" />
                <Text className="text-[17px] font-bold text-[#1A1A2E] dark:text-[#E0E0E0]">
                  {isRecording ? "მოსმენა..." : "ჩაიწერეთ ხმა"}
                </Text>
              </View>
              <Text className="mt-1.5 max-w-[220px] text-center text-[13px] leading-5 text-[#9090A8] dark:text-[#9090A8]">
                {isRecording
                  ? "ლაპარაკი გრძელდება, ტექსტი გამოჩნდება..."
                  : "დააჭირეთ ქვემოთ მიკროფონს"}
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
      <SettingsModal
        visible={showParams}
        initialValues={settings}
        onClose={() => setShowParams(false)}
        onSave={(newSettings) => setSettings(newSettings)}
      />
    </View>
  );
}
