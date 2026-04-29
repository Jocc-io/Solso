import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// We are using Solana for data storage, so this schema is mainly for type definitions
// that might be shared or for any local metadata if needed.
// For now, we define the structures that match the on-chain data for type safety.

export const conversationSchema = z.object({
  publicKey: z.string(),
  participant1: z.string(),
  participant2: z.string(),
  messageCount: z.number(),
});

export const messageSchema = z.object({
  publicKey: z.string(),
  conversation: z.string(),
  sender: z.string(),
  recipient: z.string(),
  index: z.number(),
  content: z.string(),
  timestamp: z.number(),
});

export type Conversation = z.infer<typeof conversationSchema>;
export type Message = z.infer<typeof messageSchema>;

// Keep a minimal table for generic storage if strictly required by backend structure
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(), // Wallet address
});

export const insertUserSchema = createInsertSchema(users);
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
