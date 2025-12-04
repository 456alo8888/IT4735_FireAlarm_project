import { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error to console in development
    console.error('Error caught by boundary:', error, errorInfo);
    
    // In production, you might want to log to an error reporting service
    // logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="max-w-md w-full mx-auto p-6">
            <div className="rounded-lg border border-red-200 dark:border-red-800 bg-white dark:bg-gray-800 p-6 text-center">
              <div className="flex justify-center mb-4">
                <span className="material-symbols-outlined text-4xl text-red-500" aria-hidden="true">
                  error
                </span>
              </div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Something went wrong
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {this.state.error?.message || 'An unexpected error occurred'}
              </p>
              <details className="text-left mb-4">
                <summary className="cursor-pointer text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
                  Error details
                </summary>
                <pre className="mt-2 p-3 bg-gray-100 dark:bg-gray-700 rounded text-xs overflow-auto text-gray-800 dark:text-gray-200">
                  <code>
                    {this.state.error && this.state.error.stack}
                  </code>
                </pre>
              </details>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={this.handleReset}
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                  Try again
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Reload page
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;