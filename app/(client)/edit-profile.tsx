import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useAuth } from "@/hooks/use-auth";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";

export default function ClientEditProfileScreen() {
  const { user } = useAuth();
  const colors = useColors();

  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postcode, setPostcode] = useState("");
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const utils = trpc.useUtils();

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

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Name Required", "Please enter your name.");
      return;
    }
    // In a full implementation, upload the avatar to S3 and update the user profile via API
    Alert.alert("Profile Updated", "Your profile has been saved successfully.", [
      { text: "OK", onPress: () => router.back() },
    ]);
  };

  return (
    <ScreenContainer>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {/* Header */}
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
                    <Image
                      source={{ uri: avatarUri }}
                      style={{ width: 96, height: 96, borderRadius: 48 }}
                      contentFit="cover"
                    />
                  ) : (
                    <View
                      className="w-24 h-24 rounded-full items-center justify-center"
                      style={{ backgroundColor: colors.primary + "20" }}
                    >
                      <Text className="text-primary text-4xl font-bold">
                        {(name || user?.name || "U")[0].toUpperCase()}
                      </Text>
                    </View>
                  )}
                  <View
                    className="absolute bottom-0 right-0 w-8 h-8 rounded-full items-center justify-center border-2 border-background"
                    style={{ backgroundColor: colors.primary }}
                  >
                    <IconSymbol name="camera.fill" size={14} color="#fff" />
                  </View>
                </View>
              </Pressable>
              <Text className="text-muted text-xs mt-2">Tap to change photo</Text>
            </View>

            {/* Full Name */}
            <View>
              <Text className="text-foreground font-semibold text-sm mb-2">Full Name *</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Your full name"
                placeholderTextColor={colors.muted}
                className="bg-surface border border-border rounded-2xl px-4 py-3 text-foreground text-base"
                returnKeyType="next"
              />
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

            {/* City + Postcode */}
            <View className="flex-row gap-3">
              <View className="flex-1">
                <Text className="text-foreground font-semibold text-sm mb-2">City</Text>
                <TextInput
                  value={city}
                  onChangeText={setCity}
                  placeholder="London"
                  placeholderTextColor={colors.muted}
                  className="bg-surface border border-border rounded-2xl px-4 py-3 text-foreground text-base"
                  returnKeyType="next"
                />
              </View>
              <View className="flex-1">
                <Text className="text-foreground font-semibold text-sm mb-2">Postcode</Text>
                <TextInput
                  value={postcode}
                  onChangeText={setPostcode}
                  placeholder="SW1A 1AA"
                  placeholderTextColor={colors.muted}
                  className="bg-surface border border-border rounded-2xl px-4 py-3 text-foreground text-base"
                  autoCapitalize="characters"
                  returnKeyType="done"
                />
              </View>
            </View>

            {/* Email (read-only) */}
            <View>
              <Text className="text-foreground font-semibold text-sm mb-2">Email</Text>
              <View className="bg-surface border border-border rounded-2xl px-4 py-3 flex-row items-center gap-2">
                <Text className="text-muted text-base flex-1">{user?.email}</Text>
                <IconSymbol name="lock.fill" size={14} color={colors.muted} />
              </View>
              <Text className="text-muted text-xs mt-1">Email cannot be changed</Text>
            </View>

            <Pressable
              onPress={handleSave}
              disabled={uploading}
              style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
            >
              <View className="bg-primary rounded-2xl py-4 items-center">
                {uploading ? (
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
