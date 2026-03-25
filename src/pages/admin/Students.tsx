import { useState, useEffect } from "react";
import { Plus, Upload, Edit, Trash2 } from "lucide-react";
import ConfirmModal from "../../components/ConfirmModal";

export default function Students() {
  const [students, setStudents] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [classes, setClasses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [formData, setFormData] = useState({ id: null, name: "", index_number: "", program_id: "", class_id: "" });
  const [uploadError, setUploadError] = useState("");

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchData = () => {
    fetch("/api/students").then(res => res.json()).then(setStudents);
    fetch("/api/programs").then(res => res.json()).then(setPrograms);
    fetch("/api/classes").then(res => res.json()).then(setClasses);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const isEdit = formData.id !== null;
    const url = isEdit ? `/api/students/${formData.id}` : "/api/students";
    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    });
    
    if (res.ok) {
      setShowModal(false);
      setFormData({ id: null, name: "", index_number: "", program_id: "", class_id: "" });
      fetchData();
    } else {
      const data = await res.json();
      setErrorMsg(data.error || "An error occurred");
    }
  };

  const handleEdit = (student: any) => {
    setFormData({
      id: student.id,
      name: student.name,
      index_number: student.student_id,
      program_id: student.program_id || "",
      class_id: student.class_id || ""
    });
    setShowModal(true);
  };

  const confirmDelete = async () => {
    if (deleteId === null) return;
    try {
      const res = await fetch(`/api/students/${deleteId}`, { method: "DELETE" });
      if (res.ok) {
        fetchData();
        setDeleteId(null);
      } else {
        const data = await res.json();
        setErrorMsg(data.error || "Failed to delete student");
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const handleFileUpload = (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploadError("");
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const rows = text.split('\n').map(row => row.split(','));
        // Skip header row
        const studentsList = rows.slice(1).filter(r => r.length >= 3).map(r => ({
          name: r[0]?.trim(),
          index_number: r[1]?.trim(),
          program_code: r[2]?.trim(),
          class_name: r[3]?.trim() || ""
        }));

        if (studentsList.length === 0) {
          setUploadError("No valid data found in CSV. Ensure columns are: Full Name, Index Number, Program Code, Class Name (Optional)");
          return;
        }

        const res = await fetch("/api/students/bulk", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ students: studentsList })
        });
        
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to upload");
        }
        
        setShowUploadModal(false);
        fetchData();
      } catch (err: any) {
        setUploadError(err.message);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-slate-800">Manage Students</h2>
        <div className="flex space-x-3">
          <button 
            onClick={() => setShowUploadModal(true)}
            className="bg-white text-slate-700 border border-slate-300 px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-slate-50"
          >
            <Upload className="w-4 h-4" />
            <span>Bulk Upload</span>
          </button>
          <button 
            onClick={() => {
              setFormData({ id: null, name: "", index_number: "", program_id: "", class_id: "" });
              setShowModal(true);
            }}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4" />
            <span>Add Student</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-sm font-medium text-slate-500">
                <th className="p-4">Name</th>
                <th className="p-4">Index Number</th>
                <th className="p-4">Program</th>
                <th className="p-4">Class</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {students.map((student: any) => (
                <tr key={student.id} className="hover:bg-slate-50">
                  <td className="p-4 font-medium text-slate-800">{student.name}</td>
                  <td className="p-4 text-slate-600">{student.student_id}</td>
                  <td className="p-4 text-slate-600">{student.program_name}</td>
                  <td className="p-4 text-slate-600">{student.class_name || "-"}</td>
                  <td className="p-4 flex space-x-2">
                    <button onClick={() => handleEdit(student)} className="p-1 text-indigo-600 hover:bg-indigo-50 rounded">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => setDeleteId(student.id)} className="p-1 text-red-600 hover:bg-red-50 rounded">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {students.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">No students found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal
        isOpen={deleteId !== null}
        title="Confirm Delete"
        message="Are you sure you want to delete this student? This action cannot be undone."
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
            <h3 className="text-lg font-semibold mb-4">{formData.id ? "Edit Student" : "Add New Student"}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Index Number</label>
                <input required type="text" value={formData.index_number} onChange={e => setFormData({...formData, index_number: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
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
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Class (Optional)</label>
                <select value={formData.class_id} onChange={e => setFormData({...formData, class_id: e.target.value})} className="w-full px-3 py-2 border rounded-lg">
                  <option value="">Select a class</option>
                  {classes.filter((c: any) => !formData.program_id || c.program_id == formData.program_id).map((c: any) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Save Student</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-semibold mb-4">Bulk Upload Students</h3>
            <div className="space-y-4">
              <p className="text-sm text-slate-600">
                Upload a CSV file with the following columns:
                <br />
                <strong>Full Name, Index Number, Program Code, Class Name (Optional)</strong>
              </p>
              {uploadError && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{uploadError}</div>}
              <input 
                type="file" 
                accept=".csv" 
                onChange={handleFileUpload}
                className="w-full px-3 py-2 border rounded-lg" 
              />
              <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={() => setShowUploadModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
