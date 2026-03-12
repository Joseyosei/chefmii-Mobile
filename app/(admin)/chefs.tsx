import { router } from "expo-router";
import { ActivityIndicator, Alert, FlatList, Pressable, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { trpc } from "@/lib/trpc";
import { useColors } from "@/hooks/use-colors";

const ADMIN_COLOR = "#7C3AED";

const BADGE_STYLES: Record<string, { bg: string; text: string }> = {
  elite: { bg: "#FFD700", text: "#7B5800" },
  pro: { bg: "#C0C0C0", text: "#444" },
  verified: { bg: "#4CAF50", text: "#fff" },
  none: { bg: "#E5E7EB", text: "#687076" },
};

export default function AdminChefsScreen() {
  const colors = useColors();
  const { data: applications, isLoading, refetch } = trpc.admin.listChefApplications.useQuery();
  const reviewApp = trpc.admin.reviewApplication.useMutation({ onSuccess: () => refetch() });

  const handleApprove = (id: number, name: string | null) => {
    Alert.alert("Approve Application", `Approve ${name ?? "this chef"}'s verification?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Approve",
        onPress: () => reviewApp.mutateAsync({ id, status: "approved", adminNotes: "Approved by admin" }),
      },
    ]);
  };

  const handleReject = (id: number, name: string | null) => {
    Alert.alert("Reject Application", `Reject ${name ?? "this chef"}'s verification?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Reject",
        style: "destructive",
        onPress: () => reviewApp.mutateAsync({ id, status: "rejected", adminNotes: "Rejected by admin" }),
      },
    ]);
  };

  return (
    <ScreenContainer>
      <View className="px-5 pt-4 pb-3">
        <Text className="text-foreground text-2xl font-bold">Chef Applications</Text>
        <Text className="text-muted text-sm mt-1">Review and approve chef verifications</Text>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={ADMIN_COLOR} />
        </View>
      ) : (
        <FlatList
          data={applications ?? []}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20, gap: 12 }}
          ListEmptyComponent={
            <View className="items-center py-16">
              <Text className="text-4xl mb-3">✅</Text>
              <Text className="text-foreground font-semibold text-lg">No pending applications</Text>
              <Text className="text-muted text-center mt-1">All chef applications have been reviewed</Text>
            </View>
          }
          renderItem={({ item: app }) => (
            <View className="bg-surface border border-border rounded-3xl p-4">
              <View className="flex-row items-start justify-between mb-3">
                <View className="flex-row items-center gap-3 flex-1">
                  <View className="w-12 h-12 rounded-full items-center justify-center" style={{ backgroundColor: `${ADMIN_COLOR}20` }}>
                    <Text className="font-bold text-lg" style={{ color: ADMIN_COLOR }}>
                      {(app.chefName ?? "C")[0].toUpperCase()}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-foreground font-bold text-base">{app.chefName}</Text>
                    <Text className="text-muted text-xs">{app.chefEmail}</Text>
                  </View>
                </View>
                <View className="bg-warning/20 rounded-xl px-2 py-1">
                  <Text className="text-warning text-xs font-bold">Stage {app.stage}</Text>
                </View>
              </View>

              <View className="flex-row items-center gap-2 mb-3">
                <IconSymbol name="calendar" size={13} color={colors.muted} />
                <Text className="text-muted text-xs">
                  Submitted: {new Date(app.submittedAt).toLocaleDateString("en-GB")}
                </Text>
              </View>

              {app.adminNotes && (
                <View className="bg-warning/10 rounded-xl p-2 mb-3">
                  <Text className="text-warning text-xs">{app.adminNotes}</Text>
                </View>
              )}

              <View className="flex-row gap-2">
                <Pressable
                  onPress={() => handleReject(app.id, app.chefName)}
                  style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1, flex: 1 }]}
                >
                  <View className="bg-error/10 border border-error/30 rounded-xl py-2 items-center">
                    <Text className="text-error text-sm font-semibold">Reject</Text>
                  </View>
                </Pressable>
                <Pressable
                  onPress={() => handleApprove(app.id, app.chefName)}
                  style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1, flex: 2 }]}
                >
                  <View className="rounded-xl py-2 items-center" style={{ backgroundColor: ADMIN_COLOR }}>
                    <Text className="text-white text-sm font-bold">Approve Stage {app.stage}</Text>
                  </View>
                </Pressable>
              </View>
            </View>
          )}
        />
      )}
    </ScreenContainer>
  );
}
