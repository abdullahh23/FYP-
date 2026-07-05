import { Component, ReactNode } from 'react';
import { Button } from './ui/button';

export class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <main className="flex min-h-screen items-center justify-center bg-background p-6">
        <section className="glass-panel max-w-md rounded-xl p-6 text-center">
          <h1 className="text-2xl font-bold">Something needs attention</h1>
          <p className="mt-2 text-muted-foreground">BuildWise could not render this screen. Please refresh and try again.</p>
          <Button className="mt-5" onClick={() => window.location.reload()}>
            Refresh
          </Button>
        </section>
      </main>
    );
  }
}
