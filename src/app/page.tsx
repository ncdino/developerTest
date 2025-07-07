"use client";

import { observer } from "mobx-react-lite";
import Link from "next/link";
import userStore from "@/src/app/_stores/userStore";
import historyStore from "@/src/app/_stores/historyStore";
import { useState } from "react";

const HomePage = observer(() => {
  const [lastViewedPostIsOpen, setLastViewedPostIsOpen] = useState(true);

  const formatTimeAgo = (timestamp: number): string => {
    const now = Date.now();
    const secondsPast = (now - timestamp) / 1000;

    if (secondsPast < 60) return "방금 전";
    const minutesPast = secondsPast / 60;
    if (minutesPast < 60) return `${Math.round(minutesPast)}분 전`;
    const hoursPast = minutesPast / 60;
    if (hoursPast < 24) return `${Math.round(hoursPast)}시간 전`;
    const daysPast = hoursPast / 24;
    return `${Math.round(daysPast)}일 전`;
  };

  const handleLastViewedPostIsOpen = () => {
    setLastViewedPostIsOpen(!lastViewedPostIsOpen);
  };

  const { lastViewedPost } = historyStore;

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] text-center px-4 py-8">
      {userStore.isLoggedIn ? (
        <div className="w-full max-w-3xl">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-6">
            안녕하세요,
            <span className="text-blue-600"> {userStore.user?.name}</span>님
          </h1>

          <Link
            href="/posts"
            className="block w-full md:w-fit mx-auto bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg shadow-md hover:bg-blue-700 transition-transform transform hover:scale-105 mb-10"
          >
            게시판으로 이동
          </Link>

          <div className="w-full text-left">
            <div className="flex justify-between items-center">
              <h2 className="text-base sm:text-lg text-neutral-600 font-semibold mb-4">
                최근에 읽은 글
              </h2>
              <button
                onClick={handleLastViewedPostIsOpen}
                className="text-sm text-blue-500 mb-4 hover:underline"
              >
                {lastViewedPostIsOpen ? "닫기" : "열기"}
              </button>
            </div>

            {lastViewedPost ? (
              <div
                className={`transition-opacity duration-300 ${
                  lastViewedPostIsOpen
                    ? "opacity-100 visible"
                    : "opacity-0 invisible"
                }`}
              >
                <Link
                  href={lastViewedPost.href}
                  className="block p-4 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div className="flex gap-3 items-center">
                      <span
                        className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                          lastViewedPost.category === "NOTICE"
                            ? "bg-indigo-100 text-indigo-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {lastViewedPost.category}
                      </span>
                      <p className="font-medium text-gray-900 truncate">
                        {lastViewedPost.title}
                      </p>
                    </div>
                    <span className="text-sm text-gray-500 whitespace-nowrap ml-auto">
                      {formatTimeAgo(lastViewedPost.readAt)}에 읽음
                    </span>
                  </div>
                </Link>
              </div>
            ) : (
              <div
                className={`mt-8 text-gray-500 text-sm transition-opacity duration-300 ${
                  lastViewedPostIsOpen
                    ? "opacity-100 visible"
                    : "opacity-0 invisible"
                }`}
              >
                최근에 읽은 글이 없습니다.
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="w-full max-w-sm text-center">
          <h1 className="text-xl md:text-2xl text-gray-600 mb-6">
            서비스를 이용하시려면 로그인이 필요합니다.
          </h1>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signin"
              className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold shadow hover:bg-green-600"
            >
              로그인
            </Link>
            <Link
              href="/signup"
              className="w-full sm:w-auto px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold shadow"
            >
              회원가입
            </Link>
          </div>
        </div>
      )}
    </div>
  );
});

export default HomePage;
