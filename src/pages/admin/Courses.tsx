import { useState, useEffect } from "react";
import { Plus } from "lucide-react";

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: "", code: "", program_id: "", semester: "", level: "" });

  const fetchData = () => {
    fetch("/api/courses").then(res => res.json()).then(setCourses);
    fetch("/api/programs").then(res => res.json()).then(setPrograms);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    });
    setShowModal(false);
    setFormData({ name: "", code: "", program_id: "", semester: "", level: "" });
    fetchData();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-slate-800">Manage Courses</h2>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-indigo-700"
        >
          <Plus className="w-4 h-4" />
          <span>Add Course</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-sm font-medium text-slate-500">
                <th className="p-4">Course Name</th>
                <th className="p-4">Code</th>
                <th className="p-4">Program</th>
                <th className="p-4">Semester</th>
                <th className="p-4">Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {courses.map((course: any) => (
                <tr key={course.id} className="hover:bg-slate-50">
                  <td className="p-4 font-medium text-slate-800">{course.name}</td>
                  <td className="p-4 text-slate-600">{course.code}</td>
                  <td className="p-4 text-slate-600">{course.program_name}</td>
                  <td className="p-4 text-slate-600">{course.semester}</td>
                  <td className="p-4 text-slate-600">{course.level}</td>
                </tr>
              ))}
              {courses.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">No courses found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-semibold mb-4">Add New Course</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Course Name</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Course Code</label>
                <input required type="text" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Program</label>
                <select required value={formData.program_id} onChange={e => setFormData({...formData, program_id: e.target.value})} className="w-full px-3 py-2 border rounded-lg">
                  <option value="">Select a program</option>
                  {programs.map((p: any) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Semester</label>
                  <input required type="text" value={formData.semester} onChange={e => setFormData({...formData, semester: e.target.value})} className="w-full px-3 py-2 border rounded-lg" placeholder="e.g. Fall 2026" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Level</label>
                  <input required type="text" value={formData.level} onChange={e => setFormData({...formData, level: e.target.value})} className="w-full px-3 py-2 border rounded-lg" placeholder="e.g. Year 1" />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Save Course</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
