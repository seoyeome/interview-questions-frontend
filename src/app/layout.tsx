import "./globals.css";
import { Providers } from "./providers";
import { metadata } from "./metadata";

export { metadata };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="min-h-screen bg-[var(--background)] text-[var(--text-primary)]">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
