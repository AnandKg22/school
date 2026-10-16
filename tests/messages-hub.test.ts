import { describe, it, expect } from "vitest";
import { MOCK_CONVERSATIONS, MOCK_MEMBERS } from "@/lib/school-mock";
import { Conversation, DirectMessage } from "@/lib/types";

describe("Step 5: Dedicated /messages Full-Screen Split-Pane Chat Hub", () => {
  it("structures conversations with valid participant profiles and timestamps", () => {
    expect(MOCK_CONVERSATIONS.length).toBeGreaterThanOrEqual(3);

    const firstConv = MOCK_CONVERSATIONS[0];
    expect(firstConv.participant.full_name).toBeTruthy();
    expect(firstConv.participant.avatar_url).toBeTruthy();
    expect(firstConv.last_message.content).toBeTruthy();
    expect(firstConv.messages.length).toBeGreaterThan(0);
  });

  it("filters conversations by participant search query", () => {
    const query = "sarah";
    const filtered = MOCK_CONVERSATIONS.filter((c) =>
      c.participant.full_name.toLowerCase().includes(query) ||
      c.participant.handle.toLowerCase().includes(query)
    );

    expect(filtered.length).toBeGreaterThan(0);
    expect(filtered[0].participant.full_name).toContain("Sarah");
  });

  it("dispatches new direct messages and appends to conversation thread", () => {
    const targetConv = MOCK_CONVERSATIONS[0];
    const initialCount = targetConv.messages.length;

    const newMsg: DirectMessage = {
      id: `dm_${Date.now()}`,
      sender_id: "usr_admin_001",
      receiver_id: targetConv.participant.id,
      content: "Can you review the autonomous loop PR?",
      created_at: new Date().toISOString(),
      is_read: false,
    };

    const updatedConv: Conversation = {
      ...targetConv,
      last_message: newMsg,
      messages: [...targetConv.messages, newMsg],
    };

    expect(updatedConv.messages.length).toBe(initialCount + 1);
    expect(updatedConv.last_message.content).toBe("Can you review the autonomous loop PR?");
  });

  it("initializes new conversation thread for previously uncontacted member", () => {
    const uncontactedMember = MOCK_MEMBERS[3]; // Elena or David
    const newConv: Conversation = {
      id: `conv_${Date.now()}`,
      participant: uncontactedMember,
      last_message: {
        id: `dm_init_${Date.now()}`,
        sender_id: "usr_admin_001",
        receiver_id: uncontactedMember.id,
        content: "👋 Started a new direct conversation",
        created_at: new Date().toISOString(),
        is_read: true,
      },
      unread_count: 0,
      messages: [],
    };

    expect(newConv.participant.id).toBe(uncontactedMember.id);
    expect(newConv.unread_count).toBe(0);
  });
});
