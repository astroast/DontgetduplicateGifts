import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Gift, Plus, Share2, ExternalLink, Loader2 } from "lucide-react";
import { CreateWishlistDialog } from "@/components/create-wishlist-dialog";
import { ShareDialog } from "@/components/share-dialog";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "wouter";
import type { Wishlist } from "@shared/schema";

interface WishlistWithCounts extends Wishlist {
  itemCount: number;
  claimedCount: number;
}

export default function Home() {
  const { user } = useAuth();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedWishlist, setSelectedWishlist] = useState<WishlistWithCounts | null>(null);

  const { data: wishlists, isLoading } = useQuery<WishlistWithCounts[]>({
    queryKey: ["/api/wishlists"],
  });

  const handleShare = (wishlist: WishlistWithCounts) => {
    setSelectedWishlist(wishlist);
    setShareDialogOpen(true);
  };

  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    const first = firstName?.[0] || "";
    const last = lastName?.[0] || "";
    return (first + last).toUpperCase() || "U";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Gift className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold">Wishlist</span>
          </div>
          
          <div className="flex items-center gap-4">
            <Button onClick={() => setCreateDialogOpen(true)} data-testid="button-create-wishlist">
              <Plus className="w-4 h-4 mr-2" />
              Create Wishlist
            </Button>
            <Button variant="ghost" size="icon" asChild data-testid="button-logout">
              <a href="/api/logout" title="Sign Out">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={user?.profileImageUrl || undefined} alt={user?.firstName || "User"} />
                  <AvatarFallback>{getInitials(user?.firstName, user?.lastName)}</AvatarFallback>
                </Avatar>
              </a>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-2">
            My Wishlists
          </h1>
          <p className="text-muted-foreground text-lg">
            Create and manage your wishlists, share them with family and friends.
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && wishlists?.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <Gift className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">No wishlists yet</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Create your first wishlist to start adding items and sharing with family.
            </p>
            <Button onClick={() => setCreateDialogOpen(true)} data-testid="button-create-first-wishlist">
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Wishlist
            </Button>
          </div>
        )}

        {/* Wishlists Grid */}
        {!isLoading && wishlists && wishlists.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlists.map((wishlist) => (
              <Card key={wishlist.id} className="hover-elevate" data-testid={`card-wishlist-${wishlist.id}`}>
                <CardHeader className="gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-xl font-semibold line-clamp-2 flex-1">
                      {wishlist.name}
                    </h3>
                    <Badge variant="secondary" className="shrink-0" data-testid={`badge-item-count-${wishlist.id}`}>
                      {wishlist.itemCount} {wishlist.itemCount === 1 ? "item" : "items"}
                    </Badge>
                  </div>
                  {wishlist.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {wishlist.description}
                    </p>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span data-testid={`text-claimed-count-${wishlist.id}`}>
                      {wishlist.claimedCount} claimed
                    </span>
                    <span>·</span>
                    <span>{wishlist.itemCount - wishlist.claimedCount} available</span>
                  </div>
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleShare(wishlist)} className="flex-1" data-testid={`button-share-${wishlist.id}`}>
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                  <Button size="sm" asChild className="flex-1" data-testid={`button-view-${wishlist.id}`}>
                    <Link href={`/wishlist/${wishlist.id}`}>
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Dialogs */}
      <CreateWishlistDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
      {selectedWishlist && (
        <ShareDialog 
          open={shareDialogOpen} 
          onOpenChange={setShareDialogOpen}
          wishlist={selectedWishlist}
        />
      )}
    </div>
  );
}
