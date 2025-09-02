const key = (id: number) => `suprss.onboarded.v1.${id}`;

export function isOnboarded(userId?: number | null) {
  if (!userId) return false;
  return localStorage.getItem(key(userId)) === "1";
}

export function markOnboarded(userId: number) {
  localStorage.setItem(key(userId), "1");
}
