import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Loader2, CheckCircle2, Trash2, Edit } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { EditItemDialog } from "@/components/edit-item-dialog";
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
import type { Item, Claim, User } from "@shared/schema";

interface ItemWithClaim extends Item {
  claim?: (Claim & { user: User }) | null;
}

interface ItemCardProps {
  item: ItemWithClaim;
  wishlistId: number;
  isOwner?: boolean;
  isSharedView?: boolean;
}

export function ItemCard({ item, wishlistId, isOwner = false, isSharedView = false }: ItemCardProps) {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const isClaimed = !!item.claim;
  const isClaimedByMe = item.claim?.userId === user?.id;
  const canClaim = isAuthenticated && !isClaimed && !isOwner;
  const canUnclaim = isAuthenticated && isClaimedByMe;

  const claimMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/items/${item.id}/claim`);
    },
    onSuccess: () => {
      toast({
        title: "Item claimed",
        description: "You've claimed this item. Others won't be able to claim it.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/wishlists", String(wishlistId)] });
      queryClient.invalidateQueries({ queryKey: ["/api/wishlists/shared"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const unclaimMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/items/${item.id}/claim`);
    },
    onSuccess: () => {
      toast({
        title: "Claim removed",
        description: "You've unclaimed this item. Others can now claim it.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/wishlists", String(wishlistId)] });
      queryClient.invalidateQueries({ queryKey: ["/api/wishlists/shared"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/items/${item.id}`);
    },
    onSuccess: () => {
      toast({
        title: "Item deleted",
        description: "The item has been removed from your wishlist.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/wishlists", String(wishlistId)] });
      queryClient.invalidateQueries({ queryKey: ["/api/wishlists"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getDomain = (url: string) => {
    try {
      const domain = new URL(url).hostname;
      return domain.replace("www.", "");
    } catch {
      return null;
    }
  };

  return (
    <>
      <Card 
        className={`hover-elevate ${isClaimed ? "opacity-60" : ""}`}
        data-testid={`card-item-${item.id}`}
      >
        {/* Image */}
        {item.imageUrl && (
          <div className="aspect-square overflow-hidden rounded-t-lg bg-muted">
            <img 
              src={item.imageUrl} 
              alt={item.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <CardHeader className="gap-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-xl font-semibold line-clamp-2 flex-1" data-testid={`text-item-name-${item.id}`}>
              {item.name}
            </h3>
            {isClaimed && (
              <Badge variant="secondary" className="shrink-0" data-testid={`badge-claimed-${item.id}`}>
                Claimed
              </Badge>
            )}
          </div>
          
          {item.price && (
            <p className="text-lg font-medium text-primary" data-testid={`text-item-price-${item.id}`}>
              {item.price}
            </p>
          )}
          
          {item.description && (
            <p className="text-sm text-muted-foreground line-clamp-3" data-testid={`text-item-description-${item.id}`}>
              {item.description}
            </p>
          )}
          
          {item.url && (
            <a 
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
              data-testid={`link-item-url-${item.id}`}
            >
              <ExternalLink className="w-3 h-3" />
              {getDomain(item.url)}
            </a>
          )}
        </CardHeader>
        
        <CardFooter className="flex flex-col gap-2">
          {/* Claim Status */}
          {isClaimed && item.claim?.user && (
            <div className="w-full p-2 bg-muted rounded-md text-sm text-muted-foreground" data-testid={`text-claimed-by-${item.id}`}>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  Claimed by {isClaimedByMe ? "you" : `${item.claim.user.firstName || "someone"}`}
                </span>
              </div>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex gap-2 w-full">
            {canClaim && (
              <Button 
                onClick={() => claimMutation.mutate()}
                disabled={claimMutation.isPending}
                className="flex-1"
                data-testid={`button-claim-${item.id}`}
              >
                {claimMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Claiming...
                  </>
                ) : (
                  "Claim This"
                )}
              </Button>
            )}
            
            {canUnclaim && (
              <Button 
                variant="outline"
                onClick={() => unclaimMutation.mutate()}
                disabled={unclaimMutation.isPending}
                className="flex-1"
                data-testid={`button-unclaim-${item.id}`}
              >
                {unclaimMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Unclaiming...
                  </>
                ) : (
                  "Unclaim"
                )}
              </Button>
            )}
            
            {isOwner && !isSharedView && (
              <>
                <Button 
                  variant="outline"
                  size="icon"
                  onClick={() => setEditDialogOpen(true)}
                  data-testid={`button-edit-item-${item.id}`}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button 
                  variant="outline"
                  size="icon"
                  onClick={() => setDeleteDialogOpen(true)}
                  data-testid={`button-delete-item-${item.id}`}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </>
            )}
            
            {!isAuthenticated && (
              <Button asChild className="flex-1" data-testid={`button-login-to-claim-${item.id}`}>
                <a href="/api/login">Sign In to Claim</a>
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>

      {/* Dialogs */}
      {isOwner && (
        <>
          <EditItemDialog
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            item={item}
            wishlistId={wishlistId}
          />
          <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete item?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete "{item.name}" from your wishlist. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel data-testid={`button-cancel-delete-item-${item.id}`}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => deleteMutation.mutate()}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  data-testid={`button-confirm-delete-item-${item.id}`}
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
    </>
  );
}
