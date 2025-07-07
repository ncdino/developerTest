"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { observer } from "mobx-react-lite";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import AuthGuard from "@/src/app/_components/AuthGuard";
import { getPostById, deletePost } from "@/src/app/_services/postService";
import userStore from "@/src/app/_stores/userStore";
import historyStore from "../_stores/historyStore";
import { PostDetail } from "@/src/app/_type/board";

const PostDetailContent = observer(() => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const {
    data: post,
    isLoading,
    isError,
    error,
  } = useQuery<PostDetail | null>({
    queryKey: ["post", id],
    queryFn: () => {
      if (!id) return Promise.reject(new Error("ID가 없습니다."));
      return getPostById(id);
    },
    enabled: !!id,
    retry: (failureCount, error: any) => {
      if (error.response?.status === 401 || error.response?.status === 403)
        return false;
      return failureCount < 2;
    },
  });

  useEffect(() => {
    if (post) {
      historyStore.setLastViewed(post);
    }
  }, [post]);

  const deleteMutation = useMutation({
    mutationFn: deletePost,
    onSuccess: () => {
      alert("게시물이 성공적으로 삭제되었습니다.");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      if (id) queryClient.invalidateQueries({ queryKey: ["post", id] });
      router.push("/posts");
    },
    onError: (err) => {
      alert(`삭제 실패했습니다: ${err.message}`);
    },
  });

  const handleDelete = () => {
    if (id && window.confirm("정말로 이 게시물을 삭제하시겠습니까?")) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return <div className="text-center py-10">게시물을 불러오는 중...</div>;
  }
  if (isError) {
    return <div className="text-center py-10">에러: {error.message}</div>;
  }
  if (!post) {
    return <div className="text-center py-10">게시물이 존재하지 않습니다.</div>;
  }

  const imageUrl = post.imageUrl
    ? `https://front-mission.bigs.or.kr${post.imageUrl}`
    : null;
  const Logged = userStore.isLoggedIn;

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 md:px-8 mt-6 md:mt-8 lg:mt-10">
      {Logged && (
        <div className="flex flex-row justify-end items-center gap-3">
          <Link
            href={`/post/edit?id=${id}`}
            className="bg-gray-200 text-gray-800 font-medium px-4 py-2 rounded-xl hover:bg-gray-300 text-center text-sm transition-colors duration-150"
          >
            수정
          </Link>
          <button
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="bg-red-500 text-white font-medium px-4 py-2 rounded-xl hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-center text-sm transition-colors duration-150"
          >
            {deleteMutation.isPending ? "삭제 중..." : "삭제"}
          </button>
        </div>
      )}
      <div className="pb-6 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <span className="inline-block text-xs font-medium bg-blue-100 text-blue-800 px-3 py-1 rounded-full w-max">
            {post.boardCategory}
          </span>
        </div>
        <div className="flex flex-row justify-between items-center border-y py-4 px-4 mt-6 border-neutral-400">
          <h1 className="text-lg font-bold break-words leading-snug">
            {post.title}
          </h1>
          <p className="flex flex-row gap-1 text-sm tracking-tighter">
            <span>
              {new Date(post.createdAt).toLocaleDateString("ko-KR", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
              })}
            </span>
            <span>
              {new Date(post.createdAt).toLocaleTimeString("ko-KR", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              })}
            </span>
          </p>
        </div>
      </div>
      {imageUrl && (
        <div className="my-8">
          <img
            src={imageUrl}
            alt={post.title}
            className="w-full max-h-[800px] object-contain rounded-lg shadow-sm"
          />
        </div>
      )}
      <div className="prose max-w-none px-4 text-neutral-950 prose-sm sm:prose-base break-words">
        <p className="whitespace-pre-wrap">{post.content}</p>
      </div>
      <div className="mt-10 pt-6 border-t border-neutral-400">
        <div className="flex flex-row justify-end gap-3">
          <button>
            <Link
              href="/posts"
              className="text-blue-800 hover:bg-sky-400 bg-sky-300 px-4 py-2 rounded-xl text-sm transition-colors duration-150"
            >
              글목록
            </Link>
          </button>
        </div>
      </div>
    </div>
  );
});

export default function PostDetailPage() {
  return (
    <AuthGuard>
      <PostDetailContent />
    </AuthGuard>
  );
}
