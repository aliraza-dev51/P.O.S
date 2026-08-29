"use client";

import { SessionProvider } from "next-auth/react";

import { AppQueryClientProvider } from "@/lib/query-client";

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <AppQueryClientProvider>{children}</AppQueryClientProvider>
    </SessionProvider>
  );
}