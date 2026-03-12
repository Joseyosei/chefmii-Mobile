import { router } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";

const STEPS = [
  { number: "01", emoji: "📝", title: "Create Your Profile", description: "Sign up and build your chef profile. Add your bio, cuisine specialties, years of experience, location, and a professional photo. A complete profile attracts more bookings." },
  { number: "02", emoji: "✅", title: "Complete Verification", description: "Complete our 3-stage verification: submit a government-issued ID, upload your culinary credentials, and provide your food safety certificate. Verified chefs earn a badge and appear higher in search results." },
  { number: "03", emoji: "📦", title: "Create Your Packages", description: "Build tailored packages for different occasions and group sizes. Set your price, describe the menu, and specify the number of guests. Include your labour cost and ingredient cost so clients see a transparent breakdown." },
  { number: "04", emoji: "📅", title: "Set Your Availability", description: "Mark the days and times you are available to take bookings. Keep your calendar up to date to avoid conflicts and missed opportunities." },
  { number: "05", emoji: "🔔", title: "Receive Booking Requests", description: "When a client requests a booking, you'll receive an instant notification. Review the details — date, time, guests, address, dietary requirements — and accept or decline within 24 hours." },
  { number: "06", emoji: "💬", title: "Chat with Clients", description: "Once you accept a booking, you can message the client directly through the app to discuss menu details, kitchen access, special requests, or any other logistics." },
  { number: "07", emoji: "🍽️", title: "Cook & Get Paid", description: "Arrive at the client's location, deliver an exceptional dining experience, and leave the kitchen spotless. Your earnings (85% of the package price) are transferred to your bank account within 3-5 business days." },
];

export default function ChefHowItWorksScreen() {
  const colors = useColors();
  return (
    <ScreenContainer>
      <View className="px-5 pt-4 pb-2 flex-row items-center gap-3">
        <Pressable onPress={() => router.back()} style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}>
          <IconSymbol name="arrow.left" size={22} color={colors.foreground} />
        </Pressable>
        <Text className="text-foreground text-xl font-bold">How ChefMii Works</Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View className="px-5 py-6 items-center">
          <Text className="text-5xl mb-3">👨‍🍳</Text>
          <Text className="text-foreground text-2xl font-bold text-center mb-2">Grow Your Chef Business{"\n"}with ChefMii</Text>
          <Text className="text-muted text-sm text-center leading-5">Join our marketplace of verified professional private chefs and reach clients looking for unforgettable dining experiences.</Text>
        </View>
        <View className="px-5">
          {STEPS.map((step, i) => (
            <View key={i} className="flex-row gap-4 mb-6">
              <View className="items-center">
                <View className="w-12 h-12 rounded-2xl items-center justify-center" style={{ backgroundColor: colors.primary + "20" }}>
                  <Text className="text-2xl">{step.emoji}</Text>
                </View>
                {i < STEPS.length - 1 && <View className="w-0.5 flex-1 mt-2" style={{ backgroundColor: colors.border }} />}
              </View>
              <View className="flex-1 pb-4">
                <Text className="text-muted text-xs font-bold mb-0.5">STEP {step.number}</Text>
                <Text className="text-foreground font-bold text-base mb-1">{step.title}</Text>
                <Text className="text-muted text-sm leading-5">{step.description}</Text>
              </View>
            </View>
          ))}
        </View>
        <View className="px-5 mt-2">
          <Pressable onPress={() => router.push("/(chef)/edit-profile" as never)} style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}>
            <View className="bg-primary rounded-2xl py-4 items-center">
              <Text className="text-white font-bold text-base">Complete Your Profile</Text>
            </View>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
