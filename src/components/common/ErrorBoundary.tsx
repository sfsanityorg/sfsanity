import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Error boundary component to catch and handle React errors gracefully
 * Provides a fallback UI when components fail to render
 */
export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  /**
   * Resets the error boundary state to retry rendering
   */
  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center">
            <div className="bg-background-secondary rounded-lg p-8 border border-graphite-300/30">
              <AlertTriangle size={48} className="mx-auto mb-4 text-red-500" />
              <h2 className="text-xl font-medium mb-2 text-text-primary">Something went wrong</h2>
              <p className="text-text-secondary mb-6">
                An unexpected error occurred. Please try refreshing the page or contact support if the problem persists.
              </p>
              <button
                onClick={this.handleRetry}
                className="flex items-center justify-center w-full px-4 py-2 bg-accent hover:bg-accent-muted text-white rounded-lg transition-colors"
              >
                <RefreshCw size={16} className="mr-2" />
                Try Again
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}