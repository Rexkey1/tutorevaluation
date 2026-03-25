import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../db/index.js";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key-change-me";

router.post("/login", (req, res) => {
  const { email, password } = req.body;
  // email could be an actual email or an index number (student_id)
  const user = db.prepare(`
    SELECT u.* FROM users u 
    LEFT JOIN students s ON u.id = s.user_id 
    WHERE LOWER(u.email) = LOWER(?) OR LOWER(s.student_id) = LOWER(?)
  `).get(email, email) as any;

  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const isValid = bcrypt.compareSync(password, user.password);
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
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = db.prepare("SELECT id, email, name, role FROM users WHERE id = ?").get(decoded.id);
    if (!user) return res.status(401).json({ error: "User not found" });
    res.json({ user });
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
});

export default router;
