import { type NextRequest, NextResponse } from "next/server"
import sql from "@/lib/db"
import { generateText } from "ai"
import { anthropic } from "@ai-sdk/anthropic"
import * as fal from "@fal-ai/serverless-client"

const SESSION_LIMIT = 10
const SESSION_COOKIE = "ds_session_id"

fal.config({
  credentials: process.env.FAL_KEY,
})

export async function POST(request: NextRequest) {
  try {
    // Resolve or create session
    let sessionId = request.cookies.get(SESSION_COOKIE)?.value
    const isNewSession = !sessionId
    if (!sessionId) {
      sessionId = crypto.randomUUID()
    }

    // Enforce session limit
    const countResult = await sql`
      SELECT COUNT(*)::int AS count FROM stories WHERE session_id = ${sessionId}
    `
    const storyCount = countResult[0].count
    if (storyCount >= SESSION_LIMIT) {
      return NextResponse.json(
        { error: `You've reached the ${SESSION_LIMIT} story limit for this session` },
        { status: 429 }
      )
    }

    const { genre, theme, context, childName } = await request.json()

    if (!genre) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (!process.env.FAL_KEY) {
      return NextResponse.json({ error: "Image generation not configured" }, { status: 500 })
    }

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

    const { text: storyText } = await generateText({
      model: anthropic("claude-haiku-4-5-20251001"),
      prompt: storyPrompt,
      temperature: 0.8,
    })

    const titleMatch = storyText.match(/TITLE:\s*(.+?)(?:\n|STORY:)/i)
    const storyMatch = storyText.match(/STORY:\s*(.+)/is)

    const title = titleMatch?.[1]?.trim() || `A ${genre} Adventure`
    const content = storyMatch?.[1]?.trim() || storyText

    const scenesPrompt = `Based on this children's bedtime story, create detailed image prompts for 5 beautiful storybook illustrations.

Story: ${content}

For each of the 5 key scenes provide a vivid visual description including characters, setting, mood, and key elements.

Format each scene as:
SCENE 1: [Detailed visual description - 40-60 words]

Provide exactly 5 scenes spanning the story from beginning to end.`

    const { text: scenesText } = await generateText({
      model: anthropic("claude-haiku-4-5-20251001"),
      prompt: scenesPrompt,
      temperature: 0.7,
    })

    const sceneMatches = scenesText.matchAll(/SCENE\s*\d*:\s*(.+?)(?=SCENE\s*\d*:|$)/gis)
    let scenes = Array.from(sceneMatches)
      .map((match) => match[1].trim())
      .filter((scene) => scene.length > 20)
      .slice(0, 5)

    if (scenes.length === 0) {
      scenes = [
        `${protagonist} beginning their magical ${genre} adventure in a dreamy twilight setting`,
        `${protagonist} discovering something wonderful, eyes wide with amazement`,
        `${protagonist} making a new friend in a warm welcoming environment`,
        `${protagonist} overcoming a gentle challenge with courage and kindness`,
        `${protagonist} in a peaceful happy ending scene under soft moonlight`,
      ]
    }

    const images: { url: string; scene: string }[] = []
    for (let i = 0; i < scenes.length; i++) {
      const scene = scenes[i]
      try {
        const imagePrompt = `A professional children's book illustration in soft watercolor style: ${scene}.
Style: Gentle, dreamy watercolor painting with soft edges and luminous colors. Warm, comforting palette perfect for bedtime.
Quality: High-quality children's storybook art, detailed but soothing, magical realism style similar to classic picture books.
Mood: Peaceful, enchanting, and age-appropriate for children 3-10 years old.`

        const result = await fal.subscribe("fal-ai/flux/schnell", {
          input: {
            prompt: imagePrompt,
            image_size: "landscape_16_9",
            num_inference_steps: 4,
            num_images: 1,
          },
          logs: true,
        }) as { images?: { url: string }[] }

        const imageUrl = result.images?.[0]?.url
        if (imageUrl && !imageUrl.includes("placeholder")) {
          images.push({ url: imageUrl, scene })
        } else {
          images.push({ url: `/placeholder.svg?height=400&width=600`, scene })
        }
      } catch {
        images.push({ url: `/placeholder.svg?height=400&width=600`, scene })
      }
    }

    const [story] = await sql`
      INSERT INTO stories (session_id, title, genre, theme, context, child_name, content, images, reading_time)
      VALUES (
        ${sessionId}, ${title}, ${genre},
        ${theme || null}, ${context || null}, ${childName || null},
        ${content}, ${JSON.stringify(images)}, 5
      )
      RETURNING id
    `

    const response = NextResponse.json({ storyId: story.id })
    if (isNewSession) {
      response.cookies.set(SESSION_COOKIE, sessionId, {
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 30,
        path: "/",
        sameSite: "lax",
      })
    }
    return response
  } catch (error) {
    console.error("Error generating story:", error)
    return NextResponse.json(
      { error: "Failed to generate story", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
