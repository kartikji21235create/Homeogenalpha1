"use client";

import React, { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[ErrorBoundary]", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[40vh] flex items-center justify-center px-4">
          <div className="bg-surface rounded-xl border border-danger/40 p-8 max-w-md text-center space-y-4">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-danger/20 text-danger text-2xl">
              ⚠
            </div>
            <h2 className="font-display text-xl font-bold text-text-primary">
              Something Went Wrong
            </h2>
            <p className="text-sm text-text-secondary">
              An unexpected error occurred in the clinical workflow. Your data is safe.
            </p>
            {this.state.error && (
              <pre className="text-xs text-danger/80 bg-danger/5 rounded-md p-3 overflow-auto max-h-32 text-left">
                {this.state.error.message}
              </pre>
            )}
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="rounded-lg bg-accent px-5 py-2 text-sm font-semibold text-bg hover:bg-accent-strong transition"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
