import { Router } from "express";
import { db } from "../db/index.js";

const router = Router();

router.get("/active-period", (req, res) => {
  const period = db.prepare("SELECT * FROM evaluation_periods WHERE status = 'active' ORDER BY id DESC LIMIT 1").get();
  res.json(period || null);
});

router.get("/periods", (req, res) => {
  const periods = db.prepare("SELECT * FROM evaluation_periods ORDER BY id DESC").all();
  res.json(periods);
});

router.post("/periods", (req, res) => {
  const { name, academic_year, semester, start_date, end_date, status } = req.body;
  try {
    if (status === 'active') {
      db.prepare("UPDATE evaluation_periods SET status = 'inactive' WHERE status = 'active'").run();
    }
    db.prepare(`
      INSERT INTO evaluation_periods (name, academic_year, semester, start_date, end_date, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(name, academic_year, semester, start_date, end_date, status);
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.put("/periods/:id/status", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    if (status === 'active') {
      db.prepare("UPDATE evaluation_periods SET status = 'inactive' WHERE status = 'active'").run();
    }
    db.prepare("UPDATE evaluation_periods SET status = ? WHERE id = ?").run(status, id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.get("/my-assignments/:userId", (req, res) => {
  const { userId } = req.params;
  const activePeriod = db.prepare("SELECT * FROM evaluation_periods WHERE status = 'active' LIMIT 1").get() as any;
  
  if (!activePeriod) {
    return res.json([]);
  }

  const student = db.prepare("SELECT id, program_id FROM students WHERE user_id = ?").get(userId) as any;
  if (!student) return res.status(404).json({ error: "Student not found" });

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
    WHERE a.program_id = ?
      AND NOT EXISTS (
        SELECT 1 FROM evaluations e
        JOIN tutor_assignments ta ON e.tutor_assignment_id = ta.id
        WHERE e.student_id = ? 
          AND e.evaluation_period_id = ?
          AND ta.tutor_id = a.tutor_id
          AND ta.course_id = a.course_id
      )
  `).all(student.program_id, student.id, activePeriod.id);
  
  res.json(assignments);
});

router.post("/submit", (req, res) => {
  const { student_id, tutor_assignment_id, evaluation_period_id, form_id, is_anonymous, answers } = req.body;
  
  try {
    // Verify the period is still active
    const period = db.prepare("SELECT status FROM evaluation_periods WHERE id = ?").get(evaluation_period_id) as any;
    if (!period || period.status !== 'active') {
      throw new Error("This evaluation period is no longer active.");
    }

    // student_id from frontend is actually user.id
    const student = db.prepare("SELECT id FROM students WHERE user_id = ?").get(student_id) as any;
    if (!student) throw new Error("Student not found");

    const result = db.prepare(`
      INSERT INTO evaluations (student_id, tutor_assignment_id, evaluation_period_id, form_id, is_anonymous)
      VALUES (?, ?, ?, ?, ?)
    `).run(student.id, tutor_assignment_id, evaluation_period_id, form_id, is_anonymous ? 1 : 0);
    
    const evaluationId = result.lastInsertRowid;
    
    const insertAnswer = db.prepare("INSERT INTO evaluation_answers (evaluation_id, question_id, answer_value) VALUES (?, ?, ?)");
    
    const transaction = db.transaction((answersList) => {
      for (const ans of answersList) {
        insertAnswer.run(evaluationId, ans.question_id, ans.answer_value);
      }
    });
    
    transaction(answers);
    
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
