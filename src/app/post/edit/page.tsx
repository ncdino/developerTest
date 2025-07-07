"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { observer } from "mobx-react-lite";
import Link from "next/link";

import AuthGuard from "@/src/app/_components/AuthGuard";
import {
  getPostById,
  getCategories,
  updatePost,
} from "@/src/app/_services/postService";

const EditPostContent = observer(() => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const {
    data: originalPost,
    isLoading: isLoadingPost,
    isError: isPostError,
  } = useQuery({
    queryKey: ["post", id],
    queryFn: () => {
      if (!id) return Promise.reject(new Error("ID가 없습니다."));
      return getPostById(id);
    },
    enabled: !!id,
  });

  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  useEffect(() => {
    if (originalPost) {
      setTitle(originalPost.title);
      setContent(originalPost.content);
      setCategory(originalPost.boardCategory);
    }
  }, [originalPost]);

  const updateMutation = useMutation({
    mutationFn: (updateData: {
      title: string;
      content: string;
      category: string;
      file?: File | null;
    }) => {
      if (!id) throw new Error("ID가 없습니다.");
      return updatePost({ id, updateData });
    },
    onSuccess: () => {
      alert("게시물이 성공적으로 수정되었습니다.");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["post", id] });
      router.push(`/post?id=${id}`);
    },
    onError: (error) => {
      alert(`수정에 실패했습니다: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    updateMutation.mutate({ title, content, category, file });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  if (isLoadingPost) {
    return (
      <div className="text-center py-10">게시물 정보를 불러오는 중...</div>
    );
  }

  if (isPostError) {
    return (
      <div className="text-center py-10">
        게시물 정보를 불러오는 데 실패했습니다.
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-4xl">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-center sm:text-left">
          글 수정하기
        </h1>
        <Link
          href={id ? `/post?id=${id}` : "/posts"}
          className="text-sm text-gray-600 hover:underline text-center sm:text-right"
        >
          &larr; 수정 취소하고 돌아가기
        </Link>
      </div>

      {/* 폼 */}
      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white p-4 sm:p-6 lg:p-8 rounded-lg shadow"
      >
        {/* 카테고리 */}
        <div>
          <label
            htmlFor="category"
            className="block text-sm sm:text-base font-medium text-gray-700 mb-1"
          >
            카테고리
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm sm:text-base"
          >
            <option value="" disabled>
              카테고리를 선택하세요
            </option>
            {isLoadingCategories ? (
              <option>불러오는 중...</option>
            ) : (
              categories &&
              Object.entries(categories).map(([key, value]) => (
                <option key={key} value={key}>
                  {value}
                </option>
              ))
            )}
          </select>
        </div>

        {/* 제목 */}
        <div>
          <label
            htmlFor="title"
            className="block text-sm sm:text-base font-medium text-gray-700 mb-1"
          >
            제목
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm sm:text-base"
          />
        </div>

        {/* 내용 */}
        <div>
          <label
            htmlFor="content"
            className="block text-sm sm:text-base font-medium text-gray-700 mb-1"
          >
            내용
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={10}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm sm:text-base"
          />
        </div>

        {/* 파일 */}
        <div>
          <label
            htmlFor="file"
            className="block text-sm sm:text-base font-medium text-gray-700 mb-1"
          >
            이미지 파일 (변경할 경우에만 선택)
          </label>
          <input
            type="file"
            id="file"
            onChange={handleFileChange}
            accept="image/*"
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        {/* 버튼 */}
        <div className="flex flex-col sm:flex-row sm:justify-end gap-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="w-full sm:w-auto bg-gray-200 text-gray-800 font-semibold px-6 py-2 rounded-md hover:bg-gray-300"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="w-full sm:w-auto bg-green-600 text-white font-semibold px-6 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {updateMutation.isPending ? "수정 중..." : "수정 완료"}
          </button>
        </div>
      </form>
    </div>
  );
});

export default function EditPostPage() {
  return (
    <AuthGuard>
      <EditPostContent />
    </AuthGuard>
  );
}
