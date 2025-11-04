import { Button } from "@/components/ui/button";
import { Gift, Share2, CheckCircle2 } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gift className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold">Wishlist</span>
          </div>
          <Button asChild data-testid="button-login">
            <a href="/api/login">Sign In</a>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 md:py-20 lg:py-24">
        <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
            Share Wishlists with Your Family
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Create wishlists, add product links, and share them with family members. 
            When someone claims an item, it becomes unavailable to others — no more duplicate gifts!
          </p>
          <Button size="lg" asChild className="text-lg" data-testid="button-get-started">
            <a href="/api/login">Get Started Free</a>
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-primary/10 flex items-center justify-center">
                <Gift className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Create Wishlists</h3>
              <p className="text-muted-foreground">
                Add items with links, descriptions, and prices. Organize multiple wishlists for different occasions.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-primary/10 flex items-center justify-center">
                <Share2 className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Share with Family</h3>
              <p className="text-muted-foreground">
                Generate a shareable link for each wishlist. Family members can view without needing an account.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-primary/10 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Claim Items</h3>
              <p className="text-muted-foreground">
                One-click claiming prevents duplicate purchases. Everyone sees what's already been claimed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 md:py-20">
        <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-semibold mb-4">
            Ready to create your first wishlist?
          </h2>
          <p className="text-muted-foreground mb-8">
            Sign in to get started. It's free and takes seconds.
          </p>
          <Button size="lg" asChild data-testid="button-cta">
            <a href="/api/login">Sign In Now</a>
          </Button>
        </div>
      </section>
    </div>
  );
}
