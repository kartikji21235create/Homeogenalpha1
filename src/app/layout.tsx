import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import "./globals.css";

export const metadata: Metadata = {
  title: "Homeogenalpha1 — Clinical Decision Support for Homoeopathy",
  description:
    "Reproducible, deterministic repertorisation and case management platform built on verified open data.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#11140f",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased min-h-screen bg-bg text-text-primary">
        <header className="border-b border-border bg-surface px-6 py-4 sticky top-0 z-40">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-bg font-bold font-display text-lg">
                H
              </span>
              <div>
                <Link href="/" className="font-display font-bold text-lg text-text-primary hover:text-accent transition">
                  Homeogenalpha1
                </Link>
                <span className="text-[10px] text-text-secondary block font-mono">Release 1 &middot; Kent 1897</span>
              </div>
            </div>

            <nav className="flex items-center gap-5 text-sm">
              <Link href="/consultation" className="text-text-secondary hover:text-text-primary transition">
                Consultation
              </Link>
              <Link href="/cases" className="text-text-secondary hover:text-text-primary transition">
                Cases
              </Link>
              <Link href="/patients" className="text-text-secondary hover:text-text-primary transition">
                Patients
              </Link>
              <Link href="/repertory" className="text-text-secondary hover:text-text-primary transition">
                Repertory Library
              </Link>
              <Link href="/materia-medica" className="text-text-secondary hover:text-text-primary transition">
                Materia Medica
              </Link>
              <Link href="/usage" className="text-text-secondary hover:text-text-primary transition">
                Usage &amp; Credits
              </Link>
              <Link href="/privacy-notice" className="text-text-secondary hover:text-text-primary transition text-xs">
                DPDP
              </Link>
              <div className="flex items-center gap-2 pl-4 border-l border-border">
                <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                <span className="text-xs text-text-secondary">Doctor</span>
              </div>
            </nav>
          </div>
        </header>

        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}
