import type { Metadata } from "next";
import "./globals.css";
import Header from "@/src/components/common/Header";
import StoreInit from "@/src/app/_components/StoreInit";
import SessionExpiredModal from "../components/common/SessionExpiredModal";
import QueryProvider from "../components/common/QueryProvider";
import { Noto_Sans_KR } from "next/font/google";

const NotoSansKR = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-noto-sans-kr",
});

export const metadata: Metadata = {
  title: "더드림 | 이지현",
  description: "프론트엔드 개발자 사전 테스트 전형",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${NotoSansKR.variable} antialiased tracking-tight`}
    >
      <body>
        <QueryProvider>
          <SessionExpiredModal />
          <StoreInit />
          <Header />
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
