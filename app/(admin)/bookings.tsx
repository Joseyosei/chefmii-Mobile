import { ActivityIndicator, FlatList, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { trpc } from "@/lib/trpc";
import { useColors } from "@/hooks/use-colors";

const ADMIN_COLOR = "#7C3AED";

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  pending: { bg: "#FEF3C7", text: "#92400E" },
  confirmed: { bg: "#D1FAE5", text: "#065F46" },
  declined: { bg: "#FEE2E2", text: "#991B1B" },
  completed: { bg: "#DBEAFE", text: "#1E40AF" },
  cancelled: { bg: "#F3F4F6", text: "#6B7280" },
};

export default function AdminBookingsScreen() {
  const colors = useColors();
  const { data: bookings, isLoading } = trpc.admin.listAllBookings.useQuery();

  return (
    <ScreenContainer>
      <View className="px-5 pt-4 pb-3">
        <Text className="text-foreground text-2xl font-bold">All Bookings</Text>
        <Text className="text-muted text-sm mt-1">{(bookings ?? []).length} total bookings</Text>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={ADMIN_COLOR} />
        </View>
      ) : (
        <FlatList
          data={bookings ?? []}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20, gap: 10 }}
          ListEmptyComponent={
            <View className="items-center py-16">
              <Text className="text-4xl mb-3">📅</Text>
              <Text className="text-foreground font-semibold">No bookings yet</Text>
            </View>
          }
          renderItem={({ item: booking }) => {
            const statusStyle = STATUS_STYLES[booking.status] ?? STATUS_STYLES.pending;
            return (
              <View className="bg-surface border border-border rounded-2xl p-4">
                <View className="flex-row items-start justify-between mb-2">
                  <Text className="text-foreground font-bold text-sm">{booking.bookingRef}</Text>
                  <View style={{ backgroundColor: statusStyle.bg, borderRadius: 12, paddingHorizontal: 8, paddingVertical: 3 }}>
                    <Text style={{ color: statusStyle.text, fontSize: 10, fontWeight: "700" }}>{booking.status.toUpperCase()}</Text>
                  </View>
                </View>
                <View className="flex-row gap-3">
                  <View className="flex-row items-center gap-1">
                    <IconSymbol name="calendar" size={12} color={colors.muted} />
                    <Text className="text-muted text-xs">{booking.date}</Text>
                  </View>
                  <View className="flex-row items-center gap-1">
                    <IconSymbol name="person.2.fill" size={12} color={colors.muted} />
                    <Text className="text-muted text-xs">{booking.guests} guests</Text>
                  </View>
                  <Text className="text-primary text-xs font-bold ml-auto">£{Number(booking.totalAmount).toFixed(0)}</Text>
                </View>
              </View>
            );
          }}
        />
      )}
    </ScreenContainer>
  );
}
