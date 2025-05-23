import React from 'react';
import { Button } from './button';
import { Card } from './card';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Log application errors
    console.error('Error Boundary caught an error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      retryCount: this.state.retryCount
    });
  }

  isDatabaseError = (error) => {
    const databaseErrorTypes = [
      'DatabaseError',
      'NetworkError',
      'IndexedDBError'
    ];
    
    return error && (
      databaseErrorTypes.some(type => error.name?.includes(type)) ||
      error.message?.includes('database') ||
      error.message?.includes('indexeddb') ||
      error.message?.includes('dexie')
    );
  };

  getErrorMessage = () => {
    const { error } = this.state;
    
    if (!error) return 'An unexpected error occurred';

    // Handle specific database error types
    if (error.message?.includes('network') || error.message?.includes('connection')) {
      return 'Connection error. Please check your internet connection and try again.';
    }
    
    if (error.message?.includes('database') || error.message?.includes('indexeddb')) {
      return 'Database error. Please try again or refresh the page.';
    }
    
    if (error.message?.includes('permission')) {
      return 'Permission denied. You may not have access to this resource.';
    }

    // Generic database error
    if (this.isDatabaseError(error)) {
      return 'Database connection error. Please try again or check your connection.';
    }

    return 'An unexpected error occurred. Please try refreshing the page.';
  };

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }));
  };

  handleRefresh = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const errorMessage = this.getErrorMessage();
      const isDatabaseError = this.isDatabaseError(this.state.error);
      const canRetry = this.state.retryCount < 3;

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
          <Card className="max-w-md w-full p-6 text-center">
            <div className="mb-4">
              {isDatabaseError ? (
                <div className="w-16 h-16 mx-auto mb-4 text-red-500">
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
              ) : (
                <div className="w-16 h-16 mx-auto mb-4 text-yellow-500">
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
            
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {isDatabaseError ? 'Database Error' : 'Something went wrong'}
            </h2>
            
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {errorMessage}
            </p>

            {this.state.retryCount > 0 && (
              <p className="text-sm text-gray-500 mb-4">
                Retry attempt: {this.state.retryCount}/3
              </p>
            )}

            <div className="space-y-3">
              {canRetry && (
                <Button 
                  onClick={this.handleRetry}
                  className="w-full"
                >
                  Try Again
                </Button>
              )}
              
              <Button 
                onClick={this.handleRefresh}
                variant="outline"
                className="w-full"
              >
                Refresh Page
              </Button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="text-sm text-gray-500 cursor-pointer">
                  Error Details (Development)
                </summary>
                <pre className="mt-2 text-xs text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded overflow-auto max-h-40">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;