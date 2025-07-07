"use client";

import Link from "next/link";
import { observer } from "mobx-react-lite";
import { useState, useEffect, useRef } from "react";
import userStore from "@/src/app/_stores/userStore";

const Header = observer(() => {
  const [timer, setTimer] = useState("");
  const [showExtendModal, setShowExtendModal] = useState(false);
  const hasShownWarningRef = useRef(false);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    if (userStore.isLoggedIn && userStore.tokenExp) {
      intervalId = setInterval(() => {
        const now = Date.now() / 1000;
        const remainingSeconds = Math.round(userStore.tokenExp! - now);
        const minutes = Math.floor(remainingSeconds / 60);
        const seconds = remainingSeconds % 60;

        if (remainingSeconds <= 0) {
          setTimer("만료");
          setShowExtendModal(false);
          clearInterval(intervalId!);
        } else {
          setTimer(`${minutes}:${seconds < 10 ? "0" : ""}${seconds}`);

          if (remainingSeconds <= 60 && !hasShownWarningRef.current) {
            setShowExtendModal(true);
            hasShownWarningRef.current = true;
          }
        }
      }, 1000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [userStore.isLoggedIn, userStore.tokenExp]);

  useEffect(() => {
    hasShownWarningRef.current = false;
  }, [userStore.tokenExp]);

  const handleExtendSession = async () => {
    setShowExtendModal(false);
    try {
      await userStore.refreshToken();
    } catch (error) {
      console.error("세션 연장 실패:", error);
    }
  };

  const handleLogout = () => {
    setShowExtendModal(false);
    userStore.logout();
  };

  const isTimerCritical =
    timer &&
    timer !== "만료" &&
    parseInt(timer.split(":")[0]) === 0 &&
    parseInt(timer.split(":")[1]) <= 10;

  return (
    <>
      <header className="w-full bg-gradient-to-r from-slate-50 to-blue-50 shadow-lg border-b border-gray-200/50 backdrop-blur-md">
        <nav className="px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0 max-w-7xl mx-auto">
          <Link
            href="/"
            className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform"
          >
            Developer Test
          </Link>

          <div className="flex flex-wrap items-center justify-center gap-3 text-sm sm:text-base">
            {userStore.isInitializing ? (
              <div className="flex items-center gap-2">
                <div className="h-5 w-20 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full animate-pulse" />
                <div className="h-5 w-16 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full animate-pulse" />
              </div>
            ) : userStore.isLoggedIn ? (
              <>
                <div className="bg-white/70 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-gray-200/50">
                  <span className="font-semibold text-gray-700">
                    {userStore.user?.name || "사용자 정보 없음"}님
                  </span>
                </div>
                <div className="bg-blue-50/80 backdrop-blur-sm px-3 py-1 rounded-full text-blue-600 font-medium text-xs border border-blue-200/50">
                  ID: {userStore.user?.id || "N/A"}
                </div>
                {timer && (
                  <div
                    className={`px-3 py-1 rounded-full font-mono text-sm font-bold transition-all duration-300 ${
                      timer === "만료"
                        ? "bg-red-100 text-red-700 border border-red-200 animate-pulse"
                        : isTimerCritical
                        ? "bg-orange-100 text-orange-700 border border-orange-200 animate-pulse"
                        : "bg-green-100 text-green-700 border border-green-200"
                    }`}
                  >
                    <span className="text-xs opacity-75 mr-1">세션</span>
                    {timer}
                  </div>
                )}
                <button
                  onClick={handleLogout}
                  className="bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 px-4 py-2 rounded-full font-medium transition-all duration-300 transform"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/signin"
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-2 rounded-full font-medium transition-all duration-300 transform shadow-lg hover:shadow-xl"
                >
                  로그인
                </Link>
                <Link
                  href="/signup"
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-6 py-2 rounded-full font-medium transition-all duration-300 transform shadow-lg hover:shadow-xl"
                >
                  회원가입
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      {showExtendModal && hasShownWarningRef.current && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md">
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-8 w-full max-w-md text-center border border-gray-200/50 transform animate-in fade-in-0 zoom-in-95 duration-300">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                세션 연장 필요
              </h3>
              <p className="text-gray-600 leading-relaxed">
                보안을 위해 세션이 곧 만료됩니다.
                <br />
                계속 사용하시려면 세션을 연장해주세요.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleLogout}
                className="flex-1 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 px-6 py-3 rounded-xl font-medium transition-all duration-300 transform shadow-sm"
              >
                로그아웃
              </button>
              <button
                onClick={handleExtendSession}
                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 transform shadow-lg hover:shadow-xl"
              >
                세션 연장
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
});

export default Header;
