import { Router } from "express";
import { db } from "../db/index.js";

const router = Router();

router.get("/stats", (req, res) => {
  try {
    const totalTutors = (db.prepare("SELECT COUNT(*) as count FROM tutors").get() as any).count;
    const totalPrograms = (db.prepare("SELECT COUNT(*) as count FROM programs").get() as any).count;
    const totalClasses = (db.prepare("SELECT COUNT(*) as count FROM classes").get() as any).count;
    const totalCourses = (db.prepare("SELECT COUNT(*) as count FROM courses").get() as any).count;
    const totalStudents = (db.prepare("SELECT COUNT(*) as count FROM students").get() as any).count;
    const totalEvaluations = (db.prepare("SELECT COUNT(*) as count FROM evaluations").get() as any).count;
    
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
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
