import { router } from "expo-router";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { trpc } from "@/lib/trpc";
import { useColors } from "@/hooks/use-colors";

const STAGES = [
  {
    stage: 1,
    title: "Identity Verification",
    description: "Submit a government-issued ID (passport or driving licence) for identity confirmation.",
    icon: "person.text.rectangle.fill",
    color: "#6366F1",
  },
  {
    stage: 2,
    title: "Culinary Credentials",
    description: "Upload your culinary qualifications, certifications, or professional references.",
    icon: "graduationcap.fill",
    color: "#F59E0B",
  },
  {
    stage: 3,
    title: "Food Safety Certificate",
    description: "Provide a valid Level 2 or Level 3 Food Hygiene certificate.",
    icon: "checkmark.seal.fill",
    color: "#22C55E",
  },
];

export default function ChefVerificationScreen() {
  const colors = useColors();
  const { data: myProfile, refetch } = trpc.chefs.getMyProfile.useQuery();

  const currentStage = myProfile?.verificationStage ?? 0;
  const badgeTier = myProfile?.badgeTier ?? "none";
  const isVerified = badgeTier !== "none";

  const handleStagePress = (stage: number) => {
    if (stage <= currentStage) {
      Alert.alert("Already Submitted", "This stage has already been submitted for review.");
      return;
    }
    if (stage > currentStage + 1) {
      Alert.alert("Complete Previous Stage", "Please complete the previous verification stage first.");
      return;
    }
    Alert.alert(
      `Submit Stage ${stage}`,
      `This will submit your documents for Stage ${stage} verification. In the full app, you would upload your documents here. For demo purposes, this will advance your verification stage.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Submit",
          onPress: () => {
            Alert.alert("Submitted!", `Stage ${stage} documents submitted for review. You'll be notified once approved.`);
          },
        },
      ]
    );
  };

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="px-5 pt-4 pb-2 flex-row items-center gap-3">
          <Pressable onPress={() => router.back()} style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}>
            <IconSymbol name="arrow.left" size={22} color={colors.foreground} />
          </Pressable>
          <Text className="text-foreground text-xl font-bold">Verification</Text>
        </View>

        <View className="px-5 py-4 gap-5">
          {/* Status Banner */}
          {isVerified ? (
            <View className="bg-success/10 border border-success/20 rounded-2xl p-4 flex-row items-center gap-3">
              <IconSymbol name="checkmark.seal.fill" size={28} color="#22C55E" />
              <View className="flex-1">
                <Text className="text-success font-bold text-base">Verified Chef ✓</Text>
                <Text className="text-muted text-sm mt-0.5">Your profile is verified and visible to clients</Text>
              </View>
            </View>
          ) : (
            <View className="bg-warning/10 border border-warning/20 rounded-2xl p-4">
              <Text className="text-warning font-bold mb-1">Verification Required</Text>
              <Text className="text-muted text-sm leading-relaxed">
                Complete all 3 stages to get your Verified Chef badge and start accepting bookings. Verified chefs appear higher in search results.
              </Text>
            </View>
          )}

          {/* Progress */}
          <View className="bg-surface border border-border rounded-2xl p-4">
            <Text className="text-foreground font-bold mb-3">Progress</Text>
            <View className="flex-row items-center gap-2">
              {[1, 2, 3].map((s) => (
                <View key={s} className="flex-row items-center flex-1">
                  <View
                    className="w-8 h-8 rounded-full items-center justify-center"
                    style={{ backgroundColor: s <= currentStage ? "#22C55E" : s === currentStage + 1 ? colors.primary : colors.border }}
                  >
                    {s <= currentStage ? (
                      <IconSymbol name="checkmark" size={14} color="#fff" />
                    ) : (
                      <Text style={{ color: s === currentStage + 1 ? "#fff" : colors.muted, fontWeight: "700", fontSize: 12 }}>{s}</Text>
                    )}
                  </View>
                  {s < 3 && (
                    <View className="flex-1 h-0.5 mx-1" style={{ backgroundColor: s < currentStage ? "#22C55E" : colors.border }} />
                  )}
                </View>
              ))}
            </View>
            <Text className="text-muted text-xs mt-3">
              {currentStage === 0 ? "Start your verification journey" : currentStage === 3 ? "All stages complete — awaiting final review" : `Stage ${currentStage} complete · ${3 - currentStage} remaining`}
            </Text>
          </View>

          {/* Stages */}
          {STAGES.map((stage) => {
            const isComplete = stage.stage <= currentStage;
            const isNext = stage.stage === currentStage + 1;
            const isLocked = stage.stage > currentStage + 1;

            return (
              <Pressable
                key={stage.stage}
                onPress={() => handleStagePress(stage.stage)}
                disabled={isLocked}
                style={({ pressed }) => [{ opacity: pressed ? 0.85 : isLocked ? 0.5 : 1 }]}
              >
                <View className="bg-surface border border-border rounded-2xl p-4 flex-row gap-3">
                  <View
                    className="w-12 h-12 rounded-2xl items-center justify-center"
                    style={{ backgroundColor: `${stage.color}20` }}
                  >
                    <IconSymbol name={stage.icon as any} size={24} color={isComplete ? "#22C55E" : stage.color} />
                  </View>
                  <View className="flex-1">
                    <View className="flex-row items-center gap-2 mb-1">
                      <Text className="text-foreground font-bold text-base">{stage.title}</Text>
                      {isComplete && <IconSymbol name="checkmark.circle.fill" size={16} color="#22C55E" />}
                      {isNext && (
                        <View className="bg-primary rounded-full px-2 py-0.5">
                          <Text className="text-white text-xs font-bold">Next</Text>
                        </View>
                      )}
                    </View>
                    <Text className="text-muted text-sm leading-relaxed">{stage.description}</Text>
                    {isNext && (
                      <View className="mt-3">
                        <View className="bg-primary rounded-xl py-2 items-center">
                          <Text className="text-white text-sm font-bold">Submit Documents</Text>
                        </View>
                      </View>
                    )}
                  </View>
                </View>
              </Pressable>
            );
          })}

          {/* Badge Tiers */}
          <View className="bg-surface border border-border rounded-2xl p-4">
            <Text className="text-foreground font-bold mb-3">Badge Tiers</Text>
            {[
              { tier: "Verified", color: "#4CAF50", desc: "Complete all 3 verification stages" },
              { tier: "Pro", color: "#C0C0C0", desc: "10+ completed bookings + 4.5★ average" },
              { tier: "Elite", color: "#FFD700", desc: "50+ completed bookings + 4.8★ average" },
            ].map((b) => (
              <View key={b.tier} className="flex-row items-center gap-3 py-2 border-b border-border last:border-0">
                <View className="w-8 h-8 rounded-full items-center justify-center" style={{ backgroundColor: `${b.color}30` }}>
                  <IconSymbol name="checkmark.seal.fill" size={16} color={b.color} />
                </View>
                <View className="flex-1">
                  <Text className="text-foreground font-semibold text-sm">{b.tier} Chef</Text>
                  <Text className="text-muted text-xs">{b.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
