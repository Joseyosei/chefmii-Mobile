import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { trpc } from "@/lib/trpc";
import { useColors } from "@/hooks/use-colors";
import { useAuth } from "@/hooks/use-auth";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function StarRating({ rating }: { rating: number }) {
  return (
    <View className="flex-row gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <IconSymbol
          key={s}
          name={s <= Math.round(rating) ? "star.fill" : "star"}
          size={14}
          color="#F59E0B"
        />
      ))}
    </View>
  );
}

function BadgePill({ tier }: { tier: string }) {
  const map: Record<string, { bg: string; text: string; label: string }> = {
    elite: { bg: "#FFD700", text: "#7B5800", label: "⭐ Elite Chef" },
    pro: { bg: "#C0C0C0", text: "#444", label: "✦ Pro Chef" },
    verified: { bg: "#4CAF50", text: "#fff", label: "✓ Verified Chef" },
    none: { bg: "#E5E7EB", text: "#687076", label: "Unverified" },
  };
  const style = map[tier] ?? map.none;
  return (
    <View style={{ backgroundColor: style.bg, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 }}>
      <Text style={{ color: style.text, fontSize: 12, fontWeight: "700" }}>{style.label}</Text>
    </View>
  );
}

export default function ChefProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<"packages" | "reviews" | "gallery">("packages");

  const { data: chef, isLoading } = trpc.chefs.getById.useQuery({ id: Number(id) });
  const toggleSaved = trpc.savedChefs.toggle.useMutation();
  const { data: savedList } = trpc.savedChefs.list.useQuery(undefined, { enabled: isAuthenticated });

  const isSaved = savedList?.some((s) => s.chefId === Number(id));

  const handleSave = async () => {
    if (!isAuthenticated) {
      Alert.alert("Sign In Required", "Please sign in to save chefs.");
      return;
    }
    await toggleSaved.mutateAsync({ chefId: Number(id) });
  };

  const handleBook = (pkg: any) => {
    if (!isAuthenticated) {
      Alert.alert("Sign In Required", "Please sign in to book a chef.");
      router.push("/auth/login" as never);
      return;
    }
    router.push({
      pathname: "/(client)/booking/new" as never,
      params: {
        chefId: id,
        packageId: pkg.id,
        packageName: pkg.name,
        packagePrice: pkg.price,
        chefName: chef?.name,
      },
    });
  };

  if (isLoading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  if (!chef) {
    return (
      <ScreenContainer className="items-center justify-center px-6">
        <Text className="text-foreground text-xl font-bold">Chef not found</Text>
        <Pressable onPress={() => router.back()} style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]} className="mt-4">
          <Text className="text-primary">← Go back</Text>
        </Pressable>
      </ScreenContainer>
    );
  }

  const cuisines = Array.isArray(chef.cuisines)
    ? chef.cuisines
    : typeof chef.cuisines === "string"
    ? JSON.parse(chef.cuisines)
    : [];

  const availableDays = (chef.availability ?? [])
    .filter((a) => a.isAvailable)
    .map((a) => DAYS[a.dayOfWeek]);

  return (
    <ScreenContainer edges={["top", "left", "right"]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <View style={{ position: "relative" }}>
          <Image
            source={{ uri: chef.profilePhotoUrl ?? "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=400&h=400&fit=crop" }}
            style={{ width: "100%", height: 280 }}
            contentFit="cover"
          />
          {/* Back button */}
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1, position: "absolute", top: 16, left: 16 }]}
          >
            <View className="bg-black/50 rounded-full p-2">
              <IconSymbol name="arrow.left" size={20} color="#fff" />
            </View>
          </Pressable>
          {/* Save button */}
          <Pressable
            onPress={handleSave}
            style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1, position: "absolute", top: 16, right: 16 }]}
          >
            <View className="bg-black/50 rounded-full p-2">
              <IconSymbol name={isSaved ? "heart.fill" : "heart"} size={20} color={isSaved ? "#EF4444" : "#fff"} />
            </View>
          </Pressable>
        </View>

        {/* Profile Info */}
        <View className="px-5 pt-4 pb-2">
          <View className="flex-row items-start justify-between mb-2">
            <View className="flex-1">
              <Text className="text-foreground text-2xl font-bold">{chef.name}</Text>
              <View className="flex-row items-center gap-2 mt-1">
                <IconSymbol name="location.fill" size={14} color={colors.muted} />
                <Text className="text-muted text-sm">{chef.location}</Text>
              </View>
            </View>
            <BadgePill tier={chef.badgeTier ?? "none"} />
          </View>

          {/* Stats Row */}
          <View className="flex-row gap-4 my-3 bg-surface rounded-2xl p-3 border border-border">
            <View className="flex-1 items-center">
              <View className="flex-row items-center gap-1">
                <IconSymbol name="star.fill" size={16} color="#F59E0B" />
                <Text className="text-foreground font-bold text-base">{Number(chef.avgRating).toFixed(1)}</Text>
              </View>
              <Text className="text-muted text-xs mt-1">Rating</Text>
            </View>
            <View className="w-px bg-border" />
            <View className="flex-1 items-center">
              <Text className="text-foreground font-bold text-base">{chef.totalBookings}</Text>
              <Text className="text-muted text-xs mt-1">Bookings</Text>
            </View>
            <View className="w-px bg-border" />
            <View className="flex-1 items-center">
              <Text className="text-foreground font-bold text-base">{chef.experienceYears}yr</Text>
              <Text className="text-muted text-xs mt-1">Experience</Text>
            </View>
          </View>

          {/* Cuisines */}
          <View className="flex-row flex-wrap gap-2 mb-3">
            {cuisines.map((c: string) => (
              <View key={c} className="bg-primary/10 rounded-xl px-3 py-1">
                <Text className="text-primary text-xs font-semibold">{c}</Text>
              </View>
            ))}
          </View>

          {/* Bio */}
          <Text className="text-foreground text-sm leading-6 mb-3">{chef.bio}</Text>

          {/* Availability */}
          {availableDays.length > 0 && (
            <View className="mb-3">
              <Text className="text-foreground font-semibold mb-2">Available Days</Text>
              <View className="flex-row flex-wrap gap-2">
                {availableDays.map((day) => (
                  <View key={day} className="bg-success/10 rounded-xl px-3 py-1">
                    <Text className="text-success text-xs font-semibold">{day}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Tabs */}
        <View className="flex-row border-b border-border mx-5 mb-4">
          {(["packages", "reviews", "gallery"] as const).map((tab) => (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1, flex: 1 }]}
            >
              <View
                className="pb-3 items-center"
                style={{ borderBottomWidth: activeTab === tab ? 2 : 0, borderBottomColor: colors.primary }}
              >
                <Text
                  className="text-sm font-semibold capitalize"
                  style={{ color: activeTab === tab ? colors.primary : colors.muted }}
                >
                  {tab}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>

        {/* Tab Content */}
        <View className="px-5 pb-8">
          {/* Packages */}
          {activeTab === "packages" && (
            <View className="gap-4">
              {(chef.packages ?? []).length === 0 ? (
                <Text className="text-muted text-center py-8">No packages available</Text>
              ) : (
                (chef.packages ?? []).map((pkg) => (
                  <View key={pkg.id} className="bg-surface border border-border rounded-3xl p-4">
                    <View className="flex-row items-start justify-between mb-2">
                      <View className="flex-1">
                        <Text className="text-foreground font-bold text-base">{pkg.name}</Text>
                        <Text className="text-muted text-xs mt-1">
                          {pkg.minGuests}–{pkg.maxGuests} guests
                        </Text>
                      </View>
                      <View className="items-end">
                        <Text className="text-primary font-bold text-xl">£{Number(pkg.price).toFixed(0)}</Text>
                        <Text className="text-muted text-xs">per session</Text>
                      </View>
                    </View>
                    <Text className="text-muted text-sm leading-5 mb-3">{pkg.description}</Text>
                    {pkg.sampleMenu && (
                      <View className="bg-background rounded-xl p-3 mb-3 border border-border">
                        <Text className="text-foreground text-xs font-semibold mb-1">Sample Menu</Text>
                        <Text className="text-muted text-xs leading-4">{pkg.sampleMenu}</Text>
                      </View>
                    )}
                    <Pressable
                      onPress={() => handleBook(pkg)}
                      style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
                    >
                      <View className="bg-primary rounded-2xl py-3 items-center">
                        <Text className="text-white font-bold">Book This Package</Text>
                      </View>
                    </Pressable>
                  </View>
                ))
              )}
            </View>
          )}

          {/* Reviews */}
          {activeTab === "reviews" && (
            <View className="gap-4">
              {(chef.reviews ?? []).length === 0 ? (
                <Text className="text-muted text-center py-8">No reviews yet</Text>
              ) : (
                (chef.reviews ?? []).map((review) => (
                  <View key={review.id} className="bg-surface border border-border rounded-2xl p-4">
                    <View className="flex-row items-center gap-3 mb-2">
                      <View className="w-10 h-10 bg-primary/20 rounded-full items-center justify-center">
                        <Text className="text-primary font-bold">
                          {(review.clientName ?? "A")[0].toUpperCase()}
                        </Text>
                      </View>
                      <View className="flex-1">
                        <Text className="text-foreground font-semibold text-sm">{review.clientName ?? "Anonymous"}</Text>
                        <StarRating rating={Number(review.overallRating)} />
                      </View>
                      <Text className="text-muted text-xs">
                        {new Date(review.createdAt).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}
                      </Text>
                    </View>
                    {review.writtenReview && (
                      <Text className="text-foreground text-sm leading-5">{review.writtenReview}</Text>
                    )}
                    <View className="flex-row gap-3 mt-2">
                      {[
                        { label: "Food", val: review.foodRating },
                        { label: "Presentation", val: review.presentationRating },
                        { label: "Punctuality", val: review.punctualityRating },
                        { label: "Cleanliness", val: review.cleanlinessRating },
                      ].map((r) => (
                        <View key={r.label} className="items-center">
                          <Text className="text-foreground text-xs font-bold">{r.val}/5</Text>
                          <Text className="text-muted text-xs">{r.label}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                ))
              )}
            </View>
          )}

          {/* Gallery */}
          {activeTab === "gallery" && (
            <View>
              {(chef.gallery ?? []).length === 0 ? (
                <Text className="text-muted text-center py-8">No gallery photos yet</Text>
              ) : (
                <View className="flex-row flex-wrap gap-2">
                  {(chef.gallery ?? []).map((photo) => (
                    <Image
                      key={photo.id}
                      source={{ uri: photo.photoUrl }}
                      style={{ width: "31%", aspectRatio: 1, borderRadius: 12 }}
                      contentFit="cover"
                    />
                  ))}
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
