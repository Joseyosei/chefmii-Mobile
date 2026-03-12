import { router } from "expo-router";
import { FlatList, Pressable, Text, View, ActivityIndicator } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { trpc } from "@/lib/trpc";
import { useColors } from "@/hooks/use-colors";
import { useAuth } from "@/hooks/use-auth";

const TYPE_ICONS: Record<string, { icon: any; color: string }> = {
  booking_request: { icon: "calendar", color: "#0a7ea4" },
  booking_confirmed: { icon: "checkmark.circle.fill", color: "#22C55E" },
  booking_declined: { icon: "xmark.circle.fill", color: "#EF4444" },
  booking_completed: { icon: "star.fill", color: "#F59E0B" },
  booking_cancelled: { icon: "xmark.circle.fill", color: "#6B7280" },
  new_message: { icon: "message.fill", color: "#8B5CF6" },
};

export default function NotificationsScreen() {
  const { isAuthenticated } = useAuth();
  const colors = useColors();
  const { data: notifications, isLoading, refetch } = trpc.notifications.list.useQuery(undefined, { enabled: isAuthenticated });
  const markRead = trpc.notifications.markRead.useMutation({ onSuccess: () => refetch() });
  const markAllRead = trpc.notifications.markAllRead.useMutation({ onSuccess: () => refetch() });

  const unreadCount = (notifications ?? []).filter((n) => !n.read).length;

  return (
    <ScreenContainer>
      <View className="px-5 pt-4 pb-3 flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <Pressable onPress={() => router.back()} style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}>
            <IconSymbol name="arrow.left" size={22} color={colors.foreground} />
          </Pressable>
          <Text className="text-foreground text-xl font-bold">Notifications</Text>
        </View>
        {unreadCount > 0 && (
          <Pressable onPress={() => markAllRead.mutate()} style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}>
            <Text className="text-primary text-sm font-semibold">Mark all read</Text>
          </Pressable>
        )}
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={notifications ?? []}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20, gap: 8 }}
          ListEmptyComponent={
            <View className="items-center py-16">
              <Text className="text-4xl mb-3">🔔</Text>
              <Text className="text-foreground font-semibold text-lg">No notifications</Text>
              <Text className="text-muted text-center mt-1">You're all caught up!</Text>
            </View>
          }
          renderItem={({ item: notif }) => {
            const iconConfig = TYPE_ICONS[notif.type] ?? { icon: "bell.fill", color: colors.primary };
            return (
              <Pressable
                onPress={() => {
                  if (!notif.read) markRead.mutate({ id: notif.id });
                }}
                style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
              >
                <View
                  className="rounded-2xl p-4 flex-row gap-3"
                  style={{
                    backgroundColor: notif.read ? colors.surface : `${colors.primary}15`,
                    borderWidth: 1,
                    borderColor: notif.read ? colors.border : `${colors.primary}30`,
                  }}
                >
                  <View
                    className="w-10 h-10 rounded-full items-center justify-center"
                    style={{ backgroundColor: `${iconConfig.color}20` }}
                  >
                    <IconSymbol name={iconConfig.icon} size={20} color={iconConfig.color} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-foreground font-semibold text-sm">{notif.title}</Text>
                    {notif.message && (
                      <Text className="text-muted text-xs mt-0.5 leading-4">{notif.message}</Text>
                    )}
                    <Text className="text-muted text-xs mt-1">
                      {new Date(notif.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </Text>
                  </View>
                  {!notif.read && (
                    <View className="w-2 h-2 bg-primary rounded-full self-start mt-1" />
                  )}
                </View>
              </Pressable>
            );
          }}
        />
      )}
    </ScreenContainer>
  );
}
