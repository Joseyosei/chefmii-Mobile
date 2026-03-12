// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { SymbolWeight, SymbolViewProps } from "expo-symbols";
import { ComponentProps } from "react";
import { OpaqueColorValue, type StyleProp, type TextStyle } from "react-native";

type IconMapping = Record<SymbolViewProps["name"], ComponentProps<typeof MaterialIcons>["name"]>;
type IconSymbolName = keyof typeof MAPPING;

const MAPPING = {
  // Navigation
  "house.fill": "home",
  "magnifyingglass": "search",
  "calendar": "calendar-today",
  "message.fill": "chat",
  "person.fill": "person",
  "bell.fill": "notifications",
  "gear": "settings",
  // Chef
  "fork.knife": "restaurant",
  "star.fill": "star",
  "star": "star-border",
  "checkmark.seal.fill": "verified",
  "checkmark.circle.fill": "check-circle",
  "clock.fill": "schedule",
  "location.fill": "location-on",
  "creditcard.fill": "credit-card",
  "dollarsign.circle.fill": "attach-money",
  "chart.bar.fill": "bar-chart",
  "list.bullet": "list",
  "plus.circle.fill": "add-circle",
  "pencil": "edit",
  "trash.fill": "delete",
  "xmark.circle.fill": "cancel",
  "arrow.left": "arrow-back",
  "arrow.right": "arrow-forward",
  "chevron.right": "chevron-right",
  "chevron.left": "chevron-left",
  "chevron.down": "expand-more",
  "chevron.up": "expand-less",
  "heart.fill": "favorite",
  "heart": "favorite-border",
  "photo.fill": "photo",
  "camera.fill": "camera-alt",
  "paperplane.fill": "send",
  "chevron.left.forwardslash.chevron.right": "code",
  "person.2.fill": "group",
  "shield.fill": "shield",
  "exclamationmark.circle.fill": "error",
  "info.circle.fill": "info",
  "checkmark": "check",
  "xmark": "close",
  "ellipsis": "more-horiz",
  "square.and.arrow.up": "share",
  "doc.fill": "description",
  "lock.fill": "lock",
  "eye.fill": "visibility",
  "eye.slash.fill": "visibility-off",
  "trophy.fill": "emoji-events",
  "flame.fill": "local-fire-department",
  "sparkles": "auto-awesome",
  "person.text.rectangle.fill": "badge",
  "graduationcap.fill": "school",
  "magnifyingglass.circle.fill": "manage-search",
  "arrow.up.right": "north-east",
  "calendar.badge.plus": "event",
} as IconMapping;

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
