import React, { useState } from "react";
import { X, Sparkles, AlertCircle, ArrowRight, Lightbulb, CheckCircle2 } from "lucide-react";

interface GetUnstuckModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeContext?: string;
}

export const GetUnstuckModal: React.FC<GetUnstuckModalProps> = ({ isOpen, onClose, activeContext = "" }) => {
  const [problemText, setProblemText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [solution, setSolution] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleResolve = async () => {
    if (!problemText.trim() || isLoading) return;
    setIsLoading(true);
    setSolution(null);

    try {
      const res = await fetch("/api/support/unstick", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemText: problemText.trim(),
          context: activeContext,
        }),
      });

      const data = await res.json();
      setSolution(data.solution || "We have analyzed your roadblock.");
    } catch (err) {
      console.error("Unstick error", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-rose-50/70 to-orange-50/70">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-500 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-slate-900">
                Instant "Get Unstuck" Diagnostic
              </h2>
              <p className="text-[11px] text-slate-500">
                Paste any error message, confusing formula, or conceptual roadblock.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">
              What specific problem or roadblock are you facing?
            </label>
            <textarea
              rows={4}
              value={problemText}
              onChange={(e) => setProblemText(e.target.value)}
              placeholder="e.g. 'I don't understand why softmax gradient vanishes when dot products grow large' or paste a stack trace / code snippet..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none font-['Plus_Jakarta_Sans',sans-serif]"
            />
          </div>

          <button
            id="btn-diagnose-unstuck"
            disabled={!problemText.trim() || isLoading}
            onClick={handleResolve}
            className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer ${
              problemText.trim() && !isLoading
                ? "bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-200"
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            }`}
          >
            {isLoading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Diagnosing with Socratic AI...</span>
              </>
            ) : (
              <>
                <Lightbulb className="w-4 h-4" />
                <span>Diagnose & Break Down</span>
              </>
            )}
          </button>

          {/* Solution Output */}
          {solution && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed space-y-3">
              <div className="flex items-center space-x-1.5 text-rose-700 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>AI Cognitive Diagnosis</span>
              </div>
              <div className="whitespace-pre-wrap font-['Plus_Jakarta_Sans',sans-serif]">
                {solution}
              </div>
            </div>
          )}
        </div>

        <div className="p-3 bg-slate-50 border-t border-slate-100 text-right">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
