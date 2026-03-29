import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  onClose: () => void;
}

export default function CustomAlert({
  visible,
  title,
  message,
  onClose,
}: CustomAlertProps) {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <View className="flex-1 bg-black/60 items-center justify-center px-8">
        <View
          className="w-full bg-white dark:bg-[#1E1E2E] rounded-[12px] overflow-hidden"
          style={{
            elevation: 10,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 12,
          }}
        >
          <View className="p-6 items-center">
            <View className="w-12 h-12 rounded-full bg-[#FFF0F0] dark:bg-[#2D1D1D] items-center justify-center mb-4">
              <Ionicons name="alert-circle" size={28} color="#FF4D4D" />
            </View>
            <Text className="text-[17px] font-bold text-[#1A1A2E] dark:text-[#FFFFFF] mb-2">{title}</Text>
            <Text className="text-[14px] text-[#7A8AAA] dark:text-[#9090A8] text-center leading-5 mb-6">
              {message}
            </Text>
            <TouchableOpacity
              onPress={onClose}
              className="w-full py-3.5 rounded-lg bg-[#2D7CF6] items-center justify-center"
              style={{
                shadowColor: "#2D7CF6",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
              }}
            >
              <Text className="text-white font-bold text-[15px]">გასაგებია</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
