import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import bcrypt from "bcryptjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(process.cwd(), "data.db");
export const db = new Database(dbPath);

export function initDb() {
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
      class_id INTEGER,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (class_id) REFERENCES classes(id)
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

  // Seed super admin if not exists
  const adminExists = db.prepare("SELECT * FROM users WHERE role = 'super_admin' AND email = 'rexkey@gmail.com'").get() as any;
  if (!adminExists) {
    const hash = bcrypt.hashSync("the password", 10);
    db.prepare("INSERT INTO users (email, password, role, name) VALUES (?, ?, ?, ?)").run(
      "rexkey@gmail.com",
      hash,
      "super_admin",
      "Super Admin"
    );
  } else {
    // Update the default admin to the requested one
    const hash = bcrypt.hashSync("the password", 10);
    db.prepare("UPDATE users SET password = ? WHERE email = 'rexkey@gmail.com'").run(hash);
  }

  const oldAdminExists = db.prepare("SELECT * FROM users WHERE email = 'admin@example.com'").get() as any;
  if (!oldAdminExists) {
    const hash = bcrypt.hashSync("admin123", 10);
    db.prepare("INSERT INTO users (email, password, role, name) VALUES (?, ?, ?, ?)").run(
      "admin@example.com",
      hash,
      "super_admin",
      "Admin"
    );
  }

  // Add class_id to students if it doesn't exist
  try {
    db.prepare("ALTER TABLE students ADD COLUMN class_id INTEGER REFERENCES classes(id)").run();
  } catch (e) {
    // Column might already exist
  }

  // Seed student if not exists
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
      1 // Assuming program 1 might exist or will be created
    );
  }

  // Seed default form and questions if none exist
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
      insertQ.run(q.section, q.text, q.type, q.order, q.required !== undefined ? q.required : 1);
    }
  }
}
