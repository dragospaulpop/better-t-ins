import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  `inline-flex shrink-0 items-center
  justify-center gap-2 whitespace-nowrap


  rounded-md font-medium text-sm outline-none
  transition-all focus-visible:border-ring
  focus-visible:ring-[3px] focus-visible:ring-ring/50
  disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive
  aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40
  [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0`,
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/80 active:bg-primary/50 dark:active:bg-primary/40 dark:hover:bg-primary/50",
        destructive:
          "bg-destructive text-white hover:bg-destructive/80 focus-visible:ring-destructive/20 active:bg-destructive/50 dark:bg-destructive/60 dark:active:bg-destructive/40 dark:focus-visible:ring-destructive/40 dark:hover:bg-destructive/50",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground active:bg-background/50 dark:border-input dark:bg-input/30 dark:active:bg-input/40 dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 active:bg-secondary/50 dark:active:bg-secondary/40 dark:hover:bg-secondary/50",
        ghost:
          "hover:bg-accent hover:text-accent-foreground active:bg-accent/75 dark:active:bg-accent/40 dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline active:text-primary/75",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 gap-1.5 rounded-md px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        "icon-xs": "size-6",
        "icon-sm": "size-8",
        icon: "size-9",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      data-slot="button"
      {...props}
    />
  );
}

export { Button, buttonVariants };
