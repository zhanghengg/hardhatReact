import type { Metadata } from "next";
import { Inter, Exo_2 } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ThemeProvider } from "@/components/ThemeProvider";
import { I18nProvider } from "@/i18n";
import { Web3Provider } from "@/components/Web3Provider";
import { ChatBot } from "@/components/ChatBot";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const exo2 = Exo_2({
  variable: "--font-exo2",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "web3.dev | 0xMRO 的 Web3 作品集",
  description: "Web3 前端工程师 0xMRO 的作品集，展示 DeFi、NFT、智能合约等 Web3 项目",
  keywords: ["Web3", "DeFi", "Solidity", "React", "Smart Contract", "区块链"]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const theme = localStorage.getItem('theme');
                if (theme !== 'light') {
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} ${exo2.variable} font-sans antialiased bg-background text-foreground`}>
        <Web3Provider>
          <ThemeProvider>
            <I18nProvider>
              <Header />
              <main className="pt-16">{children}</main>
              <Footer />
              <ChatBot />
            </I18nProvider>
          </ThemeProvider>
        </Web3Provider>
      </body>
    </html>
  );
}
