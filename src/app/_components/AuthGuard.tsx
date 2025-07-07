"use client";

import { observer } from "mobx-react-lite";
import { useState, useEffect } from "react";
import Link from "next/link";
import userStore from "../_stores/userStore";
import { log } from "@/src/utils/devLogger";

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard = observer(({ children }: AuthGuardProps) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  log(
    `[AuthGuard] 렌더링! isMounted: ${isMounted}, isInitializing: ${userStore.isInitializing}, isLoggedIn: ${userStore.isLoggedIn}`
  );

  if (!isMounted || userStore.isInitializing) {
    return (
      <div className="flex justify-center items-center h-screen">
        로딩 중...
      </div>
    );
  }

  if (!userStore.isLoggedIn) {
    return (
      <div className="flex flex-col justify-center items-center h-screen text-center">
        <p className="mb-4">이 페이지에 접근하려면 로그인이 필요합니다.</p>
        <Link href="/signin" className="text-blue-600 hover:underline">
          로그인 페이지로 이동
        </Link>
      </div>
    );
  }

  return <>{children}</>;
});

export default AuthGuard;
