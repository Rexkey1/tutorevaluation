import { useEffect, useState } from "react";
import { Users, BookOpen, GraduationCap, ClipboardList } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then(res => res.json())
      .then(data => setStats(data));
  }, []);

  if (!stats) return <div className="text-slate-500">Loading dashboard...</div>;

  const cards = [
    { title: "Total Tutors", value: stats.totalTutors, icon: Users, color: "bg-blue-500" },
    { title: "Total Students", value: stats.totalStudents, icon: Users, color: "bg-indigo-500" },
    { title: "Total Programs", value: stats.totalPrograms, icon: BookOpen, color: "bg-purple-500" },
    { title: "Total Classes", value: stats.totalClasses, icon: GraduationCap, color: "bg-pink-500" },
    { title: "Total Evaluations", value: stats.totalEvaluations, icon: ClipboardList, color: "bg-emerald-500" },
  ];

  // Mock data for the chart
  const chartData = [
    { name: "Punctuality", score: 4.5 },
    { name: "Communication", score: 4.2 },
    { name: "Effectiveness", score: 4.8 },
    { name: "Professionalism", score: 4.6 },
    { name: "Engagement", score: 4.1 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center space-x-4">
              <div className={`p-3 rounded-lg ${card.color} text-white`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">{card.title}</p>
                <h3 className="text-2xl font-bold text-slate-800">{card.value}</h3>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-6">Average Scores by Category</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} domain={[0, 5]} />
                <Tooltip 
                  cursor={{ fill: '#f1f5f9' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="score" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Active Evaluation Period</h3>
          {stats.activePeriod ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <p className="font-medium text-emerald-800">{stats.activePeriod.name}</p>
              <p className="text-sm text-emerald-600 mt-1">
                {new Date(stats.activePeriod.start_date).toLocaleDateString()} - {new Date(stats.activePeriod.end_date).toLocaleDateString()}
              </p>
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-slate-500">
              No active evaluation period currently.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
