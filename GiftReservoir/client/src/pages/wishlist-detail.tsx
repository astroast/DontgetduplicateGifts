import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation, Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Gift, Plus, Share2, ArrowLeft, Loader2, Trash2, Edit } from "lucide-react";
import { AddItemDialog } from "@/components/add-item-dialog";
import { ShareDialog } from "@/components/share-dialog";
import { EditWishlistDialog } from "@/components/edit-wishlist-dialog";
import { ItemCard } from "@/components/item-card";
import { Badge } from "@/components/ui/badge";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Wishlist, Item, Claim, User } from "@shared/schema";

interface ItemWithClaim extends Item {
  claim?: (Claim & { user: User }) | null;
}

interface WishlistWithItems extends Wishlist {
  items: ItemWithClaim[];
}

export default function WishlistDetail() {
  const params = useParams();
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [addItemDialogOpen, setAddItemDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const wishlistId = params.id;
  
  const { data: wishlist, isLoading } = useQuery<WishlistWithItems>({
    queryKey: ["/api/wishlists", wishlistId],
    enabled: !!wishlistId,
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/wishlists/${wishlistId}`);
    },
    onSuccess: () => {
      toast({
        title: "Wishlist deleted",
        description: "Your wishlist has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/wishlists"] });
      navigate("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const isOwner = wishlist && user && wishlist.userId === user.id;
  const claimedCount = wishlist?.items.filter(item => item.claim).length || 0;
  const totalCount = wishlist?.items.length || 0;

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
          <p className="text-muted-foreground mb-4">This wishlist may have been deleted or doesn't exist.</p>
          <Button asChild>
            <Link href="/">Go Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <Button variant="ghost" asChild data-testid="button-back">
            <Link href="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Link>
          </Button>
          
          <div className="flex items-center gap-2">
            {isOwner && (
              <>
                <Button variant="ghost" size="icon" onClick={() => setEditDialogOpen(true)} data-testid="button-edit-wishlist">
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setDeleteDialogOpen(true)} data-testid="button-delete-wishlist">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </>
            )}
            <Button variant="outline" onClick={() => setShareDialogOpen(true)} data-testid="button-share-wishlist">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            {isOwner && (
              <Button onClick={() => setAddItemDialogOpen(true)} data-testid="button-add-item">
                <Plus className="w-4 h-4 mr-2" />
                Add Item
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
              {isOwner 
                ? "Add your first item to this wishlist to get started."
                : "This wishlist doesn't have any items yet."}
            </p>
            {isOwner && (
              <Button onClick={() => setAddItemDialogOpen(true)} data-testid="button-add-first-item">
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Item
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlist.items.map((item) => (
              <ItemCard 
                key={item.id} 
                item={item} 
                wishlistId={wishlist.id}
                isOwner={isOwner}
              />
            ))}
          </div>
        )}
      </main>

      {/* Dialogs */}
      {isOwner && (
        <>
          <AddItemDialog 
            open={addItemDialogOpen} 
            onOpenChange={setAddItemDialogOpen}
            wishlistId={wishlist.id}
          />
          <EditWishlistDialog
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            wishlist={wishlist}
          />
          <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete wishlist?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete "{wishlist.name}" and all its items. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => deleteMutation.mutate()}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  data-testid="button-confirm-delete"
                >
                  {deleteMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "Delete"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
      <ShareDialog 
        open={shareDialogOpen} 
        onOpenChange={setShareDialogOpen}
        wishlist={wishlist}
      />
    </div>
  );
}
