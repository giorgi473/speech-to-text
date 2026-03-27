import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { Audio, AVPlaybackStatus } from "expo-av";
import * as Haptics from "expo-haptics";
import * as MediaLibrary from "expo-media-library";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import Reanimated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type PlayerStatus = "loading" | "playing" | "paused";

type Track = {
  id: string;
  name: string;
  artist: string;
  duration: number; // seconds
  uri: string;
};

function fmtSec(sec: number) {
  const s = Math.floor(sec);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

function fmtMs(ms: number) {
  return fmtSec(ms / 1000);
}

function EqualizerBar({ active }: { active: boolean }) {
  const height = useSharedValue(0.3);

  useEffect(() => {
    if (active) {
      height.value = withRepeat(
        withSequence(
          withTiming(Math.random() * 0.7 + 0.3, { duration: 250 + Math.random() * 250 }),
          withTiming(0.2, { duration: 250 + Math.random() * 250 })
        ),
        -1,
        true
      );
    } else {
      height.value = withTiming(0.3, { duration: 300 });
    }
  }, [active]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scaleY: height.value }],
  }));

  return (
    <Reanimated.View
      className="w-[2.5px] h-5 rounded-full bg-[#2D7CF6]"
      style={animatedStyle}
    />
  );
}

function CustomAlert({
  visible,
  title,
  message,
  onClose,
}: {
  visible: boolean;
  title: string;
  message: string;
  onClose: () => void;
}) {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <View className="flex-1 bg-black/40 items-center justify-center px-8">
        <View
          className="w-full bg-white rounded-[12px] overflow-hidden"
          style={{
            elevation: 10,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 12,
          }}
        >
          <View className="p-6 items-center">
            <View className="w-12 h-12 rounded-full bg-[#FFF0F0] items-center justify-center mb-4">
              <Ionicons name="alert-circle" size={28} color="#FF4D4D" />
            </View>
            <Text className="text-[17px] font-bold text-[#1A1A2E] mb-2">{title}</Text>
            <Text className="text-[14px] text-[#7A8AAA] text-center leading-5 mb-6">
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

function PlayerBar({
  track,
  onClose,
  onNext,
  onPrev,
  onScrubChange,
  onError,
}: {
  track: Track;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  onScrubChange: (scrubbing: boolean) => void;
  onError: (msg: string) => void;
}) {
  const soundRef = useRef<Audio.Sound | null>(null);
  const [status, setStatus] = useState<PlayerStatus>("loading");
  const [posMs, setPosMs] = useState(0);
  const [durMs, setDurMs] = useState(0);
  const isScrubbing = useRef(false);
  const durMsRef = useRef(0);

  // Keep durMsRef in sync
  useEffect(() => {
    durMsRef.current = durMs;
  }, [durMs]);

  // load track
  useEffect(() => {
    let mounted = true;
    setStatus("loading");
    setPosMs(0);
    setDurMs(0);

    const load = async () => {
      try {
        if (soundRef.current) {
          await soundRef.current.unloadAsync();
          soundRef.current = null;
        }

        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
        });

        const { sound } = await Audio.Sound.createAsync(
          { uri: track.uri },
          { shouldPlay: true, shouldCorrectPitch: true },
          (s: AVPlaybackStatus) => {
            if (!mounted || !s.isLoaded) return;
            setStatus(s.isPlaying ? "playing" : "paused");
            const dur = s.durationMillis ?? track.duration * 1000;
            setDurMs(dur);
            durMsRef.current = dur;
            if (!isScrubbing.current) {
              setPosMs(s.positionMillis ?? 0);
            }
            if (s.didJustFinish) {
              onNext();
            }
          },
        );

        soundRef.current = sound;
        if (mounted) setStatus("playing");
      } catch {
        if (mounted) setStatus("paused");
        onError("ტრეკის გახსნა ვერ მოხერხდა.");
      }
    };

    load();

    return () => {
      mounted = false;
      soundRef.current?.unloadAsync();
    };
  }, [track.uri]);

  const togglePlay = useCallback(async () => {
    if (!soundRef.current) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (status === "playing") {
      await soundRef.current.pauseAsync();
    } else {
      await soundRef.current.playAsync();
    }
  }, [status]);

  const skipForward = useCallback(async () => {
    if (!soundRef.current) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const nextPos = Math.min(durMs, posMs + 10000);
    await soundRef.current.setPositionAsync(nextPos);
    setPosMs(nextPos);
  }, [posMs, durMs]);

  const skipBackward = useCallback(async () => {
    if (!soundRef.current) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const nextPos = Math.max(0, posMs - 10000);
    await soundRef.current.setPositionAsync(nextPos);
    setPosMs(nextPos);
  }, [posMs]);

  const handleNext = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onNext();
  }, [onNext]);

  const handlePrev = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPrev();
  }, [onPrev]);

  return (
    <View
      className="mx-4 mb-4 rounded-[14px]"
      style={{
        backgroundColor: "#FFFFFF",
        elevation: 6,
        shadowColor: "#2175e2",
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 1,
        borderWidth: 1,
        borderColor: "rgba(100, 183, 255, 0.01)"
      }}
    >
      <View className="px-5 pt-5 pb-4 overflow-hidden rounded-[14px]">
        {/* Track info + controls */}
        <View className="flex-row items-center gap-4 mb-4">
          {/* Equalizer / loading */}
          <View className="w-12 h-12 rounded-2xl bg-[#F0F7FF] items-center justify-center">
            {status === "loading" ? (
              <ActivityIndicator size="small" color="#2D7CF6" />
            ) : (
              <View className="flex-row items-end gap-[2px] h-5">
                {[...Array(6)].map((_, i) => (
                  <EqualizerBar key={i} active={status === "playing"} />
                ))}
              </View>
            )}
          </View>

          {/* Title */}
          <View className="flex-1">
            <Text
              className="text-[15px] font-bold"
              style={{ color: "#1A1A2E" }}
              numberOfLines={1}
            >
              {track.name}
            </Text>
            <Text
              className="text-[12px] font-medium mt-0.5"
              style={{ color: "#7A8AAA" }}
              numberOfLines={1}
            >
              {track.artist}
            </Text>
          </View>

          {/* Actions */}
          <View className="flex-row items-center gap-2">
            <TouchableOpacity
              onPress={onClose}
              className="w-8 h-8 rounded-full bg-[#F7F8FC] items-center justify-center"
            >
              <Ionicons name="close" size={18} color="#9090A8" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Seek bar */}
        <View className="mb-2">
          <Slider
            style={{ width: "100%", height: 40 }}
            minimumValue={0}
            maximumValue={durMs > 0 ? durMs : 1}
            value={posMs}
            minimumTrackTintColor="#2D7CF6"
            maximumTrackTintColor="#E6EEFA"
            thumbTintColor="#2D7CF6"
            onSlidingStart={() => {
              isScrubbing.current = true;
              onScrubChange(true);
            }}
            onValueChange={(val) => {
              setPosMs(val);
            }}
            onSlidingComplete={async (val) => {
              if (soundRef.current) {
                await soundRef.current.setPositionAsync(val);
              }
              isScrubbing.current = false;
              onScrubChange(false);
            }}
          />
          <View className="flex-row justify-between px-1 mt-[-8px]">
            <Text className="text-[10px] font-bold text-[#9090A8]">{fmtMs(posMs)}</Text>
            <Text className="text-[10px] font-bold text-[#9090A8]">{fmtMs(durMs)}</Text>
          </View>
        </View>

        {/* Main Controls */}
        <View className="flex-row items-center justify-center">
          <View className="flex-row items-center gap-4">
            <TouchableOpacity onPress={handlePrev}>
              <Ionicons name="play-skip-back" size={20} color="#1A1A2E" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={skipBackward}
              className="items-center justify-center"
              style={{ width: 32, height: 32 }}
            >
              <Ionicons name="refresh" size={22} color="#1A1A2E" style={{ transform: [{ scaleX: -1 }] }} />
              <Text style={{ fontSize: 7, position: 'absolute', top: 12, fontWeight: 'bold', color: '#1A1A2E' }}>10</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={togglePlay}
              disabled={status === "loading"}
              style={{
                width: 42,
                height: 42,
                borderRadius: 21,
                backgroundColor: "#2D7CF6",
                alignItems: "center",
                justifyContent: "center",
                elevation: 4,
                shadowColor: "#2D7CF6",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
              }}
            >
              <Ionicons
                name={status === "playing" ? "pause" : "play"}
                size={22}
                color="#fff"
                style={{ marginLeft: status === "playing" ? 0 : 2 }}
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={skipForward}
              className="items-center justify-center"
              style={{ width: 32, height: 32 }}
            >
              <Ionicons name="refresh" size={22} color="#1A1A2E" />
              <Text style={{ fontSize: 7, position: 'absolute', top: 12, fontWeight: 'bold', color: '#1A1A2E' }}>10</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleNext}>
              <Ionicons name="play-skip-forward" size={20} color="#1A1A2E" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

// ─── Track Row

function TrackRow({
  track,
  isActive,
  index,
  onPress,
}: {
  track: Track;
  isActive: boolean;
  index: number;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      className="flex-row items-center gap-3 py-3 px-4 rounded-2xl mb-2 border"
      style={{
        backgroundColor: isActive ? "#EEF4FF" : "#FFFFFF",
        borderColor: isActive ? "#2D7CF6" : "#D0D8E8",
      }}
    >
      {/* Index / active indicator */}
      <View className="w-8 items-center">
        {isActive ? (
          <Ionicons name="musical-note" size={16} color="#2D7CF6" />
        ) : (
          <Text className="text-[#2A3A60] text-xs font-bold">
            {String(index + 1).padStart(2, "0")}
          </Text>
        )}
      </View>

      {/* Info */}
      <View className="flex-1">
        <Text
          className="text-sm font-semibold"
          style={{ color: isActive ? "#2D7CF6" : "#1A1A2E" }}
          numberOfLines={1}
        >
          {track.name}
        </Text>
        <Text className="text-xs text-[#7A8AAA] mt-0.5" numberOfLines={1}>
          {track.artist}
        </Text>
      </View>

      {/* Duration */}
      <Text className="text-xs text-[#8A9ABB]">{fmtSec(track.duration)}</Text>

      {isActive && <View className="w-1.5 h-1.5 rounded-full bg-[#2D7CF6]" />}
    </TouchableOpacity>
  );
}

// ─── Main Screen

export default function MusicLibraryScreen() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [alert, setAlert] = useState<{ visible: boolean; title: string; message: string }>({
    visible: false,
    title: "",
    message: "",
  });
  const insets = useSafeAreaInsets();
  // ref so scroll lock is synchronous — no re-render needed
  const flatListRef = useRef<FlatList>(null);

  // load device music
  useEffect(() => {
    const load = async () => {
      const { status } = await MediaLibrary.requestPermissionsAsync();

      if (status !== "granted") {
        setPermissionDenied(true);
        setLoading(false);
        return;
      }

      let allTracks: Track[] = [];
      let after: string | undefined = undefined;
      let hasMore = true;

      while (hasMore) {
        const page = await MediaLibrary.getAssetsAsync({
          mediaType: "audio",
          first: 100,
          after,
        });

        const mapped: Track[] = page.assets.map((a) => ({
          id: a.id,
          name: a.filename.replace(/\.[^/.]+$/, ""),
          artist: (a as any).artist ?? "უცნობი შემსრულებელი",
          duration: a.duration,
          uri: a.uri,
        }));

        allTracks = [...allTracks, ...mapped];
        after = page.endCursor;
        hasMore = page.hasNextPage;
      }

      setTracks(allTracks);
      setLoading(false);
    };

    load();
  }, []);

  const activeTrack = activeIndex !== null ? tracks[activeIndex] : null;

  const handleNext = useCallback(() => {
    if (activeIndex === null) return;
    setActiveIndex((i) => (i! + 1) % tracks.length);
  }, [activeIndex, tracks.length]);

  const handlePrev = useCallback(() => {
    if (activeIndex === null) return;
    setActiveIndex((i) => (i! - 1 + tracks.length) % tracks.length);
  }, [activeIndex, tracks.length]);

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      <CustomAlert
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        onClose={() => setAlert({ ...alert, visible: false })}
      />
      {/* Header Info */}
      <View className="px-5 pt-0 pb-3" style={{ marginTop: -16 }}>
        <Text className="text-[17px] font-bold text-[#1A1A2E]">
          თქვენი აუდიო ფაილები
        </Text>
        <Text className="text-[12px] text-[#7A8AAA] mt-1">
          {tracks.length} ფაილი ნაპოვნია
        </Text>
      </View>

      {/* Player */}
      {activeTrack && (
        <PlayerBar
          track={activeTrack}
          onClose={() => setActiveIndex(null)}
          onNext={handleNext}
          onPrev={handlePrev}
          onScrubChange={(scrubbing) => {
            // synchronous — directly toggle scrollability on the FlatList node
            flatListRef.current?.setNativeProps({ scrollEnabled: !scrubbing });
          }}
          onError={(msg) => setAlert({ visible: true, title: "შეცდომა", message: msg })}
        />
      )}

      {/* Loading */}
      {loading && (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#2D7CF6" />
        </View>
      )}

      {/* No Permission */}
      {permissionDenied && (
        <View className="flex-1 items-center justify-center px-10">
          <Ionicons name="lock-closed-outline" size={48} color="#C5D5F5" />
          <Text className="mt-4 text-center text-[15px] font-bold text-[#1A1A2E]">
            წვდომა აკრძალულია
          </Text>
          <Text className="mt-2 text-center text-[13px] text-[#9090A8] leading-5">
            გთხოვთ მოგვცეთ აუდიო ფაილებზე წვდომა პარამეტრებიდან
          </Text>
        </View>
      )}

      {/* No Tracks */}
      {!loading && !permissionDenied && tracks.length === 0 && (
        <View className="flex-1 items-center justify-center px-10">
          <Ionicons name="musical-notes-outline" size={48} color="#C5D5F5" />
          <Text className="mt-4 text-center text-[15px] font-bold text-[#1A1A2E]">
            ფაილები ვერ მოიძებნა
          </Text>
          <Text className="mt-2 text-center text-[13px] text-[#9090A8] leading-5">
            თქვენს მოწყობილობაზე აუდიო ფაილები არ არის
          </Text>
        </View>
      )}

      {/* Track list */}
      {!loading && !permissionDenied && tracks.length > 0 && (
        <FlatList
          ref={flatListRef}
          className="flex-1 px-4"
          data={tracks}
          keyExtractor={(t) => t.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 8 }}
          renderItem={({ item: track, index }) => (
            <TrackRow
              track={track}
              index={index}
              isActive={activeIndex === index}
              onPress={() => setActiveIndex(index)}
            />
          )}
        />
      )}
    </View>
  );
}
