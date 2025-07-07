import CryptoJS from "crypto-js";
import { log } from "@/src/utils/devLogger";

const CRYPTO_SECRET_KEY =
  process.env.NEXT_PUBLIC_CRYPTO_SECRET || "JrjktGbyS2nm3C9s3mE2P2LStBAUfhO";

export class TokenCrypto {
  private static secretKey = CRYPTO_SECRET_KEY;

  static encrypt(token: string): string {
    try {
      const encrypted = CryptoJS.AES.encrypt(token, this.secretKey).toString();
      log("토큰 암호화 성공");
      return encrypted;
    } catch (error) {
      console.error("토큰 암호화 실패:", error);
      throw new Error("토큰 암호화 실패");
    }
  }

  static decrypt(encryptedToken: string): string {
    try {
      const decrypted = CryptoJS.AES.decrypt(encryptedToken, this.secretKey);
      const originalToken = decrypted.toString(CryptoJS.enc.Utf8);

      if (!originalToken) {
        throw new Error("복호화 결과가 비어있습니다.");
      }

      log("토큰 복호화 성공");
      return originalToken;
    } catch (error) {
      console.error("토큰 복호화 실패:", error);
      throw new Error("토큰 복호화 실패");
    }
  }

  static isValidEncryptedToken(encryptedToken: string): boolean {
    try {
      const decrypted = this.decrypt(encryptedToken);
      return decrypted.length > 0;
    } catch {
      return false;
    }
  }
}

// 스토리지 유틸리티
export class SecureStorage {
  static setRefreshToken(token: string): void {
    try {
      const encryptedToken = TokenCrypto.encrypt(token);
      localStorage.setItem("refreshToken", encryptedToken);
      log("RefreshToken encrypt 후 저장 완료");
    } catch (error) {
      console.error("RefreshToken 저장 실패:", error);
      throw error;
    }
  }

  static getRefreshToken(): string | null {
    try {
      const encryptedToken = localStorage.getItem("refreshToken");
      if (!encryptedToken) return null;

      return TokenCrypto.decrypt(encryptedToken);
    } catch (error) {
      console.error("RefreshToken decrypt 실패:", error);
      // 복호화 실패 시 손상된 토큰 제거
      localStorage.removeItem("refreshToken");
      return null;
    }
  }

  static setAccessToken(token: string, encrypt: boolean = false): void {
    try {
      const tokenToStore = encrypt ? TokenCrypto.encrypt(token) : token;
      sessionStorage.setItem("accessToken", tokenToStore);
      sessionStorage.setItem("accessTokenEncrypted", encrypt.toString());
      log(`AccessToken ${encrypt ? "암호화" : "평문"} 저장 완료`);
    } catch (error) {
      console.error("AccessToken 저장 실패:", error);
      throw error;
    }
  }

  static getAccessToken(): string | null {
    try {
      const token = sessionStorage.getItem("accessToken");
      if (!token) return null;

      const isEncrypted =
        sessionStorage.getItem("accessTokenEncrypted") === "true";

      if (isEncrypted) {
        return TokenCrypto.decrypt(token);
      }

      return token;
    } catch (error) {
      console.error("AccessToken 복호화 실패:", error);
      sessionStorage.removeItem("accessToken");
      sessionStorage.removeItem("accessTokenEncrypted");
      return null;
    }
  }

  static clearAllTokens(): void {
    localStorage.removeItem("refreshToken");
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("accessTokenEncrypted");
    log("모든 토큰 제거 완료");
  }
}
