import { router } from "expo-router";
import { ActivityIndicator, FlatList, Pressable, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { trpc } from "@/lib/trpc";
import { useColors } from "@/hooks/use-colors";

export default function ChefEarningsScreen() {
  const colors = useColors();
  const { data: earnings, isLoading } = trpc.bookings.getEarnings.useQuery();

  const bookings = earnings?.bookings ?? [];
  const completedBookings = bookings.filter((b) => b.status === "completed");

  return (
    <ScreenContainer>
      <View className="px-5 pt-4 pb-3 flex-row items-center gap-3">
        <Pressable onPress={() => router.back()} style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}>
          <IconSymbol name="arrow.left" size={22} color={colors.foreground} />
        </Pressable>
        <Text className="text-foreground text-xl font-bold">Earnings</Text>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={completedBookings}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20, gap: 10 }}
          ListHeaderComponent={
            <View className="gap-4 mb-4">
              {/* Summary Cards */}
              <View className="flex-row gap-3">
                <View className="flex-1 bg-success/10 border border-success/20 rounded-2xl p-4 items-center">
                  <Text className="text-success font-bold text-2xl">£{Number(earnings?.total ?? 0).toFixed(2)}</Text>
                  <Text className="text-muted text-xs mt-1">Total Earned</Text>
                </View>
                <View className="flex-1 bg-warning/10 border border-warning/20 rounded-2xl p-4 items-center">
                  <Text className="text-warning font-bold text-2xl">£{Number(earnings?.pending ?? 0).toFixed(2)}</Text>
                  <Text className="text-muted text-xs mt-1">Pending</Text>
                </View>
              </View>

              <View className="bg-surface border border-border rounded-2xl p-4">
                <Text className="text-foreground font-bold mb-1">How earnings work</Text>
                <Text className="text-muted text-sm leading-relaxed">
                  You receive 85% of each booking total. The 15% platform fee covers payment processing, insurance, and platform support. Payouts are processed within 2–3 business days after booking completion.
                </Text>
              </View>

              <Text className="text-foreground font-bold">Completed Bookings</Text>
            </View>
          }
          ListEmptyComponent={
            <View className="items-center py-12">
              <Text className="text-4xl mb-3">💰</Text>
              <Text className="text-foreground font-semibold text-lg">No earnings yet</Text>
              <Text className="text-muted text-center mt-1">Completed bookings will appear here</Text>
            </View>
          }
          renderItem={({ item: booking }) => (
            <View className="bg-surface border border-border rounded-2xl p-4">
              <View className="flex-row items-start justify-between">
                <View className="flex-1">
                  <Text className="text-foreground font-semibold text-sm">{booking.bookingRef}</Text>
                  <Text className="text-muted text-xs mt-0.5">{booking.date} · {booking.guests} guests</Text>
                </View>
                <View className="items-end">
                  <Text className="text-success font-bold text-base">£{Number(booking.chefEarnings).toFixed(2)}</Text>
                  <Text className="text-muted text-xs">of £{Number(booking.totalAmount).toFixed(2)}</Text>
                </View>
              </View>
            </View>
          )}
        />
      )}
    </ScreenContainer>
  );
}
