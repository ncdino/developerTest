"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getPosts } from "@/src/app/_services/postService";
import Pagination from "@/src/app/_components/Pagination";
import AuthGuard from "@/src/app/_components/AuthGuard";

const PostsContent = () => {
  const [page, setPage] = useState(0);

  const {
    data: postsData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["posts", page],
    queryFn: () => getPosts(page, 10),
    retry: (failureCount, error: any) => {
      if (error.response?.status === 401 || error.response?.status === 403)
        return false;
      return failureCount < 2;
    },
  });

  if (isLoading) {
    return (
      <div className="text-center py-10">게시물 목록을 불러오는 중...</div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-10">
        에러가 발생했습니다: {error.message}
      </div>
    );
  }

  const posts = postsData?.content || [];
  const totalPages = postsData?.totalPages || 1;

  return (
    <div className="w-full max-w-7xl px-2 sm:px-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold">게시판</h1>
        <Link
          href="/post/new"
          className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-blue-700 w-full sm:w-auto text-center"
        >
          새 글 작성
        </Link>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-x-auto">
        <table className="min-w-full table-auto text-sm sm:text-base">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-2 sm:px-3 md:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase">
                번호
              </th>
              <th className="px-2 sm:px-3 md:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase">
                카테고리
              </th>
              <th className="px-2 sm:px-3 md:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase">
                제목
              </th>
              <th className="px-2 sm:px-3 md:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase hidden sm:table-cell">
                작성일
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {posts.length > 0 ? (
              posts.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50">
                  <td className="px-2 sm:px-3 md:px-6 py-4 whitespace-nowrap text-gray-500">
                    {post.id}
                  </td>
                  <td className="px-2 sm:px-3 md:px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        post.category === "NOTICE"
                          ? "bg-indigo-100 text-indigo-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {post.category}
                    </span>
                  </td>
                  <td className="px-2 sm:px-3 md:px-6 py-4 whitespace-nowrap font-medium">
                    <Link
                      href={`/post?id=${post.id}`}
                      className="text-gray-900 hover:text-blue-600"
                    >
                      {post.title}
                    </Link>
                  </td>
                  <td className="px-2 sm:px-3 md:px-6 py-4 whitespace-nowrap text-gray-500 hidden sm:table-cell">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-12 text-center text-sm text-gray-500"
                >
                  게시물이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={(newPage) => setPage(newPage)}
        />
      )}
    </div>
  );
};

export default function PostsPage() {
  return (
    <div className="w-full flex justify-center items-start p-4">
      <AuthGuard>
        <PostsContent />
      </AuthGuard>
    </div>
  );
}
