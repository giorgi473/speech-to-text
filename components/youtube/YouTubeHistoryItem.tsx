import { TranscriptItem } from "@/hooks/useYouTubeProcessor";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, Linking, Text, TouchableOpacity, View } from "react-native";

interface YouTubeHistoryItemProps {
  item: TranscriptItem;
  onDelete: (id: number) => void;
}

const YouTubeHistoryItem: React.FC<YouTubeHistoryItemProps> = ({ item, onDelete }) => {
  const openUrl = (url: string) => {
    Linking.openURL(url).catch(() => { });
  };

  return (
    <View className="bg-white rounded-xl p-4 gap-4 border border-[#EBEBF5] relative">
      {/* Top-right icons */}
      <View className="absolute top-5 right-5 z-10">
        <TouchableOpacity
          onPress={() => onDelete(item.id)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="trash-outline" size={18} color="#FF4D4D" />
        </TouchableOpacity>
      </View>

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
          className="flex-row items-center gap-1.5 bg-[#2D7CF6] px-2 py-1.5 rounded-lg"
          onPress={() => openUrl(item.url)}
        >
          <Ionicons name="document-text-outline" size={14} color="white" />
          <Text className="text-[12px] text-white font-bold">ნახვა</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default YouTubeHistoryItem;
