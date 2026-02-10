"use client"

import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const handleCallback = async () => {
      const supabase = createClient()

      // Exchange code for session
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession()

      if (error) {
        console.error("Error during OAuth callback:", error)
        router.push("/auth/login?error=oauth_failed")
        return
      }

      if (session) {
        // Redirect to app after successful authentication
        router.push("/app")
      } else {
        router.push("/auth/login")
      }
    }

    handleCallback()
  }, [router])

  return (
    <div className="flex min-h-screen w-full items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  )
}
