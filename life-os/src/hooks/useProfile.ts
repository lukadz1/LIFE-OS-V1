import { useCallback, useState } from "react";
import { readStorage, writeStorage } from "../data/storage";
import type { UserProfile } from "../types";

const DEFAULT_PROFILE: UserProfile = {
  heightCm: null,
  heightUnit: "cm",
  weightKg: null,
  weightUnit: "kg",
  age: null,
  sex: null,
  activityHrsPerWeek: null,
};

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile>(() =>
    readStorage<UserProfile>("user-profile", DEFAULT_PROFILE),
  );

  const saveProfile = useCallback((next: UserProfile) => {
    setProfile(next);
    writeStorage("user-profile", next);
  }, []);

  return { profile, saveProfile };
}
