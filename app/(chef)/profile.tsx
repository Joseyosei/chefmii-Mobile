import { router } from "expo-router";
import { Alert, Pressable, ScrollView, Switch, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useAuth } from "@/hooks/use-auth";
import { useColors } from "@/hooks/use-colors";
import { useChefMii } from "@/lib/chefmii-context";
import { useThemeContext } from "@/lib/theme-provider";
import { trpc } from "@/lib/trpc";

const BADGE_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  elite: { bg: "#FFD700", text: "#7B5800", label: "⭐ Elite Chef" },
  pro: { bg: "#C0C0C0", text: "#444", label: "✦ Pro Chef" },
  verified: { bg: "#4CAF50", text: "#fff", label: "✓ Verified Chef" },
  none: { bg: "#E5E7EB", text: "#687076", label: "Unverified" },
};

function ProfileMenuItem({
  icon,
  label,
  onPress,
  danger,
  badge,
  rightElement,
}: {
  icon: any;
  label: string;
  onPress: () => void;
  danger?: boolean;
  badge?: string;
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
        {badge && (
          <View className="bg-error rounded-full w-5 h-5 items-center justify-center">
            <Text className="text-white text-xs font-bold">{badge}</Text>
          </View>
        )}
        {rightElement ?? <IconSymbol name="chevron.right" size={16} color={colors.muted} />}
      </View>
    </Pressable>
  );
}

export default function ChefProfileScreen() {
  const { user, isAuthenticated, logout } = useAuth();
  const { clearRole } = useChefMii();
  const colors = useColors();
  const { colorScheme, setColorScheme } = useThemeContext();
  const isDark = colorScheme === "dark";

  const { data: myProfile } = trpc.chefs.getMyProfile.useQuery(undefined, { enabled: isAuthenticated });
  const { data: earnings } = trpc.bookings.getEarnings.useQuery();

  const badgeTier = myProfile?.badgeTier ?? "none";
  const badgeStyle = BADGE_STYLES[badgeTier] ?? BADGE_STYLES.none;

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
        <Text className="text-5xl mb-4">👨‍🍳</Text>
        <Text className="text-foreground text-xl font-bold mb-2">Chef Profile</Text>
        <Text className="text-muted text-center mb-6">Sign in to manage your chef profile</Text>
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
          <Text className="text-foreground text-lg font-bold">Chef Profile</Text>
          <View style={{ width: 22 }} />
        </View>

        {/* Profile Header */}
        <View className="px-5 pt-4 pb-4 items-center">
          <View className="w-24 h-24 bg-primary/20 rounded-full items-center justify-center mb-3">
            <Text className="text-primary text-4xl font-bold">
              {(user?.name ?? "C")[0].toUpperCase()}
            </Text>
          </View>
          <Text className="text-foreground text-xl font-bold">{user?.name ?? "Chef"}</Text>
          <Text className="text-muted text-sm mt-1">{user?.email}</Text>
          <View className="mt-2" style={{ backgroundColor: badgeStyle.bg, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 }}>
            <Text style={{ color: badgeStyle.text, fontWeight: "700", fontSize: 13 }}>{badgeStyle.label}</Text>
          </View>
        </View>

        {/* Stats */}
        <View className="mx-5 mb-5 bg-surface border border-border rounded-2xl p-4 flex-row">
          <View className="flex-1 items-center">
            <Text className="text-foreground font-bold text-xl">{earnings?.completed ?? 0}</Text>
            <Text className="text-muted text-xs mt-1">Completed</Text>
          </View>
          <View className="w-px bg-border" />
          <View className="flex-1 items-center">
            <Text className="text-foreground font-bold text-xl">£{Number(earnings?.total ?? 0).toFixed(0)}</Text>
            <Text className="text-muted text-xs mt-1">Earned</Text>
          </View>
          <View className="w-px bg-border" />
          <View className="flex-1 items-center">
            <Text className="text-foreground font-bold text-xl">{Number(myProfile?.avgRating ?? 0).toFixed(1)}</Text>
            <Text className="text-muted text-xs mt-1">Rating</Text>
          </View>
        </View>

        {/* Menu */}
        <View className="px-5">
          <Text className="text-muted text-xs font-semibold uppercase tracking-wider mb-2">Chef Tools</Text>
          <ProfileMenuItem icon="list.bullet" label="Manage Packages" onPress={() => router.push("/(chef)/packages" as never)} />
          <ProfileMenuItem icon="calendar" label="Set Availability" onPress={() => router.push("/(chef)/availability" as never)} />
          <ProfileMenuItem icon="dollarsign.circle.fill" label="Earnings & Payouts" onPress={() => router.push("/(chef)/earnings" as never)} />
          <ProfileMenuItem icon="checkmark.seal.fill" label="Verification Status" onPress={() => router.push("/(chef)/verification" as never)} />
          <ProfileMenuItem icon="photo.fill" label="Photo Gallery" onPress={() => router.push("/(chef)/gallery" as never)} />

          <Text className="text-muted text-xs font-semibold uppercase tracking-wider mb-2 mt-5">Account</Text>
          <ProfileMenuItem icon="person.fill" label="Edit Profile" onPress={() => router.push("/(chef)/edit-profile" as never)} />
          <ProfileMenuItem icon="bell.fill" label="Notifications" onPress={() => {}} />

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
          <ProfileMenuItem icon="info.circle.fill" label="How ChefMii Works" onPress={() => router.push("/(chef)/how-it-works" as never)} />
          <ProfileMenuItem icon="shield.fill" label="Privacy Policy" onPress={() => router.push("/(chef)/privacy-policy" as never)} />
          <ProfileMenuItem icon="doc.fill" label="Terms of Service" onPress={() => router.push("/(chef)/terms-of-service" as never)} />

          <View className="mt-5">
            <ProfileMenuItem icon="arrow.left" label="Sign Out" onPress={handleLogout} danger />
          </View>
        </View>

        {/* Switch to Client */}
        <View className="mx-5 mt-6 mb-8">
          <Pressable
            onPress={() => router.push("/onboarding/role-select" as never)}
            style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
          >
            <View className="bg-surface border border-border rounded-2xl py-3 items-center flex-row justify-center gap-2">
              <Text className="text-xl">👤</Text>
              <Text className="text-foreground font-semibold">Switch to Client Mode</Text>
            </View>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
