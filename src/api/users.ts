import { Router } from "express";
import { db } from "../db/index.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key-change-me";

const requireSuperAdmin = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No token provided" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (decoded.role !== "super_admin") {
      return res.status(403).json({ error: "Access denied. Super Admin only." });
    }
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};

// Get all system users (admins and super_admins)
router.get("/", requireSuperAdmin, (req, res) => {
  try {
    const users = db.prepare("SELECT id, name, email, role, created_at FROM users WHERE role IN ('admin', 'super_admin')").all();
    res.json(users);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new system user
router.post("/", requireSuperAdmin, (req, res) => {
  const { name, email, password, role } = req.body;
  if (!['admin', 'super_admin'].includes(role)) {
    return res.status(400).json({ error: "Invalid role for system user" });
  }

  try {
    const hash = bcrypt.hashSync(password, 10);
    db.prepare("INSERT INTO users (email, password, role, name) VALUES (?, ?, ?, ?)").run(email, hash, role, name);
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Update a system user
router.put("/:id", requireSuperAdmin, (req, res) => {
  const { id } = req.params;
  const { name, email, password, role } = req.body;
  
  try {
    if (password) {
      const hash = bcrypt.hashSync(password, 10);
      db.prepare("UPDATE users SET name = ?, email = ?, password = ?, role = ? WHERE id = ? AND role IN ('admin', 'super_admin')").run(name, email, hash, role, id);
    } else {
      db.prepare("UPDATE users SET name = ?, email = ?, role = ? WHERE id = ? AND role IN ('admin', 'super_admin')").run(name, email, role, id);
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a system user
router.delete("/:id", requireSuperAdmin, (req, res) => {
  const { id } = req.params;
  try {
    // Prevent deleting the last super_admin
    const superAdmins = db.prepare("SELECT count(*) as count FROM users WHERE role = 'super_admin'").get() as any;
    const userToDelete = db.prepare("SELECT role FROM users WHERE id = ?").get(id) as any;
    
    if (userToDelete && userToDelete.role === 'super_admin' && superAdmins.count <= 1) {
      return res.status(400).json({ error: "Cannot delete the last super admin" });
    }

    db.prepare("DELETE FROM users WHERE id = ? AND role IN ('admin', 'super_admin')").run(id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

const requireAuth = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No token provided" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};

// Update own profile
router.put("/profile/:id", requireAuth, (req, res) => {
  const { id } = req.params;
  const { name, email, password } = req.body;
  
  if ((req as any).user.id !== parseInt(id, 10)) {
    return res.status(403).json({ error: "You can only update your own profile" });
  }

  try {
    if (password) {
      const hash = bcrypt.hashSync(password, 10);
      db.prepare("UPDATE users SET name = ?, email = ?, password = ? WHERE id = ?").run(name, email, hash, id);
    } else {
      db.prepare("UPDATE users SET name = ?, email = ? WHERE id = ?").run(name, email, id);
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
