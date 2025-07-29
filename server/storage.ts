import { type User, type InsertUser, type SwapTransaction, type LiquidityPosition, type InsertSwapTransaction, type InsertLiquidityPosition } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Swap transactions
  createSwapTransaction(data: InsertSwapTransaction): Promise<SwapTransaction>;
  getSwapTransactionsByUser(userAddress: string): Promise<SwapTransaction[]>;
  
  // Liquidity positions  
  createLiquidityPosition(data: InsertLiquidityPosition): Promise<LiquidityPosition>;
  getLiquidityPositionsByUser(userAddress: string): Promise<LiquidityPosition[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private swapTransactions: Map<string, SwapTransaction>;
  private liquidityPositions: Map<string, LiquidityPosition>;

  constructor() {
    this.users = new Map();
    this.swapTransactions = new Map();
    this.liquidityPositions = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createSwapTransaction(data: InsertSwapTransaction): Promise<SwapTransaction> {
    const id = randomUUID();
    const transaction: SwapTransaction = { 
      ...data, 
      id, 
      createdAt: new Date() 
    };
    this.swapTransactions.set(id, transaction);
    return transaction;
  }

  async getSwapTransactionsByUser(userAddress: string): Promise<SwapTransaction[]> {
    return Array.from(this.swapTransactions.values()).filter(
      (tx) => tx.userAddress === userAddress
    );
  }

  async createLiquidityPosition(data: InsertLiquidityPosition): Promise<LiquidityPosition> {
    const id = randomUUID();
    const position: LiquidityPosition = { 
      ...data, 
      id, 
      createdAt: new Date() 
    };
    this.liquidityPositions.set(id, position);
    return position;
  }

  async getLiquidityPositionsByUser(userAddress: string): Promise<LiquidityPosition[]> {
    return Array.from(this.liquidityPositions.values()).filter(
      (pos) => pos.userAddress === userAddress
    );
  }
}

export const storage = new MemStorage();
