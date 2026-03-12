import { router } from "expo-router";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { trpc } from "@/lib/trpc";
import { useColors } from "@/hooks/use-colors";
import { useChefMii } from "@/lib/chefmii-context";
import { useAuth } from "@/hooks/use-auth";

const ADMIN_COLOR = "#7C3AED";

function AdminStatCard({ icon, label, value, color }: { icon: any; label: string; value: string | number; color: string }) {
  return (
    <View className="flex-1 bg-surface border border-border rounded-2xl p-4 items-center gap-1">
      <View className="w-10 h-10 rounded-full items-center justify-center mb-1" style={{ backgroundColor: `${color}20` }}>
        <IconSymbol name={icon} size={20} color={color} />
      </View>
      <Text className="text-foreground font-bold text-xl">{value}</Text>
      <Text className="text-muted text-xs text-center">{label}</Text>
    </View>
  );
}

export default function AdminDashboardScreen() {
  const colors = useColors();
  const { user } = useAuth();
  const { clearRole } = useChefMii();

  const { data: stats, isLoading } = trpc.admin.stats.useQuery();
  const { data: applications, isLoading: appsLoading } = trpc.admin.listChefApplications.useQuery();

  const pendingApps = applications ?? [];

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-5 pt-4 pb-3 flex-row items-center justify-between">
          <View>
            <View className="flex-row items-center gap-2">
              <View className="bg-purple-100 rounded-lg px-2 py-0.5">
                <Text className="text-xs font-bold" style={{ color: ADMIN_COLOR }}>ADMIN</Text>
              </View>
            </View>
            <Text className="text-foreground text-2xl font-bold mt-1">Control Panel</Text>
          </View>
          <Pressable
            onPress={() => {
              clearRole();
              router.replace("/onboarding/role-select" as never);
            }}
            style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
          >
            <View className="bg-surface border border-border rounded-xl px-3 py-2">
              <Text className="text-muted text-xs font-semibold">Exit Admin</Text>
            </View>
          </Pressable>
        </View>

        {/* Stats Grid */}
        {isLoading ? (
          <View className="mx-5 py-8 items-center">
            <ActivityIndicator color={ADMIN_COLOR} />
          </View>
        ) : (
          <>
            <View className="mx-5 mb-3 flex-row gap-3">
              <AdminStatCard icon="person.2.fill" label="Total Users" value={stats?.users ?? 0} color={ADMIN_COLOR} />
              <AdminStatCard icon="checkmark.seal.fill" label="Total Chefs" value={stats?.chefs ?? 0} color="#22C55E" />
              <AdminStatCard icon="calendar" label="Total Bookings" value={stats?.bookings ?? 0} color="#F59E0B" />
            </View>
            <View className="mx-5 mb-4 flex-row gap-3">
              <AdminStatCard icon="dollarsign.circle.fill" label="Platform Revenue" value={`£${Number(stats?.revenue ?? 0).toFixed(0)}`} color="#EF4444" />
              <AdminStatCard icon="clock.fill" label="Pending Apps" value={pendingApps.length} color="#6366F1" />
              <AdminStatCard icon="star.fill" label="Avg Rating" value="4.8" color="#F59E0B" />
            </View>
          </>
        )}

        {/* Pending Verifications */}
        <View className="px-5 mb-4">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-foreground font-bold">Chef Applications</Text>
            <Pressable onPress={() => router.push("/(admin)/chefs" as never)} style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}>
              <Text className="text-sm font-semibold" style={{ color: ADMIN_COLOR }}>See all</Text>
            </Pressable>
          </View>

          {appsLoading ? (
            <ActivityIndicator color={ADMIN_COLOR} />
          ) : pendingApps.length === 0 ? (
            <View className="bg-surface border border-border rounded-2xl p-5 items-center">
              <Text className="text-2xl mb-2">✅</Text>
              <Text className="text-foreground font-semibold">All caught up!</Text>
              <Text className="text-muted text-xs mt-1">No pending chef applications</Text>
            </View>
          ) : (
            <View className="gap-3">
              {pendingApps.slice(0, 5).map((chef) => (
                <Pressable
                  key={chef.id}
                  onPress={() => router.push({ pathname: "/(admin)/chef-review/[id]" as never, params: { id: chef.id } })}
                  style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
                >
                  <View className="bg-surface border border-border rounded-2xl p-4 flex-row items-center gap-3">
                    <View className="w-10 h-10 rounded-full items-center justify-center" style={{ backgroundColor: `${ADMIN_COLOR}20` }}>
                      <Text className="font-bold" style={{ color: ADMIN_COLOR }}>
                        {(chef.chefName ?? "C")[0].toUpperCase()}
                      </Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-foreground font-semibold text-sm">{chef.chefName}</Text>
                      <Text className="text-muted text-xs mt-0.5">Stage {chef.stage}/3 · {chef.chefEmail ?? ""}</Text>
                    </View>
                    <View className="bg-warning/20 rounded-xl px-2 py-1">
                      <Text className="text-warning text-xs font-bold">Review</Text>
                    </View>
                  </View>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        {/* Quick Admin Actions */}
        <View className="px-5 mb-8">
          <Text className="text-foreground font-bold mb-3">Quick Actions</Text>
          <View className="gap-2">
            {[
              { label: "Manage All Chefs", icon: "checkmark.seal.fill", route: "/(admin)/chefs" },
              { label: "View All Bookings", icon: "calendar", route: "/(admin)/bookings" },
              { label: "Manage Users", icon: "person.fill", route: "/(admin)/users" },
              { label: "Run Seed Data", icon: "plus.circle.fill", route: "/(admin)/seed" },
            ].map((action) => (
              <Pressable
                key={action.label}
                onPress={() => router.push(action.route as never)}
                style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
              >
                <View className="bg-surface border border-border rounded-2xl p-4 flex-row items-center gap-3">
                  <View className="w-9 h-9 rounded-xl items-center justify-center" style={{ backgroundColor: `${ADMIN_COLOR}20` }}>
                    <IconSymbol name={action.icon as any} size={18} color={ADMIN_COLOR} />
                  </View>
                  <Text className="flex-1 text-foreground font-medium">{action.label}</Text>
                  <IconSymbol name="chevron.right" size={16} color={colors.muted} />
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
