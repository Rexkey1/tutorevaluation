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

router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { name, code } = req.body;
  try {
    db.prepare("UPDATE programs SET name = ?, code = ? WHERE id = ?").run(name, code, id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/:id", (req, res) => {
  const { id } = req.params;
  try {
    db.transaction(() => {
      // Set program_id to null in students, classes, courses, tutor_assignments
      db.prepare("UPDATE students SET program_id = NULL WHERE program_id = ?").run(id);
      db.prepare("UPDATE classes SET program_id = NULL WHERE program_id = ?").run(id);
      db.prepare("UPDATE courses SET program_id = NULL WHERE program_id = ?").run(id);
      db.prepare("UPDATE tutor_assignments SET program_id = NULL WHERE program_id = ?").run(id);
      
      db.prepare("DELETE FROM programs WHERE id = ?").run(id);
    })();
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
