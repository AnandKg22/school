import { NextResponse } from "next/server";
import { MOCK_POSTS } from "@/lib/school-mock";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rawPostId = body.post_id || body.postId;
    const rawOptionId = body.option_id || body.optionId;

    if (!rawPostId || !rawOptionId) {
      return NextResponse.json(
        { success: false, error: "post_id and option_id are required" },
        { status: 400 }
      );
    }
    const post_id = rawPostId;
    const option_id = rawOptionId;

    const post = MOCK_POSTS.find((p) => p.id === post_id);
    if (!post || !post.poll) {
      return NextResponse.json(
        { success: false, error: "Poll not found on post" },
        { status: 404 }
      );
    }

    const previousVotedId = post.poll.user_voted_option_id;

    post.poll.options = post.poll.options.map((opt) => {
      if (opt.id === option_id) {
        return { ...opt, votes_count: opt.votes_count + 1 };
      }
      if (previousVotedId && opt.id === previousVotedId) {
        return { ...opt, votes_count: Math.max(0, opt.votes_count - 1) };
      }
      return opt;
    });

    if (!previousVotedId) {
      post.poll.total_votes += 1;
    }
    post.poll.user_voted_option_id = option_id;

    const total = post.poll.total_votes;
    const optionsWithPercent = post.poll.options.map((opt) => ({
      ...opt,
      percentage: total > 0 ? Math.round((opt.votes_count / total) * 100) : 0,
    }));

    return NextResponse.json({
      success: true,
      poll: post.poll,
      data: {
        totalVotes: post.poll.total_votes,
        hasVoted: true,
        userVotedOptionId: option_id,
        options: optionsWithPercent,
      },
      message: "Vote recorded successfully",
    });
  } catch (error: any) {
    console.error("Poll vote error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to record poll vote" },
      { status: 500 }
    );
  }
}
