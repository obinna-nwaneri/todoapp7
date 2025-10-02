import "./globals.css";
import { Providers } from "@/components/providers";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Enterprise Doctor Appointment",
  description: "Role-based doctor scheduling platform"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50">
        <Providers>
          <header className="border-b border-slate-200 bg-white">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
              <Link href="/" className="text-lg font-semibold text-slate-900">
                DocApp Enterprise
              </Link>
              <nav className="flex gap-4 text-sm font-medium text-slate-600">
                <Link href="/login">Login</Link>
                <Link href="/register-doctor">Register Doctor</Link>
                <Link href="/register-patient">Register Patient</Link>
              </nav>
            </div>
          </header>
          <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
