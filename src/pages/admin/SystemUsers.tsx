import { useState, useEffect } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import ConfirmModal from "../../components/ConfirmModal";

export default function SystemUsers() {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ id: null, name: "", email: "", password: "", role: "admin" });

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchUsers = () => {
    const token = localStorage.getItem("token");
    fetch("/api/users", {
      headers: { "Authorization": `Bearer ${token}` }
    }).then(res => res.json()).then(data => {
      if (Array.isArray(data)) setUsers(data);
    });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const isEdit = formData.id !== null;
    const url = isEdit ? `/api/users/${formData.id}` : "/api/users";
    const method = isEdit ? "PUT" : "POST";

    if (!isEdit && !formData.password) {
      setErrorMsg("Password is required for new users");
      return;
    }

    const token = localStorage.getItem("token");
    const res = await fetch(url, {
      method,
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(formData)
    });
    
    if (res.ok) {
      setShowModal(false);
      setFormData({ id: null, name: "", email: "", password: "", role: "admin" });
      fetchUsers();
    } else {
      const data = await res.json();
      setErrorMsg(data.error || "An error occurred");
    }
  };

  const handleEdit = (user: any) => {
    setFormData({
      id: user.id,
      name: user.name,
      email: user.email,
      password: "", // Don't populate password, leave blank unless changing
      role: user.role
    });
    setShowModal(true);
  };

  const confirmDelete = async () => {
    if (deleteId === null) return;
    const token = localStorage.getItem("token");
    const res = await fetch(`/api/users/${deleteId}`, { 
      method: "DELETE",
      headers: { "Authorization": `Bearer ${token}` }
    });
    if (res.ok) {
      fetchUsers();
      setDeleteId(null);
    } else {
      const data = await res.json();
      setErrorMsg(data.error || "An error occurred");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-slate-800">Manage System Users</h2>
        <button 
          onClick={() => {
            setFormData({ id: null, name: "", email: "", password: "", role: "admin" });
            setShowModal(true);
          }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-indigo-700"
        >
          <Plus className="w-4 h-4" />
          <span>Add User</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-sm font-medium text-slate-500">
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {users.map((user: any) => (
                <tr key={user.id} className="hover:bg-slate-50">
                  <td className="p-4 font-medium text-slate-800">{user.name}</td>
                  <td className="p-4 text-slate-600">{user.email}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.role === 'super_admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {user.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                    </span>
                  </td>
                  <td className="p-4 flex space-x-2">
                    <button onClick={() => handleEdit(user)} className="p-1 text-indigo-600 hover:bg-indigo-50 rounded">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => setDeleteId(user.id)} className="p-1 text-red-600 hover:bg-red-50 rounded">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-500">No system users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal
        isOpen={deleteId !== null}
        title="Confirm Delete"
        message="Are you sure you want to delete this system user? This action cannot be undone."
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
            <h3 className="text-lg font-semibold mb-4">{formData.id ? "Edit System User" : "Add New System User"}</h3>
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
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Password {formData.id && <span className="text-slate-400 font-normal">(Leave blank to keep current)</span>}
                </label>
                <input 
                  type="password" 
                  value={formData.password} 
                  onChange={e => setFormData({...formData, password: e.target.value})} 
                  className="w-full px-3 py-2 border rounded-lg" 
                  required={!formData.id}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                <select required value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full px-3 py-2 border rounded-lg">
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Save User</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
