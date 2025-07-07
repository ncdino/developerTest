export interface PostListItem {
  id: number;
  title: string;
  category: string;
  createdAt: string;
}

export interface PostDetail extends PostListItem {
  content: string;
  boardCategory: string;
  imageUrl: string | null;
  author: {
    id: string;
    name: string;
  };
}

export interface Pageable {
  pageNumber: number;
  pageSize: number;
}

export interface PostsResponse {
  content: PostListItem[];
  pageable: Pageable;
  totalPages: number;
  totalElements: number;
  last: boolean;
  first: boolean;
  size: number;
  number: number;
  empty: boolean;
}

export interface Categories {
  [key: string]: string;
}
