import { Image } from "expo-image";
import { router } from "expo-router";
import { useEffect } from "react";
import { Text, View } from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { ScreenContainer } from "@/components/screen-container";

export default function SplashScreen() {
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/onboarding/role-select" as never);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <ScreenContainer
      containerClassName="bg-primary"
      className="items-center justify-center"
      edges={["top", "bottom", "left", "right"]}
    >
      <Animated.View entering={FadeIn.duration(600)} className="items-center">
        <Image
          source={require("@/assets/images/icon.png")}
          style={{ width: 100, height: 100, borderRadius: 24 }}
          contentFit="cover"
        />
        <Animated.View entering={FadeInDown.delay(300).duration(600)}>
          <Text className="text-4xl font-bold text-white mt-4 tracking-tight">ChefMii</Text>
          <Text className="text-white/80 text-center text-base mt-1">
            Private chefs, on demand
          </Text>
        </Animated.View>
      </Animated.View>
    </ScreenContainer>
  );
}
