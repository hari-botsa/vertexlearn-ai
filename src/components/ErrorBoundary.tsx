import React, { ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught application error in view:", error, errorInfo);
  }

  private handleReload = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    } else {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[500px] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-2xl border border-rose-200 shadow-xl p-6 text-center space-y-4 animate-in fade-in duration-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-slate-900 font-['Outfit',sans-serif]">
                {this.props.fallbackTitle || "Dashboard Display Notice"}
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                The application encountered an unexpected view state. Click below to refresh your dashboard session smoothly.
              </p>
            </div>
            {this.state.error && (
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] font-mono text-slate-600 text-left overflow-x-auto max-h-24">
                {this.state.error.message}
              </div>
            )}
            <div className="flex items-center justify-center space-x-2 pt-2">
              <button
                onClick={this.handleReload}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors flex items-center space-x-1.5 shadow-sm cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reload View</span>
              </button>
              <button
                onClick={() => {
                  try {
                    localStorage.removeItem("alms_auth_session");
                  } catch {}
                  window.location.reload();
                }}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors flex items-center space-x-1.5 cursor-pointer"
              >
                <Home className="w-3.5 h-3.5 text-slate-500" />
                <span>Reset to Landing</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
