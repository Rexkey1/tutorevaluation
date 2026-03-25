import { Router } from "express";
import { db } from "../db/index.js";

const router = Router();

router.get("/", (req, res) => {
  const assignments = db.prepare(`
    SELECT a.*, 
           u.name as tutor_name, 
           c.name as course_name, 
           cl.name as class_name, 
           p.name as program_name
    FROM tutor_assignments a
    JOIN tutors t ON a.tutor_id = t.id
    JOIN users u ON t.user_id = u.id
    JOIN courses c ON a.course_id = c.id
    JOIN classes cl ON a.class_id = cl.id
    JOIN programs p ON a.program_id = p.id
  `).all();
  res.json(assignments);
});

router.post("/", (req, res) => {
  const { tutor_id, course_id, class_id, program_id, academic_year, semester } = req.body;
  try {
    db.prepare(`
      INSERT INTO tutor_assignments (tutor_id, course_id, class_id, program_id, academic_year, semester) 
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(tutor_id, course_id, class_id, program_id, academic_year, semester);
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
