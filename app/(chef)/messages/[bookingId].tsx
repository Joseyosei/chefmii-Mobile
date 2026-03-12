import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { trpc } from "@/lib/trpc";
import { useColors } from "@/hooks/use-colors";
import { useAuth } from "@/hooks/use-auth";

export default function ChefMessageThreadScreen() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const { user } = useAuth();
  const colors = useColors();
  const [message, setMessage] = useState("");
  const flatListRef = useRef<FlatList>(null);

  const { data: messages, isLoading, refetch } = trpc.messages.listByBooking.useQuery(
    { bookingId: Number(bookingId) },
    { refetchInterval: 5000 }
  );

  const sendMessage = trpc.messages.send.useMutation({
    onSuccess: () => {
      setMessage("");
      refetch();
    },
  });

  useEffect(() => {
    if (messages && messages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages]);

  const handleSend = async () => {
    if (!message.trim()) return;
    await sendMessage.mutateAsync({ bookingId: Number(bookingId), content: message.trim() });
  };

  return (
    <ScreenContainer edges={["top", "left", "right"]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
        <View className="px-5 pt-4 pb-3 flex-row items-center gap-3 border-b border-border">
          <Pressable onPress={() => router.back()} style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}>
            <IconSymbol name="arrow.left" size={22} color={colors.foreground} />
          </Pressable>
          <View className="flex-1">
            <Text className="text-foreground font-bold text-base">Booking #{bookingId}</Text>
            <Text className="text-muted text-xs">Chat with client</Text>
          </View>
        </View>

        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages ?? []}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={{ padding: 16, gap: 8 }}
            ListEmptyComponent={
              <View className="items-center py-16">
                <Text className="text-4xl mb-3">💬</Text>
                <Text className="text-foreground font-semibold">No messages yet</Text>
                <Text className="text-muted text-center mt-1 text-sm">Start the conversation with your client</Text>
              </View>
            }
            renderItem={({ item: msg }) => {
              const isMe = msg.senderId === user?.id;
              return (
                <View className={`flex-row ${isMe ? "justify-end" : "justify-start"}`}>
                  {!isMe && (
                    <View className="w-8 h-8 bg-primary/20 rounded-full items-center justify-center mr-2 self-end">
                      <Text className="text-primary text-xs font-bold">
                        {(msg.senderName ?? "C")[0].toUpperCase()}
                      </Text>
                    </View>
                  )}
                  <View
                    className="rounded-2xl px-4 py-3 max-w-xs"
                    style={{
                      backgroundColor: isMe ? colors.primary : colors.surface,
                      borderWidth: isMe ? 0 : 1,
                      borderColor: colors.border,
                    }}
                  >
                    <Text style={{ color: isMe ? "#fff" : colors.foreground, fontSize: 14, lineHeight: 20 }}>
                      {msg.content}
                    </Text>
                    <Text style={{ color: isMe ? "rgba(255,255,255,0.7)" : colors.muted, fontSize: 10, marginTop: 4 }}>
                      {new Date(msg.createdAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                    </Text>
                  </View>
                </View>
              );
            }}
          />
        )}

        <View className="px-4 py-3 border-t border-border flex-row items-end gap-2">
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="Type a message..."
            placeholderTextColor={colors.muted}
            className="flex-1 bg-surface border border-border rounded-2xl px-4 py-3 text-foreground text-sm"
            multiline
            maxLength={500}
            returnKeyType="send"
            onSubmitEditing={handleSend}
          />
          <Pressable
            onPress={handleSend}
            disabled={!message.trim() || sendMessage.isPending}
            style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
          >
            <View
              className="w-11 h-11 rounded-full items-center justify-center"
              style={{ backgroundColor: message.trim() ? colors.primary : colors.border }}
            >
              {sendMessage.isPending ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <IconSymbol name="paperplane.fill" size={18} color="#fff" />
              )}
            </View>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
