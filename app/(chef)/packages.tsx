import { router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, FlatList, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { trpc } from "@/lib/trpc";
import { useColors } from "@/hooks/use-colors";

export default function ChefPackagesScreen() {
  const colors = useColors();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [minGuests, setMinGuests] = useState("2");
  const [maxGuests, setMaxGuests] = useState("10");
  const [sampleMenu, setSampleMenu] = useState("");

  const { data: packages, isLoading, refetch } = trpc.packages.listMine.useQuery();
  const createPkg = trpc.packages.create.useMutation({ onSuccess: () => { refetch(); resetForm(); } });
  const updatePkg = trpc.packages.update.useMutation({ onSuccess: () => { refetch(); resetForm(); } });
  const deletePkg = trpc.packages.delete.useMutation({ onSuccess: () => refetch() });

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setName(""); setDescription(""); setPrice(""); setMinGuests("2"); setMaxGuests("10"); setSampleMenu("");
  };

  const openEdit = (pkg: any) => {
    setEditingId(pkg.id);
    setName(pkg.name);
    setDescription(pkg.description ?? "");
    setPrice(String(pkg.price));
    setMinGuests(String(pkg.minGuests));
    setMaxGuests(String(pkg.maxGuests));
    setSampleMenu(pkg.sampleMenu ?? "");
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!name.trim() || !price.trim()) {
      Alert.alert("Required Fields", "Please fill in the package name and price.");
      return;
    }
    const data = {
      name: name.trim(),
      description: description.trim() || undefined,
      price: parseFloat(price),
      minGuests: parseInt(minGuests),
      maxGuests: parseInt(maxGuests),
      sampleMenu: sampleMenu.trim() || undefined,
    };
    if (editingId) {
      await updatePkg.mutateAsync({ id: editingId, ...data });
    } else {
      await createPkg.mutateAsync(data);
    }
  };

  const handleDelete = (id: number, pkgName: string) => {
    Alert.alert("Delete Package", `Delete "${pkgName}"? This cannot be undone.`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deletePkg.mutateAsync({ id }) },
    ]);
  };

  return (
    <ScreenContainer>
      {showForm ? (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <View className="px-5 pt-4 pb-2 flex-row items-center gap-3">
              <Pressable onPress={resetForm} style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}>
                <IconSymbol name="arrow.left" size={22} color={colors.foreground} />
              </Pressable>
              <Text className="text-foreground text-xl font-bold">{editingId ? "Edit Package" : "New Package"}</Text>
            </View>

            <View className="px-5 py-4 gap-4">
              <FormField label="Package Name *" value={name} onChangeText={setName} placeholder="e.g. Romantic Dinner for Two" />
              <FormField label="Description" value={description} onChangeText={setDescription} placeholder="Describe what's included..." multiline />
              <FormField label="Price (£) *" value={price} onChangeText={setPrice} placeholder="150" keyboardType="decimal-pad" />
              <View className="flex-row gap-3">
                <View className="flex-1">
                  <FormField label="Min Guests" value={minGuests} onChangeText={setMinGuests} keyboardType="number-pad" />
                </View>
                <View className="flex-1">
                  <FormField label="Max Guests" value={maxGuests} onChangeText={setMaxGuests} keyboardType="number-pad" />
                </View>
              </View>
              <FormField label="Sample Menu" value={sampleMenu} onChangeText={setSampleMenu} placeholder="Starter: ...\nMain: ...\nDessert: ..." multiline />

              <Pressable
                onPress={handleSubmit}
                disabled={createPkg.isPending || updatePkg.isPending}
                style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
              >
                <View className="bg-primary rounded-2xl py-4 items-center">
                  {(createPkg.isPending || updatePkg.isPending) ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text className="text-white font-bold text-base">{editingId ? "Update Package" : "Create Package"}</Text>
                  )}
                </View>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      ) : (
        <>
          <View className="px-5 pt-4 pb-3 flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <Pressable onPress={() => router.back()} style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}>
                <IconSymbol name="arrow.left" size={22} color={colors.foreground} />
              </Pressable>
              <Text className="text-foreground text-xl font-bold">My Packages</Text>
            </View>
            <Pressable onPress={() => setShowForm(true)} style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}>
              <View className="bg-primary rounded-xl px-3 py-2 flex-row items-center gap-1">
                <IconSymbol name="plus.circle.fill" size={16} color="#fff" />
                <Text className="text-white text-sm font-semibold">Add</Text>
              </View>
            </Pressable>
          </View>

          {isLoading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : (
            <FlatList
              data={packages ?? []}
              keyExtractor={(item) => String(item.id)}
              contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20, gap: 12 }}
              ListEmptyComponent={
                <View className="items-center py-16">
                  <Text className="text-4xl mb-3">📋</Text>
                  <Text className="text-foreground font-semibold text-lg">No packages yet</Text>
                  <Text className="text-muted text-center mt-1 mb-6">Create packages that clients can book</Text>
                  <Pressable onPress={() => setShowForm(true)} style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}>
                    <View className="bg-primary rounded-2xl px-8 py-3">
                      <Text className="text-white font-bold">Create First Package</Text>
                    </View>
                  </Pressable>
                </View>
              }
              renderItem={({ item: pkg }) => (
                <View className="bg-surface border border-border rounded-3xl p-4">
                  <View className="flex-row items-start justify-between mb-2">
                    <View className="flex-1">
                      <Text className="text-foreground font-bold text-base">{pkg.name}</Text>
                      <Text className="text-muted text-xs mt-0.5">{pkg.minGuests}–{pkg.maxGuests} guests</Text>
                    </View>
                    <Text className="text-primary font-bold text-xl">£{Number(pkg.price).toFixed(0)}</Text>
                  </View>
                  {pkg.description && (
                    <Text className="text-muted text-sm mb-3" numberOfLines={2}>{pkg.description}</Text>
                  )}
                  <View className="flex-row gap-2">
                    <Pressable onPress={() => openEdit(pkg)} style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1, flex: 1 }]}>
                      <View className="bg-surface border border-border rounded-xl py-2 items-center flex-row justify-center gap-1">
                        <IconSymbol name="pencil" size={14} color={colors.foreground} />
                        <Text className="text-foreground text-sm font-semibold">Edit</Text>
                      </View>
                    </Pressable>
                    <Pressable onPress={() => handleDelete(pkg.id, pkg.name)} style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1, flex: 1 }]}>
                      <View className="bg-error/10 border border-error/30 rounded-xl py-2 items-center flex-row justify-center gap-1">
                        <IconSymbol name="trash.fill" size={14} color="#EF4444" />
                        <Text className="text-error text-sm font-semibold">Delete</Text>
                      </View>
                    </Pressable>
                  </View>
                </View>
              )}
            />
          )}
        </>
      )}
    </ScreenContainer>
  );
}

function FormField({ label, value, onChangeText, placeholder, multiline, keyboardType }: {
  label: string; value: string; onChangeText: (v: string) => void;
  placeholder?: string; multiline?: boolean; keyboardType?: any;
}) {
  const colors = useColors();
  return (
    <View>
      <Text className="text-foreground font-semibold text-sm mb-2">{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        className="bg-surface border border-border rounded-2xl px-4 py-3 text-foreground text-base"
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
        keyboardType={keyboardType}
        textAlignVertical={multiline ? "top" : "center"}
      />
    </View>
  );
}
