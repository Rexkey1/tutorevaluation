import { Router } from "express";
import { db } from "../db/index.js";

const router = Router();

router.get("/results", (req, res) => {
  try {
    const results = db.prepare(`
      SELECT 
        e.id,
        e.submitted_at,
        e.is_anonymous,
        u.name as student_name,
        s.student_id as index_number,
        tu.name as tutor_name,
        c.name as course_name,
        cl.name as class_name,
        p.name as program_name,
        ep.name as period_name,
        (
          SELECT json_group_array(json_object('question', eq.question_text, 'answer', ea.answer_value))
          FROM evaluation_answers ea
          JOIN evaluation_questions eq ON ea.question_id = eq.id
          WHERE ea.evaluation_id = e.id
        ) as answers
      FROM evaluations e
      JOIN students s ON e.student_id = s.id
      JOIN users u ON s.user_id = u.id
      JOIN tutor_assignments ta ON e.tutor_assignment_id = ta.id
      JOIN tutors t ON ta.tutor_id = t.id
      JOIN users tu ON t.user_id = tu.id
      JOIN courses c ON ta.course_id = c.id
      JOIN classes cl ON ta.class_id = cl.id
      JOIN programs p ON ta.program_id = p.id
      JOIN evaluation_periods ep ON e.evaluation_period_id = ep.id
      ORDER BY e.submitted_at DESC
    `).all();

    // Parse the JSON answers
    const parsedResults = results.map((r: any) => ({
      ...r,
      answers: JSON.parse(r.answers)
    }));

    res.json(parsedResults);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/results", (req, res) => {
  try {
    db.transaction(() => {
      // Delete all evaluation answers
      db.prepare("DELETE FROM evaluation_answers").run();
      // Delete all evaluations
      db.prepare("DELETE FROM evaluations").run();
    })();
    res.json({ success: true, message: "All analytics and results have been cleared successfully." });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
