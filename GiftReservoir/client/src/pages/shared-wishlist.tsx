import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Gift, Share2, Loader2, LogIn } from "lucide-react";
import { ShareDialog } from "@/components/share-dialog";
import { ItemCard } from "@/components/item-card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import type { Wishlist, Item, Claim, User } from "@shared/schema";

interface ItemWithClaim extends Item {
  claim?: (Claim & { user: User }) | null;
}

interface WishlistWithItems extends Wishlist {
  items: ItemWithClaim[];
}

export default function SharedWishlist() {
  const params = useParams();
  const { user, isAuthenticated } = useAuth();
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  const shareToken = params.token;
  
  const { data: wishlist, isLoading } = useQuery<WishlistWithItems>({
    queryKey: ["/api/wishlists/shared", shareToken],
    enabled: !!shareToken,
  });

  const claimedCount = wishlist?.items.filter(item => item.claim).length || 0;
  const totalCount = wishlist?.items.length || 0;
  const isOwner = wishlist && user && wishlist.userId === user.id;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!wishlist) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Wishlist not found</h1>
          <p className="text-muted-foreground mb-4">This wishlist may have been deleted or the link is invalid.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Gift className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold">Wishlist</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setShareDialogOpen(true)} data-testid="button-share-wishlist">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            {!isAuthenticated && (
              <Button asChild data-testid="button-login">
                <a href="/api/login">
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </a>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-muted/30 border-b">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold mb-4" data-testid="text-wishlist-name">
            {wishlist.name}
          </h1>
          {wishlist.description && (
            <p className="text-lg text-muted-foreground mb-6 max-w-3xl" data-testid="text-wishlist-description">
              {wishlist.description}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-4">
            <Badge variant="secondary" className="text-sm" data-testid="badge-total-items">
              {totalCount} {totalCount === 1 ? "item" : "items"}
            </Badge>
            <Badge variant="secondary" className="text-sm" data-testid="badge-claimed-items">
              {claimedCount} claimed
            </Badge>
            <Badge variant="secondary" className="text-sm" data-testid="badge-available-items">
              {totalCount - claimedCount} available
            </Badge>
          </div>
          {!isAuthenticated && totalCount > 0 && (
            <div className="mt-6 p-4 bg-card border rounded-lg">
              <p className="text-sm text-muted-foreground">
                Sign in to claim items and prevent duplicate gifts
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Items Grid */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">
        {totalCount === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <Gift className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">No items yet</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              This wishlist doesn't have any items yet. Check back later!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlist.items.map((item) => (
              <ItemCard 
                key={item.id} 
                item={item} 
                wishlistId={wishlist.id}
                isOwner={isOwner}
                isSharedView={true}
              />
            ))}
          </div>
        )}
      </main>

      {/* Dialogs */}
      <ShareDialog 
        open={shareDialogOpen} 
        onOpenChange={setShareDialogOpen}
        wishlist={wishlist}
      />
    </div>
  );
}
