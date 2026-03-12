import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { trpc } from "@/lib/trpc";
import { useColors } from "@/hooks/use-colors";

const CUISINE_OPTIONS = [
  "Italian", "French", "Japanese", "Indian", "Mediterranean",
  "British", "American", "Mexican", "Thai", "Chinese",
  "Middle Eastern", "Spanish", "Greek", "Korean", "Caribbean",
  "African", "Fusion", "Vegan/Plant-Based", "Pastry & Desserts",
];

export default function ChefEditProfileScreen() {
  const colors = useColors();
  const { data: profile, isLoading } = trpc.chefs.getMyProfile.useQuery();
  const updateProfile = trpc.chefs.updateProfile.useMutation();

  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [postcode, setPostcode] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [hourlyRate, setHourlyRate] = useState("");

  useEffect(() => {
    if (profile) {
      setBio(profile.bio ?? "");
      setLocation(profile.location ?? "");
      setPostcode(profile.postcode ?? "");
      setExperienceYears(String(profile.experienceYears ?? ""));
      setSelectedCuisines(Array.isArray(profile.cuisines) ? profile.cuisines : []);
      // hourlyRate not in schema
    }
  }, [profile]);

  const toggleCuisine = (cuisine: string) => {
    setSelectedCuisines((prev) =>
      prev.includes(cuisine) ? prev.filter((c) => c !== cuisine) : [...prev, cuisine]
    );
  };

  const handleSave = async () => {
    if (selectedCuisines.length === 0) {
      Alert.alert("Required", "Please select at least one cuisine type.");
      return;
    }
    try {
      await updateProfile.mutateAsync({
        bio: bio.trim() || undefined,
        location: location.trim() || undefined,
        postcode: postcode.trim() || undefined,
        experienceYears: experienceYears ? parseInt(experienceYears) : undefined,
        cuisines: selectedCuisines,

      });
      Alert.alert("Saved!", "Your profile has been updated.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err: any) {
      Alert.alert("Error", err.message ?? "Failed to save profile.");
    }
  };

  if (isLoading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View className="px-5 pt-4 pb-2 flex-row items-center gap-3">
            <Pressable onPress={() => router.back()} style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}>
              <IconSymbol name="arrow.left" size={22} color={colors.foreground} />
            </Pressable>
            <Text className="text-foreground text-xl font-bold">Edit Profile</Text>
          </View>

          <View className="px-5 py-4 gap-5">
            {/* Bio */}
            <View>
              <Text className="text-foreground font-semibold text-sm mb-2">Bio</Text>
              <TextInput
                value={bio}
                onChangeText={setBio}
                placeholder="Tell clients about your culinary journey, specialties, and cooking style..."
                placeholderTextColor={colors.muted}
                className="bg-surface border border-border rounded-2xl px-4 py-3 text-foreground text-base"
                multiline
                numberOfLines={4}
                maxLength={500}
                textAlignVertical="top"
              />
              <Text className="text-muted text-xs mt-1 text-right">{bio.length}/500</Text>
            </View>

            {/* Location */}
            <View>
              <Text className="text-foreground font-semibold text-sm mb-2">Location / City</Text>
              <TextInput
                value={location}
                onChangeText={setLocation}
                placeholder="e.g. London, UK"
                placeholderTextColor={colors.muted}
                className="bg-surface border border-border rounded-2xl px-4 py-3 text-foreground text-base"
              />
            </View>

            {/* Postcode */}
            <View>
              <Text className="text-foreground font-semibold text-sm mb-2">Postcode</Text>
              <TextInput
                value={postcode}
                onChangeText={setPostcode}
                placeholder="e.g. SW1A 1AA"
                placeholderTextColor={colors.muted}
                className="bg-surface border border-border rounded-2xl px-4 py-3 text-foreground text-base"
                autoCapitalize="characters"
              />
            </View>

            {/* Experience */}
            <View>
              <Text className="text-foreground font-semibold text-sm mb-2">Years of Experience</Text>
              <TextInput
                value={experienceYears}
                onChangeText={setExperienceYears}
                placeholder="e.g. 8"
                placeholderTextColor={colors.muted}
                className="bg-surface border border-border rounded-2xl px-4 py-3 text-foreground text-base"
                keyboardType="number-pad"
              />
            </View>

            {/* Cuisines */}
            <View>
              <Text className="text-foreground font-semibold text-sm mb-3">Cuisine Specialties *</Text>
              <View className="flex-row flex-wrap gap-2">
                {CUISINE_OPTIONS.map((cuisine) => {
                  const isSelected = selectedCuisines.includes(cuisine);
                  return (
                    <Pressable
                      key={cuisine}
                      onPress={() => toggleCuisine(cuisine)}
                      style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                    >
                      <View
                        className="rounded-2xl px-3 py-2"
                        style={{
                          backgroundColor: isSelected ? colors.primary : colors.surface,
                          borderWidth: 1,
                          borderColor: isSelected ? colors.primary : colors.border,
                        }}
                      >
                        <Text
                          className="text-sm font-medium"
                          style={{ color: isSelected ? "#fff" : colors.foreground }}
                        >
                          {cuisine}
                        </Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <Pressable
              onPress={handleSave}
              disabled={updateProfile.isPending}
              style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
            >
              <View className="bg-primary rounded-2xl py-4 items-center">
                {updateProfile.isPending ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white font-bold text-base">Save Profile</Text>
                )}
              </View>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
