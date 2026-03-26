import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  FlatList,
  Animated,
} from "react-native";
import {
  Swipeable,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import { useRecords, RecordItem } from "./RecordContext";

function getInitials(email: string): string {
  const local = email.split("@")[0];
  const parts = local.split(/[._\-]/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return local.slice(0, 2).toUpperCase();
}

const LANGUAGES = [
  { code: "ka", label: "ქართული", flag: "🇬🇪" },
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "ru", label: "Русский", flag: "🇷🇺" },
];

function UserProfileRow({ email }: { email: string }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState(LANGUAGES[0]);
  const initials = getInitials(email);

  const handleSelect = (lang: (typeof LANGUAGES)[0]) => {
    setSelectedLang(lang);
    setDropdownOpen(false);
  };

  return (
    <View className="flex-1 flex-row items-center ml-1">
      {/* Avatar */}
      <View className="w-[38px] h-[38px] rounded-full bg-[#A8E6B0] items-center justify-center mr-[10px]">
        <Text className="text-base font-bold text-[#2E7D32]">{initials}</Text>
      </View>

      {/* Profile Info */}
      <View className="flex-1">
        <Text className="text-[13px] font-semibold text-[#111]">{email}</Text>
        <View className="self-start mt-[3px]">
          <View className="bg-[#E8F5E9] rounded-md px-2 py-0.5">
            <Text className="text-[11px] font-semibold text-[#2E7D32]">
              პრემიუმი
            </Text>
          </View>
          <Ionicons
            name="star"
            size={12}
            color="#F9A825"
            style={{ position: "absolute", top: -6, right: -6 }}
          />
        </View>
      </View>

      {/* Language Selector */}
      <View>
        <TouchableOpacity
          className="flex-row items-center pr-2 pl-1"
          onPress={() => setDropdownOpen((v) => !v)}
          activeOpacity={0.7}
        >
          <Text className="text-2xl">{selectedLang.flag}</Text>
          <Ionicons
            name={dropdownOpen ? "chevron-up" : "chevron-down"}
            size={14}
            color="#555"
            style={{ marginLeft: 3, marginTop: 1 }}
          />
        </TouchableOpacity>

        {dropdownOpen && (
          <>
            <TouchableWithoutFeedback onPress={() => setDropdownOpen(false)}>
              <View
                style={{
                  position: "absolute",
                  top: -200,
                  left: -400,
                  right: -400,
                  bottom: -1000,
                  zIndex: 200,
                }}
              />
            </TouchableWithoutFeedback>

            <View
              style={{
                position: "absolute",
                top: 36,
                right: 0,
                zIndex: 300,
                minWidth: 160,
              }}
              className="bg-white rounded-xl border border-[#e0e8ff] shadow-md overflow-hidden"
            >
              {LANGUAGES.map((lang, index) => (
                <TouchableOpacity
                  key={lang.code}
                  className={`flex-row items-center px-[14px] py-[11px] ${
                    index < LANGUAGES.length - 1
                      ? "border-b border-b-[#eee]"
                      : ""
                  } ${selectedLang.code === lang.code ? "bg-[#F0F6FF]" : ""}`}
                  onPress={() => handleSelect(lang)}
                  activeOpacity={0.7}
                >
                  <Text className="text-lg mr-[10px]">{lang.flag}</Text>
                  <Text
                    className={`flex-1 text-sm font-medium ${
                      selectedLang.code === lang.code
                        ? "text-[#5086d7] font-semibold"
                        : "text-[#333]"
                    }`}
                  >
                    {lang.label}
                  </Text>
                  {selectedLang.code === lang.code && (
                    <Ionicons name="checkmark" size={14} color="#2D7CF6" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </View>
    </View>
  );
}

function SwipeableCard({
  record,
  onDelete,
}: {
  record: RecordItem;
  onDelete: (id: number) => void;
}) {
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
    progress: Animated.AnimatedInterpolation<number>,
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
}

export default function HistoryScreen() {
  const { records, deleteRecord } = useRecords();

  return (
    <GestureHandlerRootView className="flex-1">
      <View className="flex-1 bg-[#F5F5F5]">
        {/* Header */}
        <View
          className="flex-row items-center px-2 pt-[42px] pb-[14px] bg-white border-b border-b-[#e7e5e5] z-[100] overflow-visible"
          style={{ borderBottomWidth: 0.5 }}
        >
          <TouchableOpacity onPress={() => router.back()} className="p-2">
            <Ionicons name="chevron-back" size={26} color="#333" />
          </TouchableOpacity>
          <UserProfileRow email="giorgi.kavtaradze@gmail.com" />
        </View>

        {/* Content */}
        <View className="flex-1 pt-3 px-4">
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
              <SwipeableCard record={item} onDelete={deleteRecord} />
            )}
          />
        </View>
      </View>
    </GestureHandlerRootView>
  );
}
