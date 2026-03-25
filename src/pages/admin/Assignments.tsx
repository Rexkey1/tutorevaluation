import { useState, useEffect } from "react";
import { Plus } from "lucide-react";

export default function Assignments() {
  const [assignments, setAssignments] = useState([]);
  const [tutors, setTutors] = useState([]);
  const [courses, setCourses] = useState([]);
  const [classes, setClasses] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ tutor_id: "", course_id: "", class_id: "", program_id: "", academic_year: "", semester: "" });

  const fetchData = () => {
    fetch("/api/assignments").then(res => res.json()).then(setAssignments);
    fetch("/api/tutors").then(res => res.json()).then(setTutors);
    fetch("/api/courses").then(res => res.json()).then(setCourses);
    fetch("/api/classes").then(res => res.json()).then(setClasses);
    fetch("/api/programs").then(res => res.json()).then(setPrograms);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/assignments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    });
    setShowModal(false);
    setFormData({ tutor_id: "", course_id: "", class_id: "", program_id: "", academic_year: "", semester: "" });
    fetchData();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-slate-800">Tutor Assignments</h2>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-indigo-700"
        >
          <Plus className="w-4 h-4" />
          <span>Assign Tutor</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-sm font-medium text-slate-500">
                <th className="p-4">Tutor</th>
                <th className="p-4">Course</th>
                <th className="p-4">Class</th>
                <th className="p-4">Program</th>
                <th className="p-4">Academic Year</th>
                <th className="p-4">Semester</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {assignments.map((assignment: any) => (
                <tr key={assignment.id} className="hover:bg-slate-50">
                  <td className="p-4 font-medium text-slate-800">{assignment.tutor_name}</td>
                  <td className="p-4 text-slate-600">{assignment.course_name}</td>
                  <td className="p-4 text-slate-600">{assignment.class_name}</td>
                  <td className="p-4 text-slate-600">{assignment.program_name}</td>
                  <td className="p-4 text-slate-600">{assignment.academic_year}</td>
                  <td className="p-4 text-slate-600">{assignment.semester}</td>
                </tr>
              ))}
              {assignments.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">No assignments found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-semibold mb-4">New Assignment</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tutor</label>
                <select required value={formData.tutor_id} onChange={e => setFormData({...formData, tutor_id: e.target.value})} className="w-full px-3 py-2 border rounded-lg">
                  <option value="">Select a tutor</option>
                  {tutors.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Course</label>
                <select required value={formData.course_id} onChange={e => setFormData({...formData, course_id: e.target.value})} className="w-full px-3 py-2 border rounded-lg">
                  <option value="">Select a course</option>
                  {courses.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Class</label>
                <select required value={formData.class_id} onChange={e => setFormData({...formData, class_id: e.target.value})} className="w-full px-3 py-2 border rounded-lg">
                  <option value="">Select a class</option>
                  {classes.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Program</label>
                <select required value={formData.program_id} onChange={e => setFormData({...formData, program_id: e.target.value})} className="w-full px-3 py-2 border rounded-lg">
                  <option value="">Select a program</option>
                  {programs.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Academic Year</label>
                  <input required type="text" value={formData.academic_year} onChange={e => setFormData({...formData, academic_year: e.target.value})} className="w-full px-3 py-2 border rounded-lg" placeholder="2026/2027" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Semester</label>
                  <input required type="text" value={formData.semester} onChange={e => setFormData({...formData, semester: e.target.value})} className="w-full px-3 py-2 border rounded-lg" placeholder="1" />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Assign</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
