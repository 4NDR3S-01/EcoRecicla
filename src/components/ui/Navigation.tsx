import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

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
  const pathname = usePathname();
  return (
    <nav
      className={cn("flex items-center space-x-6", className)}
      role="navigation"
      aria-label="Menú principal"
    >
      {items.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onItemClick}
            className={cn(
              "flex items-center space-x-2 text-sm font-medium transition-colors duration-200 px-2 py-1 rounded-md text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
              isActive
                ? "font-bold border-b-2 border-primary bg-primary/10 shadow text-primary"
                : "",
              !isActive && "hover:bg-green-100 hover:text-primary dark:hover:bg-green-900 dark:hover:text-green-100 hover:shadow"
            )}
            aria-current={isActive ? "page" : undefined}
            tabIndex={0}
            aria-label={item.label}
          >
            <span className="text-lg" aria-hidden="true">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

interface MobileNavigationProps {
  items: readonly NavigationItem[];
  isOpen: boolean;
  onItemClick?: () => void;
}

export function MobileNavigation({ items, isOpen, onItemClick }: MobileNavigationProps) {
  const pathname = usePathname();
  if (!isOpen) return null;

  return (
    <nav
      className="md:hidden"
      role="navigation"
      aria-label="Menú principal móvil"
    >
      <div className="space-y-1 px-4 pb-3 pt-2">
        {items.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onItemClick}
              className={cn(
                "flex items-center space-x-3 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200 text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                isActive
                  ? "bg-primary/10 text-primary font-bold shadow"
                  : "",
                !isActive && "hover:bg-green-100 hover:text-primary dark:hover:bg-green-900 dark:hover:text-green-100 hover:shadow"
              )}
              aria-current={isActive ? "page" : undefined}
              tabIndex={0}
              aria-label={item.label}
            >
              <span className="text-lg" aria-hidden="true">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
} 