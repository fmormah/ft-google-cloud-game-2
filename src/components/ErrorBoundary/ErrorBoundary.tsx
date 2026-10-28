"use client";

import React from "react";
import styles from "./ErrorBoundary.module.scss";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; retry?: () => void }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // Call optional error handler
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return (
        <FallbackComponent error={this.state.error} retry={this.handleRetry} />
      );
    }

    return this.props.children;
  }
}

interface DefaultErrorFallbackProps {
  error?: Error;
  retry?: () => void;
}

function DefaultErrorFallback({ error, retry }: DefaultErrorFallbackProps) {
  return (
    <div className={styles.ErrorBoundary}>
      <div className={styles.ErrorBoundary__content}>
        <h1 className={styles.ErrorBoundary__title}>Something went wrong</h1>
        <p className={styles.ErrorBoundary__message}>
          We encountered an unexpected error. Please try refreshing the page.
        </p>

        {process.env.NODE_ENV === "development" && error && (
          <details className={styles.ErrorBoundary__details}>
            <summary>Error Details (Development)</summary>
            <pre className={styles.ErrorBoundary__error}>
              {error.toString()}
            </pre>
          </details>
        )}

        <div className={styles.ErrorBoundary__actions}>
          {retry && (
            <button
              className={styles.ErrorBoundary__retry}
              onClick={retry}
              type="button"
            >
              Try Again
            </button>
          )}
          <button
            className={styles.ErrorBoundary__refresh}
            onClick={() => window.location.reload()}
            type="button"
          >
            Refresh Page
          </button>
        </div>
      </div>
    </div>
  );
}

export default ErrorBoundary;
