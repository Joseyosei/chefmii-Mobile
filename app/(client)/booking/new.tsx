import { router, useLocalSearchParams } from "expo-router";
import { useRef, useState } from "react";
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

// Time slots from 06:00 to 23:00 in 30-min increments
const TIMES: string[] = [];
for (let h = 6; h <= 23; h++) {
  TIMES.push(`${String(h).padStart(2, "0")}:00`);
  if (h < 23) TIMES.push(`${String(h).padStart(2, "0")}:30`);
}

const ALLERGY_OPTIONS = [
  "Nuts", "Peanuts", "Gluten", "Dairy", "Eggs", "Shellfish",
  "Fish", "Soy", "Sesame", "Mustard", "Celery", "Lupin",
];

function getDatesForNext60Days() {
  const dates: { dayShort: string; dayNum: string; monthShort: string; value: string }[] = [];
  const today = new Date();
  for (let i = 1; i <= 60; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const value = d.toISOString().split("T")[0];
    const dayShort = d.toLocaleDateString("en-GB", { weekday: "short" });
    const dayNum = String(d.getDate());
    const monthShort = d.toLocaleDateString("en-GB", { month: "short" });
    dates.push({ dayShort, dayNum, monthShort, value });
  }
  return dates;
}

export default function NewBookingScreen() {
  const params = useLocalSearchParams<{
    chefId: string;
    packageId: string;
    packageName: string;
    packagePrice: string;
    labourCost: string;
    ingredientsCost: string;
    chefName: string;
  }>();
  const colors = useColors();
  const dateScrollRef = useRef<ScrollView>(null);

  const [dateWindowStart, setDateWindowStart] = useState(0);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [guests, setGuests] = useState("4");
  const [address, setAddress] = useState("");
  const [dietaryNotes, setDietaryNotes] = useState("");
  const [allergyNotes, setAllergyNotes] = useState("");
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);
  const [step, setStep] = useState<"details" | "confirm">("details");

  const dates = getDatesForNext60Days();
  const WINDOW = 7; // show 7 dates at a time
  const visibleDates = dates.slice(dateWindowStart, dateWindowStart + WINDOW);

  const createBooking = trpc.bookings.create.useMutation();

  const packagePrice = Number(params.packagePrice ?? 0);
  const labourCost = Number(params.labourCost ?? 0);
  const ingredientsCost = Number(params.ingredientsCost ?? 0);
  const platformFee = Math.round(packagePrice * 0.15 * 100) / 100;
  const total = packagePrice + platformFee;

  const toggleAllergy = (a: string) => {
    setSelectedAllergies((prev) =>
      prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]
    );
  };

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
      const allergyStr = [
        ...selectedAllergies,
        allergyNotes.trim() ? `Other: ${allergyNotes.trim()}` : "",
      ].filter(Boolean).join(", ");

      const result = await createBooking.mutateAsync({
        chefId: Number(params.chefId),
        packageId: Number(params.packageId),
        date: selectedDate,
        time: selectedTime,
        guests: parseInt(guests),
        address,
        dietaryNotes: [dietaryNotes, allergyStr].filter(Boolean).join(" | ") || undefined,
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
              {/* Date Selection with arrows */}
              <View>
                <Text className="text-foreground font-semibold text-base mb-3">Select Date</Text>
                <View className="flex-row items-center gap-2">
                  {/* Left arrow */}
                  <Pressable
                    onPress={() => setDateWindowStart(Math.max(0, dateWindowStart - WINDOW))}
                    disabled={dateWindowStart === 0}
                    style={({ pressed }) => [{ opacity: dateWindowStart === 0 ? 0.3 : pressed ? 0.6 : 1 }]}
                  >
                    <View className="w-9 h-9 bg-surface border border-border rounded-full items-center justify-center">
                      <IconSymbol name="chevron.left" size={18} color={colors.foreground} />
                    </View>
                  </Pressable>

                  {/* Date tiles */}
                  <View className="flex-1 flex-row gap-1.5">
                    {visibleDates.map((d) => (
                      <Pressable
                        key={d.value}
                        onPress={() => setSelectedDate(d.value)}
                        style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1, flex: 1 }]}
                      >
                        <View
                          className="rounded-2xl py-2.5 items-center"
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
                            {d.dayShort}
                          </Text>
                          <Text
                            className="text-sm font-bold"
                            style={{ color: selectedDate === d.value ? "#fff" : colors.foreground }}
                          >
                            {d.dayNum}
                          </Text>
                          <Text
                            className="text-xs"
                            style={{ color: selectedDate === d.value ? "#fff" : colors.muted }}
                          >
                            {d.monthShort}
                          </Text>
                        </View>
                      </Pressable>
                    ))}
                  </View>

                  {/* Right arrow */}
                  <Pressable
                    onPress={() => setDateWindowStart(Math.min(dates.length - WINDOW, dateWindowStart + WINDOW))}
                    disabled={dateWindowStart + WINDOW >= dates.length}
                    style={({ pressed }) => [{ opacity: dateWindowStart + WINDOW >= dates.length ? 0.3 : pressed ? 0.6 : 1 }]}
                  >
                    <View className="w-9 h-9 bg-surface border border-border rounded-full items-center justify-center">
                      <IconSymbol name="chevron.right" size={18} color={colors.foreground} />
                    </View>
                  </Pressable>
                </View>
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
                        className="rounded-xl px-3 py-2"
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
                  textAlignVertical="top"
                />
              </View>

              {/* Dietary Requirements */}
              <View>
                <Text className="text-foreground font-semibold text-base mb-2">
                  Dietary Requirements <Text className="text-muted font-normal">(optional)</Text>
                </Text>
                <TextInput
                  value={dietaryNotes}
                  onChangeText={setDietaryNotes}
                  placeholder="Vegetarian, vegan, halal, kosher, gluten-free..."
                  placeholderTextColor={colors.muted}
                  className="bg-surface border border-border rounded-2xl px-4 py-3 text-foreground text-base"
                  multiline
                  numberOfLines={2}
                  textAlignVertical="top"
                />
              </View>

              {/* Allergies */}
              <View>
                <Text className="text-foreground font-semibold text-base mb-2">
                  Allergies <Text className="text-muted font-normal">(optional)</Text>
                </Text>
                <Text className="text-muted text-xs mb-3">Select all that apply</Text>
                <View className="flex-row flex-wrap gap-2 mb-3">
                  {ALLERGY_OPTIONS.map((a) => {
                    const selected = selectedAllergies.includes(a);
                    return (
                      <Pressable
                        key={a}
                        onPress={() => toggleAllergy(a)}
                        style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                      >
                        <View
                          className="rounded-2xl px-3 py-2 flex-row items-center gap-1"
                          style={{
                            backgroundColor: selected ? "#EF444420" : colors.surface,
                            borderWidth: 1,
                            borderColor: selected ? "#EF4444" : colors.border,
                          }}
                        >
                          {selected && <IconSymbol name="xmark.circle.fill" size={12} color="#EF4444" />}
                          <Text
                            className="text-sm font-medium"
                            style={{ color: selected ? "#EF4444" : colors.foreground }}
                          >
                            {a}
                          </Text>
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
                <TextInput
                  value={allergyNotes}
                  onChangeText={setAllergyNotes}
                  placeholder="Any other allergies or intolerances..."
                  placeholderTextColor={colors.muted}
                  className="bg-surface border border-border rounded-2xl px-4 py-3 text-foreground text-base"
                  multiline
                  numberOfLines={2}
                  textAlignVertical="top"
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
                <SummaryRow label="Date" value={new Date(selectedDate + "T12:00:00").toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })} />
                <SummaryRow label="Time" value={selectedTime} />
                <SummaryRow label="Guests" value={`${guests} guests`} />
                <SummaryRow label="Address" value={address} />
                {dietaryNotes ? <SummaryRow label="Dietary Notes" value={dietaryNotes} /> : null}
                {selectedAllergies.length > 0 ? <SummaryRow label="Allergies" value={selectedAllergies.join(", ")} /> : null}
                {allergyNotes ? <SummaryRow label="Other Allergies" value={allergyNotes} /> : null}

                <View className="h-px bg-border" />

                {/* Price breakdown */}
                <SummaryRow label="Package Price" value={`£${packagePrice.toFixed(2)}`} />
                {labourCost > 0 && (
                  <SummaryRow label="  · Chef's Labour" value={`£${labourCost.toFixed(2)}`} muted />
                )}
                {ingredientsCost > 0 && (
                  <SummaryRow label="  · Ingredients" value={`£${ingredientsCost.toFixed(2)}`} muted />
                )}
                <SummaryRow label="Platform Fee (15%)" value={`£${platformFee.toFixed(2)}`} />

                <View className="h-px bg-border" />
                <View className="flex-row justify-between">
                  <Text className="text-foreground font-bold text-base">Total</Text>
                  <Text className="font-bold text-xl" style={{ color: colors.primary }}>£{total.toFixed(2)}</Text>
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

function SummaryRow({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <View className="flex-row justify-between gap-4">
      <Text className="text-muted text-sm">{label}</Text>
      <Text
        className="text-sm font-medium flex-1 text-right"
        style={{ color: muted ? "#687076" : undefined }}
        numberOfLines={2}
      >
        {value}
      </Text>
    </View>
  );
}
