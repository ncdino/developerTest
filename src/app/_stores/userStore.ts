import { makeAutoObservable, runInAction } from "mobx";
import { jwtDecode } from "jwt-decode";
import axios, { AxiosError } from "axios";
import api from "@/src/app/_lib/api";
import { SignUpData, SignInData } from "@/src/app/_services/authService";
import { SecureStorage } from "@/src/app/_utils/crypto";
import { log } from "@/src/utils/devLogger";

export interface User {
  id: string;
  name: string;
}

interface JwtPayload {
  username: string;
  name: string;
  iat: number;
  exp: number;
}

class UserStore {
  isLoggedIn = false;
  user: User | null = null;
  accessToken = "";
  tokenExp: number | null = null;
  isInitializing = true;
  sessionExpiredMessage: string | null = null;
  sessionExtendPrompt: string | null = null;
  isRefreshing = false;
  private tokenCheckInterval: NodeJS.Timeout | null = null;
  private hasShownExtendPrompt = false;
  private hasTriedAutoRefresh = false;

  constructor() {
    makeAutoObservable(this);
    this.setupInterceptors();
  }

  setupInterceptors() {
    api.interceptors.request.use(
      (config) => {
        log("API 요청");
        log(`[토큰 상태] accessToken 존재: ${!!this.accessToken}`);

        // 토큰 만료 체크
        if (this.accessToken && this.isTokenExpired()) {
          log(`[토큰 만료] 요청 전 토큰 만료 감지`);
          this.handleTokenExpiration();
          return Promise.reject(new Error("Token expired"));
        }

        if (this.accessToken) {
          config.headers.Authorization = `Bearer ${this.accessToken}`;
          log(`[토큰 추가] Authorization 헤더 설정`);
        } else {
          log(`[토큰 없음] Authorization 헤더 X 요청`);
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // 401 에러 -> 토큰 재발급 처리(응답 인터셉터)
    let refreshTokenPromise: Promise<any> | null = null;
    api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config;
        log(`[API 에러] ${error.response?.status} - ${error.config?.url}`);

        if (
          error.response?.status === 401 &&
          originalRequest &&
          !(originalRequest as any)._retry &&
          this.isLoggedIn
        ) {
          (originalRequest as any)._retry = true;
          log(`[토큰 재발급] 401 에러로 인한 토큰 재발급 시도`);

          if (!refreshTokenPromise) {
            refreshTokenPromise = this.refreshToken().finally(() => {
              refreshTokenPromise = null;
            });
          }

          try {
            await refreshTokenPromise;
            log(`[토큰 재발급] 성공 - 원래 요청 재시도`);
            return api(originalRequest);
          } catch (err) {
            log(`[토큰 재발급] 실패 - 로그아웃 처리`);
            return Promise.reject(err);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // 토큰 만료시간
  private isTokenExpired(): boolean {
    if (!this.tokenExp) return true;
    const currentTime = Date.now() / 1000;
    return this.tokenExp <= currentTime;
  }

  // 세션 연장 여부 확인
  private needsSessionExtendPrompt(): boolean {
    if (!this.tokenExp) return false;
    const currentTime = Date.now() / 1000;
    const promptTime = 60;
    return this.tokenExp - promptTime <= currentTime;
  }

  // 토큰 만료 처리
  private handleTokenExpiration() {
    log("[토큰 만료] 토큰 만료 감지 - 자동 로그아웃 처리");
    runInAction(() => {
      this.sessionExpiredMessage =
        "세션이 만료되었습니다. 다시 로그인해주세요.";
    });
    this.logout(false);
  }

  // 🔥 토큰 만료 주기적 체크
  private startTokenExpirationCheck() {
    if (this.tokenCheckInterval) {
      clearInterval(this.tokenCheckInterval);
    }

    this.tokenCheckInterval = setInterval(() => {
      if (!this.isLoggedIn) return;

      // 실제 만료 체크
      if (this.isTokenExpired()) {
        log("[주기적 체크] 토큰 만료 감지");
        this.handleTokenExpiration();
        return;
      }

      // 세션 연장 확인
      if (
        this.needsSessionExtendPrompt() &&
        !this.sessionExtendPrompt &&
        !this.hasShownExtendPrompt
      ) {
        log("[주기적 체크] 세션 연장 확인 필요");
        runInAction(() => {
          this.sessionExtendPrompt = "세션이 곧 만료됩니다. 연장하시겠습니까?";
          this.hasShownExtendPrompt = true; // 🔥 플래그 설정
        });
      }
    }, 60000);
  }

  // 토큰 만료 체크 중지
  private stopTokenExpirationCheck() {
    if (this.tokenCheckInterval) {
      clearInterval(this.tokenCheckInterval);
      this.tokenCheckInterval = null;
    }
  }

  async signUp(data: SignUpData) {
    try {
      await api.post("/auth/signup", data);
      return { success: true };
    } catch (error: any) {
      console.error(
        "회원가입 실패:",
        error.response?.data?.message || error.message
      );
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "중복된 계정이 있거나, 알 수 없는 에러입니다.",
      };
    }
  }

  async signIn(data: SignInData) {
    try {
      const response = await api.post("/auth/signin", data);
      const { accessToken, refreshToken } = response.data;
      this.login(accessToken, refreshToken);
      return { success: true };
    } catch (error: any) {
      error("로그인 실패:", error.response?.data?.message || error.message);
      return {
        success: false,
        message: error.response?.data?.message || "알 수 없는 에러",
      };
    }
  }

  async refreshToken() {
    if (this.isRefreshing) return;
    runInAction(() => {
      this.isRefreshing = true;
    });
    log("[토큰 재발급]");

    try {
      // refreshToken 복호화
      const refreshToken = SecureStorage.getRefreshToken();
      if (!refreshToken) throw new Error("리프레시 토큰이 없습니다.");

      const response = await api.post("/auth/refresh", { refreshToken });
      const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
        response.data;
      this.login(newAccessToken, newRefreshToken);
      log("토큰 재발급 성공");
      // 토큰 갱신 후 상태 초기화
      runInAction(() => {
        this.hasTriedAutoRefresh = false;
      });
      return response.data;
    } catch (error) {
      console.error("토큰 재발급 실패, 로그아웃 처리", error);
      runInAction(() => {
        log("[userStore.refreshToken] 세션만료 모달");
        this.sessionExpiredMessage =
          "장시간 활동이 없어 안전을 위해 로그아웃되었습니다. 다시 로그인해주세요.";
      });
      this.logout(false);
      throw error;
    } finally {
      runInAction(() => {
        this.isRefreshing = false;
      });
    }
  }

  login(accessToken: string, refreshToken: string) {
    const decoded = jwtDecode<JwtPayload>(accessToken);
    runInAction(() => {
      this.isLoggedIn = true;
      this.user = { id: decoded.username, name: decoded.name };
      this.accessToken = accessToken;
      this.tokenExp = decoded.exp;
      this.sessionExpiredMessage = null;
      this.sessionExtendPrompt = null;
      this.hasShownExtendPrompt = false;
      this.isInitializing = false;
    });

    if (typeof window !== "undefined") {
      // RefreshToken은 localStorage 저장 )암호화)
      SecureStorage.setRefreshToken(refreshToken);
      // AccessToken sessionStorage 저장 (평문저장)
      SecureStorage.setAccessToken(accessToken, false);
    }

    // 로그인 성공 시 토큰 만료 체크 시작
    this.startTokenExpirationCheck();

    log("로그인 완료", this.user);
    log("accessToken 저장 완료!", !!this.accessToken);
  }

  logout(isManualLogout = true) {
    // 토큰 만료 체크 중지
    this.stopTokenExpirationCheck();

    runInAction(() => {
      this.isLoggedIn = false;
      this.user = null;
      this.accessToken = "";
      this.tokenExp = null;
      this.hasShownExtendPrompt = false;
      if (isManualLogout) {
        this.sessionExpiredMessage = null;
      }
      this.isInitializing = true;
    });

    if (typeof window !== "undefined") {
      // 모든 토큰 삭제
      SecureStorage.clearAllTokens();
    }

    log("로그아웃 완료");
  }

  clearSessionExpiredMessage() {
    runInAction(() => {
      this.sessionExpiredMessage = null;
    });
  }

  // 세션 연장 프롬프트 처리
  async extendSession() {
    runInAction(() => {
      this.sessionExtendPrompt = null;
    });

    try {
      await this.refreshToken();
      log("[토큰 갱신] 성공");
      runInAction(() => {
        this.hasShownExtendPrompt = false;
      });
    } catch (error) {
      log("[로그아웃] 성공");
      this.handleTokenExpiration();
    }
  }

  declineSessionExtension() {
    runInAction(() => {
      this.sessionExtendPrompt = null;
    });
    this.handleTokenExpiration();
  }

  clearSessionExtendPrompt() {
    runInAction(() => {
      this.sessionExtendPrompt = null;
    });
  }

  rehydrate = () => {
    log("[rehydrate] 스토어 상태 복원");

    if (typeof window !== "undefined") {
      const storedAccessToken = SecureStorage.getAccessToken();
      const storedRefreshToken = SecureStorage.getRefreshToken();

      if (storedAccessToken) {
        try {
          const decoded = jwtDecode<JwtPayload>(storedAccessToken);
          const currentTime = Date.now() / 1000;

          if (decoded.exp > currentTime) {
            runInAction(() => {
              this.isLoggedIn = true;
              this.user = { id: decoded.username, name: decoded.name };
              this.accessToken = storedAccessToken;
              this.tokenExp = decoded.exp;
            });

            this.startTokenExpirationCheck();

            log("accessToken으로 상태 즉시 복원 성공");
            log("복원된 사용자:", this.user);
          } else {
            log("저장된 accessToken이 만료됨");
            SecureStorage.clearAllTokens();
            runInAction(() => {
              this.isLoggedIn = false;
              this.user = null;
              this.accessToken = "";
              this.tokenExp = null;
            });
          }
        } catch (error) {
          console.error("accessToken 디코딩 실패:", error);
          SecureStorage.clearAllTokens();
          runInAction(() => {
            this.isLoggedIn = false;
            this.user = null;
            this.accessToken = "";
            this.tokenExp = null;
          });
        }
      } else if (storedRefreshToken) {
        log("accessToken 없음, refreshToken으로 재발급 시도");
        this.refreshToken().catch(() => {
          log("refreshToken으로 재발급 실패");
        });
      }
    }

    runInAction(() => {
      this.isInitializing = false;
    });
  };

  destroy() {
    this.stopTokenExpirationCheck();
  }
}

const userStore = new UserStore();
export default userStore;
