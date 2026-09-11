import { Component, type ErrorInfo, type ReactNode } from 'react';

export interface SimulationBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error, retry: () => void) => ReactNode);
  recoveryMessage?: string;
  onFallback?: () => void;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface SimulationBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class SimulationBoundary extends Component<SimulationBoundaryProps, SimulationBoundaryState> {
  override state: SimulationBoundaryState = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error: Error): SimulationBoundaryState {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.props.onError?.(error, errorInfo);
    this.props.onFallback?.();
  }

  retry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  override render(): ReactNode {
    if (this.state.hasError) {
      if (typeof this.props.fallback === 'function') {
        return this.props.fallback(this.state.error ?? new Error('Rendering failed'), this.retry);
      }
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="simulation-recovery-panel" role="status" aria-live="polite">
          <div className="recovery-copy">
            <h3>Reduced visual mode</h3>
            <p>
              {this.props.recoveryMessage ??
                '3D rendering is unavailable on this device. The physics model, controls, observations, graph, and data table remain fully active.'}
            </p>
          </div>
          <button type="button" className="secondary-button" onClick={this.retry}>
            Retry 3D view
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
