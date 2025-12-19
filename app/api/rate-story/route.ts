import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { storyId, rating } = await request.json()

    if (!storyId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Invalid rating" }, { status: 400 })
    }

    const supabase = await createClient()

    // Verify user authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Update story rating
    const { error: updateError } = await supabase
      .from("stories")
      .update({ rating })
      .eq("id", storyId)
      .eq("user_id", user.id)

    if (updateError) throw updateError

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error rating story:", error)
    return NextResponse.json({ error: "Failed to rate story" }, { status: 500 })
  }
}
