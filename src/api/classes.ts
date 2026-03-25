import { Router } from "express";
import { db } from "../db/index.js";

const router = Router();

router.get("/", (req, res) => {
  const classes = db.prepare(`
    SELECT c.*, p.name as program_name 
    FROM classes c 
    LEFT JOIN programs p ON c.program_id = p.id
  `).all();
  res.json(classes);
});

router.post("/", (req, res) => {
  const { name, program_id } = req.body;
  try {
    db.prepare("INSERT INTO classes (name, program_id) VALUES (?, ?)").run(name, program_id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
