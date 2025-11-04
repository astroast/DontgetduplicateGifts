import {
  users,
  wishlists,
  items,
  claims,
  type User,
  type UpsertUser,
  type Wishlist,
  type InsertWishlist,
  type Item,
  type InsertItem,
  type Claim,
  type InsertClaim,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, sql } from "drizzle-orm";
import { randomBytes } from "crypto";

export interface IStorage {
  // User operations - Required for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Wishlist operations
  getWishlists(userId: string): Promise<Wishlist[]>;
  getWishlist(id: number, userId?: string): Promise<Wishlist | undefined>;
  getWishlistByShareToken(token: string): Promise<Wishlist | undefined>;
  createWishlist(data: InsertWishlist): Promise<Wishlist>;
  updateWishlist(id: number, userId: string, data: Partial<InsertWishlist>): Promise<Wishlist | undefined>;
  deleteWishlist(id: number, userId: string): Promise<boolean>;

  // Item operations
  getItem(id: number): Promise<Item | undefined>;
  createItem(data: InsertItem): Promise<Item>;
  updateItem(id: number, wishlistUserId: string, data: Partial<InsertItem>): Promise<Item | undefined>;
  deleteItem(id: number, wishlistUserId: string): Promise<boolean>;

  // Claim operations
  getClaim(itemId: number): Promise<Claim | undefined>;
  createClaim(data: InsertClaim): Promise<Claim>;
  deleteClaim(itemId: number, userId: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Wishlist operations
  async getWishlists(userId: string): Promise<Wishlist[]> {
    return await db.select().from(wishlists).where(eq(wishlists.userId, userId));
  }

  async getWishlist(id: number, userId?: string): Promise<Wishlist | undefined> {
    const conditions = userId
      ? and(eq(wishlists.id, id), eq(wishlists.userId, userId))
      : eq(wishlists.id, id);
    
    const [wishlist] = await db.select().from(wishlists).where(conditions!);
    return wishlist;
  }

  async getWishlistByShareToken(token: string): Promise<Wishlist | undefined> {
    const [wishlist] = await db.select().from(wishlists).where(eq(wishlists.shareToken, token));
    return wishlist;
  }

  async createWishlist(data: InsertWishlist): Promise<Wishlist> {
    const shareToken = randomBytes(32).toString("hex");
    const [wishlist] = await db
      .insert(wishlists)
      .values({ ...data, shareToken })
      .returning();
    return wishlist;
  }

  async updateWishlist(id: number, userId: string, data: Partial<InsertWishlist>): Promise<Wishlist | undefined> {
    const [wishlist] = await db
      .update(wishlists)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(wishlists.id, id), eq(wishlists.userId, userId)))
      .returning();
    return wishlist;
  }

  async deleteWishlist(id: number, userId: string): Promise<boolean> {
    const result = await db
      .delete(wishlists)
      .where(and(eq(wishlists.id, id), eq(wishlists.userId, userId)));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Item operations
  async getItem(id: number): Promise<Item | undefined> {
    const [item] = await db.select().from(items).where(eq(items.id, id));
    return item;
  }

  async createItem(data: InsertItem): Promise<Item> {
    const [item] = await db.insert(items).values(data).returning();
    return item;
  }

  async updateItem(id: number, wishlistUserId: string, data: Partial<InsertItem>): Promise<Item | undefined> {
    // Verify the item belongs to a wishlist owned by the user
    const [item] = await db
      .update(items)
      .set({ ...data, updatedAt: new Date() })
      .where(
        and(
          eq(items.id, id),
          sql`${items.wishlistId} IN (SELECT id FROM ${wishlists} WHERE ${wishlists.userId} = ${wishlistUserId})`
        )
      )
      .returning();
    return item;
  }

  async deleteItem(id: number, wishlistUserId: string): Promise<boolean> {
    // Verify the item belongs to a wishlist owned by the user
    const result = await db
      .delete(items)
      .where(
        and(
          eq(items.id, id),
          sql`${items.wishlistId} IN (SELECT id FROM ${wishlists} WHERE ${wishlists.userId} = ${wishlistUserId})`
        )
      );
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Claim operations
  async getClaim(itemId: number): Promise<Claim | undefined> {
    const [claim] = await db.select().from(claims).where(eq(claims.itemId, itemId));
    return claim;
  }

  async createClaim(data: InsertClaim): Promise<Claim> {
    const [claim] = await db.insert(claims).values(data).returning();
    return claim;
  }

  async deleteClaim(itemId: number, userId: string): Promise<boolean> {
    const result = await db
      .delete(claims)
      .where(and(eq(claims.itemId, itemId), eq(claims.userId, userId)));
    return result.rowCount !== null && result.rowCount > 0;
  }
}

export const storage = new DatabaseStorage();
