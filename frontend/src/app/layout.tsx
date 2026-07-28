import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/lib/auth/context";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Risk-Flux — Energy Trading Risk & Technology",
    template: "%s | Risk-Flux",
  },
  description:
    "Deep-dive knowledge hub for Energy Trading Risk Management (PnL, VaR, Volatility, Curves) and modern Technology (Python, FastAPI, Data Engineering).",
  keywords: ["energy trading", "risk management", "VaR", "PnL", "Python", "FastAPI", "quantitative finance"],
  authors: [{ name: "Risk-Flux" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://risk-flux.is-a.dev",
    siteName: "Risk-Flux",
    title: "Risk-Flux — Energy Trading Risk & Technology",
    description: "Deep-dive articles on energy trading risk and modern technology.",
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <AuthProvider>
            <Navbar />
            <main style={{ minHeight: "calc(100vh - 64px - 80px)" }}>{children}</main>
            <Footer />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
