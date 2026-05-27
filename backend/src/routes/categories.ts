import { Router, Request, Response } from "express";
import { getAll } from "../db/database";
import { Category } from "../types";

const router = Router();

router.get("/", (_req: Request, res: Response) => {
  try {
    const categories = getAll<Category>(
      "SELECT * FROM categories ORDER BY name ASC",
    );
    res.json(categories);
  } catch (err) {
    console.error("[GET /categories]", err);
    res
      .status(500)
      .json({ error: "server_error", message: "Failed to fetch categories" });
  }
});

export default router;
