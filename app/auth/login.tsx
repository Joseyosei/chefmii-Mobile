import { startOAuthLogin } from "@/constants/oauth";
import { router } from "expo-router";
import { useState, useEffect } from "react";
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
import * as Auth from "@/lib/_core/auth";
import * as Api from "@/lib/_core/api";
import Constants from "expo-constants";

// Detect Expo Go: Apple Sign-In requires a real signed build with the correct bundle ID.
// In Expo Go, the app runs under Expo's bundle ID so Apple rejects the identity token.
const isExpoGo =
  Constants.executionEnvironment === "storeClient" ||
  (Constants as any).appOwnership === "expo";

// Conditionally import Apple authentication (iOS only, not in Expo Go)
let AppleAuthentication: typeof import("expo-apple-authentication") | null = null;
if (Platform.OS === "ios" && !isExpoGo) {
  try {
    AppleAuthentication = require("expo-apple-authentication");
  } catch {
    AppleAuthentication = null;
  }
}

export default function LoginScreen() {
  const { role, setIsOnboarded } = useChefMii();
  const colors = useColors();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");
  const [appleAvailable, setAppleAvailable] = useState(false);

  useEffect(() => {
    if (Platform.OS === "ios" && !isExpoGo && AppleAuthentication) {
      AppleAuthentication.isAvailableAsync()
        .then(setAppleAvailable)
        .catch(() => setAppleAvailable(false));
    }
  }, []);

  const navigateAfterAuth = async () => {
    await setIsOnboarded(true);
    if (role === "chef") {
      router.replace("/(chef)/dashboard" as never);
    } else {
      router.replace("/(client)/home" as never);
    }
  };

  const handleOAuth = async () => {
    setIsLoading(true);
    try {
      // startOAuthLogin uses WebBrowser.openAuthSessionAsync on native.
      // Opens SFSafariViewController / Chrome Custom Tab with the Manus OAuth portal.
      // Server callback at /api/oauth/callback exchanges the code, sets a cookie,
      // and redirects back to the frontend URL with sessionToken as a query param.
      const oauthResult = await startOAuthLogin();

      if (oauthResult) {
        const { sessionToken, user: oauthUser } = oauthResult;
        // Store the session token in SecureStore — this is all we need for native auth.
        // All subsequent API calls will include this as a Bearer token in the Authorization header.
        await Auth.setSessionToken(sessionToken);
        // Also store user info so useAuth hook can find it immediately without an API call.
        if (oauthUser) {
          const userInfo: Auth.User = {
            id: oauthUser.id ?? 0,
            openId: oauthUser.openId ?? "",
            name: oauthUser.name ?? null,
            email: oauthUser.email ?? null,
            loginMethod: oauthUser.loginMethod ?? "google",
            lastSignedIn: new Date(oauthUser.lastSignedIn || Date.now()),
          };
          await Auth.setUserInfo(userInfo);
        }
        await navigateAfterAuth();
      } else {
        // Web path: session is set via cookie. On native, null means user cancelled.
        if (Platform.OS === "web") {
          const user = await Api.getMe();
          if (user) {
            await navigateAfterAuth();
          }
        } else {
          // User likely cancelled the browser — no error shown
          console.log("[OAuth] No session token returned — user may have cancelled");
        }
      }
    } catch (err) {
      console.error("[OAuth] handleOAuth error:", err);
      Alert.alert("Sign In Failed", "Could not complete sign-in. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    if (!AppleAuthentication || isExpoGo) return;
    setIsLoading(true);
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (!credential.identityToken) {
        Alert.alert("Sign In Failed", "Apple did not return an identity token.");
        return;
      }

      const result = await Api.signInWithApple(
        credential.identityToken,
        credential.fullName,
        credential.email,
      );

      if (result.sessionToken) {
        await Auth.setSessionToken(result.sessionToken);
        if (result.user) {
          const userInfo: Auth.User = {
            id: result.user.id,
            openId: result.user.openId,
            name: result.user.name,
            email: result.user.email,
            loginMethod: result.user.loginMethod,
            lastSignedIn: new Date(result.user.lastSignedIn || Date.now()),
          };
          await Auth.setUserInfo(userInfo);
        }
        await navigateAfterAuth();
      } else {
        Alert.alert("Sign In Failed", "Could not complete Apple Sign-In. Please try again.");
      }
    } catch (err: any) {
      if (err?.code === "ERR_REQUEST_CANCELED") {
        // User cancelled — no error shown
      } else {
        console.error("[AppleAuth] Error:", err);
        Alert.alert("Sign In Failed", "Apple Sign-In failed. Please try again.");
      }
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
                style={({ pressed }) => ({
                  opacity: pressed ? 0.85 : 1,
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderWidth: 1,
                  borderRadius: 16,
                  paddingVertical: 16,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                })}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <>
                    {/* Google G logo — rendered as coloured text since no SVG needed */}
                    <View
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 12,
                        backgroundColor: "#fff",
                        alignItems: "center",
                        justifyContent: "center",
                        borderWidth: 1,
                        borderColor: "#E5E7EB",
                      }}
                    >
                      <Text style={{ fontSize: 14, fontWeight: "700", color: "#4285F4" }}>G</Text>
                    </View>
                    <Text style={{ color: colors.foreground, fontWeight: "600", fontSize: 16 }}>
                      Continue with Google
                    </Text>
                  </>
                )}
              </Pressable>

              {/* Apple Sign-In (iOS only, not in Expo Go) */}
              {appleAvailable && AppleAuthentication && !isExpoGo && (
                <AppleAuthentication.AppleAuthenticationButton
                  buttonType={
                    isSignUp
                      ? AppleAuthentication.AppleAuthenticationButtonType.SIGN_UP
                      : AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN
                  }
                  buttonStyle={
                    colors.background === "#FFFFFF" || colors.background === "#ffffff"
                      ? AppleAuthentication.AppleAuthenticationButtonStyle.BLACK
                      : AppleAuthentication.AppleAuthenticationButtonStyle.WHITE
                  }
                  cornerRadius={16}
                  style={{ width: "100%", height: 56 }}
                  onPress={handleAppleSignIn}
                />
              )}

              {/* Divider */}
              <View className="flex-row items-center gap-3">
                <View className="flex-1 h-px bg-border" />
                <Text className="text-muted text-sm">or continue with email</Text>
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

              {/* Submit button — triggers Google OAuth */}
              <Pressable
                onPress={handleOAuth}
                disabled={isLoading}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.85 : 1,
                  backgroundColor: accentColor,
                  borderRadius: 16,
                  paddingVertical: 16,
                  alignItems: "center",
                  marginTop: 8,
                })}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={{ color: "white", fontWeight: "700", fontSize: 16 }}>
                    {isSignUp ? "Create Account" : "Sign In"}
                  </Text>
                )}
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
