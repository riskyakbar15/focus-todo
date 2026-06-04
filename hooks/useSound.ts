import { useEffect, useRef } from "react";
import { createAudioPlayer, type AudioPlayer } from "expo-audio";

// Bundled local chime so playback works offline and has no third-party dependency.
const SESSION_END_SOUND = require("../assets/session-end.wav");

// Plays a short end-of-session sound using expo-audio.
export function useSound() {
  const playerRef = useRef<AudioPlayer | null>(null);

  useEffect(() => {
    return () => {
      try {
        playerRef.current?.remove();
      } catch {
        // ignore
      }
      playerRef.current = null;
    };
  }, []);

  const playEndSound = async () => {
    try {
      if (!playerRef.current) {
        playerRef.current = createAudioPlayer(SESSION_END_SOUND);
      }
      playerRef.current.seekTo(0);
      playerRef.current.play();
    } catch (err) {
      // best-effort: ignore playback failures
      console.warn("useSound: failed to play sound", err);
    }
  };

  const unload = () => {
    try {
      playerRef.current?.remove();
    } catch {
      // ignore
    }
    playerRef.current = null;
  };

  return { playEndSound, unload };
}
