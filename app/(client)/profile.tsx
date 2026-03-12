import { router } from "expo-router";
import { Alert, Pressable, ScrollView, Switch, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useAuth } from "@/hooks/use-auth";
import { useColors } from "@/hooks/use-colors";
import { useChefMii } from "@/lib/chefmii-context";
import { useThemeContext } from "@/lib/theme-provider";
import { trpc } from "@/lib/trpc";

function ProfileMenuItem({
  icon,
  label,
  onPress,
  danger,
  rightElement,
}: {
  icon: any;
  label: string;
  onPress: () => void;
  danger?: boolean;
  rightElement?: React.ReactNode;
}) {
  const colors = useColors();
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}>
      <View className="flex-row items-center gap-3 py-4 border-b border-border">
        <View className="w-9 h-9 bg-surface rounded-xl items-center justify-center border border-border">
          <IconSymbol name={icon} size={18} color={danger ? "#EF4444" : colors.foreground} />
        </View>
        <Text className="flex-1 text-foreground text-base" style={{ color: danger ? "#EF4444" : undefined }}>
          {label}
        </Text>
        {rightElement ?? <IconSymbol name="chevron.right" size={16} color={colors.muted} />}
      </View>
    </Pressable>
  );
}

export default function ClientProfileScreen() {
  const { user, isAuthenticated, logout } = useAuth();
  const { clearRole } = useChefMii();
  const colors = useColors();
  const { colorScheme, setColorScheme } = useThemeContext();
  const isDark = colorScheme === "dark";

  const { data: savedChefs } = trpc.savedChefs.list.useQuery(undefined, { enabled: isAuthenticated });
  const { data: bookings } = trpc.bookings.listMine.useQuery({ status: "all", role: "client" }, { enabled: isAuthenticated });

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await logout();
          await clearRole();
          router.replace("/onboarding/splash" as never);
        },
      },
    ]);
  };

  if (!isAuthenticated) {
    return (
      <ScreenContainer className="items-center justify-center px-6">
        <Text className="text-5xl mb-4">👤</Text>
        <Text className="text-foreground text-xl font-bold mb-2">Your Profile</Text>
        <Text className="text-muted text-center mb-6">Sign in to manage your profile and bookings</Text>
        <Pressable onPress={() => router.push("/auth/login" as never)} style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}>
          <View className="bg-primary rounded-2xl px-8 py-3">
            <Text className="text-white font-bold">Sign In</Text>
          </View>
        </Pressable>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header with back button */}
        <View className="px-5 pt-4 pb-2 flex-row items-center justify-between">
          <Pressable onPress={() => router.back()} style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}>
            <IconSymbol name="arrow.left" size={22} color={colors.foreground} />
          </Pressable>
          <Text className="text-foreground text-lg font-bold">Profile</Text>
          <View style={{ width: 22 }} />
        </View>

        {/* Profile Header */}
        <View className="px-5 pt-4 pb-4 items-center">
          <View className="w-20 h-20 bg-primary/20 rounded-full items-center justify-center mb-3">
            <Text className="text-primary text-3xl font-bold">
              {(user?.name ?? "U")[0].toUpperCase()}
            </Text>
          </View>
          <Text className="text-foreground text-xl font-bold">{user?.name ?? "User"}</Text>
          <Text className="text-muted text-sm mt-1">{user?.email}</Text>
        </View>

        {/* Stats */}
        <View className="mx-5 mb-5 bg-surface border border-border rounded-2xl p-4 flex-row">
          <View className="flex-1 items-center">
            <Text className="text-foreground font-bold text-xl">{bookings?.length ?? 0}</Text>
            <Text className="text-muted text-xs mt-1">Bookings</Text>
          </View>
          <View className="w-px bg-border" />
          <View className="flex-1 items-center">
            <Text className="text-foreground font-bold text-xl">{savedChefs?.length ?? 0}</Text>
            <Text className="text-muted text-xs mt-1">Saved Chefs</Text>
          </View>
          <View className="w-px bg-border" />
          <View className="flex-1 items-center">
            <Text className="text-foreground font-bold text-xl">
              {bookings?.filter((b) => b.status === "completed").length ?? 0}
            </Text>
            <Text className="text-muted text-xs mt-1">Completed</Text>
          </View>
        </View>

        {/* Menu Items */}
        <View className="px-5">
          <Text className="text-muted text-xs font-semibold uppercase tracking-wider mb-2">Account</Text>
          <ProfileMenuItem icon="person.fill" label="Edit Profile" onPress={() => router.push("/(client)/edit-profile" as never)} />
          <ProfileMenuItem icon="bell.fill" label="Notifications" onPress={() => router.push("/(client)/notifications" as never)} />
          <ProfileMenuItem icon="heart.fill" label="Saved Chefs" onPress={() => router.push("/(client)/saved" as never)} />

          {/* Dark Mode Toggle */}
          <View className="flex-row items-center gap-3 py-4 border-b border-border">
            <View className="w-9 h-9 bg-surface rounded-xl items-center justify-center border border-border">
              <IconSymbol name={isDark ? "moon.fill" : "sun.max.fill"} size={18} color={colors.foreground} />
            </View>
            <Text className="flex-1 text-foreground text-base">{isDark ? "Dark Mode" : "Light Mode"}</Text>
            <Switch
              value={isDark}
              onValueChange={(val) => setColorScheme(val ? "dark" : "light")}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#fff"
            />
          </View>

          <Text className="text-muted text-xs font-semibold uppercase tracking-wider mb-2 mt-5">Support</Text>
          <ProfileMenuItem icon="info.circle.fill" label="How ChefMii Works" onPress={() => router.push("/(client)/how-it-works" as never)} />
          <ProfileMenuItem icon="shield.fill" label="Privacy Policy" onPress={() => router.push("/(client)/privacy-policy" as never)} />
          <ProfileMenuItem icon="doc.fill" label="Terms of Service" onPress={() => router.push("/(client)/terms-of-service" as never)} />

          <View className="mt-5">
            <ProfileMenuItem icon="arrow.left" label="Sign Out" onPress={handleLogout} danger />
          </View>
        </View>

        {/* Switch to Chef */}
        <View className="mx-5 mt-6 mb-8">
          <Pressable
            onPress={() => router.push("/onboarding/role-select" as never)}
            style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
          >
            <View className="bg-surface border border-border rounded-2xl py-3 items-center flex-row justify-center gap-2">
              <Text className="text-xl">👨‍🍳</Text>
              <Text className="text-foreground font-semibold">Are you a chef? Join as Chef</Text>
            </View>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
