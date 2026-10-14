import { MOCK_MEMBERS } from "./school-mock";
import { Member } from "./types";

const ACTIVE_ID_KEY = "school_active_member_id";
const CUSTOM_MEMBER_PREFIX = "school_custom_member_";

/**
 * Retrieves the currently active member, merging any custom saved profile
 * data (avatar, bio, name) from localStorage so changes survive page refreshes.
 */
export function getActiveMember(): Member {
  if (typeof window === "undefined") return MOCK_MEMBERS[0];

  const savedId = localStorage.getItem(ACTIVE_ID_KEY) || MOCK_MEMBERS[0].id;
  const baseMember = MOCK_MEMBERS.find((m) => m.id === savedId) || MOCK_MEMBERS[0];

  const customJson = localStorage.getItem(`${CUSTOM_MEMBER_PREFIX}${savedId}`);
  if (customJson) {
    try {
      const parsed = JSON.parse(customJson);
      const merged = { ...baseMember, ...parsed };
      // Also update in-memory mock store
      const idx = MOCK_MEMBERS.findIndex((m) => m.id === savedId);
      if (idx !== -1) MOCK_MEMBERS[idx] = merged;
      return merged;
    } catch {
      return baseMember;
    }
  }

  return baseMember;
}

/**
 * Persists an active member's updated profile (including base64 cropped avatar)
 * to localStorage and notifies all components via a window event.
 */
export function saveActiveMember(updated: Member): void {
  if (typeof window === "undefined") return;

  localStorage.setItem(ACTIVE_ID_KEY, updated.id);
  try {
    localStorage.setItem(`${CUSTOM_MEMBER_PREFIX}${updated.id}`, JSON.stringify(updated));
  } catch (err) {
    console.warn("Could not save full member profile to localStorage:", err);
  }

  // Update in-memory mock store
  const idx = MOCK_MEMBERS.findIndex((m) => m.id === updated.id);
  if (idx !== -1) {
    MOCK_MEMBERS[idx] = updated;
  }

  // Dispatch custom event for real-time reactivity
  window.dispatchEvent(new CustomEvent("school_member_updated", { detail: updated }));
}

/**
 * Subscribes to real-time profile updates across components.
 */
export function subscribeToMemberUpdates(callback: (member: Member) => void): () => void {
  if (typeof window === "undefined") return () => {};

  const handler = (e: Event) => {
    const customEvent = e as CustomEvent<Member>;
    if (customEvent.detail) {
      callback(customEvent.detail);
    }
  };

  window.addEventListener("school_member_updated", handler);
  return () => window.removeEventListener("school_member_updated", handler);
}
