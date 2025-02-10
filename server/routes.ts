import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertSavingsGoalSchema } from "@shared/schema";

export function registerRoutes(app: Express) {
  app.get("/api/goals", async (_req, res) => {
    const goals = await storage.getAllGoals();
    res.json(goals);
  });

  app.post("/api/goals", async (req, res) => {
    const result = insertSavingsGoalSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Invalid goal data" });
    }
    const goal = await storage.createGoal(result.data);
    res.status(201).json(goal);
  });

  app.patch("/api/goals/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid goal ID" });
    }
    const result = insertSavingsGoalSchema.partial().safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Invalid update data" });
    }
    try {
      const goal = await storage.updateGoal(id, result.data);
      res.json(goal);
    } catch (error) {
      res.status(404).json({ message: "Goal not found" });
    }
  });

  app.delete("/api/goals/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid goal ID" });
    }
    await storage.deleteGoal(id);
    res.status(204).send();
  });

  return createServer(app);
}
