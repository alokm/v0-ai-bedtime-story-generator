import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { generateText } from "ai"
import * as fal from "@fal-ai/serverless-client"

// Configure fal client
fal.config({
  credentials: process.env.FAL_KEY,
})

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Starting story generation request")
    const { userId, genre, theme, context, childName } = await request.json()

    if (!userId || !genre) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (!process.env.FAL_KEY) {
      console.error("[v0] FAL_KEY environment variable is missing")
      return NextResponse.json({ error: "Image generation not configured" }, { status: 500 })
    }

    const supabase = await createClient()

    // Verify user authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user || user.id !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Build the story prompt
    const protagonist = childName || "a brave young hero"
    const storyTheme = theme ? `The story should teach the lesson: ${theme}.` : ""
    const dailyContext = context ? `Incorporate these events from their day: ${context}.` : ""

    const storyPrompt = `You are a professional children's book author specializing in bedtime stories for ages 3-10.

Create a magical, soothing bedtime story in the ${genre} genre featuring ${protagonist} as the main character.

Requirements:
- Word count: 700-900 words
- Reading level: Appropriate for ages 3-10 (Flesch-Kincaid Grade 2-4)
- Structure: Clear beginning, gentle rising action, positive climax, calming resolution
- Tone: Magical, comforting, age-appropriate, and optimistic
- Ending: Must be peaceful and reassuring to help children fall asleep
${storyTheme}
${dailyContext}

CRITICAL SAFETY RULES:
- NO violence, horror, scary content, or anything disturbing
- NO adult themes or inappropriate content
- Keep everything positive, gentle, and child-friendly
- Focus on wonder, friendship, courage, and comfort

First, provide a short, catchy title (max 60 characters).
Then write the complete story.

Format your response as:
TITLE: [Your title here]
STORY: [Your story here]`

    console.log("[v0] Generating story text...")

    const { text: storyText } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt: storyPrompt,
      temperature: 0.8,
    })

    // Parse title and content
    const titleMatch = storyText.match(/TITLE:\s*(.+?)(?:\n|STORY:)/i)
    const storyMatch = storyText.match(/STORY:\s*(.+)/is)

    const title = titleMatch?.[1]?.trim() || `A ${genre} Adventure`
    const content = storyMatch?.[1]?.trim() || storyText

    console.log("[v0] Story generated - Title:", title)

    const scenesPrompt = `Based on this children's bedtime story, create detailed image prompts for 5 beautiful storybook illustrations.

Story: ${content}

First, identify the main character(s) and their key visual characteristics (appearance, clothing, distinctive features).

Then, for each of the 5 key scenes, provide:
1. The scene description with specific visual details
2. Character appearances (consistent across all scenes)
3. Setting details (time of day, environment, atmosphere)
4. Mood and lighting
5. Important objects or elements in the scene

Make each description vivid, specific, and perfect for generating a watercolor storybook illustration.

Format each scene as:
SCENE 1: [Detailed visual description including characters, setting, mood, and key elements - 40-60 words]

Provide exactly 5 scenes that span the story from beginning to end.`

    console.log("[v0] Extracting detailed visual scenes...")

    const { text: scenesText } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt: scenesPrompt,
      temperature: 0.7,
    })

    // Parse scenes with improved extraction
    const sceneMatches = scenesText.matchAll(/SCENE\s*\d*:\s*(.+?)(?=SCENE\s*\d*:|$)/gis)
    const scenes = Array.from(sceneMatches)
      .map((match) => match[1].trim())
      .filter((scene) => scene.length > 20)
      .slice(0, 5)

    console.log("[v0] Extracted", scenes.length, "detailed scenes for illustration")

    if (scenes.length === 0) {
      console.error("[v0] Failed to extract scenes, using default")
      scenes.push(
        `${protagonist} beginning their magical ${genre} adventure in a dreamy, twilight setting`,
        `${protagonist} discovering something wonderful and magical, eyes wide with amazement`,
        `${protagonist} making a new friend in a warm, welcoming environment`,
        `${protagonist} overcoming a gentle challenge with courage and kindness`,
        `${protagonist} in a peaceful, happy ending scene under soft moonlight`,
      )
    }

    console.log("[v0] Generating images with fal.ai...")

    const images = []

    for (let i = 0; i < scenes.length; i++) {
      const scene = scenes[i]
      console.log(`[v0] ==================== IMAGE ${i + 1}/${scenes.length} ====================`)
      console.log(`[v0] Scene description:`, scene)

      try {
        const imagePrompt = `A professional children's book illustration in soft watercolor style: ${scene}. 
Style: Gentle, dreamy watercolor painting with soft edges and luminous colors. Warm, comforting palette perfect for bedtime. 
Quality: High-quality children's storybook art, detailed but soothing, magical realism style similar to classic picture books.
Mood: Peaceful, enchanting, and age-appropriate for children 3-10 years old.`

        console.log(`[v0] Full fal prompt being sent:`)
        console.log(imagePrompt)
        console.log(`[v0] fal input parameters:`, {
          model: "fal-ai/flux/schnell",
          image_size: "landscape_16_9",
          num_inference_steps: 4,
          num_images: 1,
        })

        console.log(`[v0] Calling fal.subscribe...`)
        const result = await fal.subscribe("fal-ai/flux/schnell", {
          input: {
            prompt: imagePrompt,
            image_size: "landscape_16_9",
            num_inference_steps: 4,
            num_images: 1,
          },
          logs: true,
        })

        console.log(`[v0] Complete fal API response:`)
        console.log(JSON.stringify(result, null, 2))

        console.log(`[v0] Parsed response details:`, {
          hasImages: !!result.images,
          imageCount: result.images?.length,
          firstImage: result.images?.[0],
          allImageUrls: result.images?.map((img) => img.url),
        })

        const imageUrl = result.images?.[0]?.url

        if (imageUrl && !imageUrl.includes("placeholder")) {
          console.log(`[v0] ✓ Successfully generated image ${i + 1}`)
          console.log(`[v0] Image URL:`, imageUrl)
          images.push({ url: imageUrl, scene })
        } else {
          console.error(`[v0] ✗ No valid image URL returned for scene ${i + 1}`)
          console.error(`[v0] imageUrl value:`, imageUrl)
          images.push({
            url: `/placeholder.svg?height=400&width=600&query=${encodeURIComponent(scene)}`,
            scene,
          })
        }
      } catch (error) {
        console.error(`[v0] ✗ Error generating image ${i + 1}:`)
        console.error(`[v0] Error type:`, error?.constructor?.name)
        console.error(`[v0] Error message:`, error instanceof Error ? error.message : String(error))
        console.error(`[v0] Full error object:`, JSON.stringify(error, null, 2))
        images.push({
          url: `/placeholder.svg?height=400&width=600&query=${encodeURIComponent(scene)}`,
          scene,
        })
      }
    }

    const realImageCount = images.filter((img) => !img.url.includes("placeholder")).length
    console.log(`[v0] Generated ${realImageCount}/${images.length} real images`)

    console.log(
      "[v0] Images to save:",
      JSON.stringify(
        images.map((img) => ({
          url: img.url.substring(0, 100),
          isPlaceholder: img.url.includes("placeholder"),
        })),
      ),
    )

    console.log("[v0] Saving story to database...")
    const { data: story, error: dbError } = await supabase
      .from("stories")
      .insert({
        user_id: userId,
        title,
        genre,
        theme: theme || null,
        context: context || null,
        child_name: childName || null,
        content,
        images: images,
        reading_time: 5,
      })
      .select()
      .single()

    if (dbError) {
      console.error("[v0] Database error:", dbError)
      throw dbError
    }

    console.log("[v0] ✓ Story saved successfully with ID:", story.id)
    console.log("[v0] ✓ Saved story has", story.images?.length, "images")

    return NextResponse.json({ storyId: story.id })
  } catch (error) {
    console.error("[v0] ✗ Error generating story:", error)
    return NextResponse.json(
      {
        error: "Failed to generate story",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
