"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Star } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { Story } from "@/lib/types"
import Image from "next/image"

interface StoryReaderProps {
  story: Story
}

export function StoryReader({ story }: StoryReaderProps) {
  const [rating, setRating] = useState(story.rating || 0)
  const { toast } = useToast()

  console.log("[v0] StoryReader - Full story object:", story)
  console.log("[v0] StoryReader - Images field:", story.images)
  console.log("[v0] StoryReader - Images type:", typeof story.images)
  console.log("[v0] StoryReader - Images is array:", Array.isArray(story.images))
  console.log("[v0] StoryReader - Images length:", story.images?.length)
  if (story.images && story.images.length > 0) {
    console.log("[v0] StoryReader - First image structure:", story.images[0])
    console.log("[v0] StoryReader - All images:", JSON.stringify(story.images, null, 2))
  }

  const handleRate = async (newRating: number) => {
    try {
      const response = await fetch("/api/rate-story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storyId: story.id,
          rating: newRating,
        }),
      })

      if (!response.ok) throw new Error("Failed to rate story")

      setRating(newRating)
      toast({
        title: "Thanks for Rating!",
        description: "Your feedback helps us create better stories",
      })
    } catch (error) {
      console.error("Error rating story:", error)
      toast({
        title: "Rating Failed",
        description: "Please try again",
        variant: "destructive",
      })
    }
  }

  // Split content into paragraphs
  const paragraphs = story.content.split("\n").filter((p) => p.trim())

  const hasImages = story.images && Array.isArray(story.images) && story.images.length > 0
  console.log("[v0] StoryReader - hasImages:", hasImages)

  // Distribute images throughout the story
  const contentWithImages = []
  const imageInterval = hasImages ? Math.floor(paragraphs.length / (story.images.length + 1)) : 0

  console.log("[v0] StoryReader - imageInterval:", imageInterval)
  console.log("[v0] StoryReader - paragraphs length:", paragraphs.length)

  let imageIndex = 0
  for (let i = 0; i < paragraphs.length; i++) {
    contentWithImages.push({ type: "text", content: paragraphs[i] })

    // Insert image after certain intervals
    if (hasImages && imageIndex < story.images.length && (i + 1) % imageInterval === 0 && i < paragraphs.length - 1) {
      console.log(`[v0] StoryReader - Inserting image ${imageIndex} at position ${i}`)
      contentWithImages.push({
        type: "image",
        content: story.images[imageIndex],
      })
      imageIndex++
    }
  }

  // Add any remaining images at the end
  if (hasImages) {
    while (imageIndex < story.images.length) {
      console.log(`[v0] StoryReader - Adding remaining image ${imageIndex} at end`)
      contentWithImages.push({
        type: "image",
        content: story.images[imageIndex],
      })
      imageIndex++
    }
  }

  console.log("[v0] StoryReader - contentWithImages length:", contentWithImages.length)
  console.log("[v0] StoryReader - Image items:", contentWithImages.filter((item) => item.type === "image").length)

  return (
    <div className="bedtime-mode">
      <article className="max-w-3xl mx-auto px-4 py-12 space-y-8">
        {/* Title */}
        <header className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full text-sm">
            <span className="capitalize">{story.genre}</span>
            {story.child_name && (
              <>
                <span className="text-muted-foreground">•</span>
                <span>Starring {story.child_name}</span>
              </>
            )}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-balance font-[family-name:var(--font-storybook)]">
            {story.title}
          </h1>
          <p className="text-sm text-muted-foreground">{story.reading_time} minute bedtime story</p>
        </header>

        {/* Story Content */}
        <div className="space-y-8">
          {contentWithImages.map((item, index) => {
            if (item.type === "image") {
              console.log(`[v0] StoryReader - Rendering image at index ${index}:`, item.content)
            }

            return item.type === "text" ? (
              <p
                key={`text-${index}`}
                className="text-lg md:text-xl leading-relaxed text-pretty font-[family-name:var(--font-storybook)]"
              >
                {item.content}
              </p>
            ) : (
              <Card key={`image-${index}`} className="overflow-hidden">
                <div className="relative aspect-video w-full">
                  <Image
                    src={
                      typeof item.content === "string"
                        ? item.content
                        : item.content?.url || `/placeholder.svg?height=400&width=600`
                    }
                    alt={
                      typeof item.content === "string"
                        ? `Story illustration ${index}`
                        : item.content?.scene || `Story illustration ${index}`
                    }
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 768px"
                    onLoad={() => {
                      console.log(`[v0] StoryReader - Image ${index} loaded successfully`)
                    }}
                    onError={(e) => {
                      console.error(`[v0] StoryReader - Image ${index} failed to load:`, item.content)
                      // Fallback to placeholder on error
                      e.currentTarget.src = "/placeholder.svg?height=400&width=600"
                    }}
                  />
                </div>
                {typeof item.content !== "string" && item.content?.scene && (
                  <div className="p-3 text-xs text-muted-foreground italic border-t">{item.content.scene}</div>
                )}
              </Card>
            )
          })}
        </div>

        {/* Rating Section */}
        <Card className="p-6">
          <div className="text-center space-y-4">
            <h3 className="text-lg font-semibold">How was the story?</h3>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Button key={star} variant="ghost" size="lg" onClick={() => handleRate(star)} className="p-2">
                  <Star
                    className={`w-8 h-8 ${star <= rating ? "fill-primary text-primary" : "text-muted-foreground"}`}
                  />
                </Button>
              ))}
            </div>
            {rating > 0 && <p className="text-sm text-muted-foreground">Thanks for rating this story!</p>}
          </div>
        </Card>

        {/* The End */}
        <div className="text-center py-8">
          <p className="text-2xl font-[family-name:var(--font-storybook)] text-muted-foreground">The End 🌙</p>
          <p className="text-sm text-muted-foreground mt-2">Sweet dreams!</p>
        </div>
      </article>
    </div>
  )
}
