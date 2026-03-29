import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

export type TranscriptItem = {
  id: number;
  url: string;
  title: string;
  thumbnail: string;
  preview: string;
  time: string;
};

export const useYouTubeProcessor = () => {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [transcripts, setTranscripts] = useState<TranscriptItem[]>([]);
  const [alert, setAlert] = useState<{ visible: boolean; title: string; message: string }>({
    visible: false,
    title: "",
    message: "",
  });

  const getVideoId = (url: string) => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]{11})/);
    return match ? match[1] : null;
  };

  const isValid = url.includes("youtube.com") || url.includes("youtu.be");

  // Load history on mount
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const savedHistory = await AsyncStorage.getItem("youtube_history");
        if (savedHistory) {
          setTranscripts(JSON.parse(savedHistory));
        }
      } catch (e) {
        console.error("Failed to load history", e);
      }
    };
    loadHistory();
  }, []);

  // Save history when transcripts change
  useEffect(() => {
    const saveHistory = async () => {
      try {
        if (transcripts.length === 0) {
          // If we want to check if it was intentionally cleared
          // We can check if the storage currently has items
          const savedHistory = await AsyncStorage.getItem("youtube_history");
          if (savedHistory && JSON.parse(savedHistory).length > 0) {
            await AsyncStorage.setItem("youtube_history", JSON.stringify([]));
          }
        } else {
          await AsyncStorage.setItem("youtube_history", JSON.stringify(transcripts));
        }
      } catch (e) {
        console.error("Failed to save history", e);
      }
    };
    saveHistory();
  }, [transcripts]);

  const clearHistory = async () => {
    setTranscripts([]);
  };

  const deleteItem = async (id: number) => {
    setTranscripts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleProcess = async () => {
    if (!isValid) {
      setAlert({
        visible: true,
        title: "არასწორი URL",
        message: "გთხოვთ შეიყვანოთ სწორი YouTube ბმული",
      });
      return;
    }

    const currentVideoId = getVideoId(url);
    const isDuplicate = transcripts.some((t) => {
      const existingVideoId = getVideoId(t.url);
      return (currentVideoId && existingVideoId && currentVideoId === existingVideoId) || t.url === url;
    });

    if (isDuplicate) {
      setAlert({
        visible: true,
        title: "ლინკი უკვე არსებობს",
        message: "ეს ვიდეო უკვე დამატებულია სიაში",
      });
      return;
    }

    setLoading(true);

    try {
      const encodedUrl = encodeURIComponent(url);
      const oembedUrl = `https://www.youtube.com/oembed?url=${encodedUrl}&format=json`;

      let response = await fetch(oembedUrl);
      let videoTitle = "YouTube ვიდეო";
      let videoThumbnail = "";

      if (response.ok) {
        const data = await response.json();
        videoTitle = data.title || "YouTube ვიდეო";
        videoThumbnail = data.thumbnail_url || "";
      } else {
        const videoId = getVideoId(url);
        if (videoId) {
          videoThumbnail = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
        }
        const pageResponse = await fetch(url);
        if (pageResponse.ok) {
          const html = await pageResponse.text();
          const titleMatch = html.match(/<title>(.*?)<\/title>/);
          if (titleMatch && titleMatch[1]) {
            videoTitle = titleMatch[1].replace(" - YouTube", "");
          }
        }
      }

      setLoading(false);

      const isTitleDuplicate = transcripts.some((t) => t.title === videoTitle);
      if (isTitleDuplicate) {
        setAlert({
          visible: true,
          title: "ვიდეო უკვე არსებობს",
          message: `ვიდეო სათაურით "${videoTitle}" უკვე დამატებულია`,
        });
        setUrl("");
        return;
      }

      setTranscripts((prev) => [
        {
          id: Date.now(),
          url,
          title: videoTitle,
          thumbnail: videoThumbnail,
          preview: "",
          time: "ახლა",
        },
        ...prev,
      ]);
      setUrl("");
    } catch (error) {
      console.error("Error fetching YouTube info:", error);
      setLoading(false);

      const videoTitle = "YouTube ვიდეო";
      const isTitleDuplicate = transcripts.some((t) => t.title === videoTitle);
      if (isTitleDuplicate) {
        setAlert({
          visible: true,
          title: "ვიდეო უკვე არსებობს",
          message: `ვიდეო სათაურით "${videoTitle}" უკვე დამატებულია`,
        });
        setUrl("");
        return;
      }

      setTranscripts((prev) => [
        {
          id: Date.now(),
          url,
          title: videoTitle,
          thumbnail: "",
          preview: "",
          time: "ახლა",
        },
        ...prev,
      ]);
      setUrl("");
    }
  };

  return {
    url,
    setUrl,
    loading,
    transcripts,
    alert,
    setAlert,
    isValid,
    handleProcess,
    clearHistory,
    deleteItem,
  };
};
