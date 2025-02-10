import { type SavingsGoal, type InsertSavingsGoal } from "@shared/schema";

export interface IStorage {
  getAllGoals(): Promise<SavingsGoal[]>;
  getGoal(id: number): Promise<SavingsGoal | undefined>;
  createGoal(goal: InsertSavingsGoal): Promise<SavingsGoal>;
  updateGoal(id: number, goal: Partial<InsertSavingsGoal>): Promise<SavingsGoal>;
  deleteGoal(id: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private goals: Map<number, SavingsGoal>;
  private currentId: number;

  constructor() {
    this.goals = new Map();
    this.currentId = 1;
  }

  async getAllGoals(): Promise<SavingsGoal[]> {
    return Array.from(this.goals.values());
  }

  async getGoal(id: number): Promise<SavingsGoal | undefined> {
    return this.goals.get(id);
  }

  async createGoal(insertGoal: InsertSavingsGoal): Promise<SavingsGoal> {
    const id = this.currentId++;
    const goal: SavingsGoal = { ...insertGoal, id };
    this.goals.set(id, goal);
    return goal;
  }

  async updateGoal(id: number, update: Partial<InsertSavingsGoal>): Promise<SavingsGoal> {
    const existing = await this.getGoal(id);
    if (!existing) {
      throw new Error("Goal not found");
    }
    const updated = { ...existing, ...update };
    this.goals.set(id, updated);
    return updated;
  }

  async deleteGoal(id: number): Promise<void> {
    this.goals.delete(id);
  }
}

export const storage = new MemStorage();
