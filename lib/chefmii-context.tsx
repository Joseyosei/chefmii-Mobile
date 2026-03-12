import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

export type UserRole = "client" | "chef" | "admin" | null;

interface ChefMiiContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  isOnboarded: boolean;
  setIsOnboarded: (v: boolean) => void;
  clearRole: () => void;
}

const ChefMiiContext = createContext<ChefMiiContextType>({
  role: null,
  setRole: () => {},
  isOnboarded: false,
  setIsOnboarded: () => {},
  clearRole: () => {},
});

const ROLE_KEY = "@chefmii_role";
const ONBOARDED_KEY = "@chefmii_onboarded";

export function ChefMiiProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<UserRole>(null);
  const [isOnboarded, setIsOnboardedState] = useState(false);

  useEffect(() => {
    (async () => {
      const [savedRole, savedOnboarded] = await Promise.all([
        AsyncStorage.getItem(ROLE_KEY),
        AsyncStorage.getItem(ONBOARDED_KEY),
      ]);
      if (savedRole) setRoleState(savedRole as UserRole);
      if (savedOnboarded === "true") setIsOnboardedState(true);
    })();
  }, []);

  const setRole = useCallback(async (newRole: UserRole) => {
    setRoleState(newRole);
    if (newRole) {
      await AsyncStorage.setItem(ROLE_KEY, newRole);
    } else {
      await AsyncStorage.removeItem(ROLE_KEY);
    }
  }, []);

  const setIsOnboarded = useCallback(async (v: boolean) => {
    setIsOnboardedState(v);
    await AsyncStorage.setItem(ONBOARDED_KEY, String(v));
  }, []);

  const clearRole = useCallback(async () => {
    setRoleState(null);
    setIsOnboardedState(false);
    await AsyncStorage.multiRemove([ROLE_KEY, ONBOARDED_KEY]);
  }, []);

  return (
    <ChefMiiContext.Provider value={{ role, setRole, isOnboarded, setIsOnboarded, clearRole }}>
      {children}
    </ChefMiiContext.Provider>
  );
}

export function useChefMii() {
  return useContext(ChefMiiContext);
}
