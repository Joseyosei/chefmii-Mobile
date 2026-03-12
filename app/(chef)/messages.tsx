import { router } from "expo-router";
import { ActivityIndicator, FlatList, Pressable, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { trpc } from "@/lib/trpc";
import { useColors } from "@/hooks/use-colors";
import { useAuth } from "@/hooks/use-auth";

export default function ChefMessagesScreen() {
  const { isAuthenticated } = useAuth();
  const colors = useColors();
  const { data: threads, isLoading } = trpc.messages.listThreads.useQuery(undefined, { enabled: isAuthenticated });

  return (
    <ScreenContainer>
      <View className="px-5 pt-4 pb-3">
        <Text className="text-foreground text-2xl font-bold">Messages</Text>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={threads ?? []}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20, gap: 10 }}
          ListEmptyComponent={
            <View className="items-center py-16">
              <Text className="text-4xl mb-3">💬</Text>
              <Text className="text-foreground font-semibold text-lg">No messages yet</Text>
              <Text className="text-muted text-center mt-1">Messages from clients will appear here</Text>
            </View>
          }
          renderItem={({ item: thread }) => (
            <Pressable
              onPress={() => router.push({ pathname: "/(chef)/messages/[bookingId]" as never, params: { bookingId: thread.id } })}
              style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
            >
              <View className="bg-surface border border-border rounded-2xl p-4 flex-row items-center gap-3">
                <View className="w-12 h-12 bg-primary/20 rounded-full items-center justify-center">
                  <IconSymbol name="person.fill" size={22} color={colors.primary} />
                </View>
                <View className="flex-1">
                  <Text className="text-foreground font-bold text-sm">Booking #{thread.bookingRef}</Text>
                  <Text className="text-muted text-xs mt-0.5">{thread.date} · {thread.status}</Text>
                </View>
                <IconSymbol name="chevron.right" size={16} color={colors.muted} />
              </View>
            </Pressable>
          )}
        />
      )}
    </ScreenContainer>
  );
}
