import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sparkles, Moon, BookOpen, Stars } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-primary/5 to-accent/10">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <header className="flex justify-between items-center mb-16">
          <div className="flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">DreamSpark</h1>
          </div>
          <div className="flex gap-3">
            <Button asChild variant="ghost">
              <Link href="/auth/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/sign-up">Sign Up</Link>
            </Button>
          </div>
        </header>

        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center space-y-8 mb-20">
          <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-4">
            <Moon className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">AI-Powered Bedtime Magic</span>
          </div>

          <h2 className="text-5xl md:text-6xl font-bold text-balance leading-tight">
            Create Magical Bedtime Stories in <span className="text-primary">Seconds</span>
          </h2>

          <p className="text-xl text-muted-foreground text-balance max-w-2xl mx-auto leading-relaxed">
            Transform your child's day into a personalized bedtime adventure. Perfect for parents of children aged 3-10
            who want to make bedtime magical without the mental load.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button asChild size="lg" className="text-lg h-14 px-8">
              <Link href="/auth/sign-up">
                <Sparkles className="w-5 h-5 mr-2" />
                Start Weaving Dreams
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-lg h-14 px-8 bg-transparent">
              <Link href="#features">Learn More</Link>
            </Button>
          </div>
        </div>

        {/* Features */}
        <div id="features" className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-20">
          <div className="bg-card p-8 rounded-xl border border-border shadow-sm">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-3">Personalized Stories</h3>
            <p className="text-muted-foreground leading-relaxed">
              Add your child's name and daily events to create stories that feel uniquely theirs
            </p>
          </div>

          <div className="bg-card p-8 rounded-xl border border-border shadow-sm">
            <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center mb-4">
              <BookOpen className="w-6 h-6 text-accent" />
            </div>
            <h3 className="text-xl font-bold mb-3">Beautiful Illustrations</h3>
            <p className="text-muted-foreground leading-relaxed">
              Every story comes with 5-7 custom watercolor-style illustrations to keep kids engaged
            </p>
          </div>

          <div className="bg-card p-8 rounded-xl border border-border shadow-sm">
            <div className="w-12 h-12 bg-secondary/20 rounded-lg flex items-center justify-center mb-4">
              <Moon className="w-6 h-6 text-secondary" />
            </div>
            <h3 className="text-xl font-bold mb-3">Bedtime Optimized</h3>
            <p className="text-muted-foreground leading-relaxed">
              5-minute stories with warm colors and low blue light to help your child wind down
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="max-w-3xl mx-auto text-center bg-gradient-to-br from-primary/10 to-accent/10 p-12 rounded-2xl border border-border">
          <Stars className="w-12 h-12 text-primary mx-auto mb-4" />
          <h3 className="text-3xl font-bold mb-4">Ready to Make Bedtime Magical?</h3>
          <p className="text-lg text-muted-foreground mb-6">
            Join parents who are transforming bedtime into quality bonding time
          </p>
          <Button asChild size="lg" className="text-lg h-14 px-8">
            <Link href="/auth/sign-up">Get Started Free</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
