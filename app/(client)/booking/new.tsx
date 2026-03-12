import { router, useLocalSearchParams } from "expo-router";
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
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { trpc } from "@/lib/trpc";
import { useColors } from "@/hooks/use-colors";

const TIMES = [
  "11:00", "12:00", "13:00", "14:00", "15:00",
  "16:00", "17:00", "18:00", "19:00", "20:00", "21:00",
];

function getDatesForNext30Days() {
  const dates: { label: string; value: string }[] = [];
  const today = new Date();
  for (let i = 1; i <= 30; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const value = d.toISOString().split("T")[0];
    const label = d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
    dates.push({ label, value });
  }
  return dates;
}

export default function NewBookingScreen() {
  const params = useLocalSearchParams<{
    chefId: string;
    packageId: string;
    packageName: string;
    packagePrice: string;
    chefName: string;
  }>();
  const colors = useColors();

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [guests, setGuests] = useState("4");
  const [address, setAddress] = useState("");
  const [dietaryNotes, setDietaryNotes] = useState("");
  const [step, setStep] = useState<"details" | "confirm">("details");

  const dates = getDatesForNext30Days();
  const createBooking = trpc.bookings.create.useMutation();

  const platformFee = Math.round(Number(params.packagePrice) * 0.15 * 100) / 100;
  const total = Number(params.packagePrice);

  const handleNext = () => {
    if (!selectedDate) { Alert.alert("Select Date", "Please select a date for your booking."); return; }
    if (!selectedTime) { Alert.alert("Select Time", "Please select a time for your booking."); return; }
    if (!address.trim()) { Alert.alert("Enter Address", "Please enter the event address."); return; }
    const guestNum = parseInt(guests);
    if (isNaN(guestNum) || guestNum < 1) { Alert.alert("Guests", "Please enter a valid number of guests."); return; }
    setStep("confirm");
  };

  const handleConfirm = async () => {
    try {
      const result = await createBooking.mutateAsync({
        chefId: Number(params.chefId),
        packageId: Number(params.packageId),
        date: selectedDate,
        time: selectedTime,
        guests: parseInt(guests),
        address,
        dietaryNotes: dietaryNotes || undefined,
      });

      Alert.alert(
        "Booking Requested! 🎉",
        `Your booking reference is ${result.bookingRef}. The chef will confirm within 24 hours.`,
        [{ text: "View Bookings", onPress: () => router.replace("/(client)/bookings" as never) }]
      );
    } catch (err: any) {
      Alert.alert("Booking Failed", err.message ?? "Please try again.");
    }
  };

  return (
    <ScreenContainer>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {/* Header */}
          <View className="px-5 pt-4 pb-2 flex-row items-center gap-3">
            <Pressable onPress={() => step === "confirm" ? setStep("details") : router.back()} style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}>
              <IconSymbol name="arrow.left" size={22} color={colors.foreground} />
            </Pressable>
            <View className="flex-1">
              <Text className="text-foreground text-xl font-bold">Book a Chef</Text>
              <Text className="text-muted text-sm">{params.chefName} · {params.packageName}</Text>
            </View>
          </View>

          {/* Progress */}
          <View className="px-5 mb-4 flex-row gap-2">
            <View className="flex-1 h-1 rounded-full" style={{ backgroundColor: colors.primary }} />
            <View className="flex-1 h-1 rounded-full" style={{ backgroundColor: step === "confirm" ? colors.primary : colors.border }} />
          </View>

          {step === "details" ? (
            <View className="px-5 gap-5 pb-8">
              {/* Date Selection */}
              <View>
                <Text className="text-foreground font-semibold text-base mb-3">Select Date</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View className="flex-row gap-2">
                    {dates.map((d) => (
                      <Pressable
                        key={d.value}
                        onPress={() => setSelectedDate(d.value)}
                        style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                      >
                        <View
                          className="rounded-2xl px-4 py-3 items-center min-w-16"
                          style={{
                            backgroundColor: selectedDate === d.value ? colors.primary : colors.surface,
                            borderWidth: 1,
                            borderColor: selectedDate === d.value ? colors.primary : colors.border,
                          }}
                        >
                          <Text
                            className="text-xs font-semibold"
                            style={{ color: selectedDate === d.value ? "#fff" : colors.muted }}
                          >
                            {d.label.split(" ")[0]}
                          </Text>
                          <Text
                            className="text-base font-bold"
                            style={{ color: selectedDate === d.value ? "#fff" : colors.foreground }}
                          >
                            {d.label.split(" ")[1]}
                          </Text>
                          <Text
                            className="text-xs"
                            style={{ color: selectedDate === d.value ? "#fff" : colors.muted }}
                          >
                            {d.label.split(" ")[2]}
                          </Text>
                        </View>
                      </Pressable>
                    ))}
                  </View>
                </ScrollView>
              </View>

              {/* Time Selection */}
              <View>
                <Text className="text-foreground font-semibold text-base mb-3">Select Time</Text>
                <View className="flex-row flex-wrap gap-2">
                  {TIMES.map((t) => (
                    <Pressable
                      key={t}
                      onPress={() => setSelectedTime(t)}
                      style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                    >
                      <View
                        className="rounded-xl px-4 py-2"
                        style={{
                          backgroundColor: selectedTime === t ? colors.primary : colors.surface,
                          borderWidth: 1,
                          borderColor: selectedTime === t ? colors.primary : colors.border,
                        }}
                      >
                        <Text
                          className="text-sm font-semibold"
                          style={{ color: selectedTime === t ? "#fff" : colors.foreground }}
                        >
                          {t}
                        </Text>
                      </View>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Guests */}
              <View>
                <Text className="text-foreground font-semibold text-base mb-2">Number of Guests</Text>
                <View className="flex-row items-center gap-4">
                  <Pressable
                    onPress={() => setGuests(String(Math.max(1, parseInt(guests) - 1)))}
                    style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                  >
                    <View className="w-10 h-10 bg-surface border border-border rounded-full items-center justify-center">
                      <Text className="text-foreground text-xl font-bold">−</Text>
                    </View>
                  </Pressable>
                  <Text className="text-foreground text-2xl font-bold w-8 text-center">{guests}</Text>
                  <Pressable
                    onPress={() => setGuests(String(parseInt(guests) + 1))}
                    style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                  >
                    <View className="w-10 h-10 bg-primary rounded-full items-center justify-center">
                      <Text className="text-white text-xl font-bold">+</Text>
                    </View>
                  </Pressable>
                  <Text className="text-muted text-sm">guests</Text>
                </View>
              </View>

              {/* Address */}
              <View>
                <Text className="text-foreground font-semibold text-base mb-2">Event Address</Text>
                <TextInput
                  value={address}
                  onChangeText={setAddress}
                  placeholder="Full address where the chef will cook"
                  placeholderTextColor={colors.muted}
                  className="bg-surface border border-border rounded-2xl px-4 py-3 text-foreground text-base"
                  multiline
                  numberOfLines={2}
                />
              </View>

              {/* Dietary Notes */}
              <View>
                <Text className="text-foreground font-semibold text-base mb-2">
                  Dietary Requirements <Text className="text-muted font-normal">(optional)</Text>
                </Text>
                <TextInput
                  value={dietaryNotes}
                  onChangeText={setDietaryNotes}
                  placeholder="Allergies, dietary restrictions, preferences..."
                  placeholderTextColor={colors.muted}
                  className="bg-surface border border-border rounded-2xl px-4 py-3 text-foreground text-base"
                  multiline
                  numberOfLines={3}
                />
              </View>

              <Pressable onPress={handleNext} style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}>
                <View className="bg-primary rounded-2xl py-4 items-center">
                  <Text className="text-white font-bold text-base">Review Booking</Text>
                </View>
              </Pressable>
            </View>
          ) : (
            <View className="px-5 gap-4 pb-8">
              <Text className="text-foreground text-lg font-bold">Booking Summary</Text>

              {/* Summary Card */}
              <View className="bg-surface border border-border rounded-3xl p-4 gap-3">
                <SummaryRow label="Chef" value={params.chefName} />
                <SummaryRow label="Package" value={params.packageName} />
                <SummaryRow label="Date" value={new Date(selectedDate).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })} />
                <SummaryRow label="Time" value={selectedTime} />
                <SummaryRow label="Guests" value={`${guests} guests`} />
                <SummaryRow label="Address" value={address} />
                {dietaryNotes && <SummaryRow label="Dietary Notes" value={dietaryNotes} />}
                <View className="h-px bg-border" />
                <SummaryRow label="Package Price" value={`£${Number(params.packagePrice).toFixed(2)}`} />
                <SummaryRow label="Platform Fee (15%)" value={`£${platformFee.toFixed(2)}`} />
                <View className="h-px bg-border" />
                <View className="flex-row justify-between">
                  <Text className="text-foreground font-bold text-base">Total</Text>
                  <Text className="text-primary font-bold text-xl">£{total.toFixed(2)}</Text>
                </View>
              </View>

              {/* Payment notice */}
              <View className="bg-warning/10 border border-warning/30 rounded-2xl p-3 flex-row gap-2">
                <IconSymbol name="info.circle.fill" size={18} color="#F59E0B" />
                <Text className="text-foreground text-xs flex-1 leading-4">
                  Payment will be processed securely after the chef confirms your booking. No charge until confirmation.
                </Text>
              </View>

              <Pressable
                onPress={handleConfirm}
                disabled={createBooking.isPending}
                style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
              >
                <View className="bg-primary rounded-2xl py-4 items-center">
                  {createBooking.isPending ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text className="text-white font-bold text-base">Confirm Booking Request</Text>
                  )}
                </View>
              </Pressable>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between gap-4">
      <Text className="text-muted text-sm">{label}</Text>
      <Text className="text-foreground text-sm font-medium flex-1 text-right" numberOfLines={2}>{value}</Text>
    </View>
  );
}
