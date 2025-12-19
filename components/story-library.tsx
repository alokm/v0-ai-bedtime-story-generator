"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, Star, Trash2, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import type { Story } from "@/lib/types"
import Image from "next/image"

interface StoryLibraryProps {
  userId: string
}

export function StoryLibrary({ userId }: StoryLibraryProps) {
  const [stories, setStories] = useState<Story[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    loadStories()
  }, [userId])

  const loadStories = async () => {
    try {
      const { data, error } = await supabase
        .from("stories")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (error) throw error
      setStories(data || [])
    } catch (error) {
      console.error("Error loading stories:", error)
      toast({
        title: "Failed to Load Stories",
        description: "Please try refreshing the page",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (storyId: string) => {
    if (!confirm("Are you sure you want to delete this story?")) return

    setDeletingId(storyId)
    try {
      const { error } = await supabase.from("stories").delete().eq("id", storyId).eq("user_id", userId)

      if (error) throw error

      setStories(stories.filter((s) => s.id !== storyId))
      toast({
        title: "Story Deleted",
        description: "The story has been removed from your library",
      })
    } catch (error) {
      console.error("Error deleting story:", error)
      toast({
        title: "Delete Failed",
        description: "Please try again",
        variant: "destructive",
      })
    } finally {
      setDeletingId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (stories.length === 0) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <CardTitle>No Stories Yet</CardTitle>
          <CardDescription>Create your first magical bedtime story to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => router.push("/app")} className="w-full">
            Create a Story
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">Your Story Library</h2>
        <p className="text-muted-foreground">
          {stories.length} {stories.length === 1 ? "story" : "stories"} saved
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stories.map((story) => (
          <Card key={story.id} className="group hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              {story.images.length > 0 && (
                <div className="relative aspect-video w-full rounded-lg overflow-hidden mb-3">
                  <Image
                    src={story.images[0].url || "/placeholder.svg"}
                    alt={story.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
              )}
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="capitalize">{story.genre}</span>
                  <span>•</span>
                  <span>{story.reading_time} min</span>
                </div>
                <CardTitle className="text-lg line-clamp-2">{story.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {story.child_name && <p className="text-sm text-muted-foreground">Starring {story.child_name}</p>}

              {story.rating && (
                <div className="flex items-center gap-1">
                  {Array.from({ length: story.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <Button onClick={() => router.push(`/app/story/${story.id}`)} className="flex-1" size="sm">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Read
                </Button>
                <Button
                  onClick={() => handleDelete(story.id)}
                  variant="outline"
                  size="sm"
                  disabled={deletingId === story.id}
                >
                  {deletingId === story.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
