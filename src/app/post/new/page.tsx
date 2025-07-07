"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { observer } from "mobx-react-lite";
import AuthGuard from "@/src/app/_components/AuthGuard";
import { getCategories, createPost } from "@/src/app/_services/postService";

const NewPostContent = observer(() => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const createPostMutation = useMutation({
    mutationFn: createPost,
    onSuccess: (data) => {
      alert("게시물이 성공적으로 등록되었습니다.");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      router.push(`/post?id=${data.id}`);
    },
    onError: (error) => {
      alert(`글 등록에 실패했습니다: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!category) {
      alert("카테고리를 선택해주세요.");
      return;
    }
    createPostMutation.mutate({ title, content, category, file });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-4xl">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center sm:text-left">
        새 글 작성
      </h1>
      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white p-4 sm:p-8 rounded-lg shadow"
      >
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

        <div>
          <input
            type="file"
            id="file"
            onChange={handleFileChange}
            accept="image/*"
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        <div className="text-right sm:text-left">
          <button
            type="submit"
            disabled={createPostMutation.isPending}
            className="w-full sm:w-auto bg-blue-600 text-white font-semibold px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {createPostMutation.isPending ? "등록 중..." : "글 등록"}
          </button>
        </div>
      </form>
    </div>
  );
});

export default function NewPostPage() {
  return (
    <AuthGuard>
      <NewPostContent />
    </AuthGuard>
  );
}
