import { Image } from "expo-image";
import { router } from "expo-router";
import { FlatList, Pressable, ScrollView, Text, View, ActivityIndicator } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/hooks/use-auth";
import { useColors } from "@/hooks/use-colors";

const CUISINES = [
  { label: "All", emoji: "🍽️" },
  { label: "Caribbean", emoji: "🌴" },
  { label: "Italian", emoji: "🍝" },
  { label: "Japanese", emoji: "🍣" },
  { label: "Indian", emoji: "🍛" },
  { label: "French", emoji: "🥐" },
  { label: "West African", emoji: "🌍" },
  { label: "Vegan", emoji: "🥗" },
  { label: "BBQ", emoji: "🔥" },
];

const OCCASIONS = [
  { label: "Date Night", emoji: "🕯️" },
  { label: "Birthday", emoji: "🎂" },
  { label: "Wedding", emoji: "💍" },
  { label: "Corporate", emoji: "💼" },
  { label: "Family Feast", emoji: "👨‍👩‍👧‍👦" },
  { label: "Honeymoon", emoji: "🌹" },
];

function BadgePill({ tier }: { tier: string }) {
  const colors: Record<string, { bg: string; text: string; label: string }> = {
    elite: { bg: "#FFD700", text: "#7B5800", label: "⭐ Elite" },
    pro: { bg: "#C0C0C0", text: "#444", label: "✦ Pro" },
    verified: { bg: "#4CAF50", text: "#fff", label: "✓ Verified" },
    none: { bg: "#E5E7EB", text: "#687076", label: "Unverified" },
  };
  const style = colors[tier] ?? colors.none;
  return (
    <View style={{ backgroundColor: style.bg, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 }}>
      <Text style={{ color: style.text, fontSize: 10, fontWeight: "700" }}>{style.label}</Text>
    </View>
  );
}

function ChefCard({ chef, onPress }: { chef: any; onPress: () => void }) {
  const cuisines = Array.isArray(chef.cuisines)
    ? chef.cuisines
    : typeof chef.cuisines === "string"
    ? JSON.parse(chef.cuisines)
    : [];

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
      className="mr-4"
    >
      <View className="bg-surface rounded-3xl overflow-hidden border border-border" style={{ width: 200 }}>
        <Image
          source={{ uri: chef.profilePhotoUrl ?? "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=400&h=400&fit=crop" }}
          style={{ width: 200, height: 160 }}
          contentFit="cover"
        />
        <View className="p-3">
          <View className="flex-row items-center justify-between mb-1">
            <Text className="text-foreground font-bold text-sm flex-1" numberOfLines={1}>
              {chef.name}
            </Text>
            <BadgePill tier={chef.badgeTier ?? "none"} />
          </View>
          <Text className="text-muted text-xs mb-2" numberOfLines={1}>
            {cuisines.slice(0, 2).join(" · ")}
          </Text>
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-1">
              <IconSymbol name="star.fill" size={12} color="#F59E0B" />
              <Text className="text-foreground text-xs font-semibold">
                {Number(chef.avgRating).toFixed(1)}
              </Text>
              <Text className="text-muted text-xs">({chef.totalBookings})</Text>
            </View>
            <View className="flex-row items-center gap-1">
              <IconSymbol name="location.fill" size={12} color="#687076" />
              <Text className="text-muted text-xs" numberOfLines={1} style={{ maxWidth: 80 }}>
                {chef.location?.split(",")[0] ?? "UK"}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

export default function ClientHomeScreen() {
  const { user } = useAuth();
  const colors = useColors();
  const { data, isLoading } = trpc.chefs.list.useQuery({ limit: 20 });
  const chefs = data?.chefs ?? [];

  const topRated = [...chefs].sort((a, b) => Number(b.avgRating) - Number(a.avgRating)).slice(0, 6);
  const featured = chefs.slice(0, 8);

  const firstName = user?.name?.split(" ")[0] ?? "there";

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-5 pt-4 pb-2 flex-row items-center justify-between">
          <View>
            <Text className="text-muted text-sm">Good {getTimeOfDay()},</Text>
            <Text className="text-foreground text-2xl font-bold">{firstName} 👋</Text>
          </View>
          <Pressable
            onPress={() => router.push("/(client)/notifications" as never)}
            style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
          >
            <View className="bg-surface border border-border rounded-full p-2">
              <IconSymbol name="bell.fill" size={20} color={colors.foreground} />
            </View>
          </Pressable>
        </View>

        {/* Search Bar */}
        <Pressable
          onPress={() => router.push("/(client)/search" as never)}
          style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
          className="mx-5 mt-3 mb-4"
        >
          <View className="bg-surface border border-border rounded-2xl px-4 py-3 flex-row items-center gap-3">
            <IconSymbol name="magnifyingglass" size={18} color={colors.muted} />
            <Text className="text-muted text-base flex-1">Search chefs, cuisines, occasions...</Text>
          </View>
        </Pressable>

        {/* Cuisine Categories */}
        <View className="mb-5">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}
          >
            {CUISINES.map((c) => (
              <Pressable
                key={c.label}
                onPress={() => router.push({ pathname: "/(client)/search" as never, params: { cuisine: c.label } })}
                style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
              >
                <View className="bg-surface border border-border rounded-2xl px-4 py-2 items-center flex-row gap-2">
                  <Text className="text-base">{c.emoji}</Text>
                  <Text className="text-foreground text-sm font-medium">{c.label}</Text>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Featured Chefs */}
        <View className="mb-6">
          <View className="px-5 flex-row items-center justify-between mb-3">
            <Text className="text-foreground text-lg font-bold">Featured Chefs</Text>
            <Pressable onPress={() => router.push("/(client)/search" as never)} style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}>
              <Text className="text-primary text-sm font-semibold">See all</Text>
            </Pressable>
          </View>
          {isLoading ? (
            <View className="items-center py-8">
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingLeft: 20, paddingRight: 8 }}
            >
              {featured.map((chef) => (
                <ChefCard
                  key={chef.id}
                  chef={chef}
                  onPress={() => router.push({ pathname: "/(client)/chef/[id]" as never, params: { id: chef.id } })}
                />
              ))}
            </ScrollView>
          )}
        </View>

        {/* Top Rated */}
        <View className="mb-6">
          <View className="px-5 flex-row items-center justify-between mb-3">
            <Text className="text-foreground text-lg font-bold">⭐ Top Rated</Text>
            <Pressable onPress={() => router.push("/(client)/search" as never)} style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}>
              <Text className="text-primary text-sm font-semibold">See all</Text>
            </Pressable>
          </View>
          <View className="px-5 gap-3">
            {topRated.map((chef, index) => {
              const cuisines = Array.isArray(chef.cuisines)
                ? chef.cuisines
                : typeof chef.cuisines === "string"
                ? JSON.parse(chef.cuisines)
                : [];
              return (
                <Pressable
                  key={chef.id}
                  onPress={() => router.push({ pathname: "/(client)/chef/[id]" as never, params: { id: chef.id } })}
                  style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
                >
                  <View className="bg-surface border border-border rounded-2xl p-3 flex-row items-center gap-3">
                    <Text className="text-muted font-bold text-base w-6">{index + 1}</Text>
                    <Image
                      source={{ uri: chef.profilePhotoUrl ?? "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=400&h=400&fit=crop" }}
                      style={{ width: 52, height: 52, borderRadius: 26 }}
                      contentFit="cover"
                    />
                    <View className="flex-1">
                      <Text className="text-foreground font-bold text-sm">{chef.name}</Text>
                      <Text className="text-muted text-xs">{cuisines.slice(0, 2).join(" · ")}</Text>
                      <View className="flex-row items-center gap-1 mt-1">
                        <IconSymbol name="star.fill" size={11} color="#F59E0B" />
                        <Text className="text-foreground text-xs font-semibold">{Number(chef.avgRating).toFixed(1)}</Text>
                        <Text className="text-muted text-xs">· {chef.totalBookings} bookings</Text>
                      </View>
                    </View>
                    <BadgePill tier={chef.badgeTier ?? "none"} />
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Occasions */}
        <View className="mb-8">
          <View className="px-5 mb-3">
            <Text className="text-foreground text-lg font-bold">Book for Any Occasion</Text>
          </View>
          <View className="px-5 flex-row flex-wrap gap-3">
            {OCCASIONS.map((o) => (
              <Pressable
                key={o.label}
                onPress={() => router.push({ pathname: "/(client)/search" as never, params: { occasion: o.label } })}
                style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
              >
                <View className="bg-surface border border-border rounded-2xl px-4 py-3 items-center flex-row gap-2">
                  <Text className="text-xl">{o.emoji}</Text>
                  <Text className="text-foreground text-sm font-medium">{o.label}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

function getTimeOfDay() {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}
