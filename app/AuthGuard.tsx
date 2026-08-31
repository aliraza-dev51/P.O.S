"use client";

import { ReactNode } from "react";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import SideBar from "./SideBar";
import LoadingScreen from "@/components/LoadingScreen";

export default function AuthGuard({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const { status } = useSession();

  const isPublicAuthPage =
    pathname === "/login" || pathname === "/signin" || pathname === "/signup";

  useEffect(() => {
    if (isPublicAuthPage && status === "authenticated") {
      router.replace("/dashboard");
    }

    if (!isPublicAuthPage && status === "unauthenticated") {
      router.replace("/login");
    }
  }, [isPublicAuthPage, router, status]);

  /* =========================================
     LOGIN PAGE
  ========================================= */

  if (isPublicAuthPage) {
    if (status === "authenticated") {
      return null;
    }

    return <>{children}</>;
  }

  /* =========================================
     LOADING
  ========================================= */

  if (status === "loading") {
    return <LoadingScreen label="Loading session" />;
  }

  /* =========================================
     NOT AUTHENTICATED
  ========================================= */

  if (status === "unauthenticated") {
    return null;
  }

  /* =========================================
     AUTHENTICATED
  ========================================= */

  return (
    <div className="min-h-screen">
      <SideBar />

      <div className="bg-white sm:ml-[72px]">
        {children}
      </div>
    </div>
  );
}