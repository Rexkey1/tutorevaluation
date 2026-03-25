import { useState, useEffect } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";

export default function Tutors() {
  const [tutors, setTutors] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ id: null, name: "", email: "", staff_id: "", department: "", specialization: "" });

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchTutors = () => {
    fetch("/api/tutors").then(res => res.json()).then(setTutors);
  };

  useEffect(() => {
    fetchTutors();
  }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const isEdit = formData.id !== null;
    const url = isEdit ? `/api/tutors/${formData.id}` : "/api/tutors";
    const method = isEdit ? "PUT" : "POST";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    });
    setShowModal(false);
    setFormData({ id: null, name: "", email: "", staff_id: "", department: "", specialization: "" });
    fetchTutors();
  };

  const handleEdit = (tutor: any) => {
    setFormData({
      id: tutor.id,
      name: tutor.name,
      email: tutor.email,
      staff_id: tutor.staff_id,
      department: tutor.department || "",
      specialization: tutor.specialization || ""
    });
    setShowModal(true);
  };

  const confirmDelete = async () => {
    if (deleteId === null) return;
    try {
      const res = await fetch(`/api/tutors/${deleteId}`, { method: "DELETE" });
      if (res.ok) {
        fetchTutors();
        setDeleteId(null);
      } else {
        const data = await res.json();
        setErrorMsg(data.error || "Failed to delete tutor");
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-slate-800">Manage Tutors</h2>
        <button 
          onClick={() => {
            setFormData({ id: null, name: "", email: "", staff_id: "", department: "", specialization: "" });
            setShowModal(true);
          }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-indigo-700"
        >
          <Plus className="w-4 h-4" />
          <span>Add Tutor</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-sm font-medium text-slate-500">
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Staff ID</th>
                <th className="p-4">Department</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {tutors.map((tutor: any) => (
                <tr key={tutor.id} className="hover:bg-slate-50">
                  <td className="p-4 font-medium text-slate-800">{tutor.name}</td>
                  <td className="p-4 text-slate-600">{tutor.email}</td>
                  <td className="p-4 text-slate-600">{tutor.staff_id}</td>
                  <td className="p-4 text-slate-600">{tutor.department}</td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                      {tutor.status}
                    </span>
                  </td>
                  <td className="p-4 flex space-x-2">
                    <button onClick={() => handleEdit(tutor)} className="p-1 text-indigo-600 hover:bg-indigo-50 rounded">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => setDeleteId(tutor.id)} className="p-1 text-red-600 hover:bg-red-50 rounded">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {tutors.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">No tutors found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {deleteId !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-lg font-semibold mb-2">Confirm Delete</h3>
            <p className="text-slate-600 mb-6">Are you sure you want to delete this tutor? This action cannot be undone.</p>
            <div className="flex justify-end space-x-3">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
              <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}

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
            <h3 className="text-lg font-semibold mb-4">{formData.id ? "Edit Tutor" : "Add New Tutor"}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Staff ID</label>
                <input required type="text" value={formData.staff_id} onChange={e => setFormData({...formData, staff_id: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
                <input required type="text" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Save Tutor</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
