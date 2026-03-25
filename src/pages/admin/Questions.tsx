import { useState, useEffect } from "react";
import { Plus, Edit, Trash } from "lucide-react";

export default function Questions() {
  const [questions, setQuestions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ section: "General", question_text: "", question_type: "rating", is_required: true, order_index: 0 });

  const fetchQuestions = () => {
    fetch("/api/questions").then(res => res.json()).then(setQuestions);
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingId ? `/api/questions/${editingId}` : "/api/questions";
    const method = editingId ? "PUT" : "POST";
    
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    });
    
    setShowModal(false);
    setEditingId(null);
    setFormData({ section: "General", question_text: "", question_type: "rating", is_required: true, order_index: 0 });
    fetchQuestions();
  };

  const handleEdit = (q: any) => {
    setEditingId(q.id);
    setFormData({
      section: q.section,
      question_text: q.question_text,
      question_type: q.question_type,
      is_required: q.is_required === 1,
      order_index: q.order_index
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this question?")) return;
    await fetch(`/api/questions/${id}`, { method: "DELETE" });
    fetchQuestions();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-slate-800">Evaluation Questions</h2>
        <button 
          onClick={() => {
            setEditingId(null);
            setFormData({ section: "General", question_text: "", question_type: "rating", is_required: true, order_index: 0 });
            setShowModal(true);
          }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-indigo-700"
        >
          <Plus className="w-4 h-4" />
          <span>Add Question</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-sm font-medium text-slate-500">
                <th className="p-4">Order</th>
                <th className="p-4">Section</th>
                <th className="p-4">Question</th>
                <th className="p-4">Type</th>
                <th className="p-4">Required</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {questions.map((q: any) => (
                <tr key={q.id} className="hover:bg-slate-50">
                  <td className="p-4 text-slate-600">{q.order_index}</td>
                  <td className="p-4 text-slate-600">{q.section}</td>
                  <td className="p-4 font-medium text-slate-800">{q.question_text}</td>
                  <td className="p-4 text-slate-600">{q.question_type}</td>
                  <td className="p-4 text-slate-600">{q.is_required ? "Yes" : "No"}</td>
                  <td className="p-4 flex space-x-2">
                    <button onClick={() => handleEdit(q)} className="p-1 text-blue-600 hover:bg-blue-50 rounded"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(q.id)} className="p-1 text-red-600 hover:bg-red-50 rounded"><Trash className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
              {questions.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">No questions found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-semibold mb-4">{editingId ? "Edit Question" : "Add Question"}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Section</label>
                <input required type="text" value={formData.section} onChange={e => setFormData({...formData, section: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Question Text</label>
                <textarea required value={formData.question_text} onChange={e => setFormData({...formData, question_text: e.target.value})} className="w-full px-3 py-2 border rounded-lg" rows={3}></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Question Type</label>
                <select required value={formData.question_type} onChange={e => setFormData({...formData, question_type: e.target.value})} className="w-full px-3 py-2 border rounded-lg">
                  <option value="rating">Rating (1-5)</option>
                  <option value="yes_no">Yes / No</option>
                  <option value="short_text">Short Text</option>
                  <option value="long_text">Long Text</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Order Index</label>
                  <input required type="number" value={formData.order_index} onChange={e => setFormData({...formData, order_index: parseInt(e.target.value)})} className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div className="flex items-center mt-6">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" checked={formData.is_required} onChange={e => setFormData({...formData, is_required: e.target.checked})} className="w-4 h-4 text-indigo-600 rounded" />
                    <span className="text-sm font-medium text-slate-700">Is Required</span>
                  </label>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">{editingId ? "Update" : "Save"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
