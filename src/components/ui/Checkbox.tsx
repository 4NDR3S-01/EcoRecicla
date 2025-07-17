import React from "react";
import { cn } from "@/lib/utils";

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, error, id, name, ...props }, ref) => {
    const checkboxId = id ?? (name ? `checkbox-${name}` : undefined);

    return (
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id={checkboxId}
          name={name}
          className={cn(
            "rounded border-input focus:ring-2 focus:ring-ring focus:ring-offset-2",
            error && "border-destructive focus:ring-destructive",
            className
          )}
          ref={ref}
          {...props}
        />
        {label && (
          <label htmlFor={checkboxId} className="text-sm text-foreground">
            {label}
          </label>
        )}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";
export { Checkbox };