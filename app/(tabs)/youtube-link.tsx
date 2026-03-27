import React, { useEffect, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CustomAlert from "@/components/CustomAlert";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  ActivityIndicator,
  Image,
  Linking,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

type TranscriptItem = {
  id: number;
  url: string;
  title: string;
  thumbnail: string;
  preview: string;
  time: string;
};

export default function YouTubeLinkScreen() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [transcripts, setTranscripts] = useState<TranscriptItem[]>([]);
  const [alert, setAlert] = useState<{ visible: boolean; title: string; message: string }>({
    visible: false,
    title: "",
    message: "",
  });
  const insets = useSafeAreaInsets();

  // Load history on mount
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const savedHistory = await AsyncStorage.getItem("youtube_history");
        if (savedHistory) {
          setTranscripts(JSON.parse(savedHistory));
        }
      } catch (e) {
        console.error("Failed to load history", e);
      }
    };
    loadHistory();
  }, []);

  // Save history when transcripts change
  useEffect(() => {
    const saveHistory = async () => {
      try {
        await AsyncStorage.setItem("youtube_history", JSON.stringify(transcripts));
      } catch (e) {
        console.error("Failed to save history", e);
      }
    };
    if (transcripts.length > 0) {
      saveHistory();
    }
  }, [transcripts]);

  // Clear all history
  const clearHistory = async () => {
    try {
      await AsyncStorage.removeItem("youtube_history");
      setTranscripts([]);
    } catch (e) {
      console.error("Failed to clear history", e);
    }
  };

  const isValid = url.includes("youtube.com") || url.includes("youtu.be");

  const handleProcess = async () => {
    if (!isValid) {
      setAlert({
        visible: true,
        title: "არასწორი URL",
        message: "გთხოვთ შეიყვანოთ სწორი YouTube ბმული",
      });
      return;
    }
    setLoading(true);

    try {
      // Fetch YouTube info using oEmbed API
      const encodedUrl = encodeURIComponent(url);
      const oembedUrl = `https://www.youtube.com/oembed?url=${encodedUrl}&format=json`;

      let response = await fetch(oembedUrl);

      let videoTitle = "YouTube ვიდეო";
      let videoThumbnail = "";

      if (response.ok) {
        const data = await response.json();
        videoTitle = data.title || "YouTube ვიდეო";
        videoThumbnail = data.thumbnail_url || "";
      } else {
        // Fallback: extract ID to get default thumbnail and try to get title from page
        const videoIdMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]{11})/);
        const videoId = videoIdMatch ? videoIdMatch[1] : null;

        if (videoId) {
          videoThumbnail = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
        }

        const pageResponse = await fetch(url);
        if (pageResponse.ok) {
          const html = await pageResponse.text();
          const titleMatch = html.match(/<title>(.*?)<\/title>/);
          if (titleMatch && titleMatch[1]) {
            videoTitle = titleMatch[1].replace(" - YouTube", "");
          }
        }
      }

      setLoading(false);
      setTranscripts((prev) => [
        {
          id: Date.now(),
          url,
          title: videoTitle,
          thumbnail: videoThumbnail,
          preview: "",
          time: "ახლა",
        },
        ...prev,
      ]);
      setUrl("");
    } catch (error) {
      console.error("Error fetching YouTube info:", error);
      setLoading(false);
      setTranscripts((prev) => [
        {
          id: Date.now(),
          url,
          title: "YouTube ვიდეო",
          thumbnail: "",
          preview: "",
          time: "ახლა",
        },
        ...prev,
      ]);
      setUrl("");
    }
  };

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      <CustomAlert
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        onClose={() => setAlert({ ...alert, visible: false })}
      />

      {/* Input Section */}
      <View className="bg-white rounded-[20px] p-5 pt-0 gap-3" style={{ marginTop: -11 }}>
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
          className={`rounded-xl py-[15px] flex-row items-center justify-center ${!isValid || loading ? "bg-[#D0D0E0]" : "bg-red-600"
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
        className="flex-1 mt-4"
        contentContainerClassName="px-4 pb-10 gap-4"
        showsVerticalScrollIndicator={false}
      >
        {transcripts.length > 0 && (
          <View className="flex-row items-center justify-between px-1">
            <Text className="text-[13px] font-bold text-[#9090A8] uppercase tracking-widest">
              ბოლო ტრანსკრიფციები
            </Text>
            <TouchableOpacity onPress={clearHistory}>
              <Text className="text-[12px] font-bold text-red-500 uppercase">გასუფთავება</Text>
            </TouchableOpacity>
          </View>
        )}

        {transcripts.length === 0 ? (
          <View className="items-center py-16 gap-4 px-8">
            <View className="w-24 h-24 rounded-full bg-white shadow-sm items-center justify-center border border-[#F0F0F5]">
              <Ionicons name="logo-youtube" size={44} color="#FFD5D5" />
            </View>
            <View className="gap-2 items-center">
              <Text className="text-lg font-bold text-[#1A1A2E] text-center">
                ჯერჯერობით ცარიელია
              </Text>
              <Text className="text-[15px] text-[#9090A8] text-center leading-6">
                ჩასვით YouTube ვიდეოს ბმული ზემოთ და მიიღეთ ტექსტური ვერსია წამებში
              </Text>
            </View>
          </View>
        ) : (
          transcripts.map((item) => (
            <View key={item.id} className="bg-white rounded-xl p-5 gap-4 shadow-sm border border-[#EBEBF5] relative">
              {/* Top-right link icon */}
              <TouchableOpacity
                onPress={() => Linking.openURL(item.url).catch(() => { })}
                className="absolute top-5 right-5 z-10"
              >
                <Ionicons name="open-outline" size={18} color="#2D7CF6" />
              </TouchableOpacity>

              <View className="flex-row items-center">
                <View className="flex-row items-center gap-3 flex-1 pr-10">
                  {item.thumbnail ? (
                    <Image
                      source={{ uri: item.thumbnail }}
                      className="w-12 h-12 rounded-md"
                      resizeMode="cover"
                    />
                  ) : (
                    <View className="w-12 h-12 rounded-lg bg-[#FFF5F5] items-center justify-center">
                      <Ionicons name="logo-youtube" size={24} color="#FF0000" />
                    </View>
                  )}
                  <View className="flex-1">
                    <Text
                      className="text-[15px] font-bold text-[#1A1A2E]"
                      numberOfLines={2}
                    >
                      {item.title}
                    </Text>
                    <Text className="text-[12px] text-[#9090A8]">{item.time}</Text>
                  </View>
                </View>
              </View>

              {item.preview ? (
                <View className="bg-[#F7F8FC] rounded-xl p-3">
                  <Text
                    className="text-[13px] text-[#606078] leading-[20px]"
                    numberOfLines={3}
                  >
                    {item.preview}
                  </Text>
                </View>
              ) : null}

              <View className="flex-row items-center justify-between pt-1">
                <View className="px-2 py-1 rounded-md bg-green-50">
                  <Text className="text-[10px] font-bold text-green-600 uppercase">მზადაა</Text>
                </View>
                <TouchableOpacity
                  className="flex-row items-center gap-1.5 bg-[#2D7CF6] px-5 py-2.5 rounded-xl"
                  onPress={() => Linking.openURL(item.url).catch(() => { })}
                >
                  <Ionicons name="document-text-outline" size={15} color="white" />
                  <Text className="text-[14px] text-white font-bold">ნახვა</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}
