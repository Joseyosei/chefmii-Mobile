import { router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, FlatList, Pressable, Text, View } from "react-native";
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
] as const;

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  pending: { bg: "#FEF3C7", text: "#92400E", label: "⏳ Pending" },
  confirmed: { bg: "#D1FAE5", text: "#065F46", label: "✓ Confirmed" },
  declined: { bg: "#FEE2E2", text: "#991B1B", label: "✗ Declined" },
  completed: { bg: "#DBEAFE", text: "#1E40AF", label: "★ Completed" },
  cancelled: { bg: "#F3F4F6", text: "#6B7280", label: "× Cancelled" },
};

export default function ChefBookingsScreen() {
  const { isAuthenticated } = useAuth();
  const colors = useColors();
  const [activeStatus, setActiveStatus] = useState<"all" | "pending" | "confirmed" | "completed">("all");

  const { data: bookings, isLoading, refetch } = trpc.bookings.listMine.useQuery(
    { status: activeStatus, role: "chef" },
    { enabled: isAuthenticated }
  );
  const updateStatus = trpc.bookings.updateStatus.useMutation({ onSuccess: () => refetch() });

  const handleConfirm = (id: number, ref: string) => {
    Alert.alert(
      "Confirm Booking",
      `Accept booking ${ref}?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Accept", onPress: () => updateStatus.mutateAsync({ id, status: "confirmed" }) },
      ]
    );
  };

  const handleDecline = (id: number, ref: string) => {
    Alert.alert(
      "Decline Booking",
      `Decline booking ${ref}? The client will be notified.`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Decline", style: "destructive", onPress: () => updateStatus.mutateAsync({ id, status: "declined" }) },
      ]
    );
  };

  const handleComplete = (id: number, ref: string) => {
    Alert.alert(
      "Mark as Completed",
      `Mark booking ${ref} as completed?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Complete", onPress: () => updateStatus.mutateAsync({ id, status: "completed" }) },
      ]
    );
  };

  return (
    <ScreenContainer>
      <View className="px-5 pt-4 pb-3">
        <Text className="text-foreground text-2xl font-bold">Bookings</Text>
      </View>

      {/* Status Filter */}
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
              <Text className="text-foreground font-semibold text-lg">No bookings</Text>
              <Text className="text-muted text-center mt-1">Bookings from clients will appear here</Text>
            </View>
          }
          renderItem={({ item: booking }) => {
            const statusStyle = STATUS_STYLES[booking.status] ?? STATUS_STYLES.pending;
            return (
              <View className="bg-surface border border-border rounded-3xl p-4">
                <View className="flex-row items-start justify-between mb-3">
                  <View className="flex-1">
                    <Text className="text-foreground font-bold text-base">{booking.packageName}</Text>
                    <Text className="text-muted text-xs mt-0.5">Ref: {booking.bookingRef}</Text>
                  </View>
                  <View style={{ backgroundColor: statusStyle.bg, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 }}>
                    <Text style={{ color: statusStyle.text, fontSize: 11, fontWeight: "700" }}>{statusStyle.label}</Text>
                  </View>
                </View>

                <View className="flex-row flex-wrap gap-3 mb-3">
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

                <View className="flex-row items-center justify-between mb-3">
                  <Text className="text-muted text-xs">Your earnings</Text>
                  <Text className="text-success font-bold text-base">£{Number(booking.chefEarnings).toFixed(2)}</Text>
                </View>

                {/* Action Buttons */}
                {booking.status === "pending" && (
                  <View className="flex-row gap-2">
                    <Pressable
                      onPress={() => handleDecline(booking.id, booking.bookingRef)}
                      style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1, flex: 1 }]}
                    >
                      <View className="bg-error/10 border border-error/30 rounded-xl py-2 items-center">
                        <Text className="text-error text-sm font-semibold">Decline</Text>
                      </View>
                    </Pressable>
                    <Pressable
                      onPress={() => handleConfirm(booking.id, booking.bookingRef)}
                      style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1, flex: 2 }]}
                    >
                      <View className="bg-primary rounded-xl py-2 items-center">
                        <Text className="text-white text-sm font-bold">Accept Booking</Text>
                      </View>
                    </Pressable>
                  </View>
                )}

                {booking.status === "confirmed" && (
                  <View className="flex-row gap-2">
                    <Pressable
                      onPress={() => router.push({ pathname: "/(chef)/messages/[bookingId]" as never, params: { bookingId: booking.id } })}
                      style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1, flex: 1 }]}
                    >
                      <View className="bg-surface border border-border rounded-xl py-2 items-center flex-row justify-center gap-1">
                        <IconSymbol name="message.fill" size={14} color={colors.foreground} />
                        <Text className="text-foreground text-sm font-semibold">Message</Text>
                      </View>
                    </Pressable>
                    <Pressable
                      onPress={() => handleComplete(booking.id, booking.bookingRef)}
                      style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1, flex: 1 }]}
                    >
                      <View className="bg-success rounded-xl py-2 items-center">
                        <Text className="text-white text-sm font-bold">Mark Done</Text>
                      </View>
                    </Pressable>
                  </View>
                )}
              </View>
            );
          }}
        />
      )}
    </ScreenContainer>
  );
}
