import { createContext, useContext, useRef, useState } from "react";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { MusicNoteSquare02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { router, Tabs } from "expo-router";
import { Animated, StyleSheet, Text, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";


type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];

function TabBarIcon({
  name,
  color,
  size,
  hugeIcon,
}: {
  name?: IoniconsName;
  color: string;
  size: number;
  hugeIcon?: any;
}) {
  return hugeIcon ? (
    <HugeiconsIcon icon={hugeIcon} size={size} color={color} />
  ) : (
    name && <Ionicons name={name} size={size} color={color} />
  );
}

const RecordingContext = createContext<{
  isRecording: boolean;
  setIsRecording: (v: boolean) => void;
}>({ isRecording: false, setIsRecording: () => { } });

export const useRecording = () => useContext(RecordingContext);

// ── Burger Button ──────────────────────────────────────────────────────────────
function BurgerButton() {
  return (
    <TouchableOpacity
      onPress={() => router.push("/history")}
      style={{ paddingHorizontal: 16 }}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <MaterialIcons name="menu" size={28} color="#333" />
    </TouchableOpacity>
  );
}

// ── Flip Title ─────────────────────────────────────────────────────────────────
function FlipTitle() {
  const [flipped, setFlipped] = useState(false);
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const iconRotate = useRef(new Animated.Value(0)).current;

  const labels = ["ხმა", "ტექსტი"];

  const handlePress = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 20,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(iconRotate, {
        toValue: flipped ? 0 : 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setFlipped((f) => !f);
      translateY.setValue(-20);
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          friction: 8,
          tension: 100,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const spin = iconRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={1}>
      <Animated.View
        style={[flipStyles.row, { transform: [{ translateY }], opacity }]}
      >
        <Text style={flipStyles.title}>{flipped ? labels[1] : labels[0]}</Text>
        <Animated.View style={{ transform: [{ rotate: spin }] }}>
          <MaterialIcons
            name="swap-horiz"
            size={22}
            color="#2D7CF6"
            style={{ marginHorizontal: 6 }}
          />
        </Animated.View>
        <Text style={flipStyles.title}>{flipped ? labels[0] : labels[1]}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

const flipStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#515050",
  },
});

// ── Record Tab Button ──────────────────────────────────────────────────────────
function RecordTabButton(props: any) {
  const { isRecording, setIsRecording } = useContext(RecordingContext);
  const scale = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 0.88,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
    setIsRecording(!isRecording);
    props.onPress?.();
  };

  return (
    <TouchableOpacity
      style={tabBtnStyles.wrapper}
      onPress={handlePress}
      activeOpacity={0.85}
    >
      <Animated.View
        style={[
          tabBtnStyles.square,
          isRecording && tabBtnStyles.squareRecording,
          { transform: [{ scale }] },
        ]}
      >
        <Ionicons
          name={isRecording ? "stop" : "mic"}
          size={26}
          color="#FFFFFF"
        />
      </Animated.View>
      <Text
        style={[tabBtnStyles.label, isRecording && tabBtnStyles.labelRecording]}
      >
        {isRecording ? "შეჩერება" : "ჩაწერა"}
      </Text>
    </TouchableOpacity>
  );
}

const tabBtnStyles = StyleSheet.create({
  wrapper: { flex: 1, alignItems: "center", justifyContent: "flex-start", paddingTop: 0 },
  square: {
    width: 50,
    height: 50,
    borderRadius: 5,
    backgroundColor: "#2D7CF6",
    alignItems: "center",
    justifyContent: "center",
    elevation: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  squareRecording: { backgroundColor: "#E8504A" },
  label: { fontSize: 11, fontWeight: "700", marginTop: 2, color: "#a19e9e" },
  labelRecording: { color: "#E8504A" },
});

// ── Tab Layout ─────────────────────────────────────────────────────────────────
export default function TabLayout() {
  const [isRecording, setIsRecording] = useState(false);
  const insets = useSafeAreaInsets();

  return (
    <RecordingContext.Provider value={{ isRecording, setIsRecording }}>
      <Tabs
        screenOptions={{
          tabBarStyle: {
            paddingBottom: insets.bottom + 15,
            paddingTop: 7,
            height: insets.bottom + 80,
            borderTopWidth: 0.6,
            borderTopColor: "#f0f0f0",
            elevation: 0,
            backgroundColor: "#fff",
          },
          headerStyle: {
            borderBottomWidth: 0.5,
            borderBottomColor: "#d1d1d1",
            shadowOpacity: 0,
            elevation: 0,
          },
          headerShadowVisible: false,
          tabBarActiveTintColor: "#2D7CF6",
          tabBarItemStyle: {
            height: 55,
            justifyContent: 'center',
            alignItems: 'center',
          },
          tabBarLabelStyle: { fontSize: 11, fontWeight: "600", marginTop: 2 },
          headerRight: () => <BurgerButton />,
        }}
      >
        <Tabs.Screen
          name="audio-file"
          options={{
            title: "აუდიო ფაილი",
            tabBarIcon: ({ focused }) => (
              <TabBarIcon
                hugeIcon={MusicNoteSquare02Icon}
                color={focused ? "#2D7CF6" : "#9090A8"}
                size={28}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="index"
          options={{
            headerTitle: () => <FlipTitle />,
            tabBarButton: (props) => <RecordTabButton {...props} />,
          }}
        />
        <Tabs.Screen
          name="youtube-link"
          options={{
            title: "YouTube Link",
            tabBarIcon: ({ focused }) => (
              <TabBarIcon
                name="logo-youtube"
                color={focused ? "#FF0000" : "#9090A8"}
                size={28}
              />
            ),
          }}
        />
      </Tabs>
    </RecordingContext.Provider>
  );
}
