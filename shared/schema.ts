import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const swapTransactions = pgTable("swap_transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userAddress: text("user_address").notNull(),
  tokenIn: text("token_in").notNull(),
  tokenOut: text("token_out").notNull(),
  amountIn: decimal("amount_in").notNull(),
  amountOut: decimal("amount_out").notNull(),
  txHash: text("tx_hash").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const liquidityPositions = pgTable("liquidity_positions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userAddress: text("user_address").notNull(),
  tokenId: text("token_id").notNull(),
  token0: text("token_0").notNull(),
  token1: text("token_1").notNull(),
  fee: text("fee").notNull(),
  liquidity: decimal("liquidity").notNull(),
  txHash: text("tx_hash").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertSwapTransactionSchema = createInsertSchema(swapTransactions).omit({
  id: true,
  createdAt: true,
});

export const insertLiquidityPositionSchema = createInsertSchema(liquidityPositions).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type SwapTransaction = typeof swapTransactions.$inferSelect;
export type LiquidityPosition = typeof liquidityPositions.$inferSelect;
export type InsertSwapTransaction = z.infer<typeof insertSwapTransactionSchema>;
export type InsertLiquidityPosition = z.infer<typeof insertLiquidityPositionSchema>;
