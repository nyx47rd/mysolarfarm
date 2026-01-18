import React, { ErrorInfo, ReactNode } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// Error Boundary to catch runtime errors and prevent white screen of death
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  handleReset = () => {
    // Clear local storage and reload if the state is corrupted
    if (confirm("This will reset your game data to fix the error. Continue?")) {
        localStorage.clear();
        window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-slate-900 text-white p-4 text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Something went wrong.</h1>
          <p className="text-slate-400 mb-6 max-w-md">
            The solar array encountered a critical system failure.
            <br />
            <span className="text-xs font-mono text-slate-600 mt-2 block p-2 bg-slate-800 rounded">
                {this.state.error?.message}
            </span>
          </p>
          <div className="flex gap-4">
            <button 
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-slate-700 rounded hover:bg-slate-600 transition-colors"
            >
                Reload Page
            </button>
            <button 
                onClick={this.handleReset}
                className="px-4 py-2 bg-red-600 rounded hover:bg-red-500 transition-colors"
            >
                Reset Game Data
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
        <App />
    </ErrorBoundary>
  </React.StrictMode>
);