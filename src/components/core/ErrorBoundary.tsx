import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertOctagon, RefreshCw, Home } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  toolName?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[400px] w-full p-6 sm:p-10 rounded-3xl bg-neutral-900/30 border border-red-500/10 flex flex-col items-center justify-center text-center gap-6 backdrop-blur-md select-none">
          <div className="relative">
            <div className="absolute inset-0 bg-red-500/15 rounded-full blur-xl animate-pulse" />
            <div className="relative w-16 h-16 rounded-full bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400">
              <AlertOctagon className="w-8 h-8" />
            </div>
          </div>

          <div className="space-y-2 max-w-md">
            <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white uppercase font-display">
              {this.props.toolName || "Tool"} Runtime Interrupted
            </h3>
            <p className="text-xs sm:text-sm text-white/50 leading-relaxed">
              We detected a runtime error inside this specific modular container. The rest of the platform is fully safe and operational.
            </p>
            {this.state.error && (
              <div className="mt-4 p-3 rounded-xl bg-black border border-white/5 text-left overflow-x-auto">
                <code className="text-[10px] font-mono text-red-400/80 leading-normal whitespace-pre-wrap">
                  {this.state.error.toString()}
                </code>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-3 items-center justify-center">
            <button
              onClick={this.handleReset}
              className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 border border-white/5 hover:border-white/10 rounded-xl text-xs font-bold text-white transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Component</span>
            </button>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-xs font-bold text-white transition-all cursor-pointer"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Reset Platform</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
