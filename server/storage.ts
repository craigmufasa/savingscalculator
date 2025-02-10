import { type SavingsGoal, type InsertSavingsGoal } from "@shared/schema";

export interface IStorage {
  getAllGoals(): Promise<SavingsGoal[]>;
  getGoal(id: number): Promise<SavingsGoal | undefined>;
  createGoal(goal: InsertSavingsGoal): Promise<SavingsGoal>;
  updateGoal(id: number, goal: Partial<InsertSavingsGoal>): Promise<SavingsGoal>;
  deleteGoal(id: number): Promise<void>;
}

export class LocalStorage implements IStorage {
  private readonly STORAGE_KEY = 'savings_goals';
  private goals: Map<number, SavingsGoal>;
  private currentId: number;

  constructor() {
    this.goals = new Map();
    this.currentId = 1;
    this.loadFromStorage();
  }

  private loadFromStorage() {
    if (typeof window === 'undefined') return;

    const savedGoals = window.localStorage.getItem(this.STORAGE_KEY);
    if (savedGoals) {
      const goals = JSON.parse(savedGoals) as SavingsGoal[];
      this.goals = new Map(goals.map(goal => [goal.id, goal]));
      this.currentId = Math.max(...goals.map(g => g.id), 0) + 1;
    }
  }

  private saveToStorage() {
    if (typeof window === 'undefined') return;

    const goals = Array.from(this.goals.values());
    window.localStorage.setItem(this.STORAGE_KEY, JSON.stringify(goals));
  }

  async getAllGoals(): Promise<SavingsGoal[]> {
    return Array.from(this.goals.values());
  }

  async getGoal(id: number): Promise<SavingsGoal | undefined> {
    return this.goals.get(id);
  }

  async createGoal(insertGoal: InsertSavingsGoal): Promise<SavingsGoal> {
    const id = this.currentId++;
    const goal: SavingsGoal = {
      id,
      name: insertGoal.name,
      targetAmount: insertGoal.targetAmount.toString(),
      yearsToSave: insertGoal.yearsToSave,
      currentAmount: insertGoal.currentAmount.toString(),
    };
    this.goals.set(id, goal);
    this.saveToStorage();
    return goal;
  }

  async updateGoal(id: number, update: Partial<InsertSavingsGoal>): Promise<SavingsGoal> {
    const existing = await this.getGoal(id);
    if (!existing) {
      throw new Error("Goal not found");
    }

    const updated: SavingsGoal = {
      ...existing,
      name: update.name ?? existing.name,
      targetAmount: update.targetAmount?.toString() ?? existing.targetAmount,
      yearsToSave: update.yearsToSave ?? existing.yearsToSave,
      currentAmount: update.currentAmount?.toString() ?? existing.currentAmount,
    };

    this.goals.set(id, updated);
    this.saveToStorage();
    return updated;
  }

  async deleteGoal(id: number): Promise<void> {
    this.goals.delete(id);
    this.saveToStorage();
  }
}

export const storage = new LocalStorage();