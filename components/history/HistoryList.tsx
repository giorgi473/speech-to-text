import { RecordItem } from "@/app/RecordContext";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { FlatList, Text, View } from "react-native";
import HistoryItem from "./HistoryItem";

interface HistoryListProps {
  records: RecordItem[];
  onDelete: (id: number) => void;
}

const HistoryList: React.FC<HistoryListProps> = ({ records, onDelete }) => {
  return (
    <FlatList
      className="flex-1"
      contentContainerClassName="pb-8 gap-[10px]"
      showsVerticalScrollIndicator={false}
      data={records}
      keyExtractor={(item) => item.id.toString()}
      ListEmptyComponent={
        <View className="items-center justify-center pt-20 gap-2">
          <Ionicons name="mic-off-outline" size={42} color="#ddd" />
          <Text className="text-[15px] text-[#999] font-semibold mt-2">
            ჩანაწერები ჯერ არ არის
          </Text>
          <Text className="text-xs text-[#bbb]">
            პირველი ჩანაწერი გამოჩნდება აქ
          </Text>
        </View>
      }
      ListHeaderComponent={
        records.length > 0 ? (
          <Text className="text-[11px] text-[#bbb] text-center mb-1 tracking-wide">
            ← მარჯვნიდან გადაწიეთ წასაშლელად
          </Text>
        ) : null
      }
      renderItem={({ item }) => (
        <HistoryItem record={item} onDelete={onDelete} />
      )}
    />
  );
};

export default HistoryList;
