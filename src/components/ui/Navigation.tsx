import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface NavigationItem {
  readonly href: string;
  readonly label: string;
  readonly icon: string;
}

interface NavigationProps {
  items: readonly NavigationItem[];
  className?: string;
  onItemClick?: () => void;
}

// --- Componente Navigation: navegación accesible y reutilizable para desktop y móvil ---
export function Navigation({ items, className, onItemClick }: NavigationProps) {
  return (
    <nav className={cn("flex items-center space-x-6", className)}>
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={onItemClick}
          className="flex items-center space-x-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <span className="text-lg">{item.icon}</span>
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}

interface MobileNavigationProps {
  items: readonly NavigationItem[];
  isOpen: boolean;
  onItemClick?: () => void;
}

export function MobileNavigation({ items, isOpen, onItemClick }: MobileNavigationProps) {
  if (!isOpen) return null;

  return (
    <div className="md:hidden">
      <div className="space-y-1 px-4 pb-3 pt-2">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onItemClick}
            className="flex items-center space-x-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <span className="text-lg">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
} 