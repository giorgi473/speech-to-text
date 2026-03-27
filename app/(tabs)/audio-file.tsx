import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ActivityIndicator, FlatList, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as MediaLibrary from "expo-media-library";
import CustomAlert from "@/components/CustomAlert";
import PlayerBar from "@/components/audio/PlayerBar";
import TrackRow from "@/components/audio/TrackRow";
import { Track } from "@/types/audio";

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
