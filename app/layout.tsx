import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Toaster } from "react-hot-toast";
import { AnalyticsTracker } from "@/components/analytics-tracker";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Embertext - Free AI Tools & Bitcoin Utilities",
  description: "Free AI Humanizer, AI Content Detector, Bitcoin Calculator, and Receipt Generator. No signup, no paywalls, completely free.",
  keywords: ["AI humanizer", "AI detector", "Bitcoin calculator", "receipt generator", "free tools"],
  icons: {
    icon: "/icon.jpg",
  },
  openGraph: {
    title: "Embertext",
    description: "Free AI Tools & Bitcoin Utilities",
    type: "website",
    images: ["/icon.jpg"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AnalyticsTracker />
          <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <Toaster
            position="top-right"
            toastOptions={{
              className: "dark:bg-slate-800 dark:text-white",
              duration: 3000,
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
