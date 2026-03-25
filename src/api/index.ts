import { Router } from "express";
import authRoutes from "./auth.js";
import tutorRoutes from "./tutors.js";
import programRoutes from "./programs.js";
import classRoutes from "./classes.js";
import courseRoutes from "./courses.js";
import assignmentRoutes from "./assignments.js";
import evaluationRoutes from "./evaluations.js";
import dashboardRoutes from "./dashboard.js";
import questionRoutes from "./questions.js";
import studentRoutes from "./students.js";
import analyticsRoutes from "./analytics.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/tutors", tutorRoutes);
router.use("/programs", programRoutes);
router.use("/classes", classRoutes);
router.use("/courses", courseRoutes);
router.use("/assignments", assignmentRoutes);
router.use("/evaluations", evaluationRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/questions", questionRoutes);
router.use("/students", studentRoutes);
router.use("/analytics", analyticsRoutes);

export default router;
