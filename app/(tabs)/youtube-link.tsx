import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
  const insets = useSafeAreaInsets();

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
    <SafeAreaView className="flex-1 bg-white">
      <View className="bg-white rounded-[20px] p-5 gap-3">
        <Text className="text-xs font-bold text-[#9090A8] tracking-widest uppercase">
          YouTube ბმული
        </Text>
        <View
          className={`flex-row items-center bg-[#F7F8FC] rounded-xl px-[14px] py-3 border-[1.5px] ${url.length === 0
            ? "border-[#EEEEF5]"
            : isValid
              ? "border-green-500"
              : "border-red-200"
            }`}
        >
          <Ionicons
            name="link-outline"
            size={18}
            color={url.length > 0 && !isValid ? "#E05555" : "#9090A8"}
            style={{ marginRight: 10 }}
          />
          <TextInput
            className="flex-1 text-sm text-[#1A1A2E] font-medium"
            placeholder="https://youtube.com/watch?v=..."
            placeholderTextColor="#C0C0D0"
            value={url}
            onChangeText={setUrl}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
          />
          {url.length > 0 && (
            <TouchableOpacity onPress={() => setUrl("")} className="p-1">
              <Ionicons name="close-circle" size={18} color="#C0C0D0" />
            </TouchableOpacity>
          )}
        </View>

        {url.length > 0 && !isValid && (
          <Text className="text-xs text-[#E05555] -mt-1">
            ⚠ სწორი YouTube URL არ არის
          </Text>
        )}

        <TouchableOpacity
          className={`rounded-[14px] py-[15px] flex-row items-center justify-center ${!isValid || loading ? "bg-[#D0D0E0]" : "bg-red-600"
            }`}
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
              <Text className="text-white text-[15px] font-bold">
                ტრანსკრიბირება
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
      <ScrollView
        className="flex-1 px-4 mt-2"
        contentContainerClassName="p-4 gap-3"
        contentContainerStyle={{ paddingBottom: 8 }}
        showsVerticalScrollIndicator={false}
      >
        {transcripts.length === 0 ? (
          <View className="items-center pt-10 gap-3 px-5">
            <View className="w-20 h-20 rounded-full bg-[#FFF5F5] items-center justify-center">
              <Ionicons name="logo-youtube" size={40} color="#FFD5D5" />
            </View>
            <Text className="text-base font-bold text-[#1A1A2E] text-center">
              YouTube ვიდეოს ტრანსკრიბირება
            </Text>
            <Text className="text-sm text-[#9090A8] text-center leading-5">
              ჩასვით ბმული და მიიღეთ ტექსტი ნებისმიერი ვიდეოდან
            </Text>
          </View>
        ) : (
          transcripts.map((item) => (
            <View key={item.id} className="bg-white rounded-2xl p-4 gap-2 mb-3">
              <View className="flex-row items-center gap-2">
                <View className="w-[26px] h-[26px] rounded-md bg-[#FFF0F0] items-center justify-center">
                  <Ionicons name="logo-youtube" size={16} color="#FF0000" />
                </View>
                <Text
                  className="flex-1 text-sm font-bold text-[#1A1A2E]"
                  numberOfLines={1}
                >
                  {item.title}
                </Text>
                <Text className="text-xs text-[#9090A8]">{item.time}</Text>
              </View>

              <Text
                className="text-[13px] text-[#606078] leading-[19px]"
                numberOfLines={2}
              >
                {item.preview}
              </Text>

              <TouchableOpacity
                className="flex-row items-center"
                onPress={() => Linking.openURL(item.url).catch(() => { })}
              >
                <Ionicons name="open-outline" size={14} color="#2D7CF6" />
                <Text className="text-[13px] text-[#2D7CF6] font-semibold">
                  {" "}
                  ორიგინალი
                </Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
