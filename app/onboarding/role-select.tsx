import { Image } from "expo-image";
import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { ScreenContainer } from "@/components/screen-container";
import { useChefMii } from "@/lib/chefmii-context";

export default function RoleSelectScreen() {
  const { setRole } = useChefMii();

  const handleSelect = async (role: "client" | "chef") => {
    await setRole(role);
    router.push("/auth/login" as never);
  };

  return (
    <ScreenContainer className="px-6 pt-8 pb-6">
      <Animated.View entering={FadeInDown.duration(500)} className="flex-1">
        {/* Header */}
        <View className="items-center mb-10">
          <Image
            source={require("@/assets/images/icon.png")}
            style={{ width: 72, height: 72, borderRadius: 18 }}
            contentFit="cover"
          />
          <Text className="text-3xl font-bold text-foreground mt-4">Welcome to ChefMii</Text>
          <Text className="text-muted text-center text-base mt-2">
            The premium private chef marketplace
          </Text>
        </View>

        {/* Role Cards */}
        <View className="gap-4 flex-1 justify-center">
          <Animated.View entering={FadeInDown.delay(100).duration(500)}>
            <Pressable
              style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
              onPress={() => handleSelect("client")}
            >
              <View className="bg-card border-2 border-primary rounded-3xl p-6 items-center shadow-sm">
                <Text className="text-5xl mb-3">🍽️</Text>
                <Text className="text-xl font-bold text-foreground">I want to hire a chef</Text>
                <Text className="text-muted text-center mt-2 text-sm leading-5">
                  Browse verified private chefs, book experiences, and enjoy restaurant-quality dining at home
                </Text>
                <View className="bg-primary rounded-2xl px-8 py-3 mt-4">
                  <Text className="text-white font-semibold text-base">Book a Chef</Text>
                </View>
              </View>
            </Pressable>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(200).duration(500)}>
            <Pressable
              style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
              onPress={() => handleSelect("chef")}
            >
              <View className="bg-card border-2 border-border rounded-3xl p-6 items-center shadow-sm">
                <Text className="text-5xl mb-3">👨‍🍳</Text>
                <Text className="text-xl font-bold text-foreground">I am a chef</Text>
                <Text className="text-muted text-center mt-2 text-sm leading-5">
                  Create your profile, set your packages, and start earning from private dining experiences
                </Text>
                <View className="bg-foreground rounded-2xl px-8 py-3 mt-4">
                  <Text className="text-background font-semibold text-base">Join as Chef</Text>
                </View>
              </View>
            </Pressable>
          </Animated.View>
        </View>

        {/* Footer */}
        <Text className="text-muted text-center text-xs mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </Text>
      </Animated.View>
    </ScreenContainer>
  );
}
