import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React, { useState } from "react";
import { vi, describe, it, expect } from "vitest";
import ErrorBoundary from "./ErrorBoundary";
vi.mock("./ErrorBoundary.module.scss", () => ({
  default: {
    ErrorBoundary: "ErrorBoundary",
    "ErrorBoundary__content": "ErrorBoundary__content",
    "ErrorBoundary__title": "ErrorBoundary__title",
    "ErrorBoundary__message": "ErrorBoundary__message",
    "ErrorBoundary__details": "ErrorBoundary__details",
    "ErrorBoundary__error": "ErrorBoundary__error",
    "ErrorBoundary__actions": "ErrorBoundary__actions",
    "ErrorBoundary__retry": "ErrorBoundary__retry",
    "ErrorBoundary__refresh": "ErrorBoundary__refresh",
  },
}));
const ThrowError: React.FC<{ shouldThrow?: boolean }> = ({ shouldThrow = true }) => {
  if (shouldThrow) {
    throw new Error("Test error");
  }
  return <div>No error</div>;
};
const ThrowErrorOnClick: React.FC = () => {
  const [shouldThrow, setShouldThrow] = useState(false);

  if (shouldThrow) {
    throw new Error("Click error");
  }

  return (
    <button onClick={() => setShouldThrow(true)}>
      Click to throw error
    </button>
  );
};

describe("ErrorBoundary", () => {
  const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

  afterEach(() => {
    consoleErrorSpy.mockClear();
    consoleWarnSpy.mockClear();
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  it("should render children when no error occurs", () => {
    render(
      <ErrorBoundary>
        <div>Normal content</div>
      </ErrorBoundary>
    );

    expect(screen.getByText("Normal content")).toBeInTheDocument();
  });

  it("should catch and display error fallback for component errors", () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByText("We encountered an unexpected error. Please try refreshing the page.")).toBeInTheDocument();
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  it("should show error details in development mode", () => {
    const originalEnv = process.env.NODE_ENV;
    Object.defineProperty(process.env, "NODE_ENV", {
      value: "development",
      writable: true,
      enumerable: true,
      configurable: true,
    });

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText("Error Details (Development)")).toBeInTheDocument();
    const errorElement = screen.getByText(/Test error/);
    expect(errorElement).toBeInTheDocument();

    Object.defineProperty(process.env, "NODE_ENV", {
      value: originalEnv,
      writable: true,
      enumerable: true,
      configurable: true,
    });
  });

  it("should not show error details in production mode", () => {
    const originalEnv = process.env.NODE_ENV;
    Object.defineProperty(process.env, "NODE_ENV", {
      value: "production",
      writable: true,
      enumerable: true,
      configurable: true,
    });

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.queryByText("Error Details (Development)")).not.toBeInTheDocument();

    Object.defineProperty(process.env, "NODE_ENV", {
      value: originalEnv,
      writable: true,
      enumerable: true,
      configurable: true,
    });
  });

  it("should call onError callback when error occurs", () => {
    const onError = vi.fn();

    render(
      <ErrorBoundary onError={onError}>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.any(Object)
    );
  });

  it("should render custom fallback component", () => {
    const CustomFallback = () => <div>Custom error UI</div>;

    render(
      <ErrorBoundary fallback={CustomFallback}>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText("Custom error UI")).toBeInTheDocument();
    expect(screen.queryByText("Something went wrong")).not.toBeInTheDocument();
  });

  it("should retry and reset error state", () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Try Again"));
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });

  it("should handle refresh page action", () => {
    const mockReload = vi.fn();
    Object.defineProperty(window, "location", {
      value: { reload: mockReload },
      writable: true,
    });

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    fireEvent.click(screen.getByText("Refresh Page"));
    expect(mockReload).toHaveBeenCalled();
  });

  it("should handle errors thrown in event handlers", () => {
    render(
      <ErrorBoundary>
        <ThrowErrorOnClick />
      </ErrorBoundary>
    );

    fireEvent.click(screen.getByText("Click to throw error"));

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  it("should log errors in production environment", () => {
    const originalEnv = process.env.NODE_ENV;
    Object.defineProperty(process.env, "NODE_ENV", {
      value: "production",
      writable: true,
      enumerable: true,
      configurable: true,
    });

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "ErrorBoundary caught an error:",
      expect.any(Error),
      expect.any(Object)
    );

    Object.defineProperty(process.env, "NODE_ENV", {
      value: originalEnv,
      writable: true,
      enumerable: true,
      configurable: true,
    });
  });
});
