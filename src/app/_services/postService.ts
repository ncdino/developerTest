import api from "../_lib/api";
import { PostsResponse, PostDetail, Categories } from "../_type/board";
import { log } from "@/src/utils/devLogger";

interface CreatePostData {
  title: string;
  content: string;
  category: string;
  file?: File | null;
}

interface UpdatePostData {
  title: string;
  content: string;
  category: string;
  file?: File | null;
}

export const getPosts = async (
  page: number,
  size: number = 10
): Promise<PostsResponse> => {
  try {
    log(`[postService] getPosts 호출됨. page: ${page}, size: ${size}`);

    const response = await api.get("/boards", {
      params: {
        page,
        size,
      },
    });
    log("[postService] API 응답 성공:", response.data);

    return response.data;
  } catch (error) {
    console.error("게시글 목록 조회 실패:", error);

    return {
      content: [],
      pageable: { pageNumber: 0, pageSize: size },
      totalPages: 0,
      totalElements: 0,
      last: true,
      first: true,
      size,
      number: 0,
      empty: true,
    };
  }
};

export const getPostById = async (id: string): Promise<PostDetail | null> => {
  try {
    const response = await api.get(`/boards/${id}`);
    log(`[postService] getPostById 응답 성공:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`[조회실패] - ${id}.`, error);
    return null;
  }
};

export const getCategories = async (): Promise<Categories> => {
  try {
    const response = await api.get("/boards/categories");
    // log(response.data);
    return response.data;
  } catch (error) {
    console.error("카테고리를 가져오는 데 실패했습니다.", error);
    return {};
  }
};

export const createPost = async ({
  title,
  content,
  category,
  file,
}: CreatePostData): Promise<{ id: number }> => {
  const formData = new FormData();

  const jsonData = { title, content, category };
  formData.append(
    "request",
    new Blob([JSON.stringify(jsonData)], { type: "application/json" })
  );

  if (file) {
    formData.append("file", file);
  }

  const response = await api.post("/boards", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const deletePost = async (id: string): Promise<void> => {
  await api.delete(`/boards/${id}`);
};

export const updatePost = async ({
  id,
  updateData,
}: {
  id: string;
  updateData: UpdatePostData;
}): Promise<void> => {
  const formData = new FormData();
  const { title, content, category, file } = updateData;

  const jsonData = { title, content, category };
  formData.append(
    "request",
    new Blob([JSON.stringify(jsonData)], { type: "application/json" })
  );

  if (file) {
    formData.append("file", file);
  }

  await api.patch(`/boards/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
