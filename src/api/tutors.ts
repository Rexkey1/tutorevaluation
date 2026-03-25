import { Router } from "express";
import { db } from "../db/index.js";
import bcrypt from "bcryptjs";

const router = Router();

router.get("/", (req, res) => {
  const tutors = db.prepare(`
    SELECT t.*, u.name, u.email 
    FROM tutors t 
    JOIN users u ON t.user_id = u.id
  `).all();
  res.json(tutors);
});

router.post("/", (req, res) => {
  const { name, email, staff_id, department, specialization } = req.body;
  
  try {
    const hash = bcrypt.hashSync("tutor123", 10);
    const result = db.prepare("INSERT INTO users (email, password, role, name) VALUES (?, ?, ?, ?)").run(email, hash, "tutor", name);
    const userId = result.lastInsertRowid;
    
    db.prepare("INSERT INTO tutors (user_id, staff_id, department, specialization) VALUES (?, ?, ?, ?)").run(userId, staff_id, department, specialization);
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { name, email, staff_id, department, specialization } = req.body;
  try {
    const tutor = db.prepare("SELECT user_id FROM tutors WHERE id = ?").get(id) as any;
    if (!tutor) return res.status(404).json({ error: "Tutor not found" });

    db.transaction(() => {
      db.prepare("UPDATE users SET name = ?, email = ? WHERE id = ?").run(name, email, tutor.user_id);
      db.prepare("UPDATE tutors SET staff_id = ?, department = ?, specialization = ? WHERE id = ?").run(staff_id, department, specialization, id);
    })();
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/:id", (req, res) => {
  const { id } = req.params;
  try {
    const tutor = db.prepare("SELECT user_id FROM tutors WHERE id = ?").get(id) as any;
    if (!tutor) return res.status(404).json({ error: "Tutor not found" });

    db.transaction(() => {
      db.prepare("DELETE FROM tutors WHERE id = ?").run(id);
      db.prepare("DELETE FROM users WHERE id = ?").run(tutor.user_id);
    })();
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
