import { ActivityIndicator, FlatList, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { trpc } from "@/lib/trpc";
import { useColors } from "@/hooks/use-colors";

const ADMIN_COLOR = "#7C3AED";

const ROLE_STYLES: Record<string, { bg: string; text: string }> = {
  admin: { bg: "#EDE9FE", text: "#7C3AED" },
  chef: { bg: "#D1FAE5", text: "#065F46" },
  client: { bg: "#DBEAFE", text: "#1E40AF" },
};

export default function AdminUsersScreen() {
  const colors = useColors();
  const { data: users, isLoading } = trpc.admin.listAllUsers.useQuery();

  return (
    <ScreenContainer>
      <View className="px-5 pt-4 pb-3">
        <Text className="text-foreground text-2xl font-bold">All Users</Text>
        <Text className="text-muted text-sm mt-1">{(users ?? []).length} registered users</Text>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={ADMIN_COLOR} />
        </View>
      ) : (
        <FlatList
          data={users ?? []}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20, gap: 10 }}
          ListEmptyComponent={
            <View className="items-center py-16">
              <Text className="text-4xl mb-3">👥</Text>
              <Text className="text-foreground font-semibold">No users yet</Text>
            </View>
          }
          renderItem={({ item: user }) => {
            const roleStyle = ROLE_STYLES[user.role ?? "client"] ?? ROLE_STYLES.client;
            return (
              <View className="bg-surface border border-border rounded-2xl p-4 flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-full items-center justify-center" style={{ backgroundColor: `${ADMIN_COLOR}20` }}>
                  <Text className="font-bold" style={{ color: ADMIN_COLOR }}>
                    {(user.name ?? "U")[0].toUpperCase()}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-foreground font-semibold text-sm">{user.name}</Text>
                  <Text className="text-muted text-xs">{user.email}</Text>
                </View>
                <View style={{ backgroundColor: roleStyle.bg, borderRadius: 12, paddingHorizontal: 8, paddingVertical: 3 }}>
                  <Text style={{ color: roleStyle.text, fontSize: 10, fontWeight: "700" }}>{(user.role ?? "client").toUpperCase()}</Text>
                </View>
              </View>
            );
          }}
        />
      )}
    </ScreenContainer>
  );
}
