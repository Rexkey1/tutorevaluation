import { Router } from "express";
import { db } from "../db/index.js";

const router = Router();

router.get("/", (req, res) => {
  const questions = db.prepare("SELECT * FROM evaluation_questions ORDER BY order_index").all();
  res.json(questions);
});

router.post("/", (req, res) => {
  const { section, question_text, question_type, is_required, order_index } = req.body;
  try {
    // Ensure form 1 exists
    db.prepare("INSERT OR IGNORE INTO evaluation_forms (id, name) VALUES (1, 'Default Form')").run();
    db.prepare(`
      INSERT INTO evaluation_questions (form_id, section, question_text, question_type, is_required, order_index)
      VALUES (1, ?, ?, ?, ?, ?)
    `).run(section || 'General', question_text, question_type, is_required ? 1 : 0, order_index || 0);
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.put("/:id", (req, res) => {
  const { section, question_text, question_type, is_required, order_index } = req.body;
  try {
    db.prepare(`
      UPDATE evaluation_questions 
      SET section = ?, question_text = ?, question_type = ?, is_required = ?, order_index = ?
      WHERE id = ?
    `).run(section, question_text, question_type, is_required ? 1 : 0, order_index, req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/:id", (req, res) => {
  try {
    db.prepare("DELETE FROM evaluation_questions WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
