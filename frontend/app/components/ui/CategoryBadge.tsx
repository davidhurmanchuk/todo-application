interface CategoryBadgeProps {
  name: string;
  color: string;
  small?: boolean;
}

export function CategoryBadge({ name, color, small }: CategoryBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${small ? "text-xs px-2 py-0.5" : "text-xs px-2.5 py-1"}`}
      style={{ backgroundColor: `${color}18`, color }}
    >
      <span
        className="rounded-full shrink-0"
        style={{
          width: small ? 5 : 6,
          height: small ? 5 : 6,
          backgroundColor: color,
        }}
      />
      {name}
    </span>
  );
}
