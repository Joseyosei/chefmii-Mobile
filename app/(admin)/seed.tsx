import { router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { trpc } from "@/lib/trpc";
import { useColors } from "@/hooks/use-colors";

const ADMIN_COLOR = "#7C3AED";

export default function AdminSeedScreen() {
  const colors = useColors();
  const [seeded, setSeeded] = useState(false);
  const runSeed = trpc.seed.run.useMutation();

  const handleSeed = () => {
    Alert.alert(
      "Run Seed Data",
      "This will populate the database with 8 sample chefs, packages, and availability data. Existing data will not be deleted. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Run Seed",
          onPress: async () => {
            try {
              await runSeed.mutateAsync();
              setSeeded(true);
              Alert.alert("Success! 🎉", "Seed data has been loaded. You can now browse chefs in the client view.");
            } catch (err: any) {
              Alert.alert("Error", err.message ?? "Failed to run seed data.");
            }
          },
        },
      ]
    );
  };

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="px-5 pt-4 pb-2 flex-row items-center gap-3">
          <Pressable onPress={() => router.back()} style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}>
            <IconSymbol name="arrow.left" size={22} color={colors.foreground} />
          </Pressable>
          <Text className="text-foreground text-xl font-bold">Seed Data</Text>
        </View>

        <View className="px-5 py-4 gap-5">
          <View className="bg-surface border border-border rounded-2xl p-5 items-center">
            <Text className="text-5xl mb-4">🌱</Text>
            <Text className="text-foreground font-bold text-lg mb-2">Populate Demo Data</Text>
            <Text className="text-muted text-center text-sm leading-relaxed mb-6">
              Load sample chefs with profiles, packages, and availability to demonstrate the full ChefMii experience.
            </Text>

            {seeded ? (
              <View className="bg-success/10 border border-success/20 rounded-2xl p-4 w-full items-center">
                <IconSymbol name="checkmark.circle.fill" size={32} color="#22C55E" />
                <Text className="text-success font-bold mt-2">Seed data loaded successfully!</Text>
                <Text className="text-muted text-xs text-center mt-1">Browse the client view to see the chefs</Text>
              </View>
            ) : (
              <Pressable
                onPress={handleSeed}
                disabled={runSeed.isPending}
                style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1, width: "100%" }]}
              >
                <View className="rounded-2xl py-4 items-center" style={{ backgroundColor: ADMIN_COLOR }}>
                  {runSeed.isPending ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text className="text-white font-bold text-base">Run Seed Data</Text>
                  )}
                </View>
              </Pressable>
            )}
          </View>

          <View className="bg-surface border border-border rounded-2xl p-4">
            <Text className="text-foreground font-bold mb-3">What gets seeded</Text>
            {[
              "8 professional chef profiles with bios",
              "Multiple cuisine specialties per chef",
              "2–3 booking packages per chef",
              "Weekly availability schedules",
              "Verified badge tiers (verified, pro, elite)",
              "Realistic UK locations and postcodes",
            ].map((item, i) => (
              <View key={i} className="flex-row items-center gap-2 py-2 border-b border-border last:border-0">
                <IconSymbol name="checkmark.circle.fill" size={16} color="#22C55E" />
                <Text className="text-muted text-sm">{item}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
