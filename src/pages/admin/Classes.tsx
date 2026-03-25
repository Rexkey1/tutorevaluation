import { useState, useEffect } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import ConfirmModal from "../../components/ConfirmModal";

export default function Classes() {
  const [classes, setClasses] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ id: null, name: "", program_id: "" });
  
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchData = () => {
    fetch("/api/classes").then(res => res.json()).then(setClasses);
    fetch("/api/programs").then(res => res.json()).then(setPrograms);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const isEdit = formData.id !== null;
    const url = isEdit ? `/api/classes/${formData.id}` : "/api/classes";
    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    });

    if (res.ok) {
      setShowModal(false);
      setFormData({ id: null, name: "", program_id: "" });
      fetchData();
    } else {
      const data = await res.json();
      setErrorMsg(data.error || "An error occurred");
    }
  };

  const handleEdit = (cls: any) => {
    setFormData({ id: cls.id, name: cls.name, program_id: cls.program_id || "" });
    setShowModal(true);
  };

  const confirmDelete = async () => {
    if (deleteId === null) return;
    try {
      const res = await fetch(`/api/classes/${deleteId}`, { method: "DELETE" });
      if (res.ok) {
        fetchData();
        setDeleteId(null);
      } else {
        const data = await res.json();
        setErrorMsg(data.error || "Failed to delete class");
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-slate-800">Manage Classes</h2>
        <button 
          onClick={() => {
            setFormData({ id: null, name: "", program_id: "" });
            setShowModal(true);
          }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-indigo-700"
        >
          <Plus className="w-4 h-4" />
          <span>Add Class</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-sm font-medium text-slate-500">
                <th className="p-4">Class Name</th>
                <th className="p-4">Program</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {classes.map((cls: any) => (
                <tr key={cls.id} className="hover:bg-slate-50">
                  <td className="p-4 font-medium text-slate-800">{cls.name}</td>
                  <td className="p-4 text-slate-600">{cls.program_name}</td>
                  <td className="p-4 flex space-x-2">
                    <button onClick={() => handleEdit(cls)} className="p-1 text-indigo-600 hover:bg-indigo-50 rounded">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => setDeleteId(cls.id)} className="p-1 text-red-600 hover:bg-red-50 rounded">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {classes.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-slate-500">No classes found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal
        isOpen={deleteId !== null}
        title="Confirm Delete"
        message="Are you sure you want to delete this class? This action cannot be undone."
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
            <h3 className="text-lg font-semibold mb-4">{formData.id ? "Edit Class" : "Add New Class"}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Class Name</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
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
              <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Save Class</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
