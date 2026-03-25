/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import AdminLayout from "./layouts/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import Tutors from "./pages/admin/Tutors";
import Programs from "./pages/admin/Programs";
import Classes from "./pages/admin/Classes";
import Courses from "./pages/admin/Courses";
import Assignments from "./pages/admin/Assignments";
import Periods from "./pages/admin/Periods";
import Questions from "./pages/admin/Questions";
import Students from "./pages/admin/Students";
import Analytics from "./pages/admin/Analytics";
import SystemUsers from "./pages/admin/SystemUsers";
import Profile from "./pages/admin/Profile";
import StudentLayout from "./layouts/StudentLayout";
import Evaluate from "./pages/student/Evaluate";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="tutors" element={<Tutors />} />
          <Route path="students" element={<Students />} />
          <Route path="programs" element={<Programs />} />
          <Route path="classes" element={<Classes />} />
          <Route path="courses" element={<Courses />} />
          <Route path="assignments" element={<Assignments />} />
          <Route path="periods" element={<Periods />} />
          <Route path="questions" element={<Questions />} />
          <Route path="users" element={<SystemUsers />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        <Route path="/student" element={<StudentLayout />}>
          <Route path="evaluate" element={<Evaluate />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
