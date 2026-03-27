import React, { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { Audio, AVPlaybackStatus } from "expo-av";
import * as Haptics from "expo-haptics";
import { PlayerStatus, Track } from "../../types/audio";
import EqualizerBar from "./EqualizerBar";

interface PlayerBarProps {
  track: Track;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  onScrubChange: (scrubbing: boolean) => void;
  onError: (msg: string) => void;
}

const fmtSec = (sec: number) => {
  const s = Math.floor(sec);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

const fmtMs = (ms: number) => fmtSec(ms / 1000);

export default function PlayerBar({
  track,
  onClose,
  onNext,
  onPrev,
  onScrubChange,
  onError,
}: PlayerBarProps) {
  const soundRef = useRef<Audio.Sound | null>(null);
  const [status, setStatus] = useState<PlayerStatus>("loading");
  const [posMs, setPosMs] = useState(0);
  const [durMs, setDurMs] = useState(0);
  const isScrubbing = useRef(false);
  const durMsRef = useRef(0);

  useEffect(() => {
    durMsRef.current = durMs;
  }, [durMs]);

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
          }
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
      className="mx-4 mb-4 rounded-[24px]"
      style={{
        backgroundColor: "#FFFFFF",
        elevation: 6,
        shadowColor: "#2175e2",
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 1,
        borderWidth: 1,
        borderColor: "rgba(100, 183, 255, 0.01)",
      }}
    >
      <View className="px-5 pt-5 pb-4 overflow-hidden rounded-[24px]">
        <View className="flex-row items-center gap-4 mb-4">
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

          <View className="flex-row items-center gap-2">
            <TouchableOpacity
              onPress={onClose}
              className="w-8 h-8 rounded-full bg-[#F7F8FC] items-center justify-center"
            >
              <Ionicons name="close" size={18} color="#9090A8" />
            </TouchableOpacity>
          </View>
        </View>

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
            <Text className="text-[10px] font-bold text-[#9090A8]">
              {fmtMs(posMs)}
            </Text>
            <Text className="text-[10px] font-bold text-[#9090A8]">
              {fmtMs(durMs)}
            </Text>
          </View>
        </View>

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
              <Ionicons
                name="refresh"
                size={22}
                color="#1A1A2E"
                style={{ transform: [{ scaleX: -1 }] }}
              />
              <Text
                style={{
                  fontSize: 7,
                  position: "absolute",
                  top: 12,
                  fontWeight: "bold",
                  color: "#1A1A2E",
                }}
              >
                10
              </Text>
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
              <Text
                style={{
                  fontSize: 7,
                  position: "absolute",
                  top: 12,
                  fontWeight: "bold",
                  color: "#1A1A2E",
                }}
              >
                10
              </Text>
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
