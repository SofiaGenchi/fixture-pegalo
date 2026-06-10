"use client";

import { useState, Suspense } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

function LoginForm() {
  const { login, signup, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // If already logged in, redirect immediately
  if (user) {
    router.push(redirect);
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (isLogin) {
      const res = await login(username, password);
      if (res.success) {
        setSuccess("¡Ingreso exitoso! Redirigiendo...");
        setTimeout(() => {
          router.push(redirect);
          router.refresh();
        }, 1000);
      } else {
        setError(res.error || "Ocurrió un error al ingresar.");
      }
    } else {
      const res = await signup(username, email, password);
      if (res.success) {
        setSuccess("¡Cuenta creada con éxito! Redirigiendo...");
        setTimeout(() => {
          router.push(redirect);
          router.refresh();
        }, 1000);
      } else {
        setError(res.error || "Ocurrió un error al registrarse.");
      }
    }
  };

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center py-6">
      <div className="w-full max-w-md rounded-3xl border border-border/60 bg-card/70 backdrop-blur-xl p-6 shadow-xl relative overflow-hidden">
        {/* Accent Glow */}
        <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-pegalo-red/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 h-40 w-40 rounded-full bg-pegalo-blue/10 blur-3xl pointer-events-none" />

        <div className="text-center mb-6">
          <img
            src="/logo.png"
            alt="PEGALO FIXTURE"
            className="h-16 w-16 mx-auto mb-3 object-contain rounded-xl shadow-md"
          />
          <h1 className="text-xl font-black tracking-tight">
            PEGALO <span className="text-pegalo-blue">FIXTURE</span>
          </h1>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mt-0.5">
            MUNDIAL 2026
          </p>
        </div>

        {/* Tab Selector */}
        <div className="grid grid-cols-2 gap-1 rounded-xl bg-muted p-1 mb-6">
          <button
            onClick={() => {
              setIsLogin(true);
              setError(null);
              setSuccess(null);
            }}
            className={`rounded-lg py-2 text-xs font-bold transition-all ${
              isLogin
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Ingresar
          </button>
          <button
            onClick={() => {
              setIsLogin(false);
              setError(null);
              setSuccess(null);
            }}
            className={`rounded-lg py-2 text-xs font-bold transition-all ${
              !isLogin
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Crear Cuenta
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-xs font-semibold text-red-600 dark:text-red-400">
            ⚠️ {error}
          </div>
        )}

        {success && (
          <div className="mb-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            ✅ {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground">
              Nombre de Usuario
            </label>
            <input
              type="text"
              required
              placeholder="Ej. messi10"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-xl border border-border/80 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {!isLogin && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground">
                Email
              </label>
              <input
                type="email"
                required
                placeholder="nombre@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-border/80 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground">
              Contraseña
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-border/80 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <Button type="submit" className="w-full mt-2 font-bold bg-primary hover:bg-primary/95 text-primary-foreground">
            {isLogin ? "Iniciar Sesión" : "Registrarme y Pronosticar"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
