import { useEffect } from "react";

/**
 * A route that lives on another site. Replaces the history entry so Back
 * returns to the page before, and shows the link while the browser leaves.
 */
export default function ExternalRedirect({ to, label }: { to: string; label: string }) {
  useEffect(() => {
    window.location.replace(to);
  }, [to]);

  return (
    <main className="grid min-h-svh place-items-center bg-paper-50 px-6 text-center text-text-body">
      <p>
        Opening <a href={to} className="text-text-strong underline underline-offset-4">{label}</a>
      </p>
    </main>
  );
}
