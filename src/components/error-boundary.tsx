"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[50vh] flex-col items-center justify-center p-6 text-center space-y-4">
          <span className="text-6xl">⚠️</span>
          <h2 className="text-xl font-bold text-foreground">¡Uy! Algo salió mal.</h2>
          <p className="text-sm text-muted-foreground max-w-md">
            Ocurrió un error inesperado al cargar esta sección. Refrescá la página para volver a intentar.
          </p>
          <Button 
            onClick={() => window.location.reload()}
            className="mt-4"
          >
            Refrescar Página
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
