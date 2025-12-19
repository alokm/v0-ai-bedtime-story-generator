"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Sparkles, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { Genre } from "@/lib/types"

const genres: { value: Genre; label: string; emoji: string }[] = [
  { value: "fantasy", label: "Fantasy", emoji: "🧚" },
  { value: "sci-fi", label: "Sci-Fi", emoji: "🚀" },
  { value: "animals", label: "Animals", emoji: "🦁" },
  { value: "superheroes", label: "Superheroes", emoji: "🦸" },
  { value: "calming", label: "Calming", emoji: "🌙" },
]

interface StoryCreatorProps {
  userId: string
}

export function StoryCreator({ userId }: StoryCreatorProps) {
  const [selectedGenre, setSelectedGenre] = useState<Genre>("fantasy")
  const [theme, setTheme] = useState("")
  const [context, setContext] = useState("")
  const [childName, setChildName] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleGenerate = async () => {
    if (!selectedGenre) {
      toast({
        title: "Genre Required",
        description: "Please select a story genre",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    console.log("[v0] Starting story generation with data:", {
      userId,
      genre: selectedGenre,
      theme: theme || undefined,
      context: context || undefined,
      childName: childName || undefined,
    })

    try {
      const response = await fetch("/api/generate-story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          genre: selectedGenre,
          theme: theme || undefined,
          context: context || undefined,
          childName: childName || undefined,
        }),
      })

      console.log("[v0] API response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("[v0] API error response:", errorData)
        throw new Error(errorData.details || errorData.error || "Failed to generate story")
      }

      const { storyId } = await response.json()
      console.log("[v0] Story generated successfully, ID:", storyId)

      router.push(`/app/story/${storyId}`)
    } catch (error) {
      console.error("[v0] Error generating story:", error)
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to create your story. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center space-y-3">
        <h2 className="text-4xl font-bold text-balance">Weave a Magical Dream</h2>
        <p className="text-lg text-muted-foreground text-balance">
          Tell us about your child's day and we'll create a personalized bedtime story
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Story Details</CardTitle>
          <CardDescription>Customize your story with these details (5-minute reading time)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Genre Selection */}
          <div className="space-y-3">
            <Label>Choose a Genre</Label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {genres.map((genre) => (
                <button
                  key={genre.value}
                  type="button"
                  onClick={() => setSelectedGenre(genre.value)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedGenre === genre.value
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="text-3xl mb-2">{genre.emoji}</div>
                  <div className="text-sm font-medium">{genre.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Child's Name */}
          <div className="space-y-2">
            <Label htmlFor="childName">Child's Name (Optional)</Label>
            <Input
              id="childName"
              placeholder="e.g., Emma"
              value={childName}
              onChange={(e) => setChildName(e.target.value)}
              maxLength={50}
            />
            <p className="text-xs text-muted-foreground">Make your child the hero of the story</p>
          </div>

          {/* Theme/Lesson */}
          <div className="space-y-2">
            <Label htmlFor="theme">Theme or Lesson (Optional)</Label>
            <Input
              id="theme"
              placeholder="e.g., The importance of sharing"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              maxLength={100}
            />
            <p className="text-xs text-muted-foreground">Add a moral or lesson to weave into the story</p>
          </div>

          {/* Context from their day */}
          <div className="space-y-2">
            <Label htmlFor="context">Today's Adventure (Optional)</Label>
            <Textarea
              id="context"
              placeholder="e.g., Visited grandma, lost a tooth, learned to ride a bike"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              maxLength={200}
              rows={3}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              {context.length}/200 characters - Add details from your child's day
            </p>
          </div>

          <Button onClick={handleGenerate} disabled={isGenerating} size="lg" className="w-full text-lg h-14">
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Weaving Your Dream...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Weave a Dream
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
