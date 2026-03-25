import { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, BookOpen, GraduationCap, Calendar, ClipboardList, LogOut, HelpCircle, UserPlus, Menu, X, BarChart2 } from "lucide-react";

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const navItems = [
    { path: "/admin", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/admin/analytics", icon: BarChart2, label: "Analytics" },
    { path: "/admin/tutors", icon: Users, label: "Tutors" },
    { path: "/admin/students", icon: UserPlus, label: "Students" },
    { path: "/admin/programs", icon: BookOpen, label: "Programs" },
    { path: "/admin/classes", icon: GraduationCap, label: "Classes" },
    { path: "/admin/courses", icon: BookOpen, label: "Courses" },
    { path: "/admin/assignments", icon: ClipboardList, label: "Assignments" },
    { path: "/admin/periods", icon: Calendar, label: "Evaluation Periods" },
    { path: "/admin/questions", icon: HelpCircle, label: "Questions" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-slate-900 text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">TutorEval</h1>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2">
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`${isMobileMenuOpen ? 'flex' : 'hidden'} md:flex w-full md:w-64 bg-slate-900 text-slate-300 flex-col absolute md:relative z-40 min-h-screen md:min-h-0`}>
        <div className="p-6 hidden md:block">
          <h1 className="text-xl font-bold text-white">TutorEval</h1>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-4 md:mt-0">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive ? "bg-indigo-600 text-white" : "hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-3 w-full rounded-lg hover:bg-slate-800 hover:text-white transition-colors text-left"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden w-full">
        <header className="h-16 bg-white border-b border-slate-200 hidden md:flex items-center px-8">
          <h2 className="text-xl font-semibold text-slate-800">
            {navItems.find(i => i.path === location.pathname)?.label || "Admin Panel"}
          </h2>
        </header>
        <div className="flex-1 overflow-auto p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
