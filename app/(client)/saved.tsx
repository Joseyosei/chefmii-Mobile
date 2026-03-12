import { Image } from "expo-image";
import { router } from "expo-router";
import { ActivityIndicator, FlatList, Pressable, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { trpc } from "@/lib/trpc";
import { useColors } from "@/hooks/use-colors";
import { useAuth } from "@/hooks/use-auth";

export default function SavedChefsScreen() {
  const { isAuthenticated } = useAuth();
  const colors = useColors();
  const { data: savedChefs, isLoading, refetch } = trpc.savedChefs.list.useQuery(undefined, { enabled: isAuthenticated });
  const toggleSaved = trpc.savedChefs.toggle.useMutation({ onSuccess: () => refetch() });

  return (
    <ScreenContainer>
      <View className="px-5 pt-4 pb-3 flex-row items-center gap-3">
        <Pressable onPress={() => router.back()} style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}>
          <IconSymbol name="arrow.left" size={22} color={colors.foreground} />
        </Pressable>
        <Text className="text-foreground text-xl font-bold">Saved Chefs</Text>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={savedChefs ?? []}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20, gap: 12 }}
          ListEmptyComponent={
            <View className="items-center py-16">
              <Text className="text-4xl mb-3">❤️</Text>
              <Text className="text-foreground font-semibold text-lg">No saved chefs yet</Text>
              <Text className="text-muted text-center mt-1 mb-6">Tap the heart on a chef's profile to save them</Text>
              <Pressable onPress={() => router.push("/(client)/search" as never)} style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}>
                <View className="bg-primary rounded-2xl px-8 py-3">
                  <Text className="text-white font-bold">Browse Chefs</Text>
                </View>
              </Pressable>
            </View>
          }
          renderItem={({ item: saved }) => {
            const cuisines = Array.isArray(saved.chefCuisines)
              ? saved.chefCuisines
              : [];
            return (
              <Pressable
                onPress={() => router.push({ pathname: "/(client)/chef/[id]" as never, params: { id: saved.chefId } })}
                style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
              >
                <View className="bg-surface border border-border rounded-3xl overflow-hidden flex-row">
                  <Image
                    source={{ uri: saved.chefPhoto ?? "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=400&h=400&fit=crop" }}
                    style={{ width: 90, height: 100 }}
                    contentFit="cover"
                  />
                  <View className="flex-1 p-3 justify-between">
                    <View>
                      <Text className="text-foreground font-bold text-base">{saved.chefName}</Text>
                      <Text className="text-muted text-xs mt-0.5">{cuisines.slice(0, 2).join(" · ")}</Text>
                      <View className="flex-row items-center gap-1 mt-1">
                        <IconSymbol name="star.fill" size={11} color="#F59E0B" />
                        <Text className="text-foreground text-xs font-semibold">{Number(saved.chefRating ?? 0).toFixed(1)}</Text>
                      </View>
                    </View>
                    <View className="flex-row items-center justify-between">
                      <Pressable
                        onPress={() => router.push({ pathname: "/(client)/chef/[id]" as never, params: { id: saved.chefId } })}
                        style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                      >
                        <View className="bg-primary rounded-xl px-3 py-1">
                          <Text className="text-white text-xs font-semibold">Book Now</Text>
                        </View>
                      </Pressable>
                      <Pressable
                        onPress={() => toggleSaved.mutateAsync({ chefId: saved.chefId })}
                        style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
                      >
                        <IconSymbol name="heart.fill" size={20} color="#EF4444" />
                      </Pressable>
                    </View>
                  </View>
                </View>
              </Pressable>
            );
          }}
        />
      )}
    </ScreenContainer>
  );
}
