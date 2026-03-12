import { Tabs } from "expo-router";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { IconSymbol } from "@/components/ui/icon-symbol";

// Brand constants
const ACTIVE_COLOR = "#F4A227"; // Saffron gold — active tab
const INACTIVE_COLOR = "#9CA3AF"; // Grey — inactive tabs
const TAB_BAR_BG = "#1C1C1E"; // Dark background
const TAB_BAR_BORDER = "#2C2C2E"; // Subtle dark border

export default function ClientLayout() {
  const insets = useSafeAreaInsets();
  // iOS home indicator needs extra bottom padding; Android and web use a fixed value
  const bottomPadding = Platform.OS === "ios" ? Math.max(insets.bottom, 12) : 12;
  const tabBarHeight = 56 + bottomPadding;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: ACTIVE_COLOR,
        tabBarInactiveTintColor: INACTIVE_COLOR,
        tabBarStyle: {
          paddingTop: 8,
          paddingBottom: bottomPadding,
          height: tabBarHeight,
          backgroundColor: TAB_BAR_BG,
          borderTopColor: TAB_BAR_BORDER,
          borderTopWidth: 0.5,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          // Prevent truncation: ensure the label has enough room
          flexShrink: 0,
        },
        // Prevent icon + label from being squished
        tabBarItemStyle: {
          paddingHorizontal: 0,
        },
      }}
    >
      {/* ── The 5 visible tabs ── */}
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <IconSymbol name="house.fill" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          tabBarIcon: ({ color }) => (
            <IconSymbol name="magnifyingglass" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          title: "Bookings",
          tabBarIcon: ({ color }) => (
            <IconSymbol name="calendar" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: "Messages",
          tabBarIcon: ({ color }) => (
            <IconSymbol name="message.fill" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <IconSymbol name="person.fill" size={24} color={color} />
          ),
        }}
      />

      {/* ── All other screens: hidden from tab bar (href: null) ── */}
      <Tabs.Screen name="booking" options={{ href: null }} />
      <Tabs.Screen name="chef" options={{ href: null }} />
      <Tabs.Screen name="edit-profile" options={{ href: null }} />
      <Tabs.Screen name="how-it-works" options={{ href: null }} />
      <Tabs.Screen name="messages/[bookingId]" options={{ href: null }} />
      <Tabs.Screen name="notifications" options={{ href: null }} />
      <Tabs.Screen name="privacy-policy" options={{ href: null }} />
      <Tabs.Screen name="review" options={{ href: null }} />
      <Tabs.Screen name="saved" options={{ href: null }} />
      <Tabs.Screen name="terms-of-service" options={{ href: null }} />
    </Tabs>
  );
}
