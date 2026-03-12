import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/hooks/use-auth";

type PackageForm = {
  name: string;
  description: string;
  price: string;
  labourCost: string;
  ingredientsCost: string;
  minGuests: string;
  maxGuests: string;
  sampleMenu: string;
};

const EMPTY_FORM: PackageForm = {
  name: "",
  description: "",
  price: "",
  labourCost: "",
  ingredientsCost: "",
  minGuests: "2",
  maxGuests: "10",
  sampleMenu: "",
};

export default function ChefPackagesScreen() {
  const colors = useColors();
  const { isAuthenticated } = useAuth();

  const { data: pkgs, isLoading, refetch } = trpc.packages.listMine.useQuery(undefined, {
    enabled: isAuthenticated,
    retry: 2,
  });

  const createMutation = trpc.packages.create.useMutation();
  const updateMutation = trpc.packages.update.useMutation();
  const deleteMutation = trpc.packages.delete.useMutation();

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<PackageForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (pkg: any) => {
    setEditingId(pkg.id);
    setForm({
      name: pkg.name ?? "",
      description: pkg.description ?? "",
      price: pkg.price ? String(parseFloat(pkg.price)) : "",
      labourCost: pkg.labourCost ? String(parseFloat(pkg.labourCost)) : "",
      ingredientsCost: pkg.ingredientsCost ? String(parseFloat(pkg.ingredientsCost)) : "",
      minGuests: String(pkg.minGuests ?? 2),
      maxGuests: String(pkg.maxGuests ?? 10),
      sampleMenu: pkg.sampleMenu ?? "",
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      Alert.alert("Required", "Package name is required.");
      return;
    }
    const price = parseFloat(form.price);
    if (isNaN(price) || price <= 0) {
      Alert.alert("Invalid Price", "Please enter a valid package price.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        price,
        minGuests: parseInt(form.minGuests) || 2,
        maxGuests: parseInt(form.maxGuests) || 10,
        sampleMenu: form.sampleMenu.trim() || undefined,
        labourCost: form.labourCost ? parseFloat(form.labourCost) : undefined,
        ingredientsCost: form.ingredientsCost ? parseFloat(form.ingredientsCost) : undefined,
      };
      if (editingId !== null) {
        await updateMutation.mutateAsync({ id: editingId, ...payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      await refetch();
      setShowModal(false);
    } catch (err: any) {
      Alert.alert("Error", err.message ?? "Failed to save package.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: number, name: string) => {
    Alert.alert(
      "Delete Package",
      `Delete "${name}"? Clients will no longer be able to book this package.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteMutation.mutateAsync({ id });
              await refetch();
            } catch {
              Alert.alert("Error", "Failed to delete package.");
            }
          },
        },
      ]
    );
  };

  const activePkgs = (pkgs ?? []).filter((p: any) => p.isActive !== false);

  return (
    <ScreenContainer>
      {/* Header */}
      <View className="px-5 pt-4 pb-3 flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <Pressable onPress={() => router.back()} style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}>
            <IconSymbol name="arrow.left" size={22} color={colors.foreground} />
          </Pressable>
          <Text className="text-foreground text-xl font-bold">My Packages</Text>
        </View>
        <Pressable onPress={openCreate} style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}>
          <View className="flex-row items-center gap-1.5 bg-primary rounded-xl px-3 py-2">
            <IconSymbol name="plus" size={16} color="#fff" />
            <Text className="text-white font-bold text-sm">Add</Text>
          </View>
        </Pressable>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
          <Text className="text-muted text-sm mt-3">Loading your packages...</Text>
        </View>
      ) : activePkgs.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-5xl mb-4">📦</Text>
          <Text className="text-foreground text-xl font-bold text-center mb-2">No Packages Yet</Text>
          <Text className="text-muted text-sm text-center leading-5 mb-6">
            Create your first package to let clients book your culinary services. Include your pricing, guest range, and a sample menu.
          </Text>
          <Pressable onPress={openCreate} style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}>
            <View className="bg-primary rounded-2xl px-6 py-3">
              <Text className="text-white font-bold text-base">Create First Package</Text>
            </View>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={activePkgs}
          keyExtractor={(item: any) => String(item.id)}
          contentContainerStyle={{ padding: 20, gap: 12, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }: { item: any }) => {
            const price = parseFloat(item.price ?? "0");
            const labour = item.labourCost ? parseFloat(item.labourCost) : null;
            const ingredients = item.ingredientsCost ? parseFloat(item.ingredientsCost) : null;
            const total = price + (labour ?? 0) + (ingredients ?? 0);
            return (
              <View className="bg-surface border border-border rounded-2xl p-4">
                <View className="flex-row items-start justify-between mb-2">
                  <View className="flex-1 mr-3">
                    <Text className="text-foreground font-bold text-base">{item.name}</Text>
                    {item.description ? (
                      <Text className="text-muted text-sm mt-0.5 leading-4" numberOfLines={2}>
                        {item.description}
                      </Text>
                    ) : null}
                  </View>
                  <View className="flex-row gap-2">
                    <Pressable onPress={() => openEdit(item)} style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}>
                      <View className="w-8 h-8 rounded-lg bg-primary/10 items-center justify-center">
                        <IconSymbol name="pencil" size={15} color={colors.primary} />
                      </View>
                    </Pressable>
                    <Pressable onPress={() => handleDelete(item.id, item.name)} style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}>
                      <View className="w-8 h-8 rounded-lg bg-error/10 items-center justify-center">
                        <IconSymbol name="trash.fill" size={15} color={colors.error} />
                      </View>
                    </Pressable>
                  </View>
                </View>

                <View className="flex-row items-center gap-1.5 mb-3">
                  <IconSymbol name="person.2.fill" size={13} color={colors.muted} />
                  <Text className="text-muted text-xs">{item.minGuests}–{item.maxGuests} guests</Text>
                </View>

                {/* Pricing breakdown */}
                <View className="bg-background border border-border rounded-xl p-3 gap-1.5">
                  <View className="flex-row justify-between items-center">
                    <Text className="text-muted text-xs">Package Price</Text>
                    <Text className="text-foreground font-semibold text-sm">£{price.toFixed(2)}</Text>
                  </View>
                  {labour !== null && (
                    <View className="flex-row justify-between items-center">
                      <Text className="text-muted text-xs">Chef Labour</Text>
                      <Text className="text-foreground text-sm">£{labour.toFixed(2)}</Text>
                    </View>
                  )}
                  {ingredients !== null && (
                    <View className="flex-row justify-between items-center">
                      <Text className="text-muted text-xs">Ingredients</Text>
                      <Text className="text-foreground text-sm">£{ingredients.toFixed(2)}</Text>
                    </View>
                  )}
                  {(labour !== null || ingredients !== null) && (
                    <>
                      <View className="h-px bg-border my-0.5" />
                      <View className="flex-row justify-between items-center">
                        <Text className="text-foreground font-bold text-xs">Total Client Price</Text>
                        <Text className="font-bold text-sm" style={{ color: colors.primary }}>
                          £{total.toFixed(2)}
                        </Text>
                      </View>
                    </>
                  )}
                </View>

                {item.sampleMenu ? (
                  <View className="mt-3">
                    <Text className="text-foreground text-xs font-semibold mb-1">Sample Menu</Text>
                    <Text className="text-muted text-xs leading-4" numberOfLines={3}>{item.sampleMenu}</Text>
                  </View>
                ) : null}
              </View>
            );
          }}
        />
      )}

      {/* Create / Edit Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowModal(false)}
      >
        <KeyboardAvoidingView
          style={{ flex: 1, backgroundColor: colors.background }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View
            style={{
              paddingHorizontal: 20,
              paddingTop: 24,
              paddingBottom: 16,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}
          >
            <Text style={{ color: colors.foreground, fontSize: 18, fontWeight: "700" }}>
              {editingId !== null ? "Edit Package" : "New Package"}
            </Text>
            <Pressable onPress={() => setShowModal(false)} style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}>
              <IconSymbol name="xmark" size={20} color={colors.foreground} />
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Name */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{ color: colors.foreground, fontWeight: "600", fontSize: 13, marginBottom: 6 }}>
                Package Name *
              </Text>
              <TextInput
                value={form.name}
                onChangeText={(v) => setForm((f) => ({ ...f, name: v }))}
                placeholder="e.g. Romantic Dinner for Two"
                placeholderTextColor={colors.muted}
                style={{
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  color: colors.foreground,
                  fontSize: 14,
                }}
                returnKeyType="next"
              />
            </View>

            {/* Description */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{ color: colors.foreground, fontWeight: "600", fontSize: 13, marginBottom: 6 }}>
                Description
              </Text>
              <TextInput
                value={form.description}
                onChangeText={(v) => setForm((f) => ({ ...f, description: v }))}
                placeholder="Describe what's included in this package..."
                placeholderTextColor={colors.muted}
                multiline
                numberOfLines={3}
                style={{
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  color: colors.foreground,
                  fontSize: 14,
                  minHeight: 80,
                  textAlignVertical: "top",
                }}
              />
            </View>

            {/* Pricing Section */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{ color: colors.foreground, fontWeight: "700", fontSize: 14, marginBottom: 12 }}>
                Pricing Breakdown
              </Text>

              <View style={{ marginBottom: 10 }}>
                <Text style={{ color: colors.muted, fontSize: 12, marginBottom: 6 }}>Package Price (£) *</Text>
                <TextInput
                  value={form.price}
                  onChangeText={(v) => setForm((f) => ({ ...f, price: v }))}
                  placeholder="0.00"
                  placeholderTextColor={colors.muted}
                  keyboardType="decimal-pad"
                  style={{
                    backgroundColor: colors.surface,
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    color: colors.foreground,
                    fontSize: 14,
                  }}
                />
              </View>

              <View style={{ marginBottom: 10 }}>
                <Text style={{ color: colors.muted, fontSize: 12, marginBottom: 6 }}>Chef Labour Cost (£)</Text>
                <TextInput
                  value={form.labourCost}
                  onChangeText={(v) => setForm((f) => ({ ...f, labourCost: v }))}
                  placeholder="0.00"
                  placeholderTextColor={colors.muted}
                  keyboardType="decimal-pad"
                  style={{
                    backgroundColor: colors.surface,
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    color: colors.foreground,
                    fontSize: 14,
                  }}
                />
              </View>

              <View style={{ marginBottom: 10 }}>
                <Text style={{ color: colors.muted, fontSize: 12, marginBottom: 6 }}>Ingredients Cost (£)</Text>
                <TextInput
                  value={form.ingredientsCost}
                  onChangeText={(v) => setForm((f) => ({ ...f, ingredientsCost: v }))}
                  placeholder="0.00"
                  placeholderTextColor={colors.muted}
                  keyboardType="decimal-pad"
                  style={{
                    backgroundColor: colors.surface,
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    color: colors.foreground,
                    fontSize: 14,
                  }}
                />
              </View>

              {/* Live total preview */}
              {(form.price || form.labourCost || form.ingredientsCost) ? (
                <View
                  style={{
                    backgroundColor: colors.primary + "18",
                    borderWidth: 1,
                    borderColor: colors.primary + "33",
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: 4,
                  }}
                >
                  <Text style={{ color: colors.foreground, fontWeight: "600", fontSize: 13 }}>
                    Total Client Price
                  </Text>
                  <Text style={{ color: colors.primary, fontWeight: "700", fontSize: 15 }}>
                    £{(
                      (parseFloat(form.price) || 0) +
                      (parseFloat(form.labourCost) || 0) +
                      (parseFloat(form.ingredientsCost) || 0)
                    ).toFixed(2)}
                  </Text>
                </View>
              ) : null}
            </View>

            {/* Guest Range */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{ color: colors.foreground, fontWeight: "600", fontSize: 13, marginBottom: 8 }}>
                Guest Range
              </Text>
              <View style={{ flexDirection: "row", gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.muted, fontSize: 12, marginBottom: 6 }}>Min Guests</Text>
                  <TextInput
                    value={form.minGuests}
                    onChangeText={(v) => setForm((f) => ({ ...f, minGuests: v }))}
                    keyboardType="number-pad"
                    style={{
                      backgroundColor: colors.surface,
                      borderWidth: 1,
                      borderColor: colors.border,
                      borderRadius: 12,
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      color: colors.foreground,
                      fontSize: 14,
                    }}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.muted, fontSize: 12, marginBottom: 6 }}>Max Guests</Text>
                  <TextInput
                    value={form.maxGuests}
                    onChangeText={(v) => setForm((f) => ({ ...f, maxGuests: v }))}
                    keyboardType="number-pad"
                    style={{
                      backgroundColor: colors.surface,
                      borderWidth: 1,
                      borderColor: colors.border,
                      borderRadius: 12,
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      color: colors.foreground,
                      fontSize: 14,
                    }}
                  />
                </View>
              </View>
            </View>

            {/* Sample Menu */}
            <View style={{ marginBottom: 24 }}>
              <Text style={{ color: colors.foreground, fontWeight: "600", fontSize: 13, marginBottom: 6 }}>
                Sample Menu
              </Text>
              <TextInput
                value={form.sampleMenu}
                onChangeText={(v) => setForm((f) => ({ ...f, sampleMenu: v }))}
                placeholder={"Starter: Burrata with heirloom tomatoes\nMain: Pan-seared sea bass\nDessert: Crème brûlée"}
                placeholderTextColor={colors.muted}
                multiline
                numberOfLines={5}
                style={{
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  color: colors.foreground,
                  fontSize: 14,
                  minHeight: 110,
                  textAlignVertical: "top",
                }}
              />
            </View>

            {/* Save Button */}
            <Pressable
              onPress={handleSave}
              disabled={saving}
              style={({ pressed }) => [{ opacity: pressed || saving ? 0.7 : 1 }]}
            >
              <View
                style={{
                  backgroundColor: colors.primary,
                  borderRadius: 16,
                  paddingVertical: 16,
                  alignItems: "center",
                }}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>
                    {editingId !== null ? "Save Changes" : "Create Package"}
                  </Text>
                )}
              </View>
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </ScreenContainer>
  );
}
