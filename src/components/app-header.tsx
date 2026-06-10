"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { UserAvatar } from "@/components/user-avatar";
import { ThemeToggle } from "./theme-toggle";

export function AppHeader() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navItems = [
    { href: "/", label: "Inicio", icon: "🏠" },
    { href: "/fixture", label: "Fixture", icon: "📅" },
    { href: "/ranking", label: "Ranking", icon: "🏆" },
    { href: "/perfil", label: "Mi Perfil", icon: "👤" },
  ];

  return (
    <header className="sticky top-0 z-50 glass-header lg:fixed lg:left-0 lg:top-0 lg:bottom-0 lg:w-64 lg:border-b-0 lg:border-r">
      {/* Mobile Header */}
      <div className="flex items-center justify-between px-4 py-3 lg:hidden">
        <Link href="/" className="flex items-center gap-2">
          <PegaloLogo size={32} />
          <div className="flex flex-col leading-none">
            <span className="text-sm font-bold tracking-tight">
              PEGALO <span className="text-pegalo-blue">FIXTURE</span>
            </span>
            <span className="text-[10px] font-medium text-muted-foreground tracking-widest uppercase">
              Mundial 2026
            </span>
          </div>
        </Link>

        {/* User avatar on mobile header */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {user ? (
            <Link href="/perfil" className="flex items-center">
              <UserAvatar username={user.username} size="sm" />
            </Link>
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground hover:bg-primary/95 transition-all shadow-sm"
            >
              Ingresar
            </Link>
          )}
        </div>
      </div>

      {/* Desktop Sidebar */}
      <nav className="hidden lg:flex lg:flex-col lg:h-full lg:p-4">
        <Link href="/" className="flex items-center gap-3 px-3 py-4 mb-6">
          <PegaloLogo size={42} />
          <div className="flex flex-col leading-tight">
            <span className="text-lg font-bold tracking-tight">
              PEGALO <span className="text-pegalo-blue">FIXTURE</span>
            </span>
            <span className="text-xs font-medium text-muted-foreground tracking-widest uppercase">
              Mundial 2026
            </span>
          </div>
        </Link>

        <div className="flex flex-col gap-1 flex-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Desktop Sidebar Auth Indicator & Footer */}
        <div className="mt-auto border-t border-border pt-4 space-y-3">
          {user ? (
            <div className="rounded-2xl bg-muted/40 p-3 flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <UserAvatar username={user.username} size="sm" />
                <div className="flex flex-col min-w-0 leading-tight">
                  <span className="text-xs font-bold truncate text-foreground">{user.username}</span>
                  <span className="text-[10px] text-muted-foreground truncate">{user.email}</span>
                </div>
              </div>
              <button
                onClick={logout}
                className="w-full rounded-xl bg-destructive/10 py-1.5 text-center text-xs font-bold text-destructive hover:bg-destructive/15 transition-all"
              >
                Cerrar Sesión
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="block w-full rounded-xl bg-primary py-2 text-center text-xs font-bold text-primary-foreground hover:bg-primary/95 transition-all shadow-md"
            >
              Iniciar Sesión
            </Link>
          )}

          <div className="flex items-center justify-between px-3 text-[10px] text-muted-foreground">
            <span>Experiencia PEGALO</span>
            <span>v1.0</span>
          </div>
        </div>
      </nav>
    </header>
  );
}

function PegaloLogo({ size = 32 }: { size?: number }) {
  return (
    <img
      src="/logo.png"
      alt="PEGALO"
      className="object-contain rounded-xl"
      style={{ width: size, height: size }}
    />
  );
}
