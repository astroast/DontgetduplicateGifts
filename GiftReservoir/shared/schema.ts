import { sql } from "drizzle-orm";
import { relations } from "drizzle-orm";
import {
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  varchar,
  integer,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table - Required for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table - Required for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  wishlists: many(wishlists),
  claims: many(claims),
}));

// Wishlists table
export const wishlists = pgTable("wishlists", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  shareToken: varchar("share_token", { length: 64 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const wishlistsRelations = relations(wishlists, ({ one, many }) => ({
  user: one(users, {
    fields: [wishlists.userId],
    references: [users.id],
  }),
  items: many(items),
}));

// Items table
export const items = pgTable("items", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  wishlistId: integer("wishlist_id").notNull().references(() => wishlists.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  url: text("url"),
  description: text("description"),
  price: varchar("price", { length: 100 }),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const itemsRelations = relations(items, ({ one, many }) => ({
  wishlist: one(wishlists, {
    fields: [items.wishlistId],
    references: [wishlists.id],
  }),
  claim: many(claims),
}));

// Claims table
export const claims = pgTable("claims", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  itemId: integer("item_id").notNull().unique().references(() => items.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  claimedAt: timestamp("claimed_at").defaultNow().notNull(),
});

export const claimsRelations = relations(claims, ({ one }) => ({
  item: one(items, {
    fields: [claims.itemId],
    references: [items.id],
  }),
  user: one(users, {
    fields: [claims.userId],
    references: [users.id],
  }),
}));

// Type exports
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export type Wishlist = typeof wishlists.$inferSelect;
export type InsertWishlist = typeof wishlists.$inferInsert;

export type Item = typeof items.$inferSelect;
export type InsertItem = typeof items.$inferInsert;

export type Claim = typeof claims.$inferSelect;
export type InsertClaim = typeof claims.$inferInsert;

// Zod schemas for validation
export const insertWishlistSchema = createInsertSchema(wishlists, {
  name: z.string().min(1, "Name is required").max(255),
  description: z.string().optional(),
}).omit({
  id: true,
  userId: true,
  shareToken: true,
  createdAt: true,
  updatedAt: true,
});

export const insertItemSchema = createInsertSchema(items, {
  name: z.string().min(1, "Name is required").max(255),
  url: z.string().url("Invalid URL").optional().or(z.literal("")),
  description: z.string().optional(),
  price: z.string().optional(),
  imageUrl: z.string().url("Invalid image URL").optional().or(z.literal("")),
}).omit({
  id: true,
  wishlistId: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertWishlistInput = z.infer<typeof insertWishlistSchema>;
export type InsertItemInput = z.infer<typeof insertItemSchema>;
