export const dynamic = "force-dynamic"

import { type NextRequest, NextResponse } from "next/server"
import sql from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { storyId } = await request.json()
    const sessionId = request.cookies.get("ds_session_id")?.value

    if (!sessionId || !storyId) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    }

    await sql`DELETE FROM stories WHERE id = ${storyId} AND session_id = ${sessionId}`

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting story:", error)
    return NextResponse.json({ error: "Failed to delete story" }, { status: 500 })
  }
}
