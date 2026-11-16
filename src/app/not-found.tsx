import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center space-y-4">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-surface border border-border text-3xl">
          🔍
        </div>
        <h1 className="font-display text-3xl font-bold text-text-primary">
          Page Not Found
        </h1>
        <p className="text-sm text-text-secondary max-w-md mx-auto">
          The page you are looking for does not exist or may have been moved.
          Please check the URL or navigate back to the dashboard.
        </p>
        <div className="flex justify-center gap-4 pt-4">
          <Link
            href="/"
            className="rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-bg hover:bg-accent-strong transition"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/consultation"
            className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-text-secondary hover:text-text-primary transition"
          >
            New Consultation
          </Link>
        </div>
      </div>
    </div>
  );
}
