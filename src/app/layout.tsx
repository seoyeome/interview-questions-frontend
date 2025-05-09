import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "면접 질문 생성기",
  description: "카테고리를 선택하고 랜덤 질문을 받아보세요",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-[var(--background)] text-[var(--text-primary)]">
        {children}
      </body>
    </html>
  );
}
