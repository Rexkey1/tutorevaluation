import { Outlet, useNavigate } from "react-router-dom";
import { LogOut, GraduationCap } from "lucide-react";

export default function StudentLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
            <GraduationCap className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </div>
          <h1 className="text-lg md:text-xl font-bold text-slate-800">TutorEval</h1>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium hidden md:inline">Logout</span>
        </button>
      </header>
      
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-8">
        <Outlet />
      </main>
    </div>
  );
}
