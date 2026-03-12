import { useAuth } from "@/hooks/use-auth";
import { useChefMii } from "@/lib/chefmii-context";
import { router } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { useColors } from "@/hooks/use-colors";

export default function IndexScreen() {
  const { isAuthenticated, loading } = useAuth();
  const { role, isOnboarded } = useChefMii();
  const colors = useColors();

  useEffect(() => {
    if (loading) return;

    if (!isOnboarded || !isAuthenticated) {
      router.replace("/onboarding/splash" as never);
      return;
    }

    if (role === "chef") {
      router.replace("/(chef)/dashboard" as never);
    } else if (role === "admin") {
      router.replace("/(admin)/dashboard" as never);
    } else {
      router.replace("/(client)/home" as never);
    }
  }, [loading, isAuthenticated, role, isOnboarded]);

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}
