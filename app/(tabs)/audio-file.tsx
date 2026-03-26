import React, { useState, useEffect, useRef, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Audio, AVPlaybackStatus } from "expo-av";
import * as MediaLibrary from "expo-media-library";
import Slider from "@react-native-community/slider";
import {
  Alert,
  Animated,
  Easing,
  FlatList,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";

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

function PlayerBar({
  track,
  onClose,
  onNext,
  onPrev,
  onScrubChange,
}: {
  track: Track;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  onScrubChange: (scrubbing: boolean) => void;
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

  const barAnims = useRef(
    Array.from({ length: 4 }, () => new Animated.Value(0.3)),
  ).current;

  // equalizer
  useEffect(() => {
    if (status === "playing") {
      barAnims.forEach((anim, i) => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(anim, {
              toValue: 1,
              duration: 360 + i * 100,
              useNativeDriver: true,
              easing: Easing.inOut(Easing.sin),
            }),
            Animated.timing(anim, {
              toValue: 0.3,
              duration: 360 + i * 100,
              useNativeDriver: true,
              easing: Easing.inOut(Easing.sin),
            }),
          ]),
        ).start();
      });
    } else {
      barAnims.forEach((anim) => {
        anim.stopAnimation();
        Animated.timing(anim, {
          toValue: 0.3,
          duration: 200,
          useNativeDriver: true,
        }).start();
      });
    }
  }, [status]);

  // load track
  useEffect(() => {
    let mounted = true;
    setStatus("loading");
    setPosMs(0);
    setDurMs(0);

    const load = async () => {
      try {
        // unload previous
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
          { shouldPlay: true },
          (s: AVPlaybackStatus) => {
            if (!mounted || !s.isLoaded) return;
            setStatus(s.isPlaying ? "playing" : "paused");
            const dur = s.durationMillis ?? track.duration * 1000;
            setDurMs(dur);
            durMsRef.current = dur;
            // Don't override position while user is scrubbing
            if (!isScrubbing.current) {
              setPosMs(s.positionMillis ?? 0);
            }
            if (s.didJustFinish) onNext();
          },
        );

        soundRef.current = sound;
        if (mounted) setStatus("playing");
      } catch {
        if (mounted) setStatus("paused");
        Alert.alert("შეცდომა", "ტრეკის გახსნა ვერ მოხერხდა.");
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
    if (status === "playing") {
      await soundRef.current.pauseAsync();
    } else {
      await soundRef.current.playAsync();
    }
  }, [status]);

  return (
    <View
      className="mx-4 mb-3 rounded-2xl border"
      style={{ backgroundColor: "#FFFFFF", borderColor: "#2D7CF6" }}
    >
      <View className="px-4 pt-4 pb-3">
        {/* Track info + controls */}
        <View className="flex-row items-center gap-3 mb-4">
          {/* Equalizer / loading */}
          <View className="w-10 items-center">
            {status === "loading" ? (
              <ActivityIndicator size="small" color="#2D7CF6" />
            ) : (
              <View className="flex-row items-end gap-[3px] h-5">
                {barAnims.map((anim, i) => (
                  <Animated.View
                    key={i}
                    className="w-[3px] rounded-full bg-[#2D7CF6]"
                    style={{ height: 18, transform: [{ scaleY: anim }] }}
                  />
                ))}
              </View>
            )}
          </View>

          {/* Title */}
          <View className="flex-1">
            <Text
              className="text-sm font-bold"
              style={{ color: "#1A1A2E" }}
              numberOfLines={1}
            >
              {track.name}
            </Text>
            <Text
              className="text-xs mt-0.5"
              style={{ color: "#7A8AAA" }}
              numberOfLines={1}
            >
              {track.artist}
            </Text>
          </View>

          {/* Prev */}
          <TouchableOpacity onPress={onPrev} className="p-1">
            <Ionicons name="play-skip-back" size={20} color="#7A8AAA" />
          </TouchableOpacity>

          {/* Play/Pause */}
          <TouchableOpacity
            onPress={togglePlay}
            disabled={status === "loading"}
            className="w-10 h-10 rounded-full bg-[#2D7CF6] items-center justify-center"
          >
            <Ionicons
              name={status === "playing" ? "pause" : "play"}
              size={20}
              color="#fff"
            />
          </TouchableOpacity>

          {/* Next */}
          <TouchableOpacity onPress={onNext} className="p-1">
            <Ionicons name="play-skip-forward" size={20} color="#7A8AAA" />
          </TouchableOpacity>

          {/* Close */}
          <TouchableOpacity onPress={onClose} className="p-1">
            <Ionicons name="close" size={18} color="#7A8AAA" />
          </TouchableOpacity>
        </View>

        {/* Seek bar — native Slider */}
        <Slider
          style={{ width: "100%", height: 28, marginHorizontal: -4 }}
          minimumValue={0}
          maximumValue={durMs > 0 ? durMs : 1}
          value={posMs}
          minimumTrackTintColor="#2D7CF6"
          maximumTrackTintColor="#D0D8E8"
          thumbTintColor="#2D7CF6"
          onSlidingStart={() => {
            isScrubbing.current = true;
            onScrubChange(true);
          }}
          onValueChange={(val) => {
            setPosMs(val);
          }}
          onSlidingComplete={async (val) => {
            isScrubbing.current = false;
            onScrubChange(false);
            if (soundRef.current) {
              await soundRef.current.setPositionAsync(Math.floor(val));
            }
          }}
        />

        {/* Time */}
        <View className="flex-row justify-between" style={{ marginTop: -4 }}>
          <Text className="text-[10px]" style={{ color: "#8A9ABB" }}>
            {fmtMs(posMs)}
          </Text>
          <Text className="text-[10px]" style={{ color: "#8A9ABB" }}>
            {fmtMs(durMs)}
          </Text>
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
          mediaType: MediaLibrary.MediaType.audio,
          first: 100,
          after,
          sortBy: MediaLibrary.SortBy.default,
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
    <SafeAreaView className="flex-1" style={{ backgroundColor: "#FFFFFF" }}>
      {/* Header */}
      <View className="px-5 pt-5 pb-4">
        {!loading && !permissionDenied && (
          <Text className="text-md text-black mt-0.5">
            {tracks.length} ტრეკი მოწყობილობაზე
          </Text>
        )}
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
        />
      )}

      {/* States */}
      {loading && (
        <View className="flex-1 items-center justify-center gap-3">
          <ActivityIndicator size="large" color="#2D7CF6" />
          <Text className="text-[#3A5080] text-sm">მუსიკა იტვირთება...</Text>
        </View>
      )}

      {!loading && permissionDenied && (
        <View className="flex-1 items-center justify-center px-8 gap-4">
          <View className="w-20 h-20 rounded-xl bg-[#0C1525] items-center justify-center border border-[#192840]">
            <Ionicons name="lock-closed-outline" size={36} color="#1E3050" />
          </View>
          <Text className="text-white text-base font-bold text-center">
            წვდომა საჭიროა
          </Text>
          <Text className="text-[#3A5080] text-sm text-center">
            მუსიკის სიის სანახავად გახსენით პარამეტრები და მიეცით მედია
            ბიბლიოთეკაზე წვდომა.
          </Text>
        </View>
      )}

      {!loading && !permissionDenied && tracks.length === 0 && (
        <View className="flex-1 items-center justify-center gap-4">
          <View className="w-20 h-20 rounded-3xl bg-[#0C1525] items-center justify-center border border-[#192840]">
            <Ionicons name="musical-notes-outline" size={36} color="#1E3050" />
          </View>
          <Text className="text-[#2A3A60] text-sm font-semibold text-center">
            მოწყობილობაზე მუსიკა არ მოიძებნა
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
          contentContainerStyle={{ paddingBottom: 40 }}
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
    </SafeAreaView>
  );
}
