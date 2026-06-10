"use client";

import React, { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { InfoIcon, Trophy, Target, Medal, XCircle } from "lucide-react";

export function PointsInfoSheet() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<Button variant="outline" size="sm" className="gap-2 rounded-full border-primary/30 bg-primary/5 text-primary hover:bg-primary/10" />}>
        <InfoIcon className="h-4 w-4" />
        <span className="text-xs font-bold">¿Cómo sumar puntos?</span>
      </SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-3xl border-t border-border/50 bg-background/95 backdrop-blur-xl pb-10">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-center text-xl font-black flex items-center justify-center gap-2">
            <Trophy className="text-primary h-6 w-6" />
            Sistema de Puntuación
          </SheetTitle>
        </SheetHeader>
        
        <div className="space-y-4 px-2">
          <div className="flex gap-4 items-start rounded-2xl bg-emerald-500/10 p-4 border border-emerald-500/20">
            <div className="bg-emerald-500/20 p-2 rounded-full text-emerald-500">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">Resultado Exacto (+3 pts)</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Acertás al ganador y a la cantidad exacta de goles de ambos equipos.
                <br/><span className="font-mono mt-1 block">Pronóstico: 2-1 | Real: 2-1</span>
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start rounded-2xl bg-blue-500/10 p-4 border border-blue-500/20">
            <div className="bg-blue-500/20 p-2 rounded-full text-blue-500">
              <Medal className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-bold text-blue-600 dark:text-blue-400 text-sm">Diferencia Correcta (+2 pts)</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Acertás al ganador y la diferencia de goles es la misma, pero no el resultado exacto. Aplica también a empates (ej: pusiste 0-0, sale 1-1).
                <br/><span className="font-mono mt-1 block">Pronóstico: 2-0 | Real: 3-1</span>
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start rounded-2xl bg-amber-500/10 p-4 border border-amber-500/20">
            <div className="bg-amber-500/20 p-2 rounded-full text-amber-500">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-bold text-amber-600 dark:text-amber-400 text-sm">Ganador Correcto (+1 pt)</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Acertás qué equipo gana el partido, pero fallás en los goles y la diferencia.
                <br/><span className="font-mono mt-1 block">Pronóstico: 1-0 | Real: 3-0</span>
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start rounded-2xl bg-muted p-4 border border-border/50">
            <div className="bg-muted-foreground/20 p-2 rounded-full text-muted-foreground">
              <XCircle className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-bold text-foreground text-sm">Sin Puntos (0 pts)</h4>
              <p className="text-xs text-muted-foreground mt-1">
                No acertás al ganador.
                <br/><span className="font-mono mt-1 block">Pronóstico: 1-0 | Real: 0-1</span>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <Button className="w-full font-bold" onClick={() => setOpen(false)}>
            Entendido
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
