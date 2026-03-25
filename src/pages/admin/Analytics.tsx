import { useState, useEffect } from "react";
import { Download, Search, Trash2 } from "lucide-react";

export default function Analytics() {
  const [results, setResults] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isClearing, setIsClearing] = useState(false);

  const [showConfirm, setShowConfirm] = useState(false);
  const [message, setMessage] = useState<{type: string, text: string} | null>(null);

  const fetchResults = () => {
    fetch("/api/analytics/results")
      .then(res => res.json())
      .then(setResults);
  };

  useEffect(() => {
    fetchResults();
  }, []);

  const handleClearResults = async () => {
    setIsClearing(true);
    try {
      const res = await fetch("/api/analytics/results", {
        method: "DELETE"
      });
      
      if (res.ok) {
        setMessage({ type: "success", text: "All results have been cleared successfully." });
        fetchResults();
      } else {
        const data = await res.json();
        setMessage({ type: "error", text: data.error || "Failed to clear results" });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setIsClearing(false);
      setShowConfirm(false);
    }
  };

  const handleExport = () => {
    if (results.length === 0) return;

    // Get unique questions for headers
    const questionHeaders = new Set<string>();
    results.forEach(r => {
      r.answers.forEach((a: any) => questionHeaders.add(a.question));
    });
    const qHeadersArray = Array.from(questionHeaders);

    const headers = [
      "Submission Date",
      "Period",
      "Student Name",
      "Index Number",
      "Tutor",
      "Course",
      "Class",
      "Program",
      ...qHeadersArray
    ];

    const csvRows = [headers.join(",")];

    results.forEach(r => {
      const row = [
        new Date(r.submitted_at).toLocaleString(),
        `"${r.period_name}"`,
        r.is_anonymous ? "Anonymous" : `"${r.student_name}"`,
        r.is_anonymous ? "Anonymous" : `"${r.index_number}"`,
        `"${r.tutor_name}"`,
        `"${r.course_name}"`,
        `"${r.class_name}"`,
        `"${r.program_name}"`
      ];

      qHeadersArray.forEach(qh => {
        const answer = r.answers.find((a: any) => a.question === qh);
        row.push(answer ? `"${answer.answer.replace(/"/g, '""')}"` : "");
      });

      csvRows.push(row.join(","));
    });

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `evaluation_results_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredResults = results.filter(r => 
    r.tutor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.course_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (!r.is_anonymous && r.student_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (!r.is_anonymous && r.index_number.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-semibold text-slate-800">Analytics & Results</h2>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search tutor, course, student..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <button 
            onClick={handleExport}
            disabled={results.length === 0}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 hover:bg-indigo-700 disabled:opacity-50 w-full sm:w-auto"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          <button 
            onClick={() => setShowConfirm(true)}
            disabled={results.length === 0 || isClearing}
            className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 hover:bg-red-700 disabled:opacity-50 w-full sm:w-auto"
          >
            <Trash2 className="w-4 h-4" />
            <span>{isClearing ? "Clearing..." : "Clear Results"}</span>
          </button>
        </div>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-lg font-semibold mb-2">Confirm Clear</h3>
            <p className="text-slate-600 mb-6">Are you sure you want to delete ALL analytics and results? This action cannot be undone.</p>
            <div className="flex justify-end space-x-3">
              <button onClick={() => setShowConfirm(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
              <button onClick={handleClearResults} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Clear All</button>
            </div>
          </div>
        </div>
      )}

      {message && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl">
            <h3 className={`text-lg font-semibold mb-2 ${message.type === 'error' ? 'text-red-600' : 'text-emerald-600'}`}>
              {message.type === 'error' ? 'Error' : 'Success'}
            </h3>
            <p className="text-slate-600 mb-6">{message.text}</p>
            <div className="flex justify-end">
              <button onClick={() => setMessage(null)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200">Close</button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-sm font-medium text-slate-500">
                <th className="p-4">Date</th>
                <th className="p-4">Student</th>
                <th className="p-4">Tutor</th>
                <th className="p-4">Course</th>
                <th className="p-4">Class</th>
                <th className="p-4">Period</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredResults.map((r: any) => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="p-4 text-slate-600">{new Date(r.submitted_at).toLocaleDateString()}</td>
                  <td className="p-4 font-medium text-slate-800">
                    {r.is_anonymous ? (
                      <span className="text-slate-400 italic">Anonymous</span>
                    ) : (
                      <span>{r.student_name} <span className="text-xs text-slate-500 ml-1">({r.index_number})</span></span>
                    )}
                  </td>
                  <td className="p-4 text-slate-800">{r.tutor_name}</td>
                  <td className="p-4 text-slate-600">{r.course_name}</td>
                  <td className="p-4 text-slate-600">{r.class_name}</td>
                  <td className="p-4 text-slate-600">{r.period_name}</td>
                </tr>
              ))}
              {filteredResults.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">No evaluation results found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
