import { startOAuthLogin } from "@/constants/oauth";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { ScreenContainer } from "@/components/screen-container";
import { useChefMii } from "@/lib/chefmii-context";
import { useColors } from "@/hooks/use-colors";

export default function LoginScreen() {
  const { role, setRole, setIsOnboarded } = useChefMii();
  const colors = useColors();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");

  const handleAuth = async () => {
    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email address");
      return;
    }
    if (isSignUp && !name.trim()) {
      Alert.alert("Error", "Please enter your name");
      return;
    }

    setIsLoading(true);
    try {
      // Use Manus OAuth login
      await startOAuthLogin();
      await setIsOnboarded(true);

      // Route based on role
      if (role === "chef") {
        router.replace("/(chef)/dashboard" as never);
      } else {
        router.replace("/(client)/home" as never);
      }
    } catch (err) {
      Alert.alert("Login Failed", "Please try again or use the Google sign-in option.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuth = async () => {
    setIsLoading(true);
    try {
      await startOAuthLogin();
      await setIsOnboarded(true);

      if (role === "chef") {
        router.replace("/(chef)/dashboard" as never);
      } else {
        router.replace("/(client)/home" as never);
      }
    } catch (err) {
      Alert.alert("Sign In Failed", "Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const roleLabel = role === "chef" ? "Chef" : "Client";
  const accentColor = role === "chef" ? colors.foreground : colors.primary;

  return (
    <ScreenContainer>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 px-6 pt-8 pb-6">
            {/* Back button */}
            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
              className="mb-6"
            >
              <Text className="text-primary text-base">← Back</Text>
            </Pressable>

            <Animated.View entering={FadeInDown.duration(400)}>
              <Text className="text-3xl font-bold text-foreground">
                {isSignUp ? `Join as ${roleLabel}` : `Welcome back`}
              </Text>
              <Text className="text-muted mt-2 text-base">
                {isSignUp
                  ? `Create your ChefMii ${roleLabel.toLowerCase()} account`
                  : "Sign in to your ChefMii account"}
              </Text>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(100).duration(400)} className="mt-8 gap-4">
              {/* Google OAuth Button */}
              <Pressable
                onPress={handleOAuth}
                disabled={isLoading}
                style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
              >
                <View className="bg-card border border-border rounded-2xl py-4 flex-row items-center justify-center gap-3">
                  <Text className="text-2xl">🔑</Text>
                  <Text className="text-foreground font-semibold text-base">
                    Continue with Google
                  </Text>
                </View>
              </Pressable>

              {/* Divider */}
              <View className="flex-row items-center gap-3">
                <View className="flex-1 h-px bg-border" />
                <Text className="text-muted text-sm">or</Text>
                <View className="flex-1 h-px bg-border" />
              </View>

              {/* Name field (sign up only) */}
              {isSignUp && (
                <View>
                  <Text className="text-foreground font-medium mb-2">Full Name</Text>
                  <TextInput
                    value={name}
                    onChangeText={setName}
                    placeholder="Your full name"
                    placeholderTextColor={colors.muted}
                    className="bg-surface border border-border rounded-2xl px-4 py-4 text-foreground text-base"
                    autoCapitalize="words"
                  />
                </View>
              )}

              {/* Email field */}
              <View>
                <Text className="text-foreground font-medium mb-2">Email Address</Text>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="you@example.com"
                  placeholderTextColor={colors.muted}
                  className="bg-surface border border-border rounded-2xl px-4 py-4 text-foreground text-base"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
              </View>

              {/* Password field */}
              <View>
                <Text className="text-foreground font-medium mb-2">Password</Text>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter your password"
                  placeholderTextColor={colors.muted}
                  className="bg-surface border border-border rounded-2xl px-4 py-4 text-foreground text-base"
                  secureTextEntry
                  autoComplete="password"
                />
              </View>

              {/* Forgot password */}
              {!isSignUp && (
                <Pressable
                  style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
                  className="self-end"
                >
                  <Text className="text-primary text-sm">Forgot password?</Text>
                </Pressable>
              )}

              {/* Submit button */}
              <Pressable
                onPress={handleAuth}
                disabled={isLoading}
                style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
              >
                <View
                  className="rounded-2xl py-4 items-center mt-2"
                  style={{ backgroundColor: accentColor }}
                >
                  {isLoading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text className="text-white font-bold text-base">
                      {isSignUp ? "Create Account" : "Sign In"}
                    </Text>
                  )}
                </View>
              </Pressable>

              {/* Toggle sign up / sign in */}
              <Pressable
                onPress={() => setIsSignUp(!isSignUp)}
                style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
                className="items-center mt-2"
              >
                <Text className="text-muted text-sm">
                  {isSignUp ? "Already have an account? " : "Don't have an account? "}
                  <Text className="text-primary font-semibold">
                    {isSignUp ? "Sign In" : "Sign Up"}
                  </Text>
                </Text>
              </Pressable>
            </Animated.View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
