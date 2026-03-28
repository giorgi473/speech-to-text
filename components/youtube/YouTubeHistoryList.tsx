import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { TranscriptItem } from "@/hooks/useYouTubeProcessor";
import { Ionicons } from "@expo/vector-icons";
import YouTubeHistoryItem from "./YouTubeHistoryItem";

interface YouTubeHistoryListProps {
  transcripts: TranscriptItem[];
  onClear: () => void;
}

const YouTubeHistoryList: React.FC<YouTubeHistoryListProps> = ({
  transcripts,
  onClear,
}) => {
  return (
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
          <TouchableOpacity onPress={onClear}>
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
          <YouTubeHistoryItem key={item.id} item={item} />
        ))
      )}
    </ScrollView>
  );
};

export default YouTubeHistoryList;
