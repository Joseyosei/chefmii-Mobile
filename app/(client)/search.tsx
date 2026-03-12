import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, Text, TextInput, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { trpc } from "@/lib/trpc";
import { useColors } from "@/hooks/use-colors";

const CUISINE_FILTERS = ["All", "Caribbean", "Italian", "Japanese", "Indian", "French", "West African", "Vegan", "BBQ"];
const RATING_FILTERS = [
  { label: "Any", value: undefined },
  { label: "4.5+", value: 4.5 },
  { label: "4.8+", value: 4.8 },
];

function BadgePill({ tier }: { tier: string }) {
  const map: Record<string, { bg: string; text: string; label: string }> = {
    elite: { bg: "#FFD700", text: "#7B5800", label: "⭐ Elite" },
    pro: { bg: "#C0C0C0", text: "#444", label: "✦ Pro" },
    verified: { bg: "#4CAF50", text: "#fff", label: "✓ Verified" },
    none: { bg: "#E5E7EB", text: "#687076", label: "Unverified" },
  };
  const style = map[tier] ?? map.none;
  return (
    <View style={{ backgroundColor: style.bg, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 }}>
      <Text style={{ color: style.text, fontSize: 10, fontWeight: "700" }}>{style.label}</Text>
    </View>
  );
}

export default function SearchScreen() {
  const params = useLocalSearchParams<{ cuisine?: string; occasion?: string }>();
  const colors = useColors();
  const [search, setSearch] = useState("");
  const [selectedCuisine, setSelectedCuisine] = useState(params.cuisine ?? "All");
  const [selectedRating, setSelectedRating] = useState<number | undefined>(undefined);

  const { data, isLoading } = trpc.chefs.list.useQuery({
    search: search || undefined,
    minRating: selectedRating,
    limit: 50,
  });

  const chefs = (data?.chefs ?? []).filter((chef) => {
    if (selectedCuisine === "All") return true;
    const cuisines = Array.isArray(chef.cuisines)
      ? chef.cuisines
      : typeof chef.cuisines === "string"
      ? JSON.parse(chef.cuisines)
      : [];
    return cuisines.some((c: string) => c.toLowerCase().includes(selectedCuisine.toLowerCase()));
  });

  return (
    <ScreenContainer>
      {/* Search Header */}
      <View className="px-5 pt-4 pb-3">
        <Text className="text-foreground text-2xl font-bold mb-3">Find a Chef</Text>
        <View className="bg-surface border border-border rounded-2xl px-4 py-3 flex-row items-center gap-3">
          <IconSymbol name="magnifyingglass" size={18} color={colors.muted} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search by name, cuisine, location..."
            placeholderTextColor={colors.muted}
            className="flex-1 text-foreground text-base"
            returnKeyType="search"
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch("")} style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}>
              <IconSymbol name="xmark.circle.fill" size={18} color={colors.muted} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Cuisine Filters */}
      <View className="mb-2">
        <FlatList
          horizontal
          data={CUISINE_FILTERS}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => setSelectedCuisine(item)}
              style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
            >
              <View
                className="rounded-2xl px-4 py-2"
                style={{
                  backgroundColor: selectedCuisine === item ? colors.primary : colors.surface,
                  borderWidth: 1,
                  borderColor: selectedCuisine === item ? colors.primary : colors.border,
                }}
              >
                <Text
                  className="text-sm font-semibold"
                  style={{ color: selectedCuisine === item ? "#fff" : colors.foreground }}
                >
                  {item}
                </Text>
              </View>
            </Pressable>
          )}
        />
      </View>

      {/* Rating Filters */}
      <View className="px-5 flex-row gap-2 mb-3">
        {RATING_FILTERS.map((r) => (
          <Pressable
            key={r.label}
            onPress={() => setSelectedRating(r.value)}
            style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
          >
            <View
              className="rounded-xl px-3 py-1"
              style={{
                backgroundColor: selectedRating === r.value ? "#F59E0B" : colors.surface,
                borderWidth: 1,
                borderColor: selectedRating === r.value ? "#F59E0B" : colors.border,
              }}
            >
              <Text
                className="text-xs font-semibold"
                style={{ color: selectedRating === r.value ? "#fff" : colors.foreground }}
              >
                ⭐ {r.label}
              </Text>
            </View>
          </Pressable>
        ))}
      </View>

      {/* Results */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={chefs}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20, gap: 12 }}
          ListEmptyComponent={
            <View className="items-center py-16">
              <Text className="text-4xl mb-3">🔍</Text>
              <Text className="text-foreground font-semibold text-lg">No chefs found</Text>
              <Text className="text-muted text-center mt-1">Try adjusting your search or filters</Text>
            </View>
          }
          renderItem={({ item: chef }) => {
            const cuisines = Array.isArray(chef.cuisines)
              ? chef.cuisines
              : typeof chef.cuisines === "string"
              ? JSON.parse(chef.cuisines)
              : [];
            return (
              <Pressable
                onPress={() => router.push({ pathname: "/(client)/chef/[id]" as never, params: { id: chef.id } })}
                style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
              >
                <View className="bg-surface border border-border rounded-3xl overflow-hidden flex-row">
                  <Image
                    source={{ uri: chef.profilePhotoUrl ?? "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=400&h=400&fit=crop" }}
                    style={{ width: 100, height: 110 }}
                    contentFit="cover"
                  />
                  <View className="flex-1 p-3 justify-between">
                    <View>
                      <View className="flex-row items-center justify-between mb-1">
                        <Text className="text-foreground font-bold text-base flex-1" numberOfLines={1}>
                          {chef.name}
                        </Text>
                        <BadgePill tier={chef.badgeTier ?? "none"} />
                      </View>
                      <Text className="text-muted text-xs mb-1" numberOfLines={1}>
                        {cuisines.slice(0, 3).join(" · ")}
                      </Text>
                      <View className="flex-row items-center gap-1">
                        <IconSymbol name="location.fill" size={11} color="#687076" />
                        <Text className="text-muted text-xs">{chef.location?.split(",")[0] ?? "UK"}</Text>
                      </View>
                    </View>
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center gap-1">
                        <IconSymbol name="star.fill" size={12} color="#F59E0B" />
                        <Text className="text-foreground text-xs font-bold">{Number(chef.avgRating).toFixed(1)}</Text>
                        <Text className="text-muted text-xs">({chef.totalBookings})</Text>
                      </View>
                      <Text className="text-primary text-xs font-semibold">{chef.experienceYears}yr exp</Text>
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
