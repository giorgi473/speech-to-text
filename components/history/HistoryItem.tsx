import { RecordItem } from "@/app/RecordContext";
import { Ionicons } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import { Animated, Text, TouchableOpacity, View } from "react-native";
import { Swipeable } from "react-native-gesture-handler";

interface HistoryItemProps {
  record: RecordItem;
  onDelete: (id: number) => void;
}

const HistoryItem: React.FC<HistoryItemProps> = ({ record, onDelete }) => {
  const swipeableRef = useRef<Swipeable>(null);
  const deleteAnim = useRef(new Animated.Value(1)).current;
  const [expanded, setExpanded] = useState(false);

  const handleDelete = () => {
    swipeableRef.current?.close();
    Animated.timing(deleteAnim, {
      toValue: 0,
      duration: 280,
      useNativeDriver: true,
    }).start(() => onDelete(record.id));
  };

  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>
  ) => {
    const translateX = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [40, 0],
    });
    const opacity = progress.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0, 0.5, 1],
    });
    const scale = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0.85, 1],
    });

    return (
      <Animated.View
        style={{
          opacity,
          transform: [{ translateX }, { scale }],
          justifyContent: "center",
          alignItems: "flex-end",
          marginLeft: 8,
        }}
      >
        <TouchableOpacity
          onPress={handleDelete}
          activeOpacity={0.7}
          className="px-[10px] py-[10px]"
        >
          <Ionicons name="trash-outline" size={22} color="#FF3B30" />
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <Animated.View
      style={{
        opacity: deleteAnim,
        transform: [{ scaleY: deleteAnim }],
      }}
    >
      <Swipeable
        ref={swipeableRef}
        renderRightActions={renderRightActions}
        rightThreshold={40}
        overshootRight={false}
        friction={2}
        containerStyle={{ borderRadius: 12, overflow: "hidden" }}
      >
        <View className="p-4 bg-white rounded-xl border border-[#e8eeff]">
          {/* Card Header */}
          <View className="flex-row items-center mb-[6px]">
            <Ionicons
              name="mic-outline"
              size={13}
              color="#bbb"
              style={{ marginRight: 5 }}
            />
            <Text className="text-[11px] text-[#aaa]">
              {record.date} · {record.duration}
            </Text>
          </View>

          {/* Card Body */}
          <View className="relative pl-[26px] min-h-[22px]">
            <TouchableOpacity
              className="absolute left-0 top-0 px-0.5 py-0.5"
              onPress={() => setExpanded((prev) => !prev)}
              activeOpacity={0.7}
            >
              <Ionicons
                name="create-outline"
                size={18}
                color={expanded ? "#2D7CF6" : "#777"}
              />
            </TouchableOpacity>

            <Text
              className="text-[15px] text-[#333] leading-[22px]"
              numberOfLines={expanded ? undefined : 2}
              ellipsizeMode="tail"
            >
              {record.text}
            </Text>
          </View>
        </View>
      </Swipeable>
    </Animated.View>
  );
};

export default HistoryItem;
