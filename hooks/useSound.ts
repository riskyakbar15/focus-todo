import { useRef } from "react";
import { Audio } from "expo-av";

// Simple hook to play a short end-of-session sound using expo-av.
// Uses a public sound URL as a fallback so repo doesn't require bundling an asset.
export function useSound() {
  const soundRef = useRef<Audio.Sound | null>(null);

  const playEndSound = async () => {
    try {
      // public short ding sound
      const uri = "https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg";
      if (!soundRef.current) {
        const { sound } = await Audio.Sound.createAsync({ uri });
        soundRef.current = sound;
      }
      await soundRef.current?.replayAsync();
    } catch (err) {
      // ignore errors silently
      // fallback: try to vibrate (handled by caller if desired)
      console.warn("useSound: failed to play sound", err);
    }
  };

  const unload = async () => {
    try {
      await soundRef.current?.unloadAsync();
      soundRef.current = null;
    } catch {
      // ignore
    }
  };

  return { playEndSound, unload };
}
