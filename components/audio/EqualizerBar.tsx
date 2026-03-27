import React, { useEffect } from "react";
import Reanimated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

interface EqualizerBarProps {
  active: boolean;
}

export default function EqualizerBar({ active }: EqualizerBarProps) {
  const height = useSharedValue(0.3);

  useEffect(() => {
    if (active) {
      height.value = withRepeat(
        withSequence(
          withTiming(Math.random() * 0.7 + 0.3, {
            duration: 250 + Math.random() * 250,
          }),
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
