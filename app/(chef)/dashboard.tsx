import { router } from "expo-router";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/hooks/use-auth";
import { useColors } from "@/hooks/use-colors";

function StatCard({ icon, label, value, color }: { icon: any; label: string; value: string | number; color: string }) {
  return (
    <View className="flex-1 bg-surface border border-border rounded-2xl p-4 items-center gap-2">
      <View className="w-10 h-10 rounded-full items-center justify-center" style={{ backgroundColor: `${color}20` }}>
        <IconSymbol name={icon} size={20} color={color} />
      </View>
      <Text className="text-foreground font-bold text-xl">{value}</Text>
      <Text className="text-muted text-xs text-center">{label}</Text>
    </View>
  );
}

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  pending: { bg: "#FEF3C7", text: "#92400E", label: "⏳ Pending" },
  confirmed: { bg: "#D1FAE5", text: "#065F46", label: "✓ Confirmed" },
  declined: { bg: "#FEE2E2", text: "#991B1B", label: "✗ Declined" },
  completed: { bg: "#DBEAFE", text: "#1E40AF", label: "★ Completed" },
  cancelled: { bg: "#F3F4F6", text: "#6B7280", label: "× Cancelled" },
};

export default function ChefDashboardScreen() {
  const { user } = useAuth();
  const colors = useColors();

  const { data: earnings, isLoading: statsLoading } = trpc.bookings.getEarnings.useQuery();
  const { data: recentBookings, isLoading: bookingsLoading } = trpc.bookings.listMine.useQuery({ status: "all", role: "chef" });
  const { data: myProfile } = trpc.chefs.getMyProfile.useQuery();

  const firstName = user?.name?.split(" ")[0] ?? "Chef";
  const verificationStage = myProfile?.verificationStage ?? 0;
  const badgeTier = myProfile?.badgeTier ?? "none";
  const isVerified = badgeTier !== "none";

  const verificationBanner = isVerified
    ? null
    : verificationStage > 0
    ? { bg: "#DBEAFE", text: "#1E40AF", icon: "clock.fill" as const, msg: "Your verification is under review. We'll notify you soon." }
    : { bg: "#FEF3C7", text: "#92400E", icon: "exclamationmark.circle.fill" as const, msg: "Complete your verification to start accepting bookings" };

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-5 pt-4 pb-3 flex-row items-center justify-between">
          <View>
            <Text className="text-muted text-sm">Welcome back,</Text>
            <Text className="text-foreground text-2xl font-bold">{firstName} 👨‍🍳</Text>
          </View>
          <Pressable
            onPress={() => router.push("/(client)/notifications" as never)}
            style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
          >
            <View className="bg-surface border border-border rounded-full p-2">
              <IconSymbol name="bell.fill" size={20} color={colors.foreground} />
            </View>
          </Pressable>
        </View>

        {/* Verification Banner */}
        {verificationBanner && (
          <Pressable
            onPress={() => router.push("/(chef)/verification" as never)}
            style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
            className="mx-5 mb-4"
          >
            <View
              className="rounded-2xl p-3 flex-row items-center gap-3"
              style={{ backgroundColor: verificationBanner.bg }}
            >
              <IconSymbol name={verificationBanner.icon as any} size={20} color={verificationBanner.text} />
              <Text className="flex-1 text-sm font-medium" style={{ color: verificationBanner.text }}>
                {verificationBanner.msg}
              </Text>
              <IconSymbol name="chevron.right" size={14} color={verificationBanner.text} />
            </View>
          </Pressable>
        )}

        {/* Stats */}
        {statsLoading ? (
          <View className="mx-5 mb-4 py-8 items-center">
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : (
          <View className="mx-5 mb-4 flex-row gap-3">
            <StatCard icon="calendar" label="Total Bookings" value={earnings?.completed ?? 0} color={colors.primary} />
            <StatCard icon="dollarsign.circle.fill" label="Total Earnings" value={`£${Number(earnings?.total ?? 0).toFixed(0)}`} color="#22C55E" />
            <StatCard icon="clock.fill" label="Pending" value={earnings?.pending ?? 0} color="#F59E0B" />
          </View>
        )}

        {/* This Month */}
        <View className="mx-5 mb-4 bg-surface border border-border rounded-2xl p-4">
          <Text className="text-foreground font-bold mb-3">This Month</Text>
          <View className="flex-row gap-4">
            <View className="flex-1 items-center">
              <Text className="text-primary font-bold text-2xl">{(recentBookings ?? []).length}</Text>
              <Text className="text-muted text-xs mt-1">All Bookings</Text>
            </View>
            <View className="w-px bg-border" />
            <View className="flex-1 items-center">
              <Text className="text-success font-bold text-2xl">£{Number(earnings?.total ?? 0).toFixed(0)}</Text>
              <Text className="text-muted text-xs mt-1">Earned</Text>
            </View>
            <View className="w-px bg-border" />
            <View className="flex-1 items-center">
              <Text className="text-warning font-bold text-2xl">{(recentBookings ?? []).filter(b => b.status === 'pending').length}</Text>
              <Text className="text-muted text-xs mt-1">Pending</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="px-5 mb-4">
          <Text className="text-foreground font-bold mb-3">Quick Actions</Text>
          <View className="flex-row gap-3">
            <Pressable
              onPress={() => router.push("/(chef)/packages" as never)}
              style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1, flex: 1 }]}
            >
              <View className="bg-primary/10 border border-primary/20 rounded-2xl p-4 items-center gap-2">
                <IconSymbol name="list.bullet" size={24} color={colors.primary} />
                <Text className="text-primary text-xs font-semibold text-center">Manage Packages</Text>
              </View>
            </Pressable>
            <Pressable
              onPress={() => router.push("/(chef)/availability" as never)}
              style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1, flex: 1 }]}
            >
              <View className="bg-success/10 border border-success/20 rounded-2xl p-4 items-center gap-2">
                <IconSymbol name="calendar" size={24} color="#22C55E" />
                <Text className="text-success text-xs font-semibold text-center">Set Availability</Text>
              </View>
            </Pressable>
            <Pressable
              onPress={() => router.push("/(chef)/earnings" as never)}
              style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1, flex: 1 }]}
            >
              <View className="bg-warning/10 border border-warning/20 rounded-2xl p-4 items-center gap-2">
                <IconSymbol name="dollarsign.circle.fill" size={24} color="#F59E0B" />
                <Text className="text-warning text-xs font-semibold text-center">View Earnings</Text>
              </View>
            </Pressable>
          </View>
        </View>

        {/* Recent Bookings */}
        <View className="px-5 mb-8">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-foreground font-bold">Recent Bookings</Text>
            <Pressable onPress={() => router.push("/(chef)/bookings" as never)} style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}>
              <Text className="text-primary text-sm font-semibold">See all</Text>
            </Pressable>
          </View>

          {bookingsLoading ? (
            <ActivityIndicator color={colors.primary} />
          ) : (recentBookings ?? []).length === 0 ? (
            <View className="bg-surface border border-border rounded-2xl p-6 items-center">
              <Text className="text-3xl mb-2">📅</Text>
              <Text className="text-foreground font-semibold">No bookings yet</Text>
              <Text className="text-muted text-xs text-center mt-1">Complete your profile to start receiving bookings</Text>
            </View>
          ) : (
            <View className="gap-3">
              {(recentBookings ?? []).map((booking) => {
                const statusStyle = STATUS_STYLES[booking.status] ?? STATUS_STYLES.pending;
                return (
                  <Pressable
                    key={booking.id}
                    onPress={() => router.push({ pathname: "/(chef)/booking/[id]" as never, params: { id: booking.id } })}
                    style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
                  >
                    <View className="bg-surface border border-border rounded-2xl p-3 flex-row items-center gap-3">
                      <View className="flex-1">
                        <Text className="text-foreground font-semibold text-sm">{booking.packageName}</Text>
                        <Text className="text-muted text-xs mt-0.5">{booking.date} · {booking.time}</Text>
                        <Text className="text-muted text-xs">{booking.guests} guests</Text>
                      </View>
                      <View>
                        <View style={{ backgroundColor: statusStyle.bg, borderRadius: 12, paddingHorizontal: 8, paddingVertical: 3 }}>
                          <Text style={{ color: statusStyle.text, fontSize: 10, fontWeight: "700" }}>{statusStyle.label}</Text>
                        </View>
                        <Text className="text-primary font-bold text-sm text-right mt-1">£{Number(booking.totalAmount).toFixed(0)}</Text>
                      </View>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
