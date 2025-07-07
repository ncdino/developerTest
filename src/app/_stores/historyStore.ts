"use client";

import { makeAutoObservable, runInAction } from "mobx";
import { PostDetail } from "../_type/board";

interface RecentPostInfo {
  id: number;
  title: string;
  category: string;
  href: string;
  readAt: number;
}

class HistoryStore {
  lastViewedPost: RecentPostInfo | null = null;

  constructor() {
    makeAutoObservable(this);
    this.loadFromStorage();
  }

  setLastViewed(post: PostDetail) {
    const postInfo: RecentPostInfo = {
      id: post.id,
      title: post.title,
      category: post.boardCategory,
      href: `/post?id=${post.id}`,
      readAt: Date.now(),
    };

    runInAction(() => {
      this.lastViewedPost = postInfo;
      this.saveToStorage();
    });
  }

  private saveToStorage() {
    if (typeof window !== "undefined") {
      if (this.lastViewedPost) {
        localStorage.setItem(
          "lastViewedPost",
          JSON.stringify(this.lastViewedPost)
        );
      } else {
        localStorage.removeItem("lastViewedPost");
      }
    }
  }

  private loadFromStorage() {
    if (typeof window !== "undefined") {
      const data = localStorage.getItem("lastViewedPost");
      if (data) {
        try {
          const parsedData = JSON.parse(data) as RecentPostInfo;
          runInAction(() => {
            this.lastViewedPost = parsedData;
          });
        } catch (e) {
          console.error("최근 본 글 정보를 불러오는 데 실패했습니다.", e);
        }
      }
    }
  }
}

const historyStore = new HistoryStore();
export default historyStore;
