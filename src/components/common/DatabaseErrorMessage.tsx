import React from 'react';
import { AlertCircle, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { APP_CONFIG } from '../../config/app';

interface DatabaseErrorMessageProps {
  /** Error message to display */
  error: string;
  /** Callback function to retry the operation */
  onRetry?: () => void;
  /** Whether a retry operation is in progress */
  isRetrying?: boolean;
  /** Additional context or suggestions for the user */
  context?: string;
}

/**
 * Reusable component for displaying database connection errors
 * Provides user-friendly error messages and retry functionality
 */
export const DatabaseErrorMessage: React.FC<DatabaseErrorMessageProps> = ({
  error,
  onRetry,
  isRetrying = false,
  context
}) => {
  /**
   * Determines if the error is likely a connection issue
   */
  const isConnectionError = error.toLowerCase().includes('network') || 
                           error.toLowerCase().includes('connection') ||
                           error.toLowerCase().includes('fetch') ||
                           error.toLowerCase().includes('timeout');

  /**
   * Gets appropriate icon based on error type
   */
  const getErrorIcon = () => {
    if (isConnectionError) {
      return <WifiOff size={24} className="text-red-500" />;
    }
    return <AlertCircle size={24} className="text-red-500" />;
  };

  /**
   * Gets user-friendly error message
   */
  const getUserFriendlyMessage = () => {
    if (error.toLowerCase().includes('over_request_rate_limit') || error.toLowerCase().includes('rate limit')) {
      return "We're receiving high traffic right now. Please wait a moment before trying again.";
    }
    if (isConnectionError) {
      return "Unable to connect to the database. Please check your internet connection.";
    }
    if (error.toLowerCase().includes('unauthorized')) {
      return "Authentication failed. Please refresh the page and try again.";
    }
    if (error.toLowerCase().includes('not found')) {
      return "The requested data could not be found.";
    }
    return "We're experiencing technical difficulties. Please try again in a moment.";
  };

  /**
   * Gets suggested wait time for rate limit errors
   */
  const getRateLimitWaitTime = () => {
    if (error.toLowerCase().includes('over_request_rate_limit') || error.toLowerCase().includes('rate limit')) {
      return APP_CONFIG.RATE_LIMIT_WAIT_TIME;
    }
    return APP_CONFIG.GENERAL_ERROR_WAIT_TIME;
  };

  return (
    <div className="bg-background-secondary rounded-lg p-6 border border-red-500/20">
      <div className="flex items-start space-x-3">
        {getErrorIcon()}
        <div className="flex-1">
          <h3 className="text-lg font-medium text-text-primary mb-2">
            Database Connection Error
          </h3>
          <p className="text-text-secondary mb-3">
            {getUserFriendlyMessage()}
          </p>
          
          {context && (
            <p className="text-text-tertiary text-sm mb-4">
              {context}
            </p>
          )}

          {(error.toLowerCase().includes('over_request_rate_limit') || error.toLowerCase().includes('rate limit')) && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 mb-4">
              <p className="text-yellow-200 text-sm">
                💡 <strong>Tip:</strong> This happens when there are too many requests in a short time. 
                The system will automatically recover in about {getRateLimitWaitTime()} seconds.
              </p>
            </div>
          )}

          {APP_CONFIG.SHOW_TECHNICAL_ERROR_DETAILS && (
            <details className="mb-4">
              <summary className="text-text-tertiary text-sm cursor-pointer hover:text-text-secondary">
                Technical Details
              </summary>
              <p className="text-text-tertiary text-xs mt-2 font-mono bg-graphite-400/30 p-2 rounded">
                {error.length > APP_CONFIG.MAX_ERROR_MESSAGE_LENGTH 
                  ? `${error.substring(0, APP_CONFIG.MAX_ERROR_MESSAGE_LENGTH)}...` 
                  : error}
              </p>
            </details>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            {onRetry && (
              <button
                onClick={onRetry}
                disabled={isRetrying}
                className="flex items-center justify-center px-4 py-2 bg-accent hover:bg-accent-muted disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                <RefreshCw size={16} className={`mr-2 ${isRetrying ? 'animate-spin' : ''}`} />
                {isRetrying ? 'Retrying...' : 'Try Again'}
              </button>
            )}
            
            <button
              onClick={() => window.location.reload()}
              className="flex items-center justify-center px-4 py-2 bg-graphite-300 hover:bg-graphite-200 text-white rounded-lg transition-colors"
            >
              <Wifi size={16} className="mr-2" />
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};