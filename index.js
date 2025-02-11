// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
var LocalStorage = class {
  STORAGE_KEY = "savings_goals";
  goals;
  currentId;
  constructor() {
    this.goals = /* @__PURE__ */ new Map();
    this.currentId = 1;
    this.loadFromStorage();
  }
  loadFromStorage() {
    if (typeof window === "undefined") return;
    const savedGoals = window.localStorage.getItem(this.STORAGE_KEY);
    if (savedGoals) {
      const goals = JSON.parse(savedGoals);
      this.goals = new Map(goals.map((goal) => [goal.id, goal]));
      this.currentId = Math.max(...goals.map((g) => g.id), 0) + 1;
    }
  }
  saveToStorage() {
    if (typeof window === "undefined") return;
    const goals = Array.from(this.goals.values());
    window.localStorage.setItem(this.STORAGE_KEY, JSON.stringify(goals));
  }
  async getAllGoals() {
    return Array.from(this.goals.values());
  }
  async getGoal(id) {
    return this.goals.get(id);
  }
  async createGoal(insertGoal) {
    const id = this.currentId++;
    const goal = {
      id,
      name: insertGoal.name,
      targetAmount: insertGoal.targetAmount.toString(),
      yearsToSave: insertGoal.yearsToSave,
      currentAmount: insertGoal.currentAmount.toString()
    };
    this.goals.set(id, goal);
    this.saveToStorage();
    return goal;
  }
  async updateGoal(id, update) {
    const existing = await this.getGoal(id);
    if (!existing) {
      throw new Error("Goal not found");
    }
    const updated = {
      ...existing,
      name: update.name ?? existing.name,
      targetAmount: update.targetAmount?.toString() ?? existing.targetAmount,
      yearsToSave: update.yearsToSave ?? existing.yearsToSave,
      currentAmount: update.currentAmount?.toString() ?? existing.currentAmount
    };
    this.goals.set(id, updated);
    this.saveToStorage();
    return updated;
  }
  async deleteGoal(id) {
    this.goals.delete(id);
    this.saveToStorage();
  }
};
var storage = new LocalStorage();

// shared/schema.ts
import { pgTable, text, serial, integer, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var savingsGoals = pgTable("savings_goals", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  targetAmount: numeric("target_amount").notNull(),
  yearsToSave: integer("years_to_save").notNull(),
  currentAmount: numeric("current_amount").notNull().default("0")
});
var insertSavingsGoalSchema = createInsertSchema(savingsGoals).omit({ id: true }).extend({
  name: z.string().min(1, "Name is required"),
  targetAmount: z.number().min(1, "Target amount must be greater than 0"),
  yearsToSave: z.number().min(1, "Years must be greater than 0"),
  currentAmount: z.number().min(0, "Current amount cannot be negative")
});

// server/routes.ts
function registerRoutes(app2) {
  app2.get("/api/goals", async (_req, res) => {
    const goals = await storage.getAllGoals();
    res.json(goals);
  });
  app2.post("/api/goals", async (req, res) => {
    const result = insertSavingsGoalSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Invalid goal data" });
    }
    const goal = await storage.createGoal(result.data);
    res.status(201).json(goal);
  });
  app2.patch("/api/goals/:id", async (req, res) => {
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
  app2.delete("/api/goals/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid goal ID" });
    }
    await storage.deleteGoal(id);
    res.status(204).send();
  });
  return createServer(app2);
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2, { dirname as dirname2 } from "path";
import { fileURLToPath as fileURLToPath2 } from "url";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path, { dirname } from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { fileURLToPath } from "url";
var __filename = fileURLToPath(import.meta.url);
var __dirname = dirname(__filename);
var vite_config_default = defineConfig({
  plugins: [react(), runtimeErrorOverlay(), themePlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared")
    }
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var __filename2 = fileURLToPath2(import.meta.url);
var __dirname2 = dirname2(__filename2);
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        __dirname2,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(__dirname2, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const PORT = 5e3;
  server.listen(PORT, "0.0.0.0", () => {
    log(`serving on port ${PORT}`);
  });
})();
