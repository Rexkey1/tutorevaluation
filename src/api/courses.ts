import { Router } from "express";
import { db } from "../db/index.js";

const router = Router();

router.get("/", (req, res) => {
  const courses = db.prepare(`
    SELECT c.*, p.name as program_name 
    FROM courses c 
    LEFT JOIN programs p ON c.program_id = p.id
  `).all();
  res.json(courses);
});

router.post("/", (req, res) => {
  const { name, code, program_id, semester, level } = req.body;
  try {
    db.prepare("INSERT INTO courses (name, code, program_id, semester, level) VALUES (?, ?, ?, ?, ?)").run(name, code, program_id, semester, level);
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
