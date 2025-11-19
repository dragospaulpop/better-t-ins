import { FolderIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface AppTitleProps {
  size?: "small" | "large";
  open?: boolean;
}

const sizes = {
  small: {
    logoHeight: 24,
    logoWidth: 24,
    fontSize: "text-2xl",
    iconSize: "size-12",
    logoPadding: "p-0.5",
    logoMargin: "mt-1",
  },
  large: {
    logoHeight: 56,
    logoWidth: 56,
    fontSize: "text-5xl",
    iconSize: "size-28",
    logoPadding: "p-1",
    logoMargin: "mt-4",
  },
};

export default function AppTitle({
  size = "large",
  open = true,
}: AppTitleProps) {
  return (
    <h1
      className={cn(
        "mb-2 flex items-center justify-center rounded-lg font-semibold tracking-tight",
        sizes[size].fontSize,
        "transition-all transition-discrete duration-300 ease-in-out",
        open ? "gap-2" : "gap-0 px-0"
      )}
    >
      <div
        className={cn(
          "grid place-items-center",
          open ? "scale-100" : "scale-50"
        )}
      >
        <img
          alt="Logo"
          className={cn(
            "z-20 col-start-1 row-start-1 rounded-full bg-logo-background",
            sizes[size].logoPadding,
            sizes[size].logoMargin
          )}
          height={sizes[size].logoHeight}
          src="/logo.png"
          width={sizes[size].logoWidth}
        />
        <FolderIcon
          absoluteStrokeWidth
          className={cn(
            "z-10 col-start-1 row-start-1 fill-logo-fill",
            sizes[size].iconSize
          )}
          strokeWidth={0}
        />
      </div>

      <div
        className={cn(
          "flex items-center justify-center gap-2 leading-none",
          "transition-all duration-300 ease-in-out",
          open
            ? "max-w-64 opacity-100 delay-100"
            : "max-w-0 overflow-hidden opacity-0 delay-0"
        )}
      >
        <span className="font-bold text-tud-blue">TUD</span>
        <span className="text-tud-green italic">Box</span>
      </div>
    </h1>
  );
}
