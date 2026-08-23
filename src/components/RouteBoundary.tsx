import { Component, type ErrorInfo, type ReactNode } from "react";
import { isChunkLoadError } from "../lib/lazyWithRetry";
import Button from "./ui/Button";

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

    // A missing chunk is not a broken page, it is an out-of-date one: the site
    // was redeployed while this document was open. lazyWithRetry already tried
    // a retry and one reload, so by the time we are here the reader has to be
    // told what to do rather than shown a stack trace.
    const stale = isChunkLoadError(error);

    return (
      <div className="mx-auto flex max-w-content flex-col items-start gap-4 px-6 py-32">
        <p className="font-mono text-small text-text-muted">
          {stale ? "This page was updated" : "Something went wrong on this page"}
        </p>
        <h1 className="text-display-m text-text-strong">
          {stale ? "Reload to get the new version" : "This page did not load"}
        </h1>
        <p className="max-w-prose text-body text-text-body">
          {stale
            ? "The site was updated while this tab was open, so part of this page is no longer available. Reloading fetches the current version."
            : "The rest of the site still works — use the navigation above, or reload to try this page again."}
        </p>
        {stale && (
          <Button variant="primary" size="md" onClick={() => window.location.reload()}>
            Reload
          </Button>
        )}
        <p className="font-mono text-small text-text-muted">{error.message}</p>
      </div>
    );
  }
}
