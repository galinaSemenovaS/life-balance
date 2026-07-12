import { revalidateTag } from "next/cache";

export function userTag(userId: string) {
  return `user-${userId}`;
}

export const CACHE_TAGS = {
  scores: "sphere-scores",
  spheres: "spheres",
  wheel: "wheel",
  settings: "settings",
} as const;

export function revalidateUserData(userId: string) {
  revalidateTag(userTag(userId));
}
