"use client";

import React from "react";

interface UserAvatarProps {
  username: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function UserAvatar({ username, size = "md", className = "" }: UserAvatarProps) {
  const firstLetter = username ? username.charAt(0).toUpperCase() : "?";

  // Define dimension classes for different sizes
  const sizeClasses = {
    sm: {
      container: "h-8 w-8 text-sm border",
      badge: "h-3.5 w-3.5 text-[8px] -right-0.5 -bottom-0.5",
    },
    md: {
      container: "h-10 w-10 text-base border-2",
      badge: "h-4.5 w-4.5 text-[10px] -right-0.5 -bottom-0.5",
    },
    lg: {
      container: "h-16 w-16 text-2xl border-2",
      badge: "h-6 w-6 text-sm -right-1 -bottom-1",
    },
    xl: {
      container: "h-24 w-24 text-4xl border-2",
      badge: "h-8 w-8 text-lg -right-1.5 -bottom-1.5",
    },
  };

  const currentSize = sizeClasses[size] || sizeClasses.md;

  return (
    <div
      className={`relative flex items-center justify-center rounded-full bg-gradient-to-br from-pegalo-red to-pegalo-blue font-black text-white shadow-md border-background select-none shrink-0 ${currentSize.container} ${className}`}
    >
      <span>{firstLetter}</span>
      {/* Small soccer ball badge on the right side of the circle */}
      <div
        className={`absolute flex items-center justify-center rounded-full bg-white shadow-sm border border-border/80 ${currentSize.badge}`}
        style={{ pointerEvents: "none" }}
      >
        ⚽
      </div>
    </div>
  );
}
