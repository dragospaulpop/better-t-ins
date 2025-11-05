import {
  Indicator as ProgressPrimitiveIndicator,
  Root as ProgressPrimitiveRoot,
} from "@radix-ui/react-progress";
import type * as React from "react";

import { cn } from "@/lib/utils";

const PROGRESS_INDICATOR_TRANSFORM_X = 100;
function Progress({
  rootClassName,
  indicatorClassName,
  value,
  ...props
}: React.ComponentProps<typeof ProgressPrimitiveRoot> & {
  rootClassName?: string;
  indicatorClassName?: string;
}) {
  return (
    <ProgressPrimitiveRoot
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-primary/20",
        rootClassName
      )}
      data-slot="progress"
      {...props}
    >
      <ProgressPrimitiveIndicator
        className={cn(
          "h-full w-full flex-1 bg-primary transition-all",
          indicatorClassName
        )}
        data-slot="progress-indicator"
        style={{
          transform: `translateX(-${PROGRESS_INDICATOR_TRANSFORM_X - (value || 0)}%)`,
        }}
      />
    </ProgressPrimitiveRoot>
  );
}

export { Progress };
