"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { getPointsLabel, getPointsBg } from "@/lib/data/utils";
import { getAllPredictions } from "@/lib/services/predictions.service";
import { getMatches } from "@/lib/services/matches.service";
import { Match, Prediction } from "@/types";
import { getTeamById } from "@/lib/data/teams";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { calculatePoints } from "@/lib/data/utils";
import { UserAvatar } from "@/components/user-avatar";
import { supabase, isSupabaseConfigured } from "@/lib/supabase-client";
import Link from "next/link";

export default function PerfilPage() {
  const { user, logout, updateUsername, updatePassword, deleteAccount } = useAuth();
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [standings, setStandings] = useState<{ points: number; rank: number; exactResults: number; totalPredictions: number } | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);

  // Settings states
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [settingsError, setSettingsError] = useState("");
  const [settingsSuccess, setSettingsSuccess] = useState("");
  const [isUsernameOpen, setIsUsernameOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const preds = await getAllPredictions();
      setPredictions(preds);
      const allMatches = await getMatches();
      setMatches(allMatches);

      if (isSupabaseConfigured && user) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const { data } = await supabase
              .from("user_standings_mv")
              .select("points, rank, exact_results, total_predictions")
              .eq("user_id", session.user.id)
              .maybeSingle();
            
            if (data) {
              setStandings({
                points: data.points,
                rank: data.rank,
                exactResults: data.exact_results,
                totalPredictions: data.total_predictions,
              });
            }
          }
        } catch (e) {
          console.error("Error fetching standings:", e);
        }
      } else {
        setStandings(null);
      }
    };
    loadData();
  }, [user]);

  if (!user) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center p-6 space-y-6">
        <div className="text-6xl">👤</div>
        <div className="space-y-2 max-w-sm">
          <h1 className="text-2xl font-black">Mi Perfil</h1>
          <p className="text-sm text-muted-foreground">
            Ingresá a tu cuenta para ver tus estadísticas de pronósticos, sumar puntos en el ranking y competir por premios.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
          <Link href="/login?redirect=/perfil" className="w-full">
            <Button className="w-full font-bold bg-primary hover:bg-primary/95 text-primary-foreground">
              Iniciar Sesión / Crear Cuenta
            </Button>
          </Link>
          <Link href="/" className="w-full">
            <Button variant="outline" className="w-full font-medium">
              Volver al Inicio
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Calculate stats from predictions
  let totalPoints = 0;
  let exactResults = 0;
  let correctDiffs = 0;
  let correctWinners = 0;
  let misses = 0;

  predictions.forEach((p) => {
    const match = matches.find(m => m.id === p.matchId);
    if (match?.status === "finished" && match.homeScore !== undefined && match.awayScore !== undefined) {
      const pts = calculatePoints(p.homeScore, p.awayScore, match.homeScore, match.awayScore);
      totalPoints += pts;
      if (pts === 3) exactResults++;
      else if (pts === 2) correctDiffs++;
      else if (pts === 1) correctWinners++;
      else misses++;
    }
  });

  const handleUpdateUsername = async () => {
    setSettingsError("");
    setSettingsSuccess("");
    const res = await updateUsername(newUsername);
    if (res.success) {
      setSettingsSuccess("Nombre de usuario actualizado con éxito.");
      setIsUsernameOpen(false);
      setNewUsername("");
    } else {
      setSettingsError(res.error || "Error al actualizar.");
    }
  };

  const handleUpdatePassword = async () => {
    setSettingsError("");
    setSettingsSuccess("");
    const res = await updatePassword(newPassword);
    if (res.success) {
      setSettingsSuccess("Contraseña actualizada con éxito.");
      setIsPasswordOpen(false);
      setNewPassword("");
    } else {
      setSettingsError(res.error || "Error al actualizar.");
    }
  };

  const handleDeleteAccount = async () => {
    setSettingsError("");
    const res = await deleteAccount();
    if (!res.success) {
      setSettingsError(res.error || "Error al eliminar la cuenta.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile header */}
      <div className="flex items-center gap-4 bg-card/40 border border-border/50 rounded-2xl p-4 shadow-sm">
        <UserAvatar username={user.username} size="lg" />
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold truncate text-foreground flex items-center gap-2">
            {user.username}
            {predictions.length > 0 && (
              <span className="text-sm bg-orange-500/20 text-orange-500 px-2 py-0.5 rounded-full" title="Racha activa">
                🔥 3 días
              </span>
            )}
          </h1>
          <p className="text-xs text-primary font-bold mt-1">
            {predictions.length} pronósticos realizados
          </p>
        </div>
        <div>
          <Button
            variant="outline"
            size="sm"
            onClick={logout}
            className="text-xs border-destructive/35 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all font-bold"
          >
            Cerrar Sesión
          </Button>
        </div>
      </div>

      {settingsError && <div className="text-xs font-bold text-red-500 bg-red-500/10 p-3 rounded-xl border border-red-500/20">{settingsError}</div>}
      {settingsSuccess && <div className="text-xs font-bold text-emerald-500 bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20">{settingsSuccess}</div>}

      {/* Settings Grid */}
      <div className="grid grid-cols-3 gap-2">
        <Dialog open={isUsernameOpen} onOpenChange={setIsUsernameOpen}>
          <DialogTrigger render={<Button variant="outline" size="sm" className="text-xs font-semibold h-10 w-full text-muted-foreground hover:text-foreground" />}>
            ✏️ Cambiar Nombre
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Cambiar nombre de usuario</DialogTitle>
              <DialogDescription>
                Elige un nuevo nombre único. Aparecerá así en el ranking público.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <input
                type="text"
                placeholder="Nuevo nombre"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="w-full rounded-xl border border-border/80 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsUsernameOpen(false)}>Cancelar</Button>
              <Button onClick={handleUpdateUsername}>Guardar Cambios</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isPasswordOpen} onOpenChange={setIsPasswordOpen}>
          <DialogTrigger render={<Button variant="outline" size="sm" className="text-xs font-semibold h-10 w-full text-muted-foreground hover:text-foreground" />}>
            🔒 Contraseña
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Cambiar Contraseña</DialogTitle>
              <DialogDescription>
                Ingresa tu nueva contraseña (mínimo 6 caracteres).
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <input
                type="password"
                placeholder="Nueva contraseña"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-xl border border-border/80 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsPasswordOpen(false)}>Cancelar</Button>
              <Button onClick={handleUpdatePassword}>Actualizar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <DialogTrigger render={<Button variant="outline" size="sm" className="text-xs font-semibold h-10 w-full text-destructive hover:bg-destructive/10 border-destructive/20" />}>
            🗑️ Eliminar
          </DialogTrigger>
          <DialogContent className="sm:max-w-md border-red-500/50">
            <DialogHeader>
              <DialogTitle className="text-red-500">¿Eliminar cuenta definitivamente?</DialogTitle>
              <DialogDescription>
                <strong className="text-foreground">ESTA ACCIÓN ES IRREVERSIBLE.</strong> Perderás todos tus pronósticos, tus puntos y serás borrado del ranking inmediatamente.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancelar</Button>
              <Button variant="destructive" onClick={handleDeleteAccount}>Sí, Eliminar Mi Cuenta</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-border/60 bg-card p-4 text-center">
          <p className="text-3xl font-bold text-primary">{standings?.points ?? totalPoints}</p>
          <p className="text-xs text-muted-foreground mt-1 font-semibold uppercase tracking-wider">Puntos Totales</p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card p-4 text-center">
          <p className="text-3xl font-bold">#{standings?.rank ?? 15}</p>
          <p className="text-xs text-muted-foreground mt-1 font-semibold uppercase tracking-wider">Posición</p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card p-4 text-center">
          <p className="text-3xl font-bold text-emerald-500">{standings?.exactResults ?? exactResults}</p>
          <p className="text-xs text-muted-foreground mt-1 font-semibold uppercase tracking-wider">Exactos</p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card p-4 text-center">
          <p className="text-3xl font-bold">{standings?.totalPredictions ?? predictions.length}</p>
          <p className="text-xs text-muted-foreground mt-1 font-semibold uppercase tracking-wider">Pronósticos</p>
        </div>
      </div>

      {/* Points breakdown */}
      <div className="rounded-2xl border border-border/60 bg-card p-4">
        <h3 className="text-sm font-bold mb-3">Desglose de Puntos</h3>
        <div className="space-y-2">
          <PointsRow label="Resultado exacto (+3 pts)" count={exactResults} color="bg-emerald-500" />
          <PointsRow label="Diferencia correcta (+2 pts)" count={correctDiffs} color="bg-blue-500" />
          <PointsRow label="Ganador correcto (+1 pt)" count={correctWinners} color="bg-amber-500" />
          <PointsRow label="Sin puntos" count={misses} color="bg-gray-300 dark:bg-gray-600" />
        </div>
      </div>

      <Separator />

      {/* Gamification / Medals */}
      <div>
        <h3 className="text-sm font-bold mb-3">🏅 Mis Logros</h3>
        <div className="grid grid-cols-3 gap-2">
          {predictions.length > 0 ? (
            <div className="flex flex-col items-center p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center">
              <span className="text-2xl mb-1">🥉</span>
              <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">Primer Paso</span>
            </div>
          ) : (
            <div className="flex flex-col items-center p-3 rounded-2xl bg-muted/30 border border-border/50 text-center opacity-50 grayscale">
              <span className="text-2xl mb-1">🔒</span>
              <span className="text-[10px] font-bold text-muted-foreground">Primer Paso</span>
            </div>
          )}

          {exactResults >= 5 ? (
            <div className="flex flex-col items-center p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-center">
              <span className="text-2xl mb-1">🎯</span>
              <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400">Francotirador</span>
            </div>
          ) : (
            <div className="flex flex-col items-center p-3 rounded-2xl bg-muted/30 border border-border/50 text-center opacity-50 grayscale">
              <span className="text-2xl mb-1">🔒</span>
              <span className="text-[10px] font-bold text-muted-foreground">Francotirador</span>
            </div>
          )}

          {predictions.length >= 10 ? (
            <div className="flex flex-col items-center p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-center">
              <span className="text-2xl mb-1">🌟</span>
              <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">Veterano</span>
            </div>
          ) : (
            <div className="flex flex-col items-center p-3 rounded-2xl bg-muted/30 border border-border/50 text-center opacity-50 grayscale">
              <span className="text-2xl mb-1">🔒</span>
              <span className="text-[10px] font-bold text-muted-foreground">Veterano</span>
            </div>
          )}
        </div>
      </div>

      <Separator />

      {/* Predictions history */}
      <div>
        <h3 className="text-sm font-bold mb-3">📋 Mis Pronósticos</h3>
        {predictions.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-muted/30 p-10 text-center">
            <span className="text-3xl mb-2">🎯</span>
            <p className="text-sm font-medium">Aún no hiciste pronósticos</p>
            <p className="text-xs text-muted-foreground mt-1">
              Andá al fixture y empezá a pronosticar
            </p>
            <Link href="/fixture" className="mt-4">
              <Button size="sm" className="text-xs font-bold text-primary-foreground bg-primary">
                Ver el Fixture
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {predictions.map((p) => {
              const match = matches.find(m => m.id === p.matchId);
              if (!match) return null;
              const home = getTeamById(match.homeTeamId);
              const away = getTeamById(match.awayTeamId);
              if (!home || !away) return null;

              const pts =
                match.status === "finished" && match.homeScore !== undefined && match.awayScore !== undefined
                  ? calculatePoints(p.homeScore, p.awayScore, match.homeScore, match.awayScore)
                  : null;

              return (
                <div
                  key={p.matchId}
                  className="flex items-center justify-between rounded-xl border border-border/40 bg-card px-3 py-2.5"
                >
                  <div className="flex items-center gap-2 text-xs">
                    <span>{home.flag}</span>
                    <span className="font-medium">
                      {home.code} {p.homeScore}-{p.awayScore} {away.code}
                    </span>
                    <span>{away.flag}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {match.status === "finished" ? (
                      <>
                        <span className="text-[10px] text-muted-foreground">
                          Real: {match.homeScore}-{match.awayScore}
                        </span>
                        {pts !== null && (
                          <Badge className={`text-[9px] ${getPointsBg(pts)}`}>
                            +{pts}
                          </Badge>
                        )}
                      </>
                    ) : (
                      <Badge variant="secondary" className="text-[9px]">
                        ⏳ Pendiente
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* PEGALO footer */}
      <div className="flex items-center justify-center gap-2 py-4 text-xs text-muted-foreground">
        <span>Una experiencia</span>
        <span className="font-bold text-foreground">PEGALO</span>
      </div>
    </div>
  );
}

// PointsRow helper component
function PointsRow({
  label,
  count,
  color,
}: {
  label: string;
  count: number;
  color: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className={`h-2.5 w-2.5 rounded-full ${color}`} />
        <span className="text-xs">{label}</span>
      </div>
      <span className="text-xs font-bold tabular-nums">{count}</span>
    </div>
  );
}
