import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { trpc } from "@/lib/trpc";
import { useColors } from "@/hooks/use-colors";
import { useAuth } from "@/hooks/use-auth";

const CUISINE_OPTIONS = [
  "Italian", "French", "Japanese", "Indian", "Mediterranean",
  "British", "American", "Mexican", "Thai", "Chinese",
  "Middle Eastern", "Spanish", "Greek", "Korean", "Caribbean",
  "African", "Fusion", "Vegan/Plant-Based", "Pastry & Desserts",
];

export default function ChefEditProfileScreen() {
  const colors = useColors();
  const { user } = useAuth();
  const { data: profile, isLoading } = trpc.chefs.getMyProfile.useQuery();
  const updateProfile = trpc.chefs.updateProfile.useMutation();

  const [bio, setBio] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [address, setAddress] = useState("");
  const [postcode, setPostcode] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

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

  const handlePickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Required", "Please allow access to your photo library to upload a profile picture.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setAvatarUri(result.assets[0].uri);
    }
  };

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
            {/* Avatar */}
            <View className="items-center">
              <Pressable onPress={handlePickPhoto} style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}>
                <View className="relative">
                  {avatarUri ? (
                    <Image source={{ uri: avatarUri }} style={{ width: 96, height: 96, borderRadius: 48 }} contentFit="cover" />
                  ) : (
                    <View className="w-24 h-24 rounded-full items-center justify-center" style={{ backgroundColor: colors.primary + "20" }}>
                      <Text className="text-primary text-4xl font-bold">{(user?.name ?? "C")[0].toUpperCase()}</Text>
                    </View>
                  )}
                  <View className="absolute bottom-0 right-0 w-8 h-8 rounded-full items-center justify-center border-2 border-background" style={{ backgroundColor: colors.primary }}>
                    <IconSymbol name="camera.fill" size={14} color="#fff" />
                  </View>
                </View>
              </Pressable>
              <Text className="text-muted text-xs mt-2">Tap to change profile photo</Text>
            </View>

            {/* Display Name (read-only) */}
            <View>
              <Text className="text-foreground font-semibold text-sm mb-2">Display Name</Text>
              <View className="bg-surface border border-border rounded-2xl px-4 py-3 flex-row items-center gap-2">
                <Text className="text-muted text-base flex-1">{user?.name ?? "—"}</Text>
                <IconSymbol name="lock.fill" size={14} color={colors.muted} />
              </View>
              <Text className="text-muted text-xs mt-1">Name is linked to your Google account</Text>
            </View>

            {/* Phone */}
            <View>
              <Text className="text-foreground font-semibold text-sm mb-2">Phone Number</Text>
              <TextInput
                value={phone}
                onChangeText={setPhone}
                placeholder="+44 7700 900000"
                placeholderTextColor={colors.muted}
                className="bg-surface border border-border rounded-2xl px-4 py-3 text-foreground text-base"
                keyboardType="phone-pad"
                returnKeyType="next"
              />
            </View>

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

            {/* Address */}
            <View>
              <Text className="text-foreground font-semibold text-sm mb-2">Home Address</Text>
              <TextInput
                value={address}
                onChangeText={setAddress}
                placeholder="Street address"
                placeholderTextColor={colors.muted}
                className="bg-surface border border-border rounded-2xl px-4 py-3 text-foreground text-base"
                returnKeyType="next"
              />
            </View>

            {/* Location */}
            <View>
              <Text className="text-foreground font-semibold text-sm mb-2">City</Text>
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
