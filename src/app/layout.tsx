import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { BottomNav } from "@/components/bottom-nav";
import { AppHeader } from "@/components/app-header";
import { AuthProvider } from "@/lib/auth-context";
import { ToastProvider } from "@/lib/toast-context";
import { ErrorBoundary } from "@/components/error-boundary";
import { ThemeProvider } from "@/components/theme-provider";

const outfit = Outfit({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "PEGALO FIXTURE MUNDIAL 2026",
  description:
    "Pronosticá los partidos del Mundial 2026. Competí con amigos, sumá puntos y demostrá que sabés de fútbol. Powered by PEGALO.",
  keywords: [
    "mundial 2026",
    "pronósticos",
    "predicciones",
    "fútbol",
    "world cup",
    "PEGALO",
    "fixture",
    "ranking",
  ],
  openGraph: {
    title: "PEGALO FIXTURE MUNDIAL 2026",
    description:
      "Pronosticá los partidos del Mundial 2026 y competí en el ranking.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${outfit.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-background font-sans selection:bg-primary/30 text-foreground">
        <ErrorBoundary>
          <ToastProvider>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
              <AuthProvider>
              <AppHeader />
              <main className="flex-1 pb-20 lg:pb-0 lg:pl-64">
                <div className="mx-auto max-w-3xl px-4 py-4 lg:py-6">
                  {children}
                </div>
              </main>
              <BottomNav />
              </AuthProvider>
            </ThemeProvider>
          </ToastProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
