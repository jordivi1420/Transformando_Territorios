import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

const Progress = React.forwardRef(({ className, value, ...props }, ref) => {
  const progress = Math.min(100, Math.max(0, Number(value) || 0));

  return (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-3 w-full overflow-hidden rounded-full",
      className
    )}
    style={{ backgroundColor: "#EAD7C1" }}
    aria-label="Progreso de la iniciativa"
    {...props}>
    <ProgressPrimitive.Indicator
      className="h-full w-full flex-1 transition-all duration-500"
      style={{ transform: `translateX(-${100 - progress}%)`, backgroundColor: "#C75A3B" }} />
  </ProgressPrimitive.Root>
  );
})
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
