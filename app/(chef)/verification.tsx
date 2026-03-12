import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/hooks/use-auth";

const STAGES = [
  {
    index: 0,
    emoji: "🪪",
    title: "Identity Verification",
    subtitle: "Stage 1 of 3",
    description:
      "Submit a government-issued ID (passport or driving licence) for identity confirmation. This is required before you can accept any bookings.",
    acceptedDocs: ["Passport", "Driving Licence", "National ID Card"],
    badgeEarned: "Verified Chef",
  },
  {
    index: 1,
    emoji: "🎓",
    title: "Culinary Credentials",
    subtitle: "Stage 2 of 3",
    description:
      "Upload your culinary qualifications, certifications, or professional references. This helps clients trust your expertise and culinary background.",
    acceptedDocs: ["Culinary Degree / Diploma", "Professional Certification", "Reference Letter from Employer"],
    badgeEarned: "Pro Chef",
  },
  {
    index: 2,
    emoji: "✅",
    title: "Food Safety Certificate",
    subtitle: "Stage 3 of 3",
    description:
      "Provide a valid Level 2 or Level 3 Food Hygiene certificate. This is mandatory for all chefs operating on ChefMii.",
    acceptedDocs: ["Level 2 Food Hygiene Certificate", "Level 3 Food Safety Certificate"],
    badgeEarned: "Elite Chef",
  },
];

const BADGE_TIERS = [
  { icon: "✅", name: "Verified Chef", desc: "Completes Stage 1 — Identity", color: "#22C55E" },
  { icon: "⭐", name: "Pro Chef", desc: "Completes Stages 1 & 2", color: "#F4A227" },
  { icon: "🏆", name: "Elite Chef", desc: "Completes all 3 stages", color: "#8B5CF6" },
];

export default function ChefVerificationScreen() {
  const colors = useColors();
  const { isAuthenticated } = useAuth();

  const { data: profile } = trpc.chefs.getMyProfile.useQuery(undefined, { enabled: isAuthenticated });
  const { data: verifications, refetch } = trpc.chefs.getMyVerifications.useQuery(undefined, { enabled: isAuthenticated });
  const submitMutation = trpc.chefs.submitVerification.useMutation();

  const [activeStage, setActiveStage] = useState<number | null>(null);
  const [pickedFiles, setPickedFiles] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const currentStage = profile?.verificationStage ?? 0;

  const getStageStatus = (stageIndex: number): "approved" | "pending" | "rejected" | "none" => {
    if (!verifications) return "none";
    // stage in DB is 0-indexed matching stageIndex
    const v = verifications.find((v) => v.stage === stageIndex);
    if (!v) return "none";
    return v.status as "approved" | "pending" | "rejected";
  };

  const handlePickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Required", "Please allow access to your photo library to upload documents.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      const name = uri.split("/").pop() ?? "document.jpg";
      setPickedFiles((prev) => [...prev, name]);
    }
  };

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Required", "Please allow camera access to photograph your documents.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      const name = `camera_doc_${Date.now()}.jpg`;
      setPickedFiles((prev) => [...prev, name]);
    }
  };

  const handleSubmit = async () => {
    if (activeStage === null) return;
    if (pickedFiles.length === 0) {
      Alert.alert("Documents Required", "Please upload at least one document before submitting.");
      return;
    }
    setSubmitting(true);
    try {
      await submitMutation.mutateAsync({
        stage: activeStage,
        documentUrls: pickedFiles.map((f) => `doc:${f}`),
      });
      await refetch();
      setActiveStage(null);
      setPickedFiles([]);
      Alert.alert(
        "Submitted! 🎉",
        "Your documents have been submitted for review. Our team will verify them within 1–3 business days. You'll receive a notification once reviewed.",
        [{ text: "Great, thanks!" }]
      );
    } catch (err: any) {
      Alert.alert("Submission Failed", err.message ?? "Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenContainer>
      {/* Header */}
      <View className="px-5 pt-4 pb-2 flex-row items-center gap-3">
        <Pressable onPress={() => router.back()} style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}>
          <IconSymbol name="arrow.left" size={22} color={colors.foreground} />
        </Pressable>
        <Text className="text-foreground text-xl font-bold">Verification</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Info Banner */}
        <View className="mx-5 mb-4 mt-2 bg-surface border border-border rounded-2xl p-4">
          <Text className="font-bold text-sm mb-1" style={{ color: colors.primary }}>Verification Required</Text>
          <Text className="text-muted text-sm leading-5">
            Complete all 3 stages to get your Verified Chef badge and start accepting bookings. Verified chefs appear higher in search results.
          </Text>
        </View>

        {/* Progress Tracker */}
        <View className="mx-5 mb-4 bg-surface border border-border rounded-2xl p-4">
          <Text className="text-foreground font-bold text-sm mb-4">Progress</Text>
          <View className="flex-row items-center">
            {[0, 1, 2].map((idx) => {
              const status = getStageStatus(idx);
              const isApproved = status === "approved" || currentStage > idx;
              const isPending = status === "pending";
              const isActive = idx === currentStage && !isApproved && !isPending;
              const bgColor = isApproved
                ? colors.success
                : isPending
                ? colors.warning
                : isActive
                ? colors.primary
                : colors.border;
              return (
                <View key={idx} className="flex-row items-center flex-1">
                  <View
                    className="w-10 h-10 rounded-full items-center justify-center"
                    style={{ backgroundColor: bgColor }}
                  >
                    {isApproved ? (
                      <Text style={{ color: "#fff", fontWeight: "700" }}>✓</Text>
                    ) : isPending ? (
                      <Text style={{ color: "#fff", fontSize: 12 }}>⏳</Text>
                    ) : (
                      <Text style={{ color: "#fff", fontWeight: "700" }}>{idx + 1}</Text>
                    )}
                  </View>
                  {idx < 2 && (
                    <View
                      className="flex-1 h-0.5 mx-1"
                      style={{ backgroundColor: isApproved ? colors.success : colors.border }}
                    />
                  )}
                </View>
              );
            })}
          </View>
          {/* Labels */}
          <View className="flex-row mt-2">
            <Text className="text-muted text-xs" style={{ width: 40 }}>Identity</Text>
            <Text className="text-muted text-xs flex-1 text-center">Credentials</Text>
            <Text className="text-muted text-xs" style={{ width: 40, textAlign: "right" }}>Food Safety</Text>
          </View>
          <Text className="text-muted text-xs mt-3">
            {currentStage === 0
              ? "Start your verification journey"
              : currentStage === 1
              ? "Stage 1 complete — continue to Stage 2"
              : currentStage === 2
              ? "Stage 2 complete — one more step!"
              : "All stages complete — you're fully verified!"}
          </Text>
        </View>

        {/* Stage Cards */}
        <View className="px-5 gap-3">
          {STAGES.map((stageInfo) => {
            const status = getStageStatus(stageInfo.index);
            const isApproved = status === "approved" || currentStage > stageInfo.index;
            const isPending = status === "pending";
            const isNext = stageInfo.index === currentStage && !isApproved && !isPending;
            const isLocked = stageInfo.index > currentStage && !isApproved && !isPending;

            return (
              <View
                key={stageInfo.index}
                className="bg-surface border rounded-2xl p-4"
                style={{
                  borderColor: isApproved
                    ? colors.success
                    : isPending
                    ? colors.warning
                    : isNext
                    ? colors.primary
                    : colors.border,
                  opacity: isLocked ? 0.55 : 1,
                }}
              >
                <View className="flex-row items-start gap-3">
                  <View
                    className="w-12 h-12 rounded-2xl items-center justify-center"
                    style={{
                      backgroundColor: isApproved
                        ? colors.success + "20"
                        : isPending
                        ? colors.warning + "20"
                        : colors.primary + "15",
                    }}
                  >
                    <Text style={{ fontSize: 24 }}>{stageInfo.emoji}</Text>
                  </View>
                  <View className="flex-1">
                    <View className="flex-row items-center gap-2 flex-wrap mb-0.5">
                      <Text className="text-foreground font-bold text-base">{stageInfo.title}</Text>
                      {isApproved && (
                        <View className="bg-success rounded-full px-2 py-0.5">
                          <Text className="text-white text-xs font-bold">Approved</Text>
                        </View>
                      )}
                      {isPending && (
                        <View className="bg-warning rounded-full px-2 py-0.5">
                          <Text className="text-white text-xs font-bold">Under Review</Text>
                        </View>
                      )}
                      {isNext && (
                        <View className="bg-primary rounded-full px-2 py-0.5">
                          <Text className="text-white text-xs font-bold">Next</Text>
                        </View>
                      )}
                    </View>
                    <Text className="text-muted text-xs mb-2">{stageInfo.subtitle}</Text>
                    <Text className="text-muted text-sm leading-5">{stageInfo.description}</Text>
                  </View>
                </View>

                {/* Accepted documents */}
                <View className="mt-3 gap-1">
                  <Text className="text-foreground text-xs font-semibold mb-1">Accepted documents:</Text>
                  {stageInfo.acceptedDocs.map((doc, i) => (
                    <View key={i} className="flex-row items-center gap-2">
                      <View className="w-1.5 h-1.5 rounded-full bg-muted" />
                      <Text className="text-muted text-xs">{doc}</Text>
                    </View>
                  ))}
                </View>

                {/* Action area */}
                {!isApproved && !isPending && !isLocked && (
                  <Pressable
                    onPress={() => { setActiveStage(stageInfo.index); setPickedFiles([]); }}
                    style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
                    className="mt-4"
                  >
                    <View className="bg-primary rounded-xl py-3 items-center">
                      <Text className="text-white font-bold text-sm">Submit Documents</Text>
                    </View>
                  </Pressable>
                )}

                {isPending && (
                  <View className="mt-3 rounded-xl py-3 items-center border"
                    style={{ backgroundColor: colors.warning + "15", borderColor: colors.warning + "40" }}>
                    <Text className="font-semibold text-sm" style={{ color: colors.warning }}>
                      ⏳ Under Review — 1–3 business days
                    </Text>
                  </View>
                )}

                {isApproved && (
                  <View className="mt-3 rounded-xl py-3 items-center border"
                    style={{ backgroundColor: colors.success + "15", borderColor: colors.success + "40" }}>
                    <Text className="font-semibold text-sm" style={{ color: colors.success }}>
                      ✓ Verified — {stageInfo.badgeEarned} badge earned
                    </Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Badge Tiers */}
        <View className="mx-5 mt-5">
          <Text className="text-foreground font-bold text-base mb-3">Badge Tiers</Text>
          <View className="gap-2">
            {BADGE_TIERS.map((badge, i) => (
              <View key={i} className="flex-row items-center gap-3 bg-surface border border-border rounded-2xl px-4 py-3">
                <Text style={{ fontSize: 22 }}>{badge.icon}</Text>
                <View className="flex-1">
                  <Text className="text-foreground font-semibold text-sm">{badge.name}</Text>
                  <Text className="text-muted text-xs">{badge.desc}</Text>
                </View>
                {currentStage >= i + 1 && (
                  <View className="bg-success rounded-full px-2 py-0.5">
                    <Text className="text-white text-xs font-bold">Earned</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Document Upload Modal */}
      <Modal
        visible={activeStage !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setActiveStage(null)}
      >
        <View className="flex-1 bg-background">
          <View className="px-5 pt-6 pb-4 flex-row items-center justify-between border-b border-border">
            <Text className="text-foreground text-lg font-bold">
              {activeStage !== null ? STAGES[activeStage].title : ""}
            </Text>
            <Pressable onPress={() => setActiveStage(null)} style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}>
              <IconSymbol name="xmark" size={20} color={colors.foreground} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={{ padding: 20 }}>
            {activeStage !== null && (
              <>
                <Text className="text-muted text-sm leading-5 mb-5">
                  {STAGES[activeStage].description}
                </Text>

                <Text className="text-foreground font-semibold text-sm mb-3">
                  Upload your documents (PDF, JPG, PNG)
                </Text>

                {/* Upload options */}
                <View className="gap-3 mb-5">
                  <Pressable
                    onPress={handlePickPhoto}
                    style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
                  >
                    <View className="flex-row items-center gap-3 bg-surface border border-border rounded-2xl px-4 py-4">
                      <View className="w-10 h-10 rounded-xl items-center justify-center" style={{ backgroundColor: colors.primary + "15" }}>
                        <IconSymbol name="photo.fill" size={20} color={colors.primary} />
                      </View>
                      <View className="flex-1">
                        <Text className="text-foreground font-semibold text-sm">Choose from Library</Text>
                        <Text className="text-muted text-xs">Select a photo or document from your device</Text>
                      </View>
                      <IconSymbol name="chevron.right" size={16} color={colors.muted} />
                    </View>
                  </Pressable>

                  <Pressable
                    onPress={handleTakePhoto}
                    style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
                  >
                    <View className="flex-row items-center gap-3 bg-surface border border-border rounded-2xl px-4 py-4">
                      <View className="w-10 h-10 rounded-xl items-center justify-center" style={{ backgroundColor: colors.primary + "15" }}>
                        <IconSymbol name="camera.fill" size={20} color={colors.primary} />
                      </View>
                      <View className="flex-1">
                        <Text className="text-foreground font-semibold text-sm">Take a Photo</Text>
                        <Text className="text-muted text-xs">Photograph your document with the camera</Text>
                      </View>
                      <IconSymbol name="chevron.right" size={16} color={colors.muted} />
                    </View>
                  </Pressable>
                </View>

                {/* Uploaded files */}
                {pickedFiles.length > 0 && (
                  <View className="mb-5">
                    <Text className="text-foreground font-semibold text-sm mb-2">
                      Attached ({pickedFiles.length})
                    </Text>
                    {pickedFiles.map((file, i) => (
                      <View
                        key={i}
                        className="flex-row items-center gap-3 rounded-xl px-3 py-2 mb-2 border"
                        style={{ backgroundColor: colors.success + "10", borderColor: colors.success + "30" }}
                      >
                        <IconSymbol name="checkmark.circle.fill" size={18} color={colors.success} />
                        <Text className="text-foreground text-sm flex-1" numberOfLines={1}>{file}</Text>
                        <Pressable
                          onPress={() => setPickedFiles((prev) => prev.filter((_, idx) => idx !== i))}
                          style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
                        >
                          <IconSymbol name="xmark" size={14} color={colors.muted} />
                        </Pressable>
                      </View>
                    ))}
                  </View>
                )}

                {/* Privacy note */}
                <View className="bg-surface border border-border rounded-xl p-3 mb-5">
                  <Text className="text-muted text-xs leading-4">
                    🔒 Your documents are encrypted and stored securely. They are only accessible to our verification team and will never be shared with clients or third parties.
                  </Text>
                </View>

                <Pressable
                  onPress={handleSubmit}
                  disabled={submitting || pickedFiles.length === 0}
                  style={({ pressed }) => [{ opacity: pressed || pickedFiles.length === 0 ? 0.6 : 1 }]}
                >
                  <View className="bg-primary rounded-2xl py-4 items-center">
                    {submitting ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text className="text-white font-bold text-base">Submit for Review</Text>
                    )}
                  </View>
                </Pressable>
              </>
            )}
          </ScrollView>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
