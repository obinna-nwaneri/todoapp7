import "./globals.css";
import { ReactNode } from "react";
import Providers from "../components/providers";

export const metadata = {
  title: "Enterprise Doctor Appointment Platform",
  description: "Manage doctor, patient, and appointment operations in one place.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
