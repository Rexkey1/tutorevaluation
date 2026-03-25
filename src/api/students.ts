import { Router } from "express";
import { db } from "../db/index.js";
import bcrypt from "bcryptjs";

const router = Router();

router.get("/", (req, res) => {
  const students = db.prepare(`
    SELECT s.*, u.name, u.email, p.name as program_name, c.name as class_name
    FROM students s 
    JOIN users u ON s.user_id = u.id
    LEFT JOIN programs p ON s.program_id = p.id
    LEFT JOIN classes c ON s.class_id = c.id
  `).all();
  res.json(students);
});

router.post("/", (req, res) => {
  const { name, index_number, program_id, class_id } = req.body;
  try {
    const password = index_number.slice(-6);
    const hash = bcrypt.hashSync(password, 10);
    const email = `${index_number}@student.local`;
    
    const result = db.prepare("INSERT INTO users (email, password, role, name) VALUES (?, ?, ?, ?)").run(email, hash, "student", name);
    const userId = result.lastInsertRowid;
    
    db.prepare("INSERT INTO students (user_id, student_id, program_id, class_id) VALUES (?, ?, ?, ?)").run(userId, index_number, program_id || null, class_id || null);
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { name, index_number, program_id, class_id } = req.body;
  try {
    const student = db.prepare("SELECT user_id FROM students WHERE id = ?").get(id) as any;
    if (!student) return res.status(404).json({ error: "Student not found" });

    db.transaction(() => {
      db.prepare("UPDATE users SET name = ? WHERE id = ?").run(name, student.user_id);
      db.prepare("UPDATE students SET student_id = ?, program_id = ?, class_id = ? WHERE id = ?").run(index_number, program_id || null, class_id || null, id);
    })();
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/:id", (req, res) => {
  const { id } = req.params;
  try {
    const student = db.prepare("SELECT user_id FROM students WHERE id = ?").get(id) as any;
    if (!student) return res.status(404).json({ error: "Student not found" });

    db.transaction(() => {
      db.prepare("DELETE FROM students WHERE id = ?").run(id);
      db.prepare("DELETE FROM users WHERE id = ?").run(student.user_id);
    })();
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.post("/bulk", (req, res) => {
  const { students } = req.body;
  try {
    const insertUser = db.prepare("INSERT INTO users (email, password, role, name) VALUES (?, ?, ?, ?)");
    const insertStudent = db.prepare("INSERT INTO students (user_id, student_id, program_id, class_id) VALUES (?, ?, ?, ?)");
    const getProgram = db.prepare("SELECT id FROM programs WHERE code = ?");
    const getClass = db.prepare("SELECT id FROM classes WHERE name = ?");
    
    const transaction = db.transaction((studentsList) => {
      for (const student of studentsList) {
        const password = student.index_number.slice(-6);
        const hash = bcrypt.hashSync(password, 10);
        const email = `${student.index_number}@student.local`;
        
        const program = getProgram.get(student.program_code) as any;
        const program_id = program ? program.id : null;

        let class_id = null;
        if (student.class_name) {
          const classObj = getClass.get(student.class_name) as any;
          if (classObj) class_id = classObj.id;
        }
        
        const result = insertUser.run(email, hash, "student", student.name);
        insertStudent.run(result.lastInsertRowid, student.index_number, program_id, class_id);
      }
    });
    
    transaction(students);
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
