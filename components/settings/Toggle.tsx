import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";
import { ToggleProps } from "./types";

export function Toggle({ label, value, onToggle }: ToggleProps) {
  return (
    <TouchableOpacity
      className="flex-row items-center gap-3 flex-1"
      onPress={onToggle}
      activeOpacity={0.7}
    >
      <View
        className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
          value
            ? "bg-[#2D7CF6] border-[#2D7CF6]"
            : "bg-[#F8FAFF] dark:bg-[#2D2D3F] border-[#DDE6F5] dark:border-[#2D2D3F]"
        }`}
      >
        {value && <Ionicons name="checkmark" size={16} color="#fff" />}
      </View>
      <Text className="text-[15px] text-[#1A1A2E] dark:text-[#E0E0E0] font-semibold flex-1">
        {label}
      </Text>
    </TouchableOpacity>
  );
}
