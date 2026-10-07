"use client";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="page-container"><section className="empty-state"><h2>That didn’t go as planned</h2><p>Something unexpected happened. Please try again.</p><button className="primary-button" onClick={reset} style={{ padding: "0 18px" }}>Try again</button></section></main>;
}
