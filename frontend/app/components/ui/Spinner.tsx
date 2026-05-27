import { cn } from "../../lib/utils";

interface SpinnerProps {
  className?: string;
}

export function Spinner({ className }: SpinnerProps) {
  return (
    <div
      className={cn(
        "inline-block w-5 h-5 rounded-full border-2 border-current border-t-transparent animate-spin",
        className,
      )}
      role="status"
      aria-label="Loading"
    />
  );
}
