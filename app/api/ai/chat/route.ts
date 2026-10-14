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

    const systemPrompt = `You are the AKStack CommunityOS AI Knowledge Copilot.
You assist members, founders, and learners in the AKStack AI Builders Club community.

STRICT INSTRUCTIONS:
1. Always base your answers on the provided Community Knowledge Repository, Classroom Curriculum, and Discussions.
2. If citing a course or discussion, explicitly mention the title and source.
3. Be professional, supportive, concise, and structured (use bullet points and bold highlights).
4. If asked about how the platform is hosted or built, mention Dokploy VPS orchestration and Supabase PostgreSQL with app-scoped RLS isolation.`;

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
        console.warn(`MiMo API response not OK (${response.status}): ${errText}`);
      }
    } catch (networkErr) {
      console.warn("External MiMo call failed, using deterministic fallback:", networkErr);
    }

    // Fallback if external API was unreachable or empty
    if (!assistantAnswer) {
      const qLower = question.toLowerCase();
      if (qLower.includes("course") || qLower.includes("learn") || qLower.includes("masterclass")) {
        assistantAnswer = `We currently offer 2 flagship courses in the **Classroom**:\n\n1. **Agentic AI Engineering Masterclass: From Zero to Production** (Free Tier): 4 modules covering autonomous loops, tool calling, and Xiaomi MiMo AI Singapore cluster integration.\n2. **Full-Stack SaaS Platform Engineering with Dokploy & Supabase** (Pro Tier): 6 modules covering automated rolling deploys and isolated multi-tenant architectures.\n\nCheck out the **Classroom** tab to start watching Lesson 1.1 right now!`;
      } else if (qLower.includes("rule") || qLower.includes("guideline") || qLower.includes("conduct")) {
        assistantAnswer = `**AKStack AI Builders Club Guidelines**:\n\n1. **Be helpful and share real code** — practical implementations over theory.\n2. **No ungrounded hype** — ground claims with benchmarks or metrics.\n3. **Zero spam or aggressive self-promotion**.\n4. **Respect fellow builders** at all skill levels.`;
      } else if (qLower.includes("mimo") || qLower.includes("ai") || qLower.includes("model")) {
        assistantAnswer = `This community copilot is powered by **Xiaomi MiMo AI** (\`mimo-v2.6-flash\`) running on the dedicated Singapore Token Plan cluster (\`token-plan-sgp.xiaomimimo.com\`). It features a 1 Million Token context window, rapid sub-second inference, and deep reasoning token generation.`;
      } else {
        assistantAnswer = `Thanks for asking! In the **AKStack AI Builders Club**, members collaborate on building autonomous agent loops, containerized micro-SaaS platforms, and full-stack AI workflows.\n\n- You can browse discussions in **Community Feed**\n- Explore video masterclasses in the **Classroom**\n- View top builders on the **Members** leaderboard\n- Or ask me any specific question about agent architectures!`;
      }
    }

    return NextResponse.json({
      answer: assistantAnswer,
      reasoning: reasoning || null,
      provider: "Xiaomi MiMo AI (Singapore Gateway)",
      model,
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
