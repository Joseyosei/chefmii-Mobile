import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { trpc } from "@/lib/trpc";
import { useColors } from "@/hooks/use-colors";

const DAYS = [
  { day: 0, label: "Sunday", short: "Sun" },
  { day: 1, label: "Monday", short: "Mon" },
  { day: 2, label: "Tuesday", short: "Tue" },
  { day: 3, label: "Wednesday", short: "Wed" },
  { day: 4, label: "Thursday", short: "Thu" },
  { day: 5, label: "Friday", short: "Fri" },
  { day: 6, label: "Saturday", short: "Sat" },
];

const TIME_SLOTS = [
  "09:00", "10:00", "11:00", "12:00", "13:00", "14:00",
  "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00",
];

type DayAvailability = {
  dayOfWeek: number;
  isAvailable: boolean;
  startTime: string;
  endTime: string;
};

export default function ChefAvailabilityScreen() {
  const colors = useColors();
  const { data: existing, isLoading, refetch } = trpc.availability.getMine.useQuery();
  const updateAvailability = trpc.availability.update.useMutation({ onSuccess: () => { refetch(); Alert.alert("Saved", "Your availability has been updated."); } });

  const [availability, setAvailability] = useState<DayAvailability[]>(
    DAYS.map((d) => ({ dayOfWeek: d.day, isAvailable: false, startTime: "10:00", endTime: "22:00" }))
  );

  useEffect(() => {
    if (existing && existing.length > 0) {
      setAvailability(
        DAYS.map((d) => {
          const found = existing.find((e) => e.dayOfWeek === d.day);
          return found
            ? { dayOfWeek: d.day, isAvailable: found.isAvailable ?? false, startTime: found.startTime ?? "10:00", endTime: found.endTime ?? "22:00" }
            : { dayOfWeek: d.day, isAvailable: false, startTime: "10:00", endTime: "22:00" };
        })
      );
    }
  }, [existing]);

  const toggleDay = (dayOfWeek: number) => {
    setAvailability((prev) =>
      prev.map((a) => a.dayOfWeek === dayOfWeek ? { ...a, isAvailable: !a.isAvailable } : a)
    );
  };

  const setTime = (dayOfWeek: number, field: "startTime" | "endTime", value: string) => {
    setAvailability((prev) =>
      prev.map((a) => a.dayOfWeek === dayOfWeek ? { ...a, [field]: value } : a)
    );
  };

  const handleSave = async () => {
    await updateAvailability.mutateAsync(availability);
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
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="px-5 pt-4 pb-2 flex-row items-center gap-3">
          <Pressable onPress={() => router.back()} style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}>
            <IconSymbol name="arrow.left" size={22} color={colors.foreground} />
          </Pressable>
          <View className="flex-1">
            <Text className="text-foreground text-xl font-bold">Availability</Text>
            <Text className="text-muted text-xs">Set when you're available to cook</Text>
          </View>
        </View>

        <View className="px-5 py-4 gap-4">
          {DAYS.map((dayInfo) => {
            const dayAvail = availability.find((a) => a.dayOfWeek === dayInfo.day)!;
            return (
              <View key={dayInfo.day} className="bg-surface border border-border rounded-2xl p-4">
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="text-foreground font-bold text-base">{dayInfo.label}</Text>
                  <Pressable
                    onPress={() => toggleDay(dayInfo.day)}
                    style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                  >
                    <View
                      className="w-12 h-6 rounded-full items-center justify-center"
                      style={{
                        backgroundColor: dayAvail.isAvailable ? colors.primary : colors.border,
                        paddingHorizontal: 2,
                        flexDirection: "row",
                        justifyContent: dayAvail.isAvailable ? "flex-end" : "flex-start",
                      }}
                    >
                      <View className="w-5 h-5 bg-white rounded-full" />
                    </View>
                  </Pressable>
                </View>

                {dayAvail.isAvailable && (
                  <View>
                    <Text className="text-muted text-xs mb-2">Available from</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      <View className="flex-row gap-2 mb-3">
                        {TIME_SLOTS.slice(0, 8).map((t) => (
                          <Pressable
                            key={t}
                            onPress={() => setTime(dayInfo.day, "startTime", t)}
                            style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                          >
                            <View
                              className="rounded-xl px-3 py-1"
                              style={{
                                backgroundColor: dayAvail.startTime === t ? colors.primary : colors.background,
                                borderWidth: 1,
                                borderColor: dayAvail.startTime === t ? colors.primary : colors.border,
                              }}
                            >
                              <Text style={{ color: dayAvail.startTime === t ? "#fff" : colors.foreground, fontSize: 12, fontWeight: "600" }}>
                                {t}
                              </Text>
                            </View>
                          </Pressable>
                        ))}
                      </View>
                    </ScrollView>
                    <Text className="text-muted text-xs mb-2">Until</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      <View className="flex-row gap-2">
                        {TIME_SLOTS.slice(4).map((t) => (
                          <Pressable
                            key={t}
                            onPress={() => setTime(dayInfo.day, "endTime", t)}
                            style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                          >
                            <View
                              className="rounded-xl px-3 py-1"
                              style={{
                                backgroundColor: dayAvail.endTime === t ? colors.primary : colors.background,
                                borderWidth: 1,
                                borderColor: dayAvail.endTime === t ? colors.primary : colors.border,
                              }}
                            >
                              <Text style={{ color: dayAvail.endTime === t ? "#fff" : colors.foreground, fontSize: 12, fontWeight: "600" }}>
                                {t}
                              </Text>
                            </View>
                          </Pressable>
                        ))}
                      </View>
                    </ScrollView>
                  </View>
                )}
              </View>
            );
          })}

          <Pressable
            onPress={handleSave}
            disabled={updateAvailability.isPending}
            style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
          >
            <View className="bg-primary rounded-2xl py-4 items-center">
              {updateAvailability.isPending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white font-bold text-base">Save Availability</Text>
              )}
            </View>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
