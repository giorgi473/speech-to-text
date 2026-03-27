export type PlayerStatus = "loading" | "playing" | "paused";

export type Track = {
  id: string;
  name: string;
  artist: string;
  duration: number; // seconds
  uri: string;
};
