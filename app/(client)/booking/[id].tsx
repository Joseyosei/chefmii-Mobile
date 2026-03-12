import { router, useLocalSearchParams } from "expo-router";
import { Alert, Pressable, ScrollView, Text, View, ActivityIndicator } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { trpc } from "@/lib/trpc";
import { useColors } from "@/hooks/use-colors";

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  pending: { bg: "#FEF3C7", text: "#92400E", label: "⏳ Pending Confirmation" },
  confirmed: { bg: "#D1FAE5", text: "#065F46", label: "✓ Confirmed" },
  declined: { bg: "#FEE2E2", text: "#991B1B", label: "✗ Declined" },
  completed: { bg: "#DBEAFE", text: "#1E40AF", label: "★ Completed" },
  cancelled: { bg: "#F3F4F6", text: "#6B7280", label: "× Cancelled" },
};

export default function BookingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();

  const { data: booking, isLoading, refetch } = trpc.bookings.getById.useQuery({ id: Number(id) });
  const updateStatus = trpc.bookings.updateStatus.useMutation({ onSuccess: () => refetch() });

  const handleCancel = () => {
    Alert.alert(
      "Cancel Booking",
      "Are you sure you want to cancel this booking?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: async () => {
            await updateStatus.mutateAsync({ id: Number(id), status: "cancelled" });
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  if (!booking) {
    return (
      <ScreenContainer className="items-center justify-center">
        <Text className="text-foreground text-xl font-bold">Booking not found</Text>
        <Pressable onPress={() => router.back()} style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]} className="mt-4">
          <Text className="text-primary">← Go back</Text>
        </Pressable>
      </ScreenContainer>
    );
  }

  const statusStyle = STATUS_STYLES[booking.status] ?? STATUS_STYLES.pending;

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-5 pt-4 pb-2 flex-row items-center gap-3">
          <Pressable onPress={() => router.back()} style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}>
            <IconSymbol name="arrow.left" size={22} color={colors.foreground} />
          </Pressable>
          <Text className="text-foreground text-xl font-bold flex-1">Booking Details</Text>
        </View>

        <View className="px-5 pb-8 gap-4">
          {/* Status Banner */}
          <View style={{ backgroundColor: statusStyle.bg, borderRadius: 16, padding: 12, alignItems: "center" }}>
            <Text style={{ color: statusStyle.text, fontWeight: "700", fontSize: 16 }}>{statusStyle.label}</Text>
          </View>

          {/* Booking Ref */}
          <View className="bg-surface border border-border rounded-2xl p-4">
            <Text className="text-muted text-xs mb-1">Booking Reference</Text>
            <Text className="text-foreground font-bold text-xl tracking-widest">{booking.bookingRef}</Text>
          </View>

          {/* Details */}
          <View className="bg-surface border border-border rounded-2xl p-4 gap-3">
            <DetailRow icon="calendar" label="Date" value={booking.date} />
            <DetailRow icon="clock.fill" label="Time" value={booking.time} />
            <DetailRow icon="person.2.fill" label="Guests" value={`${booking.guests} guests`} />
            <DetailRow icon="location.fill" label="Address" value={booking.address ?? ""} />
            {booking.dietaryNotes && (
              <DetailRow icon="doc.fill" label="Dietary Notes" value={booking.dietaryNotes} />
            )}
          </View>

          {/* Payment */}
          <View className="bg-surface border border-border rounded-2xl p-4 gap-2">
            <Text className="text-foreground font-bold mb-1">Payment Summary</Text>
            <View className="flex-row justify-between">
              <Text className="text-muted text-sm">Package Price</Text>
              <Text className="text-foreground text-sm">£{Number(booking.totalAmount).toFixed(2)}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-muted text-sm">Platform Fee</Text>
              <Text className="text-foreground text-sm">£{Number(booking.platformFee).toFixed(2)}</Text>
            </View>
            <View className="h-px bg-border" />
            <View className="flex-row justify-between">
              <Text className="text-foreground font-bold">Total</Text>
              <Text className="text-primary font-bold text-base">£{Number(booking.totalAmount).toFixed(2)}</Text>
            </View>
          </View>

          {/* Actions */}
          <View className="gap-3">
            {booking.status === "confirmed" && (
              <Pressable
                onPress={() => router.push({ pathname: "/(client)/messages/[bookingId]" as never, params: { bookingId: booking.id } })}
                style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
              >
                <View className="bg-surface border border-border rounded-2xl py-3 items-center flex-row justify-center gap-2">
                  <IconSymbol name="message.fill" size={18} color={colors.foreground} />
                  <Text className="text-foreground font-semibold">Message Chef</Text>
                </View>
              </Pressable>
            )}

            {booking.status === "completed" && (
              <Pressable
                onPress={() => router.push({ pathname: "/(client)/review/[bookingId]" as never, params: { bookingId: booking.id } })}
                style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
              >
                <View className="bg-primary rounded-2xl py-3 items-center flex-row justify-center gap-2">
                  <IconSymbol name="star.fill" size={18} color="#fff" />
                  <Text className="text-white font-bold">Leave a Review</Text>
                </View>
              </Pressable>
            )}

            {(booking.status === "pending" || booking.status === "confirmed") && (
              <Pressable onPress={handleCancel} style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}>
                <View className="bg-error/10 border border-error/30 rounded-2xl py-3 items-center">
                  <Text className="text-error font-semibold">Cancel Booking</Text>
                </View>
              </Pressable>
            )}
          </View>
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
        <Text className="text-foreground text-sm font-medium">{value}</Text>
      </View>
    </View>
  );
}
