import { router } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";

const STEPS = [
  {
    number: "01",
    emoji: "🔍",
    title: "Browse & Discover",
    description:
      "Search our curated marketplace of verified professional private chefs. Filter by cuisine, occasion, location, price, and availability. Read detailed profiles, view menus, check ratings, and browse photo galleries to find the perfect chef for your event.",
  },
  {
    number: "02",
    emoji: "📋",
    title: "Choose Your Package",
    description:
      "Each chef offers tailored packages designed for different occasions — from intimate date nights and family feasts to corporate events, weddings, and honeymoons. Packages include a full menu, the chef's labour, and all ingredients. Prices are transparent with no hidden fees.",
  },
  {
    number: "03",
    emoji: "📅",
    title: "Book Your Date",
    description:
      "Select your preferred date and time, enter the number of guests and the event address, and share any dietary requirements or allergies. Our booking form is simple and takes less than 2 minutes to complete.",
  },
  {
    number: "04",
    emoji: "✅",
    title: "Chef Confirms",
    description:
      "Your booking request is sent directly to the chef. They will review your details and confirm within 24 hours. You'll receive a notification as soon as they accept. Payment is only processed after confirmation — you're never charged until the chef says yes.",
  },
  {
    number: "05",
    emoji: "💬",
    title: "Chat with Your Chef",
    description:
      "Once confirmed, you can message your chef directly through the app to discuss menu preferences, special requests, kitchen access, or any other details. Our in-app messaging keeps everything in one place.",
  },
  {
    number: "06",
    emoji: "🍽️",
    title: "Enjoy Your Experience",
    description:
      "Your chef arrives at your home or venue, sets up their kitchen station, prepares a restaurant-quality meal, and leaves your kitchen spotless. Sit back, relax, and enjoy a truly personal dining experience.",
  },
  {
    number: "07",
    emoji: "⭐",
    title: "Rate & Review",
    description:
      "After your experience, leave a detailed review rating the chef on food quality, presentation, professionalism, and value. Your feedback helps other clients make informed choices and helps great chefs grow their reputation on ChefMii.",
  },
];

const FAQS = [
  {
    q: "How are chefs verified?",
    a: "Every chef on ChefMii completes a 3-stage verification process: identity verification (government-issued ID), culinary credentials review (qualifications and professional references), and food safety certification (Level 2 or Level 3 Food Hygiene certificate). Verified chefs earn a badge displayed on their profile.",
  },
  {
    q: "What occasions can I book a chef for?",
    a: "ChefMii chefs are available for any occasion — date nights, birthday dinners, wedding receptions, honeymoon meals, family feasts, corporate lunches, sports events, entertainment venues, and more. If you have a special request, just message the chef directly.",
  },
  {
    q: "What is included in the package price?",
    a: "Each package price covers the chef's labour (preparation time, cooking, and service) plus all ingredients. A 15% platform fee is added at checkout to cover secure payment processing, customer support, and platform maintenance.",
  },
  {
    q: "Can I cancel or reschedule?",
    a: "Yes. Cancellations made more than 48 hours before the booking are fully refunded. Cancellations within 48 hours may incur a fee. To reschedule, contact your chef via in-app messaging or reach our support team at support@chefmii.com.",
  },
  {
    q: "Is my payment secure?",
    a: "All payments are processed through Stripe, one of the world's most trusted payment platforms. Your card details are never stored on ChefMii's servers. Payments are held securely until the chef confirms your booking.",
  },
];

export default function HowItWorksScreen() {
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
        {/* Hero */}
        <View className="px-5 py-6 items-center">
          <Text className="text-5xl mb-3">👨‍🍳</Text>
          <Text className="text-foreground text-2xl font-bold text-center mb-2">
            Your Personal Chef,{"\n"}Anywhere, Any Occasion
          </Text>
          <Text className="text-muted text-sm text-center leading-5">
            ChefMii connects you with verified professional private chefs for unforgettable in-home and event dining experiences.
          </Text>
        </View>

        {/* Steps */}
        <View className="px-5">
          <Text className="text-foreground text-lg font-bold mb-4">How It Works</Text>
          {STEPS.map((step, i) => (
            <View key={i} className="flex-row gap-4 mb-6">
              <View className="items-center">
                <View
                  className="w-12 h-12 rounded-2xl items-center justify-center"
                  style={{ backgroundColor: colors.primary + "20" }}
                >
                  <Text className="text-2xl">{step.emoji}</Text>
                </View>
                {i < STEPS.length - 1 && (
                  <View className="w-0.5 flex-1 mt-2" style={{ backgroundColor: colors.border }} />
                )}
              </View>
              <View className="flex-1 pb-4">
                <Text className="text-muted text-xs font-bold mb-0.5">STEP {step.number}</Text>
                <Text className="text-foreground font-bold text-base mb-1">{step.title}</Text>
                <Text className="text-muted text-sm leading-5">{step.description}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* FAQ */}
        <View className="px-5 mt-2">
          <Text className="text-foreground text-lg font-bold mb-4">Frequently Asked Questions</Text>
          {FAQS.map((faq, i) => (
            <View key={i} className="mb-5 bg-surface border border-border rounded-2xl p-4">
              <Text className="text-foreground font-semibold text-sm mb-2">{faq.q}</Text>
              <Text className="text-muted text-sm leading-5">{faq.a}</Text>
            </View>
          ))}
        </View>

        {/* CTA */}
        <View className="px-5 mt-2">
          <Pressable
            onPress={() => router.push("/(client)/search" as never)}
            style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
          >
            <View className="bg-primary rounded-2xl py-4 items-center">
              <Text className="text-white font-bold text-base">Browse Chefs Now</Text>
            </View>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
