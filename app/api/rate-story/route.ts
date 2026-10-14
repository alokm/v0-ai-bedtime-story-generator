export const dynamic = "force-dynamic"

import { type NextRequest, NextResponse } from "next/server"
import sql from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { storyId, rating } = await request.json()

    if (!storyId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Invalid rating" }, { status: 400 })
    }

    const sessionId = request.cookies.get("ds_session_id")?.value
    if (!sessionId) {
      return NextResponse.json({ error: "No session" }, { status: 401 })
    }

    await sql`
      UPDATE stories SET rating = ${rating}
      WHERE id = ${storyId} AND session_id = ${sessionId}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error rating story:", error)
    return NextResponse.json({ error: "Failed to rate story" }, { status: 500 })
  }
}
