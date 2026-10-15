import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const DEFAULT_MIMO_URL = process.env.MIMO_API_BASE_URL 
  ? `${process.env.MIMO_API_BASE_URL.replace(/\/+$/, "")}/chat/completions`
  : "https://token-plan-sgp.xiaomimimo.com/v1/chat/completions";

// Simple in-memory rate limiter per IP / identifier
const requestCounts = new Map<string, { count: number; expiresAt: number }>();

function checkRateLimit(identifier: string, limit = 15, windowMs = 60000): boolean {
  const now = Date.now();
  const entry = requestCounts.get(identifier);

  if (!entry || entry.expiresAt < now) {
    requestCounts.set(identifier, { count: 1, expiresAt: now + windowMs });
    return true;
  }

  if (entry.count >= limit) {
    return false;
  }

  entry.count += 1;
  return true;
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "anonymous_ip";
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Too many AI requests. Please wait a minute before asking again." },
        { status: 429 }
      );
    }

    const { question } = await req.json();

    if (!question || typeof question !== "string" || question.trim().length === 0) {
      return NextResponse.json({ error: "A valid question is required." }, { status: 400 });
    }

    // Server-managed provider credentials only (never accept client-supplied keys)
    const apiKey = process.env.MIMO_API_KEY;
    const model = process.env.MIMO_DEFAULT_MODEL || "mimo-v2.6-flash";

    // 1. Dynamic Grounding: Fetch real community knowledge from Supabase
    let knowledgeSnippets = "";
    let courseSnippets = "";
    let postSnippets = "";

    try {
      const [knowledgeRes, coursesRes, postsRes] = await Promise.all([
        supabase.from("app_school_ai_knowledge").select("title, content, source_type").limit(6),
        supabase.from("app_school_courses").select("title, description, required_tier").limit(4),
        supabase.from("app_school_posts").select("title, content").order("created_at", { ascending: false }).limit(3)
      ]);

      if (knowledgeRes.data && knowledgeRes.data.length > 0) {
        knowledgeSnippets = knowledgeRes.data
          .map((k) => `[Source: ${k.title} (${k.source_type})]: ${k.content}`)
          .join("\n\n");
      }

      if (coursesRes.data && coursesRes.data.length > 0) {
        courseSnippets = coursesRes.data
          .map((c) => `[Course: ${c.title}]: ${c.description} (Access Tier: ${c.required_tier})`)
          .join("\n\n");
      }

      if (postsRes.data && postsRes.data.length > 0) {
        postSnippets = postsRes.data
          .map((p) => `[Discussion: "${p.title}"]: ${p.content?.slice(0, 300)}...`)
          .join("\n\n");
      }
    } catch (dbErr) {
      console.warn("Could not query dynamic grounding from database:", dbErr);
    }

    const groundTruthContext = `
=== COMMUNITY KNOWLEDGE REPOSITORY ===
${knowledgeSnippets || "AKStack AI Builders Club guidelines: Share real code, zero hype, respect builders."}

=== CLASSROOM CURRICULUM ===
${courseSnippets || "Agentic AI Engineering Masterclass (Free) and Full-Stack AI Architecture (Pro)."}

=== RECENT DISCUSSIONS ===
${postSnippets || "Discussions covering autonomous agents, containerization, and RLS database designs."}
`;

    const systemPrompt = `You are Nova, the friendly, brilliant, and supportive AI Study Buddy for AKSchool.
You assist members, founders, and students in the AKSchool AI Builders Club.

STRICT INSTRUCTIONS:
1. Always base your answers on the provided Community Knowledge Repository, Classroom Curriculum, and Discussions.
2. If citing a course or discussion, explicitly mention the title and source.
3. Be encouraging, clear, concise, structured, and format your answers with clean Markdown (bold highlights, bullet points, and code blocks).
4. Never mention internal vendor names, API keys, or infrastructure topology. Focus entirely on helping the user learn and build great software.`;

    let assistantAnswer = "";
    let reasoning = "";

    if (apiKey) {
      try {
        const response = await fetch(DEFAULT_MIMO_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model,
            temperature: 0.3,
            max_tokens: 1024,
            messages: [
              { role: "system", content: systemPrompt },
              {
                role: "user",
                content: `Ground Truth Context:\n${groundTruthContext}\n\nMember Question: "${question}"`,
              },
            ],
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const choice = data.choices?.[0]?.message;
          assistantAnswer = choice?.content || "";
          reasoning = choice?.reasoning_content || "";
        } else {
          const errText = await response.text();
          console.warn(`External AI API not OK (${response.status}): ${errText}`);
        }
      } catch (networkErr) {
        console.warn("External AI call failed, falling back to deterministic answer:", networkErr);
      }
    }

    // Deterministic fallback if API key is not configured or external call was empty
    if (!assistantAnswer) {
      const qLower = question.toLowerCase();
      if (qLower.includes("course") || qLower.includes("learn") || qLower.includes("masterclass")) {
        assistantAnswer = `We currently offer flagship courses in the **Classroom**:\n\n1. **Agentic AI Engineering Masterclass: From Zero to Production** (Free Tier): Covers autonomous loops, tool calling, and high-performance reasoning.\n2. **Full-Stack AI Application Engineering & Scalable Cloud Deployments** (Pro Tier): Covers Docker containers, CI/CD, and robust PostgreSQL architectures.\n\nCheck out the **Classroom** tab to start your next lesson!`;
      } else if (qLower.includes("rule") || qLower.includes("guideline") || qLower.includes("conduct")) {
        assistantAnswer = `**AKSchool Community Guidelines**:\n\n1. **Be helpful and share real code** — practical implementations over theory.\n2. **No ungrounded hype** — ground claims with benchmarks or metrics.\n3. **Zero spam** — respect the community focus.\n4. **Respect fellow builders** at all skill levels.`;
      } else if (qLower.includes("who are you") || qLower.includes("what is your name") || qLower.includes("nova") || qLower.includes("bot")) {
        assistantAnswer = `Hi there! I am **Nova**, your AKSchool AI Study Buddy 🤖✨.\n\nI am here to help you navigate course materials, understand architectural patterns, review code snippets, and answer questions about anything happening in our community. How can I help you today?`;
      } else {
        assistantAnswer = `In the **AKSchool AI Builders Club**, members collaborate on building autonomous agent loops, containerized micro-applications, and full-stack AI workflows.\n\n- Browse discussions in the **Community Feed**\n- Explore video masterclasses in the **Classroom**\n- View top builders in the **Members** directory\n- Or ask me any specific question about building your next project!`;
      }
    }

    return NextResponse.json({
      answer: assistantAnswer,
      reasoning: reasoning || null,
      assistantName: "Nova AI",
      grounded: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("AI Assistant route error:", error);
    return NextResponse.json(
      { error: "Internal error processing AI query." },
      { status: 500 }
    );
  }
}
