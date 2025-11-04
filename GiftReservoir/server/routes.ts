import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertWishlistSchema, insertItemSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Wishlist routes
  // GET /api/wishlists - Get all wishlists for current user with counts
  app.get("/api/wishlists", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const userWishlists = await storage.getWishlists(userId);
      
      // Add item and claimed counts using db queries
      const { db } = await import("./db");
      const { wishlists, items, claims } = await import("@shared/schema");
      const { eq, count } = await import("drizzle-orm");
      
      const wishlistsWithCounts = await Promise.all(
        userWishlists.map(async (wishlist) => {
          const [itemCountResult] = await db
            .select({ count: count() })
            .from(items)
            .where(eq(items.wishlistId, wishlist.id));
          
          const [claimedCountResult] = await db
            .select({ count: count() })
            .from(items)
            .innerJoin(claims, eq(items.id, claims.itemId))
            .where(eq(items.wishlistId, wishlist.id));
          
          return {
            ...wishlist,
            itemCount: itemCountResult?.count || 0,
            claimedCount: claimedCountResult?.count || 0,
          };
        })
      );
      
      res.json(wishlistsWithCounts);
    } catch (error) {
      console.error("Error fetching wishlists:", error);
      res.status(500).json({ message: "Failed to fetch wishlists" });
    }
  });

  // GET /api/wishlists/:id - Get a specific wishlist with items
  app.get("/api/wishlists/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const wishlistId = parseInt(req.params.id);
      
      if (isNaN(wishlistId)) {
        return res.status(400).json({ message: "Invalid wishlist ID" });
      }
      
      const wishlist = await storage.getWishlist(wishlistId, userId);
      
      if (!wishlist) {
        return res.status(404).json({ message: "Wishlist not found" });
      }
      
      // Get items with claims
      const { db } = await import("./db");
      const { items, claims, users } = await import("@shared/schema");
      const { eq } = await import("drizzle-orm");
      
      const wishlistItems = await db
        .select({
          item: items,
          claim: claims,
          claimUser: users,
        })
        .from(items)
        .leftJoin(claims, eq(items.id, claims.itemId))
        .leftJoin(users, eq(claims.userId, users.id))
        .where(eq(items.wishlistId, wishlistId));
      
      const formattedItems = wishlistItems.map(row => ({
        ...row.item,
        claim: row.claim && row.claimUser ? {
          ...row.claim,
          user: row.claimUser,
        } : null,
      }));
      
      res.json({ ...wishlist, items: formattedItems });
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      res.status(500).json({ message: "Failed to fetch wishlist" });
    }
  });

  // GET /api/wishlists/shared/:token - Get a wishlist by share token
  app.get("/api/wishlists/shared/:token", async (req, res) => {
    try {
      const { token } = req.params;
      
      const wishlist = await storage.getWishlistByShareToken(token);
      
      if (!wishlist) {
        return res.status(404).json({ message: "Wishlist not found" });
      }
      
      // Get items with claims
      const { db } = await import("./db");
      const { items, claims, users } = await import("@shared/schema");
      const { eq } = await import("drizzle-orm");
      
      const wishlistItems = await db
        .select({
          item: items,
          claim: claims,
          claimUser: users,
        })
        .from(items)
        .leftJoin(claims, eq(items.id, claims.itemId))
        .leftJoin(users, eq(claims.userId, users.id))
        .where(eq(items.wishlistId, wishlist.id));
      
      const formattedItems = wishlistItems.map(row => ({
        ...row.item,
        claim: row.claim && row.claimUser ? {
          ...row.claim,
          user: row.claimUser,
        } : null,
      }));
      
      res.json({ ...wishlist, items: formattedItems });
    } catch (error) {
      console.error("Error fetching shared wishlist:", error);
      res.status(500).json({ message: "Failed to fetch wishlist" });
    }
  });

  // POST /api/wishlists - Create a new wishlist
  app.post("/api/wishlists", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validationResult = insertWishlistSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        const error = fromZodError(validationResult.error);
        return res.status(400).json({ message: error.message });
      }
      
      const wishlist = await storage.createWishlist({
        ...validationResult.data,
        userId,
      });
      
      res.status(201).json(wishlist);
    } catch (error) {
      console.error("Error creating wishlist:", error);
      res.status(500).json({ message: "Failed to create wishlist" });
    }
  });

  // PATCH /api/wishlists/:id - Update a wishlist
  app.patch("/api/wishlists/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const wishlistId = parseInt(req.params.id);
      
      if (isNaN(wishlistId)) {
        return res.status(400).json({ message: "Invalid wishlist ID" });
      }
      
      const validationResult = insertWishlistSchema.partial().safeParse(req.body);
      
      if (!validationResult.success) {
        const error = fromZodError(validationResult.error);
        return res.status(400).json({ message: error.message });
      }
      
      const wishlist = await storage.updateWishlist(wishlistId, userId, validationResult.data);
      
      if (!wishlist) {
        return res.status(404).json({ message: "Wishlist not found" });
      }
      
      res.json(wishlist);
    } catch (error) {
      console.error("Error updating wishlist:", error);
      res.status(500).json({ message: "Failed to update wishlist" });
    }
  });

  // DELETE /api/wishlists/:id - Delete a wishlist
  app.delete("/api/wishlists/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const wishlistId = parseInt(req.params.id);
      
      if (isNaN(wishlistId)) {
        return res.status(400).json({ message: "Invalid wishlist ID" });
      }
      
      const deleted = await storage.deleteWishlist(wishlistId, userId);
      
      if (!deleted) {
        return res.status(404).json({ message: "Wishlist not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting wishlist:", error);
      res.status(500).json({ message: "Failed to delete wishlist" });
    }
  });

  // Item routes
  // POST /api/wishlists/:wishlistId/items - Create a new item
  app.post("/api/wishlists/:wishlistId/items", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const wishlistId = parseInt(req.params.wishlistId);
      
      if (isNaN(wishlistId)) {
        return res.status(400).json({ message: "Invalid wishlist ID" });
      }
      
      // Verify user owns the wishlist
      const wishlist = await storage.getWishlist(wishlistId, userId);
      if (!wishlist) {
        return res.status(404).json({ message: "Wishlist not found" });
      }
      
      const validationResult = insertItemSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        const error = fromZodError(validationResult.error);
        return res.status(400).json({ message: error.message });
      }
      
      const item = await storage.createItem({
        ...validationResult.data,
        wishlistId,
      });
      
      res.status(201).json(item);
    } catch (error) {
      console.error("Error creating item:", error);
      res.status(500).json({ message: "Failed to create item" });
    }
  });

  // PATCH /api/items/:id - Update an item
  app.patch("/api/items/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const itemId = parseInt(req.params.id);
      
      if (isNaN(itemId)) {
        return res.status(400).json({ message: "Invalid item ID" });
      }
      
      const validationResult = insertItemSchema.partial().safeParse(req.body);
      
      if (!validationResult.success) {
        const error = fromZodError(validationResult.error);
        return res.status(400).json({ message: error.message });
      }
      
      const item = await storage.updateItem(itemId, userId, validationResult.data);
      
      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }
      
      res.json(item);
    } catch (error) {
      console.error("Error updating item:", error);
      res.status(500).json({ message: "Failed to update item" });
    }
  });

  // DELETE /api/items/:id - Delete an item
  app.delete("/api/items/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const itemId = parseInt(req.params.id);
      
      if (isNaN(itemId)) {
        return res.status(400).json({ message: "Invalid item ID" });
      }
      
      const deleted = await storage.deleteItem(itemId, userId);
      
      if (!deleted) {
        return res.status(404).json({ message: "Item not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting item:", error);
      res.status(500).json({ message: "Failed to delete item" });
    }
  });

  // Claim routes
  // POST /api/items/:itemId/claim - Claim an item
  app.post("/api/items/:itemId/claim", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const itemId = parseInt(req.params.itemId);
      
      if (isNaN(itemId)) {
        return res.status(400).json({ message: "Invalid item ID" });
      }
      
      // Check if item exists
      const item = await storage.getItem(itemId);
      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }
      
      // Check if item is already claimed
      const existingClaim = await storage.getClaim(itemId);
      if (existingClaim) {
        return res.status(400).json({ message: "Item is already claimed" });
      }
      
      // Check if user owns the wishlist (can't claim own items)
      const { db } = await import("./db");
      const { wishlists } = await import("@shared/schema");
      const { eq } = await import("drizzle-orm");
      
      const [wishlist] = await db
        .select()
        .from(wishlists)
        .where(eq(wishlists.id, item.wishlistId));
      
      if (wishlist && wishlist.userId === userId) {
        return res.status(400).json({ message: "You cannot claim items from your own wishlist" });
      }
      
      const claim = await storage.createClaim({
        itemId,
        userId,
      });
      
      res.status(201).json(claim);
    } catch (error) {
      console.error("Error claiming item:", error);
      res.status(500).json({ message: "Failed to claim item" });
    }
  });

  // DELETE /api/items/:itemId/claim - Unclaim an item
  app.delete("/api/items/:itemId/claim", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const itemId = parseInt(req.params.itemId);
      
      if (isNaN(itemId)) {
        return res.status(400).json({ message: "Invalid item ID" });
      }
      
      const deleted = await storage.deleteClaim(itemId, userId);
      
      if (!deleted) {
        return res.status(404).json({ message: "Claim not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error unclaiming item:", error);
      res.status(500).json({ message: "Failed to unclaim item" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
