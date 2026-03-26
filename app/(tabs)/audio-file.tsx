import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type AudioFile = {
  id: number;
  name: string;
  size: string;
  duration: string;
  status: "done" | "processing";
};

const MOCK_FILES: AudioFile[] = [
  {
    id: 1,
    name: "meeting_2024.mp3",
    size: "4.2 MB",
    duration: "12:30",
    status: "done",
  },
  {
    id: 2,
    name: "lecture.wav",
    size: "18.7 MB",
    duration: "45:12",
    status: "processing",
  },
];

export default function AudioFileScreen() {
  const [files, setFiles] = useState<AudioFile[]>([]);

  const handleUpload = () => {
    Alert.alert("ფაილის არჩევა", "აირჩიეთ აუდიო ფაილი", [
      { text: "გაუქმება", style: "cancel" },
      {
        text: "სიმულაცია",
        onPress: () => {
          const mock = MOCK_FILES[files.length % 2];
          setFiles((prev) => [...prev, { ...mock, id: Date.now() }]);
        },
      },
    ]);
  };

  const removeFile = (id: number) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Upload Zone */}
      <View className="p-5">
        <TouchableOpacity
          className="bg-white rounded-[20px] border-2 border-dashed border-[#D8E8FF] items-center py-8 gap-2"
          onPress={handleUpload}
          activeOpacity={0.85}
        >
          <View className="w-16 h-16 rounded-full bg-[#EEF4FF] items-center justify-center">
            <Ionicons name="cloud-upload-outline" size={36} color="#2D7CF6" />
          </View>
          <Text className="text-base font-bold text-[#1A1A2E]">
            ფაილის ატვირთვა
          </Text>
          <Text className="text-[13px] text-[#9090A8]">
            MP3 · WAV · M4A · OGG · მაქს. 200MB
          </Text>
        </TouchableOpacity>
      </View>

      {/* File List */}
      <ScrollView
        className="flex-1"
        contentContainerClassName="p-4 gap-3"
        showsVerticalScrollIndicator={false}
      >
        {files.length === 0 ? (
          <View className="items-center pt-16 gap-3">
            <Ionicons name="document-outline" size={48} color="#D0D8F0" />
            <Text className="text-[15px] text-[#B0B0C8] font-medium">
              ჯერ ფაილი არ არის ატვირთული
            </Text>
          </View>
        ) : (
          files.map((file) => (
            <View
              key={file.id}
              className="bg-white rounded-2xl p-[14px] flex-row items-center gap-3 mb-3"
            >
              <View className="w-11 h-11 rounded-xl bg-[#EEF4FF] items-center justify-center">
                <Ionicons name="musical-notes" size={22} color="#2D7CF6" />
              </View>

              <View className="flex-1 gap-1">
                <Text
                  className="text-sm font-bold text-[#1A1A2E]"
                  numberOfLines={1}
                >
                  {file.name}
                </Text>
                <Text className="text-xs text-[#9090A8]">
                  {file.size} · {file.duration}
                </Text>
                <View
                  className={`self-start px-[10px] py-1 rounded-lg mt-0.5 ${
                    file.status === "done" ? "bg-[#E8F5E9]" : "bg-[#FFF8E1]"
                  }`}
                >
                  <Text
                    className={`text-xs font-semibold ${
                      file.status === "done"
                        ? "text-[#2E7D32]"
                        : "text-[#F57F17]"
                    }`}
                  >
                    {file.status === "done" ? "✓ დასრულდა" : "⏳ მუშავდება"}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => removeFile(file.id)}
                className="p-1"
              >
                <Ionicons name="close-circle" size={22} color="#C0C0D0" />
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
