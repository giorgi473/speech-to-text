import React from "react";
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface YouTubeInputProps {
  url: string;
  setUrl: (url: string) => void;
  isValid: boolean;
  loading: boolean;
  onProcess: () => void;
}

const YouTubeInput: React.FC<YouTubeInputProps> = ({
  url,
  setUrl,
  isValid,
  loading,
  onProcess,
}) => {
  return (
    <View className="bg-white rounded-[20px] px-4 pb-1 pt-0 gap-3" style={{ marginTop: -11 }}>
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
        onPress={onProcess}
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
  );
};

export default YouTubeInput;
