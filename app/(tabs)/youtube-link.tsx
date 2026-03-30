import CustomAlert from "@/components/CustomAlert";
import YouTubeHistoryList from "@/components/youtube/YouTubeHistoryList";
import YouTubeInput from "@/components/youtube/YouTubeInput";
import { useYouTubeProcessor } from "@/hooks/useYouTubeProcessor";
import React from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function YouTubeLinkScreen() {
  const insets = useSafeAreaInsets();
  const {
    url,
    setUrl,
    loading,
    transcripts,
    alert,
    setAlert,
    isValid,
    handleProcess,
    clearHistory,
    deleteTranscript,
  } = useYouTubeProcessor();

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      <CustomAlert
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        onClose={() => setAlert({ ...alert, visible: false })}
      />

      <YouTubeInput
        url={url}
        setUrl={setUrl}
        isValid={isValid}
        loading={loading}
        onProcess={handleProcess}
      />

      <YouTubeHistoryList
        transcripts={transcripts}
        onClear={clearHistory}
        onDelete={deleteTranscript}
      />
    </View>
  );
}
