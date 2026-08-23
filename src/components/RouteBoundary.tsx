import { Component, type ErrorInfo, type ReactNode } from "react";

type RouteBoundaryProps = {
  /** Changing this remounts the boundary, so a new route always gets a clean slate. */
  resetKey: string;
  children: ReactNode;
};

type RouteBoundaryState = { error: Error | null };

/**
 * One page must never be able to blank the whole site.
 *
 * Without a boundary, any exception thrown while React commits a route — the
 * landing's gsap contexts reverting on unmount, a data loader throwing at
 * module scope — unmounts the entire root, and every later navigation renders
 * into an empty tree. That is the white page Cedric hit: refreshing worked,
 * clicking never did. Keyed on the pathname, so the fallback is scoped to the
 * route that failed and clears itself the moment the reader moves on.
 */
export default class RouteBoundary extends Component<RouteBoundaryProps, RouteBoundaryState> {
  state: RouteBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): RouteBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Route failed to render:", error, info.componentStack);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    return (
      <div className="mx-auto flex max-w-content flex-col items-start gap-4 px-6 py-32">
        <p className="font-mono text-small text-text-muted">Something went wrong on this page</p>
        <h1 className="text-display-m text-text-strong">This page did not load</h1>
        <p className="max-w-prose text-body text-text-body">
          The rest of the site still works — use the navigation above, or reload to try this page
          again.
        </p>
        <p className="font-mono text-small text-text-muted">{error.message}</p>
      </div>
    );
  }
}
