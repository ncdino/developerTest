import { makeAutoObservable } from "mobx";

export interface Post {
  id: number;
  title: string;
  content: string;
  author: string;
  createdAt: string;
}

class PostStore {
  posts: Post[] = [];
  currentPage = 1;
  totalPages = 1;
  selectedPost: Post | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  setPosts(postsData: Post[], currentPage: number, totalPages: number) {
    this.posts = postsData;
    this.currentPage = currentPage;
    this.totalPages = totalPages;
  }
}

const postStore = new PostStore();
export default postStore;
