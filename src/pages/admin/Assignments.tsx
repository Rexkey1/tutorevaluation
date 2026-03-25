import { useState, useEffect } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import ConfirmModal from "../../components/ConfirmModal";

export default function Assignments() {
  const [assignments, setAssignments] = useState([]);
  const [tutors, setTutors] = useState([]);
  const [courses, setCourses] = useState([]);
  const [classes, setClasses] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ id: null, tutor_id: "", course_id: "", class_id: "", program_id: "", academic_year: "", semester: "" });

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const isEdit = formData.id !== null;
    const url = isEdit ? `/api/assignments/${formData.id}` : "/api/assignments";
    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    });

    if (res.ok) {
      setShowModal(false);
      setFormData({ id: null, tutor_id: "", course_id: "", class_id: "", program_id: "", academic_year: "", semester: "" });
      fetchData();
    } else {
      const data = await res.json();
      setErrorMsg(data.error || "An error occurred");
    }
  };

  const handleEdit = (assignment: any) => {
    setFormData({ 
      id: assignment.id, 
      tutor_id: assignment.tutor_id || "", 
      course_id: assignment.course_id || "", 
      class_id: assignment.class_id || "", 
      program_id: assignment.program_id || "", 
      academic_year: assignment.academic_year || "", 
      semester: assignment.semester || "" 
    });
    setShowModal(true);
  };

  const confirmDelete = async () => {
    if (deleteId === null) return;
    try {
      const res = await fetch(`/api/assignments/${deleteId}`, { method: "DELETE" });
      if (res.ok) {
        fetchData();
        setDeleteId(null);
      } else {
        const data = await res.json();
        setErrorMsg(data.error || "Failed to delete assignment");
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-slate-800">Tutor Assignments</h2>
        <button 
          onClick={() => {
            setFormData({ id: null, tutor_id: "", course_id: "", class_id: "", program_id: "", academic_year: "", semester: "" });
            setShowModal(true);
          }}
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
                <th className="p-4">Actions</th>
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
                  <td className="p-4 flex space-x-2">
                    <button onClick={() => handleEdit(assignment)} className="p-1 text-indigo-600 hover:bg-indigo-50 rounded">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => setDeleteId(assignment.id)} className="p-1 text-red-600 hover:bg-red-50 rounded">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {assignments.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">No assignments found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal
        isOpen={deleteId !== null}
        title="Confirm Delete"
        message="Are you sure you want to delete this assignment? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />

      {errorMsg && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-lg font-semibold text-red-600 mb-2">Error</h3>
            <p className="text-slate-600 mb-6">{errorMsg}</p>
            <div className="flex justify-end">
              <button onClick={() => setErrorMsg(null)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200">Close</button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-semibold mb-4">{formData.id ? "Edit Assignment" : "New Assignment"}</h3>
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
