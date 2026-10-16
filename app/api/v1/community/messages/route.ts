import { NextResponse } from "next/server";
import { MOCK_CONVERSATIONS, MOCK_MEMBERS } from "@/lib/school-mock";
import { DirectMessage, Conversation } from "@/lib/types";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get("conversation_id");

    if (conversationId) {
      const conv = MOCK_CONVERSATIONS.find((c) => c.id === conversationId);
      if (!conv) {
        return NextResponse.json({ success: false, error: "Conversation not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, conversation: conv });
    }

    return NextResponse.json({
      success: true,
      count: MOCK_CONVERSATIONS.length,
      conversations: MOCK_CONVERSATIONS,
      data: MOCK_CONVERSATIONS,
    });
  } catch (error: any) {
    console.error("Messages GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch direct messages" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const conversation_id = body.conversation_id || body.conversationId;
    const sender_id = body.sender_id || body.senderId;
    const receiver_id = body.receiver_id || body.recipient_id || body.recipientId;
    const content = body.content;

    if (!content || !content.trim()) {
      return NextResponse.json(
        { success: false, error: "Message content cannot be empty" },
        { status: 400 }
      );
    }

    const newMsg: DirectMessage = {
      id: `dm_${Date.now()}`,
      sender_id: sender_id || "usr_admin_001",
      receiver_id: receiver_id || "usr_sarah_002",
      content: content.trim(),
      created_at: new Date().toISOString(),
      is_read: false,
    };

    let targetConv = MOCK_CONVERSATIONS.find((c) => c.id === conversation_id);

    if (targetConv) {
      targetConv.last_message = newMsg;
      targetConv.messages.push(newMsg);
    } else {
      const recipient =
        MOCK_MEMBERS.find((m) => m.id === receiver_id) || MOCK_MEMBERS[1];

      const newConv: Conversation = {
        id: `conv_${Date.now()}`,
        participant: recipient,
        last_message: newMsg,
        unread_count: 0,
        messages: [newMsg],
      };
      MOCK_CONVERSATIONS.unshift(newConv);
      targetConv = newConv;
    }

    return NextResponse.json({
      success: true,
      message: newMsg,
      data: newMsg,
      conversation: targetConv,
    });
  } catch (error: any) {
    console.error("Messages POST error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send message" },
      { status: 500 }
    );
  }
}
