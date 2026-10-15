import { MOCK_MEMBERS } from "./school-mock";
import { Member } from "./types";

const ACTIVE_ID_KEY = "school_active_member_id";
const CUSTOM_MEMBER_PREFIX = "school_custom_member_";

/**
 * Retrieves the currently active member, merging any custom saved profile
 * data (avatar, bio, name) from localStorage so changes survive page refreshes.
 * Returns null if no authenticated member is saved in localStorage.
 */
export function getActiveMember(): Member | null {
  if (typeof window === "undefined") return null;

  const savedId = localStorage.getItem(ACTIVE_ID_KEY);
  if (!savedId) return null;

  const baseMember = MOCK_MEMBERS.find((m) => m.id === savedId);
  const customJson = localStorage.getItem(`${CUSTOM_MEMBER_PREFIX}${savedId}`);
  if (customJson) {
    try {
      const parsed = JSON.parse(customJson);
      const merged = baseMember ? { ...baseMember, ...parsed } : parsed;
      // Also update in-memory mock store if found
      const idx = MOCK_MEMBERS.findIndex((m) => m.id === savedId);
      if (idx !== -1) MOCK_MEMBERS[idx] = merged;
      return merged;
    } catch {
      return baseMember || null;
    }
  }

  return baseMember || null;
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
 * Clears active member data from localStorage on logout.
 */
export function clearActiveMember(): void {
  if (typeof window === "undefined") return;
  const savedId = localStorage.getItem(ACTIVE_ID_KEY);
  if (savedId) {
    localStorage.removeItem(`${CUSTOM_MEMBER_PREFIX}${savedId}`);
  }
  localStorage.removeItem(ACTIVE_ID_KEY);
  localStorage.removeItem("school_active_member_role");

  // Dispatch custom event with null to notify all components
  window.dispatchEvent(new CustomEvent("school_member_updated", { detail: null }));
}

/**
 * Subscribes to real-time profile updates across components.
 */
export function subscribeToMemberUpdates(callback: (member: Member | null) => void): () => void {
  if (typeof window === "undefined") return () => {};

  const handler = (e: Event) => {
    const customEvent = e as CustomEvent<Member | null>;
    callback(customEvent.detail ?? null);
  };

  window.addEventListener("school_member_updated", handler);
  return () => window.removeEventListener("school_member_updated", handler);
}
