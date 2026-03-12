import { router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, FlatList, Pressable, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { trpc } from "@/lib/trpc";
import { useColors } from "@/hooks/use-colors";
import { useAuth } from "@/hooks/use-auth";

const STATUS_TABS = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
] as const;

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  pending: { bg: "#FEF3C7", text: "#92400E", label: "⏳ Pending" },
  confirmed: { bg: "#D1FAE5", text: "#065F46", label: "✓ Confirmed" },
  declined: { bg: "#FEE2E2", text: "#991B1B", label: "✗ Declined" },
  completed: { bg: "#DBEAFE", text: "#1E40AF", label: "★ Completed" },
  cancelled: { bg: "#F3F4F6", text: "#6B7280", label: "× Cancelled" },
};

export default function ClientBookingsScreen() {
  const { isAuthenticated } = useAuth();
  const colors = useColors();
  const [activeStatus, setActiveStatus] = useState<"all" | "pending" | "confirmed" | "completed" | "cancelled">("all");

  const { data: bookings, isLoading } = trpc.bookings.listMine.useQuery(
    { status: activeStatus, role: "client" },
    { enabled: isAuthenticated }
  );

  if (!isAuthenticated) {
    return (
      <ScreenContainer className="items-center justify-center px-6">
        <Text className="text-4xl mb-4">📅</Text>
        <Text className="text-foreground text-xl font-bold mb-2">Your Bookings</Text>
        <Text className="text-muted text-center mb-6">Sign in to view your bookings</Text>
        <Pressable onPress={() => router.push("/auth/login" as never)} style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}>
          <View className="bg-primary rounded-2xl px-8 py-3">
            <Text className="text-white font-bold">Sign In</Text>
          </View>
        </Pressable>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <View className="px-5 pt-4 pb-3">
        <Text className="text-foreground text-2xl font-bold">My Bookings</Text>
      </View>

      {/* Status Filter Tabs */}
      <View className="mb-3">
        <FlatList
          horizontal
          data={STATUS_TABS}
          keyExtractor={(item) => item.value}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => setActiveStatus(item.value)}
              style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
            >
              <View
                className="rounded-2xl px-4 py-2"
                style={{
                  backgroundColor: activeStatus === item.value ? colors.primary : colors.surface,
                  borderWidth: 1,
                  borderColor: activeStatus === item.value ? colors.primary : colors.border,
                }}
              >
                <Text
                  className="text-sm font-semibold"
                  style={{ color: activeStatus === item.value ? "#fff" : colors.foreground }}
                >
                  {item.label}
                </Text>
              </View>
            </Pressable>
          )}
        />
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={bookings ?? []}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20, gap: 12 }}
          ListEmptyComponent={
            <View className="items-center py-16">
              <Text className="text-4xl mb-3">📅</Text>
              <Text className="text-foreground font-semibold text-lg">No bookings yet</Text>
              <Text className="text-muted text-center mt-1 mb-6">Find a chef and book your first experience</Text>
              <Pressable onPress={() => router.push("/(client)/search" as never)} style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}>
                <View className="bg-primary rounded-2xl px-8 py-3">
                  <Text className="text-white font-bold">Find a Chef</Text>
                </View>
              </Pressable>
            </View>
          }
          renderItem={({ item: booking }) => {
            const statusStyle = STATUS_STYLES[booking.status] ?? STATUS_STYLES.pending;
            return (
              <Pressable
                onPress={() => router.push({ pathname: "/(client)/booking/[id]" as never, params: { id: booking.id } })}
                style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
              >
                <View className="bg-surface border border-border rounded-3xl p-4">
                  <View className="flex-row items-start justify-between mb-2">
                    <View className="flex-1">
                      <Text className="text-foreground font-bold text-base">{booking.packageName}</Text>
                      <Text className="text-muted text-xs mt-1">Ref: {booking.bookingRef}</Text>
                    </View>
                    <View style={{ backgroundColor: statusStyle.bg, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 }}>
                      <Text style={{ color: statusStyle.text, fontSize: 11, fontWeight: "700" }}>{statusStyle.label}</Text>
                    </View>
                  </View>

                  <View className="flex-row gap-4 mt-2">
                    <View className="flex-row items-center gap-1">
                      <IconSymbol name="calendar" size={13} color={colors.muted} />
                      <Text className="text-muted text-xs">{booking.date}</Text>
                    </View>
                    <View className="flex-row items-center gap-1">
                      <IconSymbol name="clock.fill" size={13} color={colors.muted} />
                      <Text className="text-muted text-xs">{booking.time}</Text>
                    </View>
                    <View className="flex-row items-center gap-1">
                      <IconSymbol name="person.2.fill" size={13} color={colors.muted} />
                      <Text className="text-muted text-xs">{booking.guests} guests</Text>
                    </View>
                  </View>

                  <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-border">
                    <Text className="text-muted text-xs">Total</Text>
                    <Text className="text-primary font-bold text-base">£{Number(booking.totalAmount).toFixed(2)}</Text>
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
