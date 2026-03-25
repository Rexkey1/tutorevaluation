import { useState, useEffect } from "react";
import { Plus, Power, Archive, CheckCircle } from "lucide-react";
import ConfirmModal from "../../components/ConfirmModal";

export default function Periods() {
  const [periods, setPeriods] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: "", academic_year: "", semester: "", start_date: "", end_date: "", status: "draft" });

  const [confirmAction, setConfirmAction] = useState<{ id: number, newStatus: string, message: string } | null>(null);

  const fetchPeriods = () => {
    fetch("/api/evaluations/periods").then(res => res.json()).then(setPeriods);
  };

  useEffect(() => {
    fetchPeriods();
  }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    await fetch("/api/evaluations/periods", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    });
    setShowModal(false);
    setFormData({ name: "", academic_year: "", semester: "", start_date: "", end_date: "", status: "draft" });
    fetchPeriods();
  };

  const handleStatusChangeClick = (id: number, newStatus: string) => {
    if (newStatus === 'active') {
      setConfirmAction({ id, newStatus, message: "Activating this period will make any currently active period inactive. Continue?" });
    } else if (newStatus === 'archived') {
      setConfirmAction({ id, newStatus, message: "Are you sure you want to archive this period? Students will no longer be able to submit evaluations." });
    } else {
      executeStatusChange(id, newStatus);
    }
  };

  const executeStatusChange = async (id: number, newStatus: string) => {
    await fetch(`/api/evaluations/periods/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus })
    });
    fetchPeriods();
    setConfirmAction(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-slate-800">Evaluation Periods</h2>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-indigo-700"
        >
          <Plus className="w-4 h-4" />
          <span>New Period</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-sm font-medium text-slate-500">
                <th className="p-4">Name</th>
                <th className="p-4">Academic Year</th>
                <th className="p-4">Semester</th>
                <th className="p-4">Start Date</th>
                <th className="p-4">End Date</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {periods.map((period: any) => (
                <tr key={period.id} className="hover:bg-slate-50">
                  <td className="p-4 font-medium text-slate-800">{period.name}</td>
                  <td className="p-4 text-slate-600">{period.academic_year}</td>
                  <td className="p-4 text-slate-600">{period.semester}</td>
                  <td className="p-4 text-slate-600">{new Date(period.start_date).toLocaleDateString()}</td>
                  <td className="p-4 text-slate-600">{new Date(period.end_date).toLocaleDateString()}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      period.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                      period.status === 'draft' ? 'bg-slate-100 text-slate-700' :
                      period.status === 'archived' ? 'bg-amber-100 text-amber-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {period.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4 flex space-x-2">
                    {period.status !== 'active' && (
                      <button 
                        onClick={() => handleStatusChangeClick(period.id, 'active')} 
                        className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                        title="Make Active"
                      >
                        <Power className="w-4 h-4" />
                      </button>
                    )}
                    {period.status === 'active' && (
                      <button 
                        onClick={() => handleStatusChangeClick(period.id, 'inactive')} 
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                        title="Make Inactive"
                      >
                        <Power className="w-4 h-4" />
                      </button>
                    )}
                    {period.status !== 'archived' && (
                      <button 
                        onClick={() => handleStatusChangeClick(period.id, 'archived')} 
                        className="p-1 text-amber-600 hover:bg-amber-50 rounded"
                        title="Archive"
                      >
                        <Archive className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {periods.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">No evaluation periods found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmAction !== null}
        title="Confirm Action"
        message={confirmAction?.message || ""}
        onConfirm={() => confirmAction && executeStatusChange(confirmAction.id, confirmAction.newStatus)}
        onCancel={() => setConfirmAction(null)}
      />

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-semibold mb-4">Create Evaluation Period</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border rounded-lg" placeholder="e.g. Fall 2026 Mid-Term" />
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                  <input required type="date" value={formData.start_date} onChange={e => setFormData({...formData, start_date: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
                  <input required type="date" value={formData.end_date} onChange={e => setFormData({...formData, end_date: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <select required value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full px-3 py-2 border rounded-lg">
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                {formData.status === 'active' && (
                  <p className="text-xs text-amber-600 mt-1">Setting this to Active will make any currently active period inactive.</p>
                )}
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Create Period</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
