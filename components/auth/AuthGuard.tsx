"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import PageTransition from "@/components/ui/PageTransition";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isInitialized } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isInitialized && !user) {
      router.replace("/login");
    }
  }, [isInitialized, user, router]);

  if (!isInitialized) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#09090b] z-50">
        <div className="flex flex-col items-center gap-4">
          <LoadingSpinner size="lg" />
          <p className="text-sm text-muted-foreground animate-pulse">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <PageTransition>{children}</PageTransition>;
}
