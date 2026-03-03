import { AnimatePresence, motion } from "framer-motion";
import { type ReactNode, useState } from "react";
import { cn } from "../../lib/utils";

interface TooltipProps {
  content: string;
  children: ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  className?: string;
}

const positionStyles = {
  top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
  bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
  left: "right-full top-1/2 -translate-y-1/2 mr-2",
  right: "left-full top-1/2 -translate-y-1/2 ml-2",
};

const arrowStyles = {
  top: "top-full left-1/2 -translate-x-1/2 border-t-gray-900",
  bottom: "bottom-full left-1/2 -translate-x-1/2 border-b-gray-900",
  left: "left-full top-1/2 -translate-y-1/2 border-l-gray-900",
  right: "right-full top-1/2 -translate-y-1/2 border-r-gray-900",
};

export function Tooltip({ content, children, position = "top", className }: TooltipProps) {
  const [show, setShow] = useState(false);

  return (
    <div
      className={cn("relative inline-flex", className)}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.1 }}
            className={cn(
              "pointer-events-none absolute z-50 whitespace-nowrap rounded-md bg-gray-900 px-2.5 py-1.5 text-xs text-white shadow-lg",
              positionStyles[position],
            )}
          >
            {content}
            <span
              className={cn("absolute h-0 w-0 border-4 border-transparent", arrowStyles[position])}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
