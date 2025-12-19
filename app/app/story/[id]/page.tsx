import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { StoryReader } from "@/components/story-reader"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Sparkles } from "lucide-react"
import Link from "next/link"
import { SignOutButton } from "@/components/sign-out-button"
import { ThemeToggle } from "@/components/theme-toggle"

export default async function StoryPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: authData, error: authError } = await supabase.auth.getUser()
  if (authError || !authData?.user) {
    redirect("/auth/login")
  }

  console.log("[v0] Fetching story with ID:", id)

  const { data: story, error: storyError } = await supabase
    .from("stories")
    .select("*")
    .eq("id", id)
    .eq("user_id", authData.user.id)
    .single()

  console.log("[v0] Story fetch result - Error:", storyError)
  console.log("[v0] Story fetch result - Data:", story)
  console.log("[v0] Story images field:", story?.images)
  console.log("[v0] Story images type:", typeof story?.images)
  console.log("[v0] Story images is array:", Array.isArray(story?.images))

  if (storyError || !story) {
    redirect("/app/library")
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="icon">
              <Link href="/app/library">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary" />
              <h1 className="text-xl font-bold">DreamSpark</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <SignOutButton />
          </div>
        </div>
      </header>

      <main>
        <StoryReader story={story} />
      </main>
    </div>
  )
}
