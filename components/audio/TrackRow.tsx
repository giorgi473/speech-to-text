import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Track } from "../../types/audio";

interface TrackRowProps {
  track: Track;
  isActive: boolean;
  index: number;
  onPress: () => void;
}

const fmtSec = (sec: number) => {
  const s = Math.floor(sec);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

export default function TrackRow({
  track,
  isActive,
  index,
  onPress,
}: TrackRowProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      className="flex-row items-center gap-3 py-3 px-4 rounded-2xl mb-2 border"
      style={{
        backgroundColor: isActive ? "#EEF4FF" : "#FFFFFF",
        borderColor: isActive ? "#2D7CF6" : "#D0D8E8",
      }}
    >
      {/* Index / active indicator */}
      <View className="w-8 items-center">
        {isActive ? (
          <Ionicons name="musical-note" size={16} color="#2D7CF6" />
        ) : (
          <Text className="text-[#2A3A60] text-xs font-bold">
            {String(index + 1).padStart(2, "0")}
          </Text>
        )}
      </View>

      {/* Info */}
      <View className="flex-1">
        <Text
          className="text-sm font-semibold"
          style={{ color: isActive ? "#2D7CF6" : "#1A1A2E" }}
          numberOfLines={1}
        >
          {track.name}
        </Text>
        <Text className="text-xs text-[#7A8AAA] mt-0.5" numberOfLines={1}>
          {track.artist}
        </Text>
      </View>

      {/* Duration */}
      <Text className="text-xs text-[#8A9ABB]">{fmtSec(track.duration)}</Text>

      {isActive && <View className="w-1.5 h-1.5 rounded-full bg-[#2D7CF6]" />}
    </TouchableOpacity>
  );
}
