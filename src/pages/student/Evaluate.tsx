import { useState, useEffect } from "react";
import { CheckCircle } from "lucide-react";

export default function Evaluate() {
  const [assignments, setAssignments] = useState([]);
  const [activePeriod, setActivePeriod] = useState<any>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  
  // Form state
  const [ratings, setRatings] = useState<Record<string, any>>({});
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    
    fetch("/api/evaluations/active-period")
      .then(res => res.json())
      .then(setActivePeriod);
      
    if (user.id) {
      fetch(`/api/evaluations/my-assignments/${user.id}`)
        .then(res => res.json())
        .then(setAssignments);
    }

    fetch("/api/questions")
      .then(res => res.json())
      .then(setQuestions);
  }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    
    // Format answers
    const answers = Object.entries(ratings).map(([qId, val]) => ({
      question_id: qId,
      answer_value: val.toString()
    }));

    try {
      const res = await fetch("/api/evaluations/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: user.id,
          tutor_assignment_id: selectedAssignment.id,
          evaluation_period_id: activePeriod.id,
          form_id: 1, // Default form
          is_anonymous: isAnonymous,
          answers
        })
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit");
      }
      
      setIsSubmitted(true);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to submit evaluation. You may have already evaluated this tutor.");
    }
  };

  if (!activePeriod) {
    return (
      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">No Active Evaluation Period</h2>
        <p className="text-slate-600">There are currently no active evaluation periods. Please check back later.</p>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="bg-white p-12 rounded-xl shadow-sm border border-slate-200 text-center">
        <div className="flex justify-center mb-6">
          <CheckCircle className="w-16 h-16 text-emerald-500" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Evaluation Submitted!</h2>
        <p className="text-slate-600 mb-8">Thank you for your feedback. Your response has been recorded successfully.</p>
        <button 
          onClick={() => {
            setIsSubmitted(false);
            setSelectedAssignment(null);
            setRatings({});
            // Refresh assignments to remove the evaluated one
            const user = JSON.parse(localStorage.getItem("user") || "{}");
            if (user.id) {
              fetch(`/api/evaluations/my-assignments/${user.id}`)
                .then(res => res.json())
                .then(setAssignments);
            }
          }}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
        >
          Evaluate Another Tutor
        </button>
      </div>
    );
  }

  if (!selectedAssignment) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Select a Tutor to Evaluate</h2>
          <p className="text-slate-600 mt-1">Evaluation Period: {activePeriod.name}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assignments.map((assignment: any) => (
            <div 
              key={assignment.id} 
              onClick={() => setSelectedAssignment(assignment)}
              className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 cursor-pointer hover:border-indigo-500 hover:shadow-md transition-all"
            >
              <h3 className="text-lg font-bold text-slate-800 mb-1">{assignment.tutor_name}</h3>
              <div className="space-y-1 text-sm text-slate-600">
                <p><span className="font-medium">Course:</span> {assignment.course_name}</p>
                <p><span className="font-medium">Class:</span> {assignment.class_name}</p>
                <p><span className="font-medium">Program:</span> {assignment.program_name}</p>
              </div>
            </div>
          ))}
          {assignments.length === 0 && (
            <div className="col-span-full p-8 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
              No tutors assigned to you at the moment or you have completed all evaluations.
            </div>
          )}
        </div>

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
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="bg-slate-50 p-6 border-b border-slate-200">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Tutor Evaluation Form</h2>
            <p className="text-slate-600 mt-1">Evaluating: <span className="font-semibold text-slate-800">{selectedAssignment.tutor_name}</span></p>
            <p className="text-sm text-slate-500 mt-1">{selectedAssignment.course_name} • {selectedAssignment.class_name}</p>
          </div>
          <button 
            onClick={() => setSelectedAssignment(null)}
            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
          >
            Change Tutor
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-8">
        <div className="space-y-6">
          {questions.length === 0 ? (
            <p className="text-slate-500 italic">No evaluation questions have been set up yet.</p>
          ) : (
            questions.map((q, index) => (
              <div key={q.id} className="space-y-3">
                <label className="block font-medium text-slate-800">
                  {index + 1}. {q.question_text} {q.is_required === 1 && <span className="text-red-500">*</span>}
                </label>
                
                {q.question_type === 'rating' && (
                  <div className="flex space-x-4">
                    {[1, 2, 3, 4, 5].map(num => (
                      <label key={num} className="flex flex-col items-center space-y-1 cursor-pointer">
                        <input 
                          type="radio" 
                          name={`q_${q.id}`} 
                          value={num}
                          required={q.is_required === 1}
                          checked={ratings[q.id] === num}
                          onChange={() => setRatings({...ratings, [q.id]: num})}
                          className="w-5 h-5 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-sm text-slate-600">{num}</span>
                      </label>
                    ))}
                  </div>
                )}

                {q.question_type === 'yes_no' && (
                  <div className="flex space-x-4">
                    {['Yes', 'No'].map(opt => (
                      <label key={opt} className="flex items-center space-x-2 cursor-pointer">
                        <input 
                          type="radio" 
                          name={`q_${q.id}`} 
                          value={opt}
                          required={q.is_required === 1}
                          checked={ratings[q.id] === opt}
                          onChange={() => setRatings({...ratings, [q.id]: opt})}
                          className="w-5 h-5 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-sm text-slate-600">{opt}</span>
                      </label>
                    ))}
                  </div>
                )}

                {q.question_type === 'short_text' && (
                  <input 
                    type="text"
                    required={q.is_required === 1}
                    value={ratings[q.id] || ''}
                    onChange={e => setRatings({...ratings, [q.id]: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  />
                )}

                {q.question_type === 'long_text' && (
                  <textarea 
                    rows={4}
                    required={q.is_required === 1}
                    value={ratings[q.id] || ''}
                    onChange={e => setRatings({...ratings, [q.id]: e.target.value})}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
                  ></textarea>
                )}
              </div>
            ))
          )}
        </div>

        <div className="pt-4 border-t border-slate-200">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input 
              type="checkbox" 
              checked={isAnonymous}
              onChange={e => setIsAnonymous(e.target.checked)}
              className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
            />
            <span className="text-slate-700 font-medium">Submit anonymously</span>
          </label>
          <p className="text-sm text-slate-500 mt-1 ml-8">Your identity will be hidden from the tutor and administrators.</p>
        </div>

        <div className="pt-6 flex justify-end">
          <button 
            type="submit"
            disabled={questions.length === 0}
            className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Submit Evaluation
          </button>
        </div>
      </form>

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
    </div>
  );
}
