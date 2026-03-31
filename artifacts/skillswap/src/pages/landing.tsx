import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Lightbulb, Users, Zap } from "lucide-react";
import { useAuth } from "@/lib/auth";

export default function Landing() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  if (user) {
    setLocation("/dashboard");
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="font-bold text-2xl tracking-tight text-primary">SkillSwap</div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium hover:text-primary transition-colors">
              Log in
            </Link>
            <Link href="/signup">
              <Button className="rounded-full shadow-sm hover-elevate">Join the Bazaar</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="py-24 md:py-32 px-4 container mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/20 text-secondary-foreground text-sm font-medium mb-8">
            <Zap className="h-4 w-4 text-secondary" />
            <span>The world's largest skill exchange</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight max-w-4xl mx-auto leading-tight mb-6">
            Trade what you <span className="text-primary italic">know</span> for what you want to <span className="text-secondary italic">learn</span>.
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            No money involved. Just a vibrant community of passionate learners and experts connecting to exchange knowledge, one hour at a time.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" className="rounded-full text-lg h-14 px-8 shadow-md hover-elevate group">
                Start Swapping
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/explore">
              <Button size="lg" variant="outline" className="rounded-full text-lg h-14 px-8 bg-card shadow-sm hover-elevate">
                Explore Skills
              </Button>
            </Link>
          </div>
        </section>

        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-16">How the Exchange Works</h2>
            <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
              <div className="flex flex-col items-center text-center">
                <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 text-primary">
                  <Lightbulb className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold mb-3">1. List Your Expertise</h3>
                <p className="text-muted-foreground">Share what you're good at—from Python to Pottery, Spanish to SEO.</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="h-16 w-16 bg-secondary/10 rounded-2xl flex items-center justify-center mb-6 text-secondary">
                  <BookOpen className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold mb-3">2. Find What You Need</h3>
                <p className="text-muted-foreground">Search our vibrant bazaar for the exact skill you want to acquire.</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="h-16 w-16 bg-accent rounded-2xl flex items-center justify-center mb-6 text-accent-foreground">
                  <Users className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold mb-3">3. Swap and Connect</h3>
                <p className="text-muted-foreground">Send a request, agree on terms, and start learning together over video or chat.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-8 border-t bg-card text-center text-muted-foreground text-sm">
        <p>© {new Date().getFullYear()} SkillSwap Platform. Built for the community.</p>
      </footer>
    </div>
  );
}
