export const dynamic = "force-dynamic"

import { type NextRequest, NextResponse } from "next/server"
import sql from "@/lib/db"

export async function GET(request: NextRequest) {
  const sessionId = request.cookies.get("ds_session_id")?.value
  if (!sessionId) {
    return NextResponse.json({ count: 0, limit: 10 })
  }

  const result = await sql`
    SELECT COUNT(*)::int AS count FROM stories WHERE session_id = ${sessionId}
  `
  return NextResponse.json({ count: result[0].count, limit: 10 })
}
