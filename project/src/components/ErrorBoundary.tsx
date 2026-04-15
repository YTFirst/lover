import { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from './Button';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-100 dark:bg-gray-900">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="text-center">
              <div className="text-6xl mb-4">❌</div>
              <h2 className="text-2xl font-bold mb-2 text-gray-800 dark:text-white">
                应用出错了
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                很抱歉，应用遇到了一个错误。请尝试刷新页面或联系开发者。
              </p>
              <Button
                variant="primary"
                onClick={this.handleReset}
                className="w-full"
              >
                重试
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}