"use client"

import { Button } from "@/components/ui/button"
import { BookOpen } from "lucide-react"
import { useRouter } from "next/navigation"

export function LibraryLink() {
  const router = useRouter()

  return (
    <Button variant="outline" onClick={() => router.push("/app/library")}>
      <BookOpen className="w-4 h-4 mr-2" />
      Library
    </Button>
  )
}
