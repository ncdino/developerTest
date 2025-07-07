"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import userStore from "@/src/app/_stores/userStore";

const SignUpPage = () => {
  const router = useRouter();

  const [formData, setFormData] = useState({
    username: "",
    name: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState<string | null>(null);

  const [isUsernameValid, setIsUsernameValid] = useState(true);

  const [passwordValid, setPasswordValid] = useState({
    length: false,
    letter: false,
    number: false,
    special: false,
  });

  useEffect(() => {
    const { username } = formData;
    if (username.length > 0) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      setIsUsernameValid(emailRegex.test(username));
    } else {
      setIsUsernameValid(true);
    }
  }, [formData]);

  useEffect(() => {
    const { password } = formData;
    setPasswordValid({
      length: password.length >= 8,
      letter: /[a-zA-Z]/.test(password),
      number: /\d/.test(password),
      special: /[^a-zA-Z0-9]/.test(password),
    });
  }, [formData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!isUsernameValid) {
      setError("올바른 이메일 형식이 아닙니다.");
      return;
    }

    const allPasswordRulesMet = Object.values(passwordValid).every(Boolean);
    if (!allPasswordRulesMet) {
      setError("비밀번호가 규칙에 어긋납니다. 다시 확인해주세요.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    const result = await userStore.signUp({
      username: formData.username,
      name: formData.name,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
    });

    if (result.success) {
      alert("회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.");
      router.push("/signin");
    } else {
      setError(result.message || "회원가입에 실패했습니다.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            새로운 계정 만들기
          </h1>
          <p className="mt-3 text-sm text-gray-600">
            아래 정보를 입력해주세요.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700"
            >
              아이디 (이메일)
            </label>
            <input
              type="email"
              name="username"
              id="username"
              required
              className={`w-full px-3 py-2 mt-1 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                !isUsernameValid ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="you@example.com"
              onChange={handleChange}
              value={formData.username}
            />
            {!isUsernameValid && (
              <p className="mt-2 text-xs text-red-600">
                올바른 이메일 형식을 입력해주세요.
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              사용자 이름
            </label>
            <input
              type="text"
              name="name"
              id="name"
              required
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="홍길동"
              onChange={handleChange}
              value={formData.name}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              비밀번호
            </label>
            <input
              type="password"
              name="password"
              id="password"
              required
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="••••••••"
              onChange={handleChange}
              value={formData.password}
            />
            <ul className="mt-2 text-xs space-y-1">
              <li
                className={
                  passwordValid.length ? "text-green-600" : "text-gray-500"
                }
              >
                <span className="mr-2">{passwordValid.length ? "✓" : "•"}</span>
                8자 이상
              </li>
              <li
                className={
                  passwordValid.letter ? "text-green-600" : "text-gray-500"
                }
              >
                <span className="mr-2">{passwordValid.letter ? "✓" : "•"}</span>
                영문 포함
              </li>
              <li
                className={
                  passwordValid.number ? "text-green-600" : "text-gray-500"
                }
              >
                <span className="mr-2">{passwordValid.number ? "✓" : "•"}</span>
                숫자 포함
              </li>
              <li
                className={
                  passwordValid.special ? "text-green-600" : "text-gray-500"
                }
              >
                <span className="mr-2">
                  {passwordValid.special ? "✓" : "•"}
                </span>
                특수문자 포함
              </li>
            </ul>
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700"
            >
              비밀번호 확인
            </label>
            <input
              type="password"
              name="confirmPassword"
              id="confirmPassword"
              required
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="••••••••"
              onChange={handleChange}
              value={formData.confirmPassword}
            />
          </div>

          {error && (
            <p className="text-sm font-medium text-center text-red-600">
              {error}
            </p>
          )}

          <div>
            <button
              type="submit"
              className="w-full px-4 py-2 font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-300"
            >
              계정 생성하기
            </button>
          </div>
        </form>
        <p className="text-sm text-center text-gray-600">
          이미 계정이 있으신가요?{" "}
          <Link
            href="/signin"
            className="font-medium text-blue-600 hover:underline"
          >
            로그인
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUpPage;
