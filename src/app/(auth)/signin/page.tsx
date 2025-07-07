"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import userStore from "@/src/app/_stores/userStore";

const SignInPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const result = await userStore.signIn({
      username: formData.username,
      password: formData.password,
    });

    if (result.success) {
      router.push("/");
    } else {
      setError(
        result.message ||
          "로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요."
      );
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md sm:max-w-lg bg-white p-6 sm:p-8 rounded-xl shadow-lg space-y-6">
        {/* 제목 */}
        <div className="text-center sm:text-left">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
            로그인
          </h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600">
            로그인하여 서비스를 이용하세요.
          </p>
        </div>

        {/* 로그인 폼 */}
        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
          {/* 이메일 입력 */}
          <div>
            <label
              htmlFor="username"
              className="block text-sm sm:text-base font-medium text-gray-700"
            >
              아이디
            </label>
            <input
              type="email"
              name="username"
              id="username"
              required
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm text-sm sm:text-base placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="you@example.com"
              onChange={handleChange}
              value={formData.username}
            />
          </div>

          {/* 비밀번호 입력 */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm sm:text-base font-medium text-gray-700"
            >
              비밀번호
            </label>
            <input
              type="password"
              name="password"
              id="password"
              required
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm text-sm sm:text-base placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="••••••••"
              onChange={handleChange}
              value={formData.password}
            />
          </div>

          {/* 에러 메시지 */}
          {error && (
            <p className="text-sm sm:text-base font-medium text-center text-red-600">
              {error}
            </p>
          )}

          {/* 로그인 버튼 */}
          <div>
            <button
              type="submit"
              className="w-full px-4 py-2 font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-300 text-sm sm:text-base"
            >
              로그인
            </button>
          </div>
        </form>

        {/* 회원가입 링크 */}
        <p className="text-sm sm:text-base text-center text-gray-600">
          아직 계정이 없으신가요?{" "}
          <Link
            href="/signup"
            className="font-medium text-blue-600 hover:underline"
          >
            회원가입
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignInPage;
