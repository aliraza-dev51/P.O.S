"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import SideBar from "./SideBar";

const AUTH_KEY = "posAuthenticated";

export default function AuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const authenticated =
      localStorage.getItem(AUTH_KEY) === "true" ||
      sessionStorage.getItem(AUTH_KEY) === "true";

    setIsAuthenticated(authenticated);
    setIsChecking(false);

    if (pathname !== "/login" && !authenticated) {
      router.replace("/login");
    }

    if (pathname === "/login" && authenticated) {
      router.replace("/dashboard");
    }
  }, [pathname, router]);

  if (pathname === "/login") {
    return <>{children}</>;
  }

  if (isChecking || !isAuthenticated) {
    return null;
  }

  return (
    <div className="h-screen">
      <SideBar />
      <div className="bg-white sm:ml-[72px]">
        {children}
      </div>
    </div>
  );
}
