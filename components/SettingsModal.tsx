import React, { useEffect, useRef, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  Animated,
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  GestureHandlerRootView,
  PanGestureHandler,
  State,
} from "react-native-gesture-handler";

const SCREEN_HEIGHT = Dimensions.get("window").height;
const DISMISS_THRESHOLD = 80;

// ---- ტიპები ----
export type SettingsValues = {
  language: string;
  speakerOutput: string;
  sttModel: string;
  microphone: string;
  punctuation: boolean;
  autoCorrect: boolean;
};

type DropdownOption = { label: string; value: string };
type DropdownProps = {
  options: DropdownOption[];
  selected: string;
  onSelect: (value: string) => void;
};

// ---- Dropdown ----
function Dropdown({ options, selected, onSelect }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const selectedLabel =
    options.find((o) => o.value === selected)?.label ?? selected;

  return (
    <View style={dd.wrapper}>
      <TouchableOpacity
        style={dd.trigger}
        onPress={() => setOpen((p) => !p)}
        activeOpacity={0.8}
      >
        <Text style={dd.triggerText}>{selectedLabel}</Text>
        <Ionicons
          name={open ? "chevron-up" : "chevron-down"}
          size={18}
          color="#555"
        />
      </TouchableOpacity>
      {open && (
        <View style={dd.menu}>
          {options.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={[dd.item, selected === opt.value && dd.itemActive]}
              onPress={() => {
                onSelect(opt.value);
                setOpen(false);
              }}
            >
              <Text
                style={[
                  dd.itemText,
                  selected === opt.value && dd.itemTextActive,
                ]}
              >
                {opt.label}
              </Text>
              {selected === opt.value && (
                <Ionicons name="checkmark" size={16} color="#2D7CF6" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

// ---- Toggle ----
type ToggleProps = { label: string; value: boolean; onToggle: () => void };
function Toggle({ label, value, onToggle }: ToggleProps) {
  return (
    <TouchableOpacity style={tog.row} onPress={onToggle} activeOpacity={0.7}>
      <View style={[tog.circle, value && tog.circleActive]}>
        {value && <Ionicons name="checkmark" size={13} color="#fff" />}
      </View>
      <Text style={tog.label}>{label}</Text>
    </TouchableOpacity>
  );
}

// ---- Options ----
const LANGUAGE_OPTIONS: DropdownOption[] = [
  { label: "ქართული", value: "ka" },
  { label: "English", value: "en" },
  { label: "Русский", value: "ru" },
  { label: "Deutsch", value: "de" },
  { label: "Français", value: "fr" },
];
const SPEAKER_OUTPUT_OPTIONS: DropdownOption[] = [
  { label: "მოსაუბრის გამოყოფა", value: "diarization" },
  { label: "გამორთული", value: "off" },
];
const STT_MODEL_OPTIONS: DropdownOption[] = [
  { label: "STT1", value: "stt1" },
  { label: "STT2", value: "stt2" },
  { label: "STT3 (Pro)", value: "stt3" },
];
const MICROPHONE_OPTIONS: DropdownOption[] = [
  { label: "მიკროფონი", value: "default" },
  { label: "Bluetooth", value: "bluetooth" },
  { label: "გარე მიკროფონი", value: "external" },
];
const DEFAULT_VALUES: SettingsValues = {
  language: "ka",
  speakerOutput: "diarization",
  sttModel: "stt1",
  microphone: "default",
  punctuation: true,
  autoCorrect: false,
};

type Props = {
  visible: boolean;
  initialValues?: Partial<SettingsValues>;
  onClose: () => void;
  onSave: (values: SettingsValues) => void;
};

export default function SettingsModal({
  visible,
  initialValues,
  onClose,
  onSave,
}: Props) {
  const [modalVisible, setModalVisible] = useState(false);
  const [values, setValues] = useState<SettingsValues>({
    ...DEFAULT_VALUES,
    ...initialValues,
  });

  const overlayOpacity = useRef(new Animated.Value(0)).current;
  // ერთი translateY — ანიმაციასა და gesture-ს ორივეს ვაკეთებ ამით
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  // gesture დროს translateY-ის საწყისი მნიშვნელობა
  const baseY = useRef(0);

  const set = <K extends keyof SettingsValues>(
    key: K,
    val: SettingsValues[K],
  ) => setValues((p) => ({ ...p, [key]: val }));

  const animateOpen = () => {
    baseY.current = 0;
    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 320,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const animateClose = (callback: () => void) => {
    Animated.sequence([
      Animated.timing(translateY, {
        toValue: SCREEN_HEIGHT,
        duration: 260,
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setModalVisible(false);
      callback();
    });
  };

  useEffect(() => {
    if (visible) {
      overlayOpacity.setValue(0);
      translateY.setValue(SCREEN_HEIGHT);
      baseY.current = 0;
      setModalVisible(true);
    }
  }, [visible]);

  useEffect(() => {
    if (modalVisible) animateOpen();
  }, [modalVisible]);

  const handleSave = () => {
    onSave(values);
    animateClose(onClose);
  };
  const handleCancel = () => {
    setValues({ ...DEFAULT_VALUES, ...initialValues });
    animateClose(onClose);
  };

  // ---- Gesture ----
  const onGestureEvent = ({ nativeEvent }: any) => {
    const newY = baseY.current + nativeEvent.translationY;
    // მხოლოდ ქვემოთ მიმართულება (0-ზე ნაკლები არ მიდის)
    translateY.setValue(Math.max(0, newY));
  };

  const onHandlerStateChange = ({ nativeEvent }: any) => {
    if (
      nativeEvent.state === State.END ||
      nativeEvent.state === State.CANCELLED
    ) {
      const finalY = baseY.current + nativeEvent.translationY;

      if (
        nativeEvent.translationY > DISMISS_THRESHOLD ||
        nativeEvent.velocityY > 800
      ) {
        // საკმარისად ჩამოქაჩა — ვხურავთ
        animateClose(onClose);
      } else {
        // ვბრუნდებით 0-ზე
        baseY.current = 0;
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          bounciness: 4,
          speed: 20,
        }).start();
      }
    }

    if (nativeEvent.state === State.BEGAN) {
      // gesture დაიწყო — ვინახავთ ამჟამინდელ პოზიციას
      baseY.current = 0;
      // შევაჩეროთ მიმდინარე ანიმაცია
      translateY.stopAnimation((val) => {
        baseY.current = val;
      });
    }
  };

  if (!modalVisible) return null;

  return (
    <Modal
      visible={modalVisible}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        {/* overlay */}
        <Animated.View style={[s.overlay, { opacity: overlayOpacity }]}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={handleCancel}
          />
        </Animated.View>

        {/* Sheet */}
        <Animated.View style={[s.sheet, { transform: [{ translateY }] }]}>
          {/* Handle — gesture მხოლოდ აქ */}
          <PanGestureHandler
            onGestureEvent={onGestureEvent}
            onHandlerStateChange={onHandlerStateChange}
          >
            <Animated.View style={s.handleArea}>
              <View style={s.handle} />
            </Animated.View>
          </PanGestureHandler>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Dropdown
              options={LANGUAGE_OPTIONS}
              selected={values.language}
              onSelect={(v) => set("language", v)}
            />
            <Dropdown
              options={SPEAKER_OUTPUT_OPTIONS}
              selected={values.speakerOutput}
              onSelect={(v) => set("speakerOutput", v)}
            />
            <Dropdown
              options={STT_MODEL_OPTIONS}
              selected={values.sttModel}
              onSelect={(v) => set("sttModel", v)}
            />
            <Dropdown
              options={MICROPHONE_OPTIONS}
              selected={values.microphone}
              onSelect={(v) => set("microphone", v)}
            />

            <View style={s.toggleRow}>
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

            <View style={s.btnRow}>
              <TouchableOpacity
                style={[s.btn, s.btnCancel]}
                onPress={handleCancel}
                activeOpacity={0.8}
              >
                <Text style={s.btnCancelText}>გაუქმება</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.btn, s.btnSave]}
                onPress={handleSave}
                activeOpacity={0.8}
              >
                <Text style={s.btnSaveText}>დამახსოვრება</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Animated.View>
      </GestureHandlerRootView>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(120, 120, 130, 0.35)",
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingBottom: 44,
    paddingTop: 0,
  },
  handleArea: {
    width: "100%",
    alignItems: "center",
    paddingVertical: 14,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E0E0EC",
  },
  toggleRow: {
    flexDirection: "row",
    gap: 32,
    marginTop: 8,
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  btnRow: { flexDirection: "row", gap: 12 },
  btn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
  },
  btnCancel: { backgroundColor: "#EEF4FF" },
  btnCancelText: { color: "#2D7CF6", fontSize: 15, fontWeight: "700" },
  btnSave: { backgroundColor: "#2D7CF6" },
  btnSaveText: { color: "#fff", fontSize: 15, fontWeight: "700" },
});

const dd = StyleSheet.create({
  wrapper: { marginBottom: 12, zIndex: 10 },
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1.5,
    borderColor: "#DDE6F5",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#fff",
  },
  triggerText: { fontSize: 15, color: "#1A1A2E", fontWeight: "500" },
  menu: {
    borderWidth: 1.5,
    borderColor: "#DDE6F5",
    borderRadius: 10,
    backgroundColor: "#fff",
    marginTop: 4,
    overflow: "hidden",
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F4FF",
  },
  itemActive: { backgroundColor: "#F0F6FF" },
  itemText: { fontSize: 14, color: "#444" },
  itemTextActive: { color: "#2D7CF6", fontWeight: "600" },
});

const tog = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  circle: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: "#C0C8D8",
    backgroundColor: "#F5F7FF",
    alignItems: "center",
    justifyContent: "center",
  },
  circleActive: { backgroundColor: "#2D7CF6", borderColor: "#2D7CF6" },
  label: { fontSize: 14, color: "#1A1A2E", fontWeight: "600" },
});
