import { router } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";

export default function ChefGalleryScreen() {
  const colors = useColors();

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="px-5 pt-4 pb-2 flex-row items-center gap-3">
          <Pressable onPress={() => router.back()} style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}>
            <IconSymbol name="arrow.left" size={22} color={colors.foreground} />
          </Pressable>
          <Text className="text-foreground text-xl font-bold">Photo Gallery</Text>
        </View>

        <View className="px-5 py-4">
          <View className="bg-surface border border-border rounded-2xl p-6 items-center">
            <Text className="text-5xl mb-4">📸</Text>
            <Text className="text-foreground font-bold text-lg mb-2">Showcase Your Dishes</Text>
            <Text className="text-muted text-center text-sm leading-relaxed mb-6">
              Upload photos of your best dishes to attract more clients. A great gallery can significantly increase your booking rate.
            </Text>
            <Pressable style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}>
              <View className="bg-primary rounded-2xl px-8 py-3 flex-row items-center gap-2">
                <IconSymbol name="plus.circle.fill" size={18} color="#fff" />
                <Text className="text-white font-bold">Upload Photos</Text>
              </View>
            </Pressable>
          </View>

          <View className="mt-4 bg-surface border border-border rounded-2xl p-4">
            <Text className="text-foreground font-bold mb-2">Tips for great photos</Text>
            {[
              "Use natural lighting when possible",
              "Show plating and presentation clearly",
              "Include a variety of dishes",
              "Show your cooking process",
              "Keep photos high resolution",
            ].map((tip, i) => (
              <View key={i} className="flex-row items-center gap-2 py-2 border-b border-border last:border-0">
                <View className="w-5 h-5 bg-primary/20 rounded-full items-center justify-center">
                  <Text className="text-primary text-xs font-bold">{i + 1}</Text>
                </View>
                <Text className="text-muted text-sm">{tip}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
