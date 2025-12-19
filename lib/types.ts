export interface Story {
  id: string
  user_id: string
  title: string
  genre: string
  theme?: string
  context?: string
  child_name?: string
  content: string
  images: { url: string; scene: string }[]
  reading_time: number
  created_at: string
  rating?: number
}

export type Genre = "fantasy" | "sci-fi" | "animals" | "superheroes" | "calming"
