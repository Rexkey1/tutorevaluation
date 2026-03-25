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

router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { name, code, program_id, semester, level } = req.body;
  try {
    db.prepare("UPDATE courses SET name = ?, code = ?, program_id = ?, semester = ?, level = ? WHERE id = ?").run(name, code, program_id, semester, level, id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/:id", (req, res) => {
  const { id } = req.params;
  try {
    db.transaction(() => {
      // Set course_id to null in tutor_assignments
      db.prepare("UPDATE tutor_assignments SET course_id = NULL WHERE course_id = ?").run(id);
      
      db.prepare("DELETE FROM courses WHERE id = ?").run(id);
    })();
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
