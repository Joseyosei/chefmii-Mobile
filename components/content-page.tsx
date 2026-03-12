import { router } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";

interface Section {
  heading?: string;
  body: string;
}

interface ContentPageProps {
  title: string;
  subtitle?: string;
  sections: Section[];
}

export function ContentPage({ title, subtitle, sections }: ContentPageProps) {
  const colors = useColors();
  return (
    <ScreenContainer>
      <View className="px-5 pt-4 pb-2 flex-row items-center gap-3">
        <Pressable onPress={() => router.back()} style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}>
          <IconSymbol name="arrow.left" size={22} color={colors.foreground} />
        </Pressable>
        <Text className="text-foreground text-xl font-bold flex-1">{title}</Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}>
        {subtitle && (
          <Text className="text-muted text-sm mb-6 leading-5">{subtitle}</Text>
        )}
        {sections.map((s, i) => (
          <View key={i} className="mb-5">
            {s.heading && (
              <Text className="text-foreground font-bold text-base mb-2">{s.heading}</Text>
            )}
            <Text className="text-foreground text-sm leading-6">{s.body}</Text>
          </View>
        ))}
      </ScrollView>
    </ScreenContainer>
  );
}
