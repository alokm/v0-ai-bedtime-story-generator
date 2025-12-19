import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { StoryCreator } from "@/components/story-creator"
import { LibraryLink } from "@/components/library-link"
import { SignOutButton } from "@/components/sign-out-button"
import { ThemeToggle } from "@/components/theme-toggle"
import { Sparkles } from "lucide-react"

export default async function AppPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold">DreamSpark</h1>
          </div>
          <div className="flex items-center gap-3">
            <LibraryLink />
            <ThemeToggle />
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <StoryCreator userId={data.user.id} />
      </main>
    </div>
  )
}
