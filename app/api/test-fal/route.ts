import { type NextRequest, NextResponse } from "next/server"
import * as fal from "@fal-ai/serverless-client"

fal.config({
  credentials: process.env.FAL_KEY,
})

export async function GET(request: NextRequest) {
  try {
    console.log("[v0] Testing fal integration...")
    console.log("[v0] FAL_KEY exists:", !!process.env.FAL_KEY)
    console.log("[v0] FAL_KEY first 10 chars:", process.env.FAL_KEY?.substring(0, 10))

    if (!process.env.FAL_KEY) {
      return NextResponse.json(
        {
          error: "FAL_KEY not configured",
          message: "Please add your FAL_KEY to environment variables",
        },
        { status: 500 },
      )
    }

    console.log("[v0] Attempting to generate test image...")

    const result = await fal.subscribe("fal-ai/flux/schnell", {
      input: {
        prompt: "A soft watercolor painting of a sleeping child with a teddy bear, dreamy clouds, gentle moonlight",
        image_size: "landscape_16_9",
        num_inference_steps: 4,
        num_images: 1,
      },
      logs: true,
    })

    console.log("[v0] Fal result:", JSON.stringify(result))

    const imageUrl = result.images?.[0]?.url

    if (!imageUrl) {
      return NextResponse.json(
        {
          error: "No image URL in response",
          result: result,
        },
        { status: 500 },
      )
    }

    console.log("[v0] Test successful! Image URL:", imageUrl)

    return NextResponse.json({
      success: true,
      message: "fal integration is working correctly",
      imageUrl: imageUrl,
      fullResult: result,
    })
  } catch (error) {
    console.error("[v0] Test failed:", error)
    return NextResponse.json(
      {
        error: "fal test failed",
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
