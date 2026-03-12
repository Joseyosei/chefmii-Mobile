import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { trpc } from "@/lib/trpc";
import { useColors } from "@/hooks/use-colors";

function StarPicker({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <View className="flex-row items-center justify-between py-3 border-b border-border">
      <Text className="text-foreground text-sm font-medium">{label}</Text>
      <View className="flex-row gap-1">
        {[1, 2, 3, 4, 5].map((s) => (
          <Pressable key={s} onPress={() => onChange(s)} style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}>
            <IconSymbol name={s <= value ? "star.fill" : "star"} size={28} color={s <= value ? "#F59E0B" : "#D1D5DB"} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

export default function ReviewScreen() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const colors = useColors();

  const [overall, setOverall] = useState(5);
  const [food, setFood] = useState(5);
  const [presentation, setPresentation] = useState(5);
  const [punctuality, setPunctuality] = useState(5);
  const [cleanliness, setCleanliness] = useState(5);
  const [writtenReview, setWrittenReview] = useState("");

  const submitReview = trpc.reviews.create.useMutation();

  const handleSubmit = async () => {
    if (overall === 0) {
      Alert.alert("Rating Required", "Please provide an overall rating.");
      return;
    }
    try {
      await submitReview.mutateAsync({
        bookingId: Number(bookingId),
        foodRating: food,
        presentationRating: presentation,
        punctualityRating: punctuality,
        cleanlinessRating: cleanliness,
        writtenReview: writtenReview || undefined,
      });
      Alert.alert(
        "Review Submitted! ⭐",
        "Thank you for your feedback. It helps other clients find great chefs.",
        [{ text: "Done", onPress: () => router.replace("/(client)/bookings" as never) }]
      );
    } catch (err: any) {
      Alert.alert("Error", err.message ?? "Failed to submit review. Please try again.");
    }
  };

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View className="px-5 pt-4 pb-2 flex-row items-center gap-3">
          <Pressable onPress={() => router.back()} style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}>
            <IconSymbol name="arrow.left" size={22} color={colors.foreground} />
          </Pressable>
          <Text className="text-foreground text-xl font-bold">Leave a Review</Text>
        </View>

        <View className="px-5 py-4 gap-5">
          {/* Overall Rating Hero */}
          <View className="items-center py-6 bg-surface border border-border rounded-3xl">
            <Text className="text-foreground font-bold text-lg mb-4">Overall Experience</Text>
            <View className="flex-row gap-3 mb-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <Pressable key={s} onPress={() => setOverall(s)} style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}>
                  <IconSymbol name={s <= overall ? "star.fill" : "star"} size={42} color={s <= overall ? "#F59E0B" : "#D1D5DB"} />
                </Pressable>
              ))}
            </View>
            <Text className="text-muted text-sm">
              {overall === 5 ? "Exceptional! 🌟" : overall === 4 ? "Great! 😊" : overall === 3 ? "Good 👍" : overall === 2 ? "Fair 😐" : "Poor 😞"}
            </Text>
          </View>

          {/* Detailed Ratings */}
          <View className="bg-surface border border-border rounded-2xl px-4">
            <StarPicker label="Food Quality" value={food} onChange={setFood} />
            <StarPicker label="Presentation" value={presentation} onChange={setPresentation} />
            <StarPicker label="Punctuality" value={punctuality} onChange={setPunctuality} />
            <StarPicker label="Cleanliness" value={cleanliness} onChange={setCleanliness} />
          </View>

          {/* Written Review */}
          <View>
            <Text className="text-foreground font-semibold text-base mb-2">
              Write a Review <Text className="text-muted font-normal">(optional)</Text>
            </Text>
            <TextInput
              value={writtenReview}
              onChangeText={setWrittenReview}
              placeholder="Share your experience with this chef..."
              placeholderTextColor={colors.muted}
              className="bg-surface border border-border rounded-2xl px-4 py-3 text-foreground text-base"
              multiline
              numberOfLines={5}
              maxLength={1000}
              textAlignVertical="top"
            />
            <Text className="text-muted text-xs mt-1 text-right">{writtenReview.length}/1000</Text>
          </View>

          <Pressable
            onPress={handleSubmit}
            disabled={submitReview.isPending}
            style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
          >
            <View className="bg-primary rounded-2xl py-4 items-center">
              {submitReview.isPending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white font-bold text-base">Submit Review</Text>
              )}
            </View>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
