import { router, useLocalSearchParams } from "expo-router";
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { trpc } from "@/lib/trpc";
import { useColors } from "@/hooks/use-colors";

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  pending: { bg: "#FEF3C7", text: "#92400E", label: "⏳ Pending" },
  confirmed: { bg: "#D1FAE5", text: "#065F46", label: "✓ Confirmed" },
  declined: { bg: "#FEE2E2", text: "#991B1B", label: "✗ Declined" },
  completed: { bg: "#DBEAFE", text: "#1E40AF", label: "★ Completed" },
  cancelled: { bg: "#F3F4F6", text: "#6B7280", label: "× Cancelled" },
};

export default function ChefBookingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();

  const { data: booking, isLoading, refetch } = trpc.bookings.getById.useQuery({ id: Number(id) });
  const updateStatus = trpc.bookings.updateStatus.useMutation({ onSuccess: () => refetch() });

  if (isLoading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  if (!booking) {
    return (
      <ScreenContainer className="items-center justify-center px-6">
        <Text className="text-4xl mb-3">❌</Text>
        <Text className="text-foreground font-bold text-lg">Booking not found</Text>
        <Pressable onPress={() => router.back()} style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}>
          <Text className="text-primary mt-3">Go back</Text>
        </Pressable>
      </ScreenContainer>
    );
  }

  const statusStyle = STATUS_STYLES[booking.status] ?? STATUS_STYLES.pending;

  const handleConfirm = () => {
    Alert.alert("Accept Booking", "Accept this booking request?", [
      { text: "Cancel", style: "cancel" },
      { text: "Accept", onPress: () => updateStatus.mutateAsync({ id: booking.id, status: "confirmed" }) },
    ]);
  };

  const handleDecline = () => {
    Alert.alert("Decline Booking", "Decline this booking? The client will be notified.", [
      { text: "Cancel", style: "cancel" },
      { text: "Decline", style: "destructive", onPress: () => updateStatus.mutateAsync({ id: booking.id, status: "declined" }) },
    ]);
  };

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="px-5 pt-4 pb-2 flex-row items-center gap-3">
          <Pressable onPress={() => router.back()} style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}>
            <IconSymbol name="arrow.left" size={22} color={colors.foreground} />
          </Pressable>
          <Text className="text-foreground text-xl font-bold">Booking Detail</Text>
        </View>

        <View className="px-5 py-4 gap-4">
          {/* Status */}
          <View className="flex-row items-center justify-between">
            <Text className="text-foreground font-bold text-lg">{booking.bookingRef}</Text>
            <View style={{ backgroundColor: statusStyle.bg, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 }}>
              <Text style={{ color: statusStyle.text, fontWeight: "700", fontSize: 13 }}>{statusStyle.label}</Text>
            </View>
          </View>

          {/* Details */}
          <View className="bg-surface border border-border rounded-2xl p-4 gap-3">
            <DetailRow icon="calendar" label="Date" value={booking.date} />
            <DetailRow icon="clock.fill" label="Time" value={booking.time} />
            <DetailRow icon="person.2.fill" label="Guests" value={`${booking.guests} guests`} />
            <DetailRow icon="location.fill" label="Address" value={booking.address ?? "Not specified"} />
            {booking.dietaryNotes && (
              <DetailRow icon="exclamationmark.circle.fill" label="Dietary Notes" value={booking.dietaryNotes} />
            )}
          </View>

          {/* Financials */}
          <View className="bg-surface border border-border rounded-2xl p-4">
            <Text className="text-foreground font-bold mb-3">Payment Breakdown</Text>
            <View className="gap-2">
              <View className="flex-row justify-between">
                <Text className="text-muted text-sm">Booking Total</Text>
                <Text className="text-foreground text-sm font-semibold">£{Number(booking.totalAmount).toFixed(2)}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-muted text-sm">Platform Fee (15%)</Text>
                <Text className="text-error text-sm">-£{Number(booking.platformFee).toFixed(2)}</Text>
              </View>
              <View className="h-px bg-border my-1" />
              <View className="flex-row justify-between">
                <Text className="text-foreground font-bold">Your Earnings</Text>
                <Text className="text-success font-bold text-base">£{Number(booking.chefEarnings).toFixed(2)}</Text>
              </View>
            </View>
          </View>

          {/* Actions */}
          {booking.status === "pending" && (
            <View className="flex-row gap-3">
              <Pressable onPress={handleDecline} style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1, flex: 1 }]}>
                <View className="bg-error/10 border border-error/30 rounded-2xl py-3 items-center">
                  <Text className="text-error font-bold">Decline</Text>
                </View>
              </Pressable>
              <Pressable onPress={handleConfirm} style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1, flex: 2 }]}>
                <View className="bg-primary rounded-2xl py-3 items-center">
                  <Text className="text-white font-bold">Accept Booking</Text>
                </View>
              </Pressable>
            </View>
          )}

          {booking.status === "confirmed" && (
            <Pressable
              onPress={() => router.push({ pathname: "/(chef)/messages/[bookingId]" as never, params: { bookingId: booking.id } })}
              style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
            >
              <View className="bg-primary rounded-2xl py-3 items-center flex-row justify-center gap-2">
                <IconSymbol name="message.fill" size={18} color="#fff" />
                <Text className="text-white font-bold">Message Client</Text>
              </View>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

function DetailRow({ icon, label, value }: { icon: any; label: string; value: string }) {
  const colors = useColors();
  return (
    <View className="flex-row items-start gap-3">
      <IconSymbol name={icon} size={16} color={colors.muted} />
      <View className="flex-1">
        <Text className="text-muted text-xs">{label}</Text>
        <Text className="text-foreground text-sm font-medium mt-0.5">{value}</Text>
      </View>
    </View>
  );
}
