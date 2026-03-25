import { Router } from "express";
import { db } from "../db/index.js";

const router = Router();

router.get("/", (req, res) => {
  const programs = db.prepare("SELECT * FROM programs").all();
  res.json(programs);
});

router.post("/", (req, res) => {
  const { name, code } = req.body;
  try {
    db.prepare("INSERT INTO programs (name, code) VALUES (?, ?)").run(name, code);
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
