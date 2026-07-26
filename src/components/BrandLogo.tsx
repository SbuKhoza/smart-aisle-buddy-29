import { ShoppingBasket } from "lucide-react";

export function BrandLogo({ size = 40 }: { size?: number }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="flex items-center justify-center rounded-2xl text-primary-foreground shadow-[var(--shadow-elegant)]"
        style={{
          width: size,
          height: size,
          background: "var(--gradient-primary)",
        }}
      >
        <ShoppingBasket size={size * 0.55} />
      </div>
      <div className="flex flex-col leading-tight">
        <span className="text-lg font-bold tracking-tight text-secondary">
          AISLE SPY
        </span>
        <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Smart Shopping
        </span>
      </div>
    </div>
  );
}