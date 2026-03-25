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

router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { name, program_id } = req.body;
  try {
    db.prepare("UPDATE classes SET name = ?, program_id = ? WHERE id = ?").run(name, program_id, id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/:id", (req, res) => {
  const { id } = req.params;
  try {
    db.transaction(() => {
      // Set class_id to null in students, tutor_assignments
      db.prepare("UPDATE students SET class_id = NULL WHERE class_id = ?").run(id);
      db.prepare("UPDATE tutor_assignments SET class_id = NULL WHERE class_id = ?").run(id);
      
      db.prepare("DELETE FROM classes WHERE id = ?").run(id);
    })();
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
