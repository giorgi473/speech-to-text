import React, { useState } from "react";
import { Animated, Modal, Text, TouchableOpacity, View } from "react-native";
import {
  GestureHandlerRootView,
  PanGestureHandler,
} from "react-native-gesture-handler";

import { useTheme } from "@/context/ThemeContext";
import { Toggle } from "./Toggle";
import {
  DEFAULT_SETTINGS,
  LANGUAGE_OPTIONS,
  MICROPHONE_OPTIONS,
  SPEAKER_OUTPUT_OPTIONS,
  STT_MODEL_OPTIONS
} from "./constants";
import {
  MicDropdown,
  SearchableDropdown,
  SpeakerDropdown,
  SttDropdown
} from "./dropdowns";
import { useSheetAnimation } from "./hooks/useSheetAnimation";
import { SettingsModalProps, SettingsValues } from "./types";

export default function SettingsModal({
  visible,
  initialValues,
  onClose,
  onSave,
}: SettingsModalProps) {
  const { setTheme, isDark } = useTheme();
  const [values, setValues] = useState<SettingsValues>({
    ...DEFAULT_SETTINGS,
    ...initialValues,
  });

  const {
    modalVisible,
    overlayOpacity,
    translateY,
    animateClose,
    onGestureEvent,
    onHandlerStateChange,
  } = useSheetAnimation({ visible, onClose });

  const set = <K extends keyof SettingsValues>(
    key: K,
    val: SettingsValues[K],
  ) => setValues((p) => ({ ...p, [key]: val }));

  const handleSave = () => {
    onSave(values);
    if (values.theme) {
      setTheme(values.theme);
    }
    animateClose(onClose);
  };

  const handleCancel = () => {
    setValues({ ...DEFAULT_SETTINGS, ...initialValues });
    animateClose(onClose);
  };

  if (!modalVisible) return null;

  return (
    <Modal
      visible={modalVisible}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <GestureHandlerRootView className="flex-1">
        <Animated.View
          style={{ opacity: overlayOpacity }}
          className="absolute inset-0 bg-[rgba(0,0,0,0.4)] dark:bg-[rgba(255,255,255,0.15)]"
        >
          <TouchableOpacity
            className="absolute inset-0"
            activeOpacity={1}
            onPress={handleCancel}
          />
        </Animated.View>

        <Animated.View
          style={{ transform: [{ translateY }] }}
          className="absolute bottom-0 left-0 right-0 bg-white dark:bg-black rounded-tl-[28px] rounded-tr-[28px] px-5 pb-11 pt-0"
        >
          <PanGestureHandler
            onGestureEvent={onGestureEvent}
            onHandlerStateChange={onHandlerStateChange}
          >
            <Animated.View className="w-full items-center py-[14px]">
              <View className="w-10 h-1 rounded-full bg-[#E0E0EC] dark:bg-[#2D2D3F]" />
            </Animated.View>
          </PanGestureHandler>

          <SearchableDropdown
            options={LANGUAGE_OPTIONS}
            selected={values.language}
            onSelect={(v) => set("language", v)}
            searchPlaceholder="ძიება"
          />
          <SpeakerDropdown
            options={SPEAKER_OUTPUT_OPTIONS}
            selected={values.speakerOutput}
            onSelect={(v) => set("speakerOutput", v)}
          />
          <SttDropdown
            options={STT_MODEL_OPTIONS}
            selected={values.sttModel}
            onSelect={(v) => set("sttModel", v)}
          />
          <MicDropdown
            options={MICROPHONE_OPTIONS}
            selected={values.microphone}
            onSelect={(v) => set("microphone", v)}
          />

          <View className="flex-row gap-8 mt-2 mb-6 px-1">
            <Toggle
              label="პუნქტუაცია"
              value={values.punctuation}
              onToggle={() => set("punctuation", !values.punctuation)}
            />
            <Toggle
              label="ავტოკორექტი"
              value={values.autoCorrect}
              onToggle={() => set("autoCorrect", !values.autoCorrect)}
            />
          </View>

          <View className="flex-row gap-3">
            <TouchableOpacity
              className="flex-1 rounded-xl py-[15px] items-center bg-[#EEF4FF] dark:bg-[#2D2D3F]"
              onPress={handleCancel}
              activeOpacity={0.8}
            >
              <Text className="text-[#2D7CF6] text-[15px] font-bold">
                გაუქმება
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 rounded-xl py-[15px] items-center bg-[#2D7CF6]"
              onPress={handleSave}
              activeOpacity={0.8}
            >
              <Text className="text-white text-[15px] font-bold">
                დამახსოვრება
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </GestureHandlerRootView>
    </Modal>
  );
}
