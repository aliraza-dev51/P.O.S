import "./globals.css";

import { Inter } from "next/font/google";

import AuthGuard from "./AuthGuard";
import Providers from "../components/providers";


const inter = Inter({
  subsets: ["latin"],
});

export const metadata = {
  title: "VPOS",
  description: "Virtual Point of Sale",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <AuthGuard>
            {children}
          </AuthGuard>
        </Providers>
      </body>
    </html>
  );
}