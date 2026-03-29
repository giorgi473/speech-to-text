import React from "react";
import { TouchableOpacity, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import HistoryList from "@/components/history/HistoryList";
import UserProfileRow from "@/components/history/UserProfileRow";
import { useHistory } from "@/hooks/useHistory";

export default function HistoryScreen() {
  const { records, deleteRecord } = useHistory();

  return (
    <GestureHandlerRootView className="flex-1">
      <View className="flex-1 bg-[#F5F5F5] dark:bg-[#121212]">
        {/* Header */}
        <View
          className="flex-row items-center px-2 pt-[42px] pb-[14px] bg-white dark:bg-[#1A1A2E] border-b border-b-[#e7e5e5] dark:border-b-[#2D2D3F] z-[100] overflow-visible"
          style={{ borderBottomWidth: 0.5 }}
        >
          <TouchableOpacity onPress={() => router.back()} className="p-2">
            <Ionicons name="chevron-back" size={26} color="#333" className="dark:text-white" />
          </TouchableOpacity>
          <UserProfileRow email="giorgi.kavtaradze@gmail.com" />
        </View>

        {/* Content */}
        <View className="flex-1 pt-3 px-4">
          <HistoryList records={records} onDelete={deleteRecord} />
        </View>
      </View>
    </GestureHandlerRootView>
  );
}
