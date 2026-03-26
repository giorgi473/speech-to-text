import { useEffect, useRef, useState } from "react";
import { Animated, Dimensions } from "react-native";
import { State } from "react-native-gesture-handler";

const SCREEN_HEIGHT = Dimensions.get("window").height;
const DISMISS_THRESHOLD = 80;

type UseSheetAnimationOptions = {
  visible: boolean;
  onClose: () => void;
};

export function useSheetAnimation({
  visible,
  onClose,
}: UseSheetAnimationOptions) {
  const [modalVisible, setModalVisible] = useState(false);
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const baseY = useRef(0);

  const animateOpen = () => {
    baseY.current = 0;
    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 320,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const animateClose = (callback: () => void) => {
    Animated.sequence([
      Animated.timing(translateY, {
        toValue: SCREEN_HEIGHT,
        duration: 260,
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setModalVisible(false);
      callback();
    });
  };

  useEffect(() => {
    if (visible) {
      overlayOpacity.setValue(0);
      translateY.setValue(SCREEN_HEIGHT);
      baseY.current = 0;
      setModalVisible(true);
    }
  }, [visible]);

  useEffect(() => {
    if (modalVisible) animateOpen();
  }, [modalVisible]);

  const onGestureEvent = ({ nativeEvent }: any) => {
    const newY = baseY.current + nativeEvent.translationY;
    translateY.setValue(Math.max(0, newY));
  };

  const onHandlerStateChange = ({ nativeEvent }: any) => {
    if (
      nativeEvent.state === State.END ||
      nativeEvent.state === State.CANCELLED
    ) {
      if (
        nativeEvent.translationY > DISMISS_THRESHOLD ||
        nativeEvent.velocityY > 800
      ) {
        animateClose(onClose);
      } else {
        baseY.current = 0;
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          bounciness: 4,
          speed: 20,
        }).start();
      }
    }

    if (nativeEvent.state === State.BEGAN) {
      baseY.current = 0;
      translateY.stopAnimation((val) => {
        baseY.current = val;
      });
    }
  };

  return {
    modalVisible,
    overlayOpacity,
    translateY,
    animateClose,
    onGestureEvent,
    onHandlerStateChange,
  };
}
