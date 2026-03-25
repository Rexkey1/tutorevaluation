// server.ts
import express from "express";
import path2 from "path";
import { fileURLToPath as fileURLToPath2 } from "url";

// src/db/index.ts
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var dbPath = path.join(process.cwd(), "data.db");
var db = new Database(dbPath);
function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL, -- 'super_admin', 'admin', 'student', 'tutor'
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS tutors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE,
      staff_id TEXT UNIQUE,
      department TEXT,
      specialization TEXT,
      status TEXT DEFAULT 'active',
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE,
      student_id TEXT UNIQUE,
      program_id INTEGER,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS programs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      code TEXT UNIQUE NOT NULL
    );

    CREATE TABLE IF NOT EXISTS classes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      program_id INTEGER,
      FOREIGN KEY (program_id) REFERENCES programs(id)
    );

    CREATE TABLE IF NOT EXISTS courses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      code TEXT UNIQUE NOT NULL,
      program_id INTEGER,
      semester TEXT,
      level TEXT,
      FOREIGN KEY (program_id) REFERENCES programs(id)
    );

    CREATE TABLE IF NOT EXISTS tutor_assignments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tutor_id INTEGER,
      course_id INTEGER,
      class_id INTEGER,
      program_id INTEGER,
      academic_year TEXT,
      semester TEXT,
      FOREIGN KEY (tutor_id) REFERENCES tutors(id),
      FOREIGN KEY (course_id) REFERENCES courses(id),
      FOREIGN KEY (class_id) REFERENCES classes(id),
      FOREIGN KEY (program_id) REFERENCES programs(id),
      UNIQUE(tutor_id, course_id, class_id, program_id, academic_year, semester)
    );

    CREATE TABLE IF NOT EXISTS evaluation_periods (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      academic_year TEXT NOT NULL,
      semester TEXT NOT NULL,
      start_date DATETIME NOT NULL,
      end_date DATETIME NOT NULL,
      status TEXT DEFAULT 'draft' -- 'draft', 'active', 'closed', 'archived'
    );

    CREATE TABLE IF NOT EXISTS evaluation_forms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'draft'
    );

    CREATE TABLE IF NOT EXISTS evaluation_questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      form_id INTEGER,
      section TEXT NOT NULL,
      question_text TEXT NOT NULL,
      question_type TEXT NOT NULL, -- 'rating', 'yes_no', 'short_text', 'long_text'
      is_required BOOLEAN DEFAULT 1,
      order_index INTEGER DEFAULT 0,
      FOREIGN KEY (form_id) REFERENCES evaluation_forms(id)
    );

    CREATE TABLE IF NOT EXISTS evaluations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER,
      tutor_assignment_id INTEGER,
      evaluation_period_id INTEGER,
      form_id INTEGER,
      is_anonymous BOOLEAN DEFAULT 0,
      submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id),
      FOREIGN KEY (tutor_assignment_id) REFERENCES tutor_assignments(id),
      FOREIGN KEY (evaluation_period_id) REFERENCES evaluation_periods(id),
      FOREIGN KEY (form_id) REFERENCES evaluation_forms(id),
      UNIQUE(student_id, tutor_assignment_id, evaluation_period_id)
    );

    CREATE TABLE IF NOT EXISTS evaluation_answers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      evaluation_id INTEGER,
      question_id INTEGER,
      answer_value TEXT,
      FOREIGN KEY (evaluation_id) REFERENCES evaluations(id),
      FOREIGN KEY (question_id) REFERENCES evaluation_questions(id)
    );
  `);
  const adminExists = db.prepare("SELECT * FROM users WHERE role = 'super_admin'").get();
  if (!adminExists) {
    const hash = bcrypt.hashSync("admin123", 10);
    db.prepare("INSERT INTO users (email, password, role, name) VALUES (?, ?, ?, ?)").run(
      "admin@example.com",
      hash,
      "super_admin",
      "Super Admin"
    );
  }
  const studentExists = db.prepare("SELECT * FROM users WHERE role = 'student'").get();
  if (!studentExists) {
    const hash = bcrypt.hashSync("student123", 10);
    const result = db.prepare("INSERT INTO users (email, password, role, name) VALUES (?, ?, ?, ?)").run(
      "student@example.com",
      hash,
      "student",
      "Test Student"
    );
    const userId = result.lastInsertRowid;
    db.prepare("INSERT INTO students (user_id, student_id, program_id) VALUES (?, ?, ?)").run(
      userId,
      "STU001",
      1
      // Assuming program 1 might exist or will be created
    );
  }
  const formExists = db.prepare("SELECT * FROM evaluation_forms WHERE id = 1").get();
  if (!formExists) {
    db.prepare("INSERT INTO evaluation_forms (id, name, description, status) VALUES (1, 'Default Form', 'Standard tutor evaluation form', 'active')").run();
    const questions = [
      { section: "General", text: "The tutor explains concepts clearly and effectively.", type: "rating", order: 1 },
      { section: "General", text: "The tutor is approachable and willing to help.", type: "rating", order: 2 },
      { section: "General", text: "The tutor provides useful feedback on assignments.", type: "rating", order: 3 },
      { section: "General", text: "The tutor manages class time efficiently.", type: "rating", order: 4 },
      { section: "General", text: "Overall satisfaction with the tutor's performance.", type: "rating", order: 5 },
      { section: "Feedback", text: "Additional Comments (Optional)", type: "long_text", order: 6, required: 0 }
    ];
    const insertQ = db.prepare("INSERT INTO evaluation_questions (form_id, section, question_text, question_type, order_index, is_required) VALUES (1, ?, ?, ?, ?, ?)");
    for (const q of questions) {
      insertQ.run(q.section, q.text, q.type, q.order, q.required !== void 0 ? q.required : 1);
    }
  }
}

// src/api/index.ts
import { Router as Router12 } from "express";

// src/api/auth.ts
import { Router } from "express";
import bcrypt2 from "bcryptjs";
import jwt from "jsonwebtoken";
var router = Router();
var JWT_SECRET = process.env.JWT_SECRET || "super-secret-key-change-me";
router.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = db.prepare(`
    SELECT u.* FROM users u 
    LEFT JOIN students s ON u.id = s.user_id 
    WHERE LOWER(u.email) = LOWER(?) OR LOWER(s.student_id) = LOWER(?)
  `).get(email, email);
  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  const isValid = bcrypt2.compareSync(password, user.password);
  if (!isValid) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "24h" });
  res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
});
router.get("/me", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No token provided" });
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = db.prepare("SELECT id, email, name, role FROM users WHERE id = ?").get(decoded.id);
    if (!user) return res.status(401).json({ error: "User not found" });
    res.json({ user });
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
});
var auth_default = router;

// src/api/tutors.ts
import { Router as Router2 } from "express";
import bcrypt3 from "bcryptjs";
var router2 = Router2();
router2.get("/", (req, res) => {
  const tutors = db.prepare(`
    SELECT t.*, u.name, u.email 
    FROM tutors t 
    JOIN users u ON t.user_id = u.id
  `).all();
  res.json(tutors);
});
router2.post("/", (req, res) => {
  const { name, email, staff_id, department, specialization } = req.body;
  try {
    const hash = bcrypt3.hashSync("tutor123", 10);
    const result = db.prepare("INSERT INTO users (email, password, role, name) VALUES (?, ?, ?, ?)").run(email, hash, "tutor", name);
    const userId = result.lastInsertRowid;
    db.prepare("INSERT INTO tutors (user_id, staff_id, department, specialization) VALUES (?, ?, ?, ?)").run(userId, staff_id, department, specialization);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
var tutors_default = router2;

// src/api/programs.ts
import { Router as Router3 } from "express";
var router3 = Router3();
router3.get("/", (req, res) => {
  const programs = db.prepare("SELECT * FROM programs").all();
  res.json(programs);
});
router3.post("/", (req, res) => {
  const { name, code } = req.body;
  try {
    db.prepare("INSERT INTO programs (name, code) VALUES (?, ?)").run(name, code);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
var programs_default = router3;

// src/api/classes.ts
import { Router as Router4 } from "express";
var router4 = Router4();
router4.get("/", (req, res) => {
  const classes = db.prepare(`
    SELECT c.*, p.name as program_name 
    FROM classes c 
    LEFT JOIN programs p ON c.program_id = p.id
  `).all();
  res.json(classes);
});
router4.post("/", (req, res) => {
  const { name, program_id } = req.body;
  try {
    db.prepare("INSERT INTO classes (name, program_id) VALUES (?, ?)").run(name, program_id);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
var classes_default = router4;

// src/api/courses.ts
import { Router as Router5 } from "express";
var router5 = Router5();
router5.get("/", (req, res) => {
  const courses = db.prepare(`
    SELECT c.*, p.name as program_name 
    FROM courses c 
    LEFT JOIN programs p ON c.program_id = p.id
  `).all();
  res.json(courses);
});
router5.post("/", (req, res) => {
  const { name, code, program_id, semester, level } = req.body;
  try {
    db.prepare("INSERT INTO courses (name, code, program_id, semester, level) VALUES (?, ?, ?, ?, ?)").run(name, code, program_id, semester, level);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
var courses_default = router5;

// src/api/assignments.ts
import { Router as Router6 } from "express";
var router6 = Router6();
router6.get("/", (req, res) => {
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
router6.post("/", (req, res) => {
  const { tutor_id, course_id, class_id, program_id, academic_year, semester } = req.body;
  try {
    db.prepare(`
      INSERT INTO tutor_assignments (tutor_id, course_id, class_id, program_id, academic_year, semester) 
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(tutor_id, course_id, class_id, program_id, academic_year, semester);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
var assignments_default = router6;

// src/api/evaluations.ts
import { Router as Router7 } from "express";
var router7 = Router7();
router7.get("/active-period", (req, res) => {
  const period = db.prepare("SELECT * FROM evaluation_periods WHERE status = 'active' ORDER BY id DESC LIMIT 1").get();
  res.json(period || null);
});
router7.get("/periods", (req, res) => {
  const periods = db.prepare("SELECT * FROM evaluation_periods ORDER BY id DESC").all();
  res.json(periods);
});
router7.post("/periods", (req, res) => {
  const { name, academic_year, semester, start_date, end_date, status } = req.body;
  try {
    if (status === "active") {
      db.prepare("UPDATE evaluation_periods SET status = 'inactive' WHERE status = 'active'").run();
    }
    db.prepare(`
      INSERT INTO evaluation_periods (name, academic_year, semester, start_date, end_date, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(name, academic_year, semester, start_date, end_date, status);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
router7.put("/periods/:id/status", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    if (status === "active") {
      db.prepare("UPDATE evaluation_periods SET status = 'inactive' WHERE status = 'active'").run();
    }
    db.prepare("UPDATE evaluation_periods SET status = ? WHERE id = ?").run(status, id);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
router7.get("/my-assignments/:userId", (req, res) => {
  const { userId } = req.params;
  const activePeriod = db.prepare("SELECT * FROM evaluation_periods WHERE status = 'active' LIMIT 1").get();
  if (!activePeriod) {
    return res.json([]);
  }
  const student = db.prepare("SELECT id, program_id FROM students WHERE user_id = ?").get(userId);
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
router7.post("/submit", (req, res) => {
  const { student_id, tutor_assignment_id, evaluation_period_id, form_id, is_anonymous, answers } = req.body;
  try {
    const period = db.prepare("SELECT status FROM evaluation_periods WHERE id = ?").get(evaluation_period_id);
    if (!period || period.status !== "active") {
      throw new Error("This evaluation period is no longer active.");
    }
    const student = db.prepare("SELECT id FROM students WHERE user_id = ?").get(student_id);
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
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
var evaluations_default = router7;

// src/api/dashboard.ts
import { Router as Router8 } from "express";
var router8 = Router8();
router8.get("/stats", (req, res) => {
  try {
    const totalTutors = db.prepare("SELECT COUNT(*) as count FROM tutors").get().count;
    const totalPrograms = db.prepare("SELECT COUNT(*) as count FROM programs").get().count;
    const totalClasses = db.prepare("SELECT COUNT(*) as count FROM classes").get().count;
    const totalCourses = db.prepare("SELECT COUNT(*) as count FROM courses").get().count;
    const totalStudents = db.prepare("SELECT COUNT(*) as count FROM students").get().count;
    const totalEvaluations = db.prepare("SELECT COUNT(*) as count FROM evaluations").get().count;
    const activePeriod = db.prepare("SELECT * FROM evaluation_periods WHERE status = 'active' LIMIT 1").get();
    res.json({
      totalTutors,
      totalPrograms,
      totalClasses,
      totalCourses,
      totalStudents,
      totalEvaluations,
      activePeriod
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
var dashboard_default = router8;

// src/api/questions.ts
import { Router as Router9 } from "express";
var router9 = Router9();
router9.get("/", (req, res) => {
  const questions = db.prepare("SELECT * FROM evaluation_questions ORDER BY order_index").all();
  res.json(questions);
});
router9.post("/", (req, res) => {
  const { section, question_text, question_type, is_required, order_index } = req.body;
  try {
    db.prepare("INSERT OR IGNORE INTO evaluation_forms (id, name) VALUES (1, 'Default Form')").run();
    db.prepare(`
      INSERT INTO evaluation_questions (form_id, section, question_text, question_type, is_required, order_index)
      VALUES (1, ?, ?, ?, ?, ?)
    `).run(section || "General", question_text, question_type, is_required ? 1 : 0, order_index || 0);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
router9.put("/:id", (req, res) => {
  const { section, question_text, question_type, is_required, order_index } = req.body;
  try {
    db.prepare(`
      UPDATE evaluation_questions 
      SET section = ?, question_text = ?, question_type = ?, is_required = ?, order_index = ?
      WHERE id = ?
    `).run(section, question_text, question_type, is_required ? 1 : 0, order_index, req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
router9.delete("/:id", (req, res) => {
  try {
    db.prepare("DELETE FROM evaluation_questions WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
var questions_default = router9;

// src/api/students.ts
import { Router as Router10 } from "express";
import bcrypt4 from "bcryptjs";
var router10 = Router10();
router10.get("/", (req, res) => {
  const students = db.prepare(`
    SELECT s.*, u.name, u.email, p.name as program_name 
    FROM students s 
    JOIN users u ON s.user_id = u.id
    LEFT JOIN programs p ON s.program_id = p.id
  `).all();
  res.json(students);
});
router10.post("/", (req, res) => {
  const { name, index_number, program_id } = req.body;
  try {
    const password = index_number.slice(-6);
    const hash = bcrypt4.hashSync(password, 10);
    const email = `${index_number}@student.local`;
    const result = db.prepare("INSERT INTO users (email, password, role, name) VALUES (?, ?, ?, ?)").run(email, hash, "student", name);
    const userId = result.lastInsertRowid;
    db.prepare("INSERT INTO students (user_id, student_id, program_id) VALUES (?, ?, ?)").run(userId, index_number, program_id);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
router10.post("/bulk", (req, res) => {
  const { students } = req.body;
  try {
    const insertUser = db.prepare("INSERT INTO users (email, password, role, name) VALUES (?, ?, ?, ?)");
    const insertStudent = db.prepare("INSERT INTO students (user_id, student_id, program_id) VALUES (?, ?, ?)");
    const getProgram = db.prepare("SELECT id FROM programs WHERE code = ?");
    const transaction = db.transaction((studentsList) => {
      for (const student of studentsList) {
        const password = student.index_number.slice(-6);
        const hash = bcrypt4.hashSync(password, 10);
        const email = `${student.index_number}@student.local`;
        const program = getProgram.get(student.program_code);
        const program_id = program ? program.id : null;
        const result = insertUser.run(email, hash, "student", student.name);
        insertStudent.run(result.lastInsertRowid, student.index_number, program_id);
      }
    });
    transaction(students);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
var students_default = router10;

// src/api/analytics.ts
import { Router as Router11 } from "express";
var router11 = Router11();
router11.get("/results", (req, res) => {
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
    const parsedResults = results.map((r) => ({
      ...r,
      answers: JSON.parse(r.answers)
    }));
    res.json(parsedResults);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
var analytics_default = router11;

// src/api/index.ts
var router12 = Router12();
router12.use("/auth", auth_default);
router12.use("/tutors", tutors_default);
router12.use("/programs", programs_default);
router12.use("/classes", classes_default);
router12.use("/courses", courses_default);
router12.use("/assignments", assignments_default);
router12.use("/evaluations", evaluations_default);
router12.use("/dashboard", dashboard_default);
router12.use("/questions", questions_default);
router12.use("/students", students_default);
router12.use("/analytics", analytics_default);
var api_default = router12;

// server.ts
var __filename2 = fileURLToPath2(import.meta.url);
var __dirname2 = path2.dirname(__filename2);
async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3e3;
  app.use(express.json());
  initDb();
  app.use("/api", api_default);
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path2.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path2.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
startServer();
