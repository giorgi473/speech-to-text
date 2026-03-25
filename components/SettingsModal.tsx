import React, { useEffect, useRef, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  Animated,
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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

// ---- Searchable Language Dropdown ----
type SearchableDropdownProps = {
  options: DropdownOption[];
  selected: string;
  onSelect: (value: string) => void;
  searchPlaceholder?: string;
};

function SearchableDropdown({
  options,
  selected,
  onSelect,
  searchPlaceholder = "ძიება",
}: SearchableDropdownProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [menuLayout, setMenuLayout] = useState<{
    x: number;
    y: number;
    width: number;
  } | null>(null);
  const triggerRef = useRef<View>(null);

  const selectedLabel =
    options.find((o) => o.value === selected)?.label ?? selected;

  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(query.toLowerCase()),
  );

  const handleOpen = () => {
    triggerRef.current?.measure((_fx, _fy, width, height, px, py) => {
      setMenuLayout({ x: px, y: py + height + 4, width });
      setOpen(true);
    });
  };

  const handleSelect = (value: string) => {
    onSelect(value);
    setOpen(false);
    setQuery("");
  };

  const handleClose = () => {
    setOpen(false);
    setQuery("");
  };

  return (
    <View style={sdd.wrapper}>
      <TouchableOpacity
        ref={triggerRef}
        style={sdd.trigger}
        onPress={open ? handleClose : handleOpen}
        activeOpacity={0.8}
      >
        <Text style={sdd.triggerText}>{selectedLabel}</Text>
        <Ionicons
          name={open ? "chevron-up" : "chevron-down"}
          size={18}
          color="#555"
        />
      </TouchableOpacity>

      {open && menuLayout && (
        <Modal transparent animationType="none" statusBarTranslucent>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={handleClose}
          />
          <View
            style={[
              sdd.menu,
              {
                top: menuLayout.y,
                left: menuLayout.x,
                width: menuLayout.width,
              },
            ]}
          >
            <View style={sdd.searchRow}>
              <Ionicons
                name="search"
                size={16}
                color="#9AA5BE"
                style={sdd.searchIcon}
              />
              <TextInput
                style={sdd.searchInput}
                placeholder={searchPlaceholder}
                placeholderTextColor="#9AA5BE"
                value={query}
                onChangeText={setQuery}
                autoFocus
                clearButtonMode="while-editing"
              />
            </View>

            <ScrollView
              style={sdd.list}
              nestedScrollEnabled
              keyboardShouldPersistTaps="handled"
            >
              {filtered.length > 0 ? (
                filtered.map((opt) => (
                  <TouchableOpacity
                    key={opt.value}
                    style={[sdd.item, selected === opt.value && sdd.itemActive]}
                    onPress={() => handleSelect(opt.value)}
                  >
                    <Text
                      style={[
                        sdd.itemText,
                        selected === opt.value && sdd.itemTextActive,
                      ]}
                    >
                      {opt.label}
                    </Text>
                    {selected === opt.value && (
                      <Ionicons name="checkmark" size={16} color="#2D7CF6" />
                    )}
                  </TouchableOpacity>
                ))
              ) : (
                <View style={sdd.emptyRow}>
                  <Text style={sdd.emptyText}>შედეგი არ მოიძებნა</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </Modal>
      )}
    </View>
  );
}

// ---- Generic dropdown trigger+list (shared radius ლოგიკით) ----
type RadiusDropdownProps = {
  options: DropdownOption[];
  selected: string;
  onSelect: (value: string) => void;
  styleWrapper?: any;
};

function RadiusDropdown({
  options,
  selected,
  onSelect,
  styleWrapper,
}: RadiusDropdownProps) {
  const [menuLayout, setMenuLayout] = useState<{
    x: number;
    y: number;
    width: number;
  } | null>(null);
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<View>(null);

  const selectedLabel =
    options.find((o) => o.value === selected)?.label ?? selected;

  const openMenu = () => {
    triggerRef.current?.measure((_fx, _fy, width, height, px, py) => {
      setMenuLayout({ x: px, y: py + height, width });
      setOpen(true);
    });
  };

  const closeMenu = () => setOpen(false);

  const handleSelect = (value: string) => {
    onSelect(value);
    closeMenu();
  };

  return (
    <View style={[rd.wrapper, styleWrapper]}>
      <TouchableOpacity
        ref={triggerRef}
        style={[rd.trigger, open && rd.triggerOpen]}
        onPress={open ? closeMenu : openMenu}
        activeOpacity={0.8}
      >
        <Text style={rd.triggerText}>{selectedLabel}</Text>
        <Ionicons
          name={open ? "chevron-up" : "chevron-down"}
          size={18}
          color="#555"
        />
      </TouchableOpacity>

      {open && menuLayout && (
        <Modal transparent animationType="none" statusBarTranslucent>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={closeMenu}
          />
          <View
            style={[
              rd.menu,
              {
                top: menuLayout.y,
                left: menuLayout.x,
                width: menuLayout.width,
              },
            ]}
          >
            <ScrollView>
              {options.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={[rd.item, selected === opt.value && rd.itemActive]}
                  onPress={() => handleSelect(opt.value)}
                >
                  <Text
                    style={[
                      rd.itemText,
                      selected === opt.value && rd.itemTextActive,
                    ]}
                  >
                    {opt.label}
                  </Text>
                  {selected === opt.value && (
                    <Ionicons name="checkmark" size={16} color="#2D7CF6" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </Modal>
      )}
    </View>
  );
}

// კონკრეტული ელემენტები
const SpeakerDropdown = (p: RadiusDropdownProps) => <RadiusDropdown {...p} />;
const SttDropdown = (p: RadiusDropdownProps) => <RadiusDropdown {...p} />;
const MicDropdown = (p: RadiusDropdownProps) => <RadiusDropdown {...p} />;

// ---- Toggle (მრგვალი წრეები) ----
type ToggleProps = { label: string; value: boolean; onToggle: () => void };
function Toggle({ label, value, onToggle }: ToggleProps) {
  return (
    <TouchableOpacity style={tog.row} onPress={onToggle} activeOpacity={0.7}>
      <View style={[tog.circle, value && tog.circleActive]}>
        {value && <Ionicons name="checkmark" size={16} color="#fff" />}
      </View>
      <Text style={tog.label}>{label}</Text>
    </TouchableOpacity>
  );
}

// ---- Options ----
const LANGUAGE_OPTIONS: DropdownOption[] = [
  { label: "ქართული", value: "ka" },
  { label: "ინგლისური", value: "en" },
  { label: "რუსული", value: "ru" },
  { label: "გერმანული", value: "de" },
  { label: "ფრანგული", value: "fr" },
  { label: "იაპონური", value: "ja" },
  { label: "არაბული", value: "ar" },
  { label: "ნიდერლანდური", value: "nl" },
  { label: "შვედური", value: "sv" },
  { label: "პოლონური", value: "pl" },
  { label: "თურქული", value: "tr" },
  { label: "კორეული", value: "ko" },
  { label: "ჩინური", value: "zh" },
  { label: "იტალიური", value: "it" },
  { label: "პორტუგალიური", value: "pt" },
  { label: "ესპანური", value: "es" },
  { label: "უკრაინული", value: "uk" },
  { label: "ჩეხური", value: "cs" },
  { label: "ფინური", value: "fi" },
  { label: "ნორვეგიული", value: "no" },
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
  { label: "სისტემის ხმა", value: "external" },
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
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
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
    translateY.setValue(Math.max(0, newY));
  };

  const onHandlerStateChange = ({ nativeEvent }: any) => {
    if (
      nativeEvent.state === State.END ||
      nativeEvent.state === State.CANCELLED
    ) {
      if (
        nativeEvent.translationY > DISMISS_THRESHOLD ||
        nativeEvent.velocityY > 800
      ) {
        animateClose(onClose);
      } else {
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
      baseY.current = 0;
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
        <Animated.View style={[s.overlay, { opacity: overlayOpacity }]}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={handleCancel}
          />
        </Animated.View>

        <Animated.View style={[s.sheet, { transform: [{ translateY }] }]}>
          <PanGestureHandler
            onGestureEvent={onGestureEvent}
            onHandlerStateChange={onHandlerStateChange}
          >
            <Animated.View style={s.handleArea}>
              <View style={s.handle} />
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
        </Animated.View>
      </GestureHandlerRootView>
    </Modal>
  );
}

// ---- Styles ----
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

// ენის searchable dropdown
const sdd = StyleSheet.create({
  wrapper: { marginBottom: 12, zIndex: 20 },
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1.5,
    borderColor: "#DDE6F5",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 14,
    backgroundColor: "#fff",
  },
  triggerText: { fontSize: 15, color: "#1A1A2E", fontWeight: "500" },
  menu: {
    position: "absolute",
    borderWidth: 1.5,
    borderColor: "#DDE6F5",
    borderRadius: 10,
    backgroundColor: "#fff",
    overflow: "hidden",
    maxHeight: 260,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#EEF2FB",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#F8FAFF",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#1A1A2E",
    paddingVertical: 4,
  },
  list: {
    maxHeight: 200,
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
  emptyRow: {
    paddingVertical: 16,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 13,
    color: "#9AA5BE",
  },
});

// Generic radius dropdown styles (speaker, stt, mic)
const rd = StyleSheet.create({
  wrapper: { marginBottom: 12 },
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
  triggerOpen: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  triggerText: { fontSize: 15, color: "#1A1A2E", fontWeight: "500" },
  menu: {
    position: "absolute",
    borderWidth: 1.5,
    borderColor: "#DDE6F5",
    borderTopWidth: 0,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    backgroundColor: "#fff",
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

// ✅ მრგვალი Toggle checkboxes
const tog = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  circle: {
    width: 24,
    height: 24,
    borderRadius: 12, // მრგვალი წრე (width/2)
    borderWidth: 2,
    borderColor: "#DDE6F5",
    backgroundColor: "#F8FAFF",
    alignItems: "center",
    justifyContent: "center",
  },
  circleActive: {
    backgroundColor: "#2D7CF6",
    borderColor: "#2D7CF6",
  },
  label: {
    fontSize: 15,
    color: "#1A1A2E",
    fontWeight: "600",
    flex: 1,
  },
});
