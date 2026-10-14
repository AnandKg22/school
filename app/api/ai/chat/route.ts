import { NextRequest, NextResponse } from "next/server";
import { MOCK_AI_KNOWLEDGE, MOCK_POSTS, MOCK_COURSES } from "@/lib/school-mock";

const DEFAULT_MIMO_URL = "https://token-plan-sgp.xiaomimimo.com/v1/chat/completions";
const DEFAULT_MIMO_KEY = process.env.MIMO_API_KEY || "tp-spbijc5cwclk2lwi945bxnikhr7htj4lrduaism00vgjhmdd";

export async function POST(req: NextRequest) {
  try {
    const { question, customApiKey, customModel } = await req.json();

    if (!question || typeof question !== "string") {
      return NextResponse.json({ error: "A valid question is required." }, { status: 400 });
    }

    const apiKey = customApiKey?.trim() || DEFAULT_MIMO_KEY;
    const model = customModel?.trim() || "mimo-v2.6-flash";

    // Build Grounding Context from Community Posts, Courses, and Knowledge Base
    const knowledgeSnippets = MOCK_AI_KNOWLEDGE.map(
      (k) => `[Source: ${k.title} (${k.source_type})]: ${k.content}`
    ).join("\n\n");

    const courseSnippets = MOCK_COURSES.map(
      (c) => `[Course: ${c.title}]: ${c.description} (Access Tier: ${c.required_tier})`
    ).join("\n\n");

    const postSnippets = MOCK_POSTS.slice(0, 3)
      .map((p) => `[Discussion: "${p.title}" by ${p.author.full_name}]: ${p.content.slice(0, 300)}...`)
      .join("\n\n");

    const groundTruthContext = `
=== COMMUNITY KNOWLEDGE REPOSITORY ===
${knowledgeSnippets}

=== CLASSROOM CURRICULUM ===
${courseSnippets}

=== RECENT DISCUSSIONS ===
${postSnippets}
`;

    const systemPrompt = `You are Nova, the friendly, brilliant, and supportive AI Study Buddy for AKSchool.
You assist members, founders, and students in the AKSchool AI Builders Club.

STRICT INSTRUCTIONS:
1. Always base your answers on the provided Community Knowledge Repository, Classroom Curriculum, and Discussions.
2. If citing a course or discussion, explicitly mention the title and source.
3. Be encouraging, clear, concise, structured, and format your answers with clean Markdown (bold highlights, bullet points, and code blocks).
4. Never mention internal vendor names, token plans, or internal server configurations. Focus entirely on helping the user learn and build great software.`;

    let assistantAnswer = "";
    let reasoning = "";

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
        console.warn(`AI API response not OK (${response.status}): ${errText}`);
      }
    } catch (networkErr) {
      console.warn("External AI call failed, using deterministic fallback:", networkErr);
    }

    // Fallback if external API was unreachable or empty
    if (!assistantAnswer) {
      const qLower = question.toLowerCase();
      if (qLower.includes("course") || qLower.includes("learn") || qLower.includes("masterclass")) {
        assistantAnswer = `We currently offer 2 flagship courses in the **Classroom**:\n\n1. **Agentic AI Engineering Masterclass: From Zero to Production** (Free Tier): 4 modules covering autonomous loops, tool calling, and high-performance reasoning.\n2. **Full-Stack AI Application Engineering & Scalable Cloud Deployments** (Pro Tier): 4 modules covering production Docker containers, automated CI/CD, and robust PostgreSQL architectures.\n\nCheck out the **Classroom** tab to start watching Lesson 1.1 right now!`;
      } else if (qLower.includes("rule") || qLower.includes("guideline") || qLower.includes("conduct")) {
        assistantAnswer = `**AKSchool Community Guidelines**:\n\n1. **Be helpful and share real code** — practical implementations over theory.\n2. **No ungrounded hype** — ground claims with benchmarks or metrics.\n3. **Zero spam** — respect the community focus.\n4. **Respect fellow builders** at all skill levels.`;
      } else if (qLower.includes("who are you") || qLower.includes("what is your name") || qLower.includes("nova") || qLower.includes("bot")) {
        assistantAnswer = `Hi there! I am **Nova**, your AKSchool AI Study Buddy 🤖✨.\n\nI am here to help you navigate course materials, understand complex architectural patterns, review code snippets, and answer questions about anything happening in our community. How can I help you today?`;
      } else {
        assistantAnswer = `Thanks for asking! In the **AKSchool AI Builders Club**, members collaborate on building autonomous agent loops, containerized micro-applications, and full-stack AI workflows.\n\n- You can browse discussions in **Community Feed**\n- Explore video masterclasses in the **Classroom**\n- View top builders on the **Members** directory\n- Or ask me any specific question about building your next project!`;
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
    console.error("AI Assistant error:", error);
    return NextResponse.json(
      { error: "Internal error processing AI query." },
      { status: 500 }
    );
  }
}
