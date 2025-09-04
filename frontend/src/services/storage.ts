// src/services/storage.ts
export const isOnboarded = (userId?: string): boolean => {
  if (!userId) return false;
  return localStorage.getItem(`onboarded:${userId}`) === "1";
};

export const markOnboarded = (userId?: string | undefined): void => {
  if (!userId) return;
  localStorage.setItem(`onboarded:${userId}`, "1");
};
