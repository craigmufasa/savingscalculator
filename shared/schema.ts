import { pgTable, text, serial, integer, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const savingsGoals = pgTable("savings_goals", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  targetAmount: numeric("target_amount").notNull(),
  yearsToSave: integer("years_to_save").notNull(),
  currentAmount: numeric("current_amount").notNull().default("0"),
});

export const insertSavingsGoalSchema = createInsertSchema(savingsGoals)
  .omit({ id: true })
  .extend({
    name: z.string().min(1, "Name is required"),
    targetAmount: z.number().min(1, "Target amount must be greater than 0"),
    yearsToSave: z.number().min(1, "Years must be greater than 0"),
    currentAmount: z.number().min(0, "Current amount cannot be negative"),
  });

export type InsertSavingsGoal = z.infer<typeof insertSavingsGoalSchema>;
export type SavingsGoal = typeof savingsGoals.$inferSelect;
