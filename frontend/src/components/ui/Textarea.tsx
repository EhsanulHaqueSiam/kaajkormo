import { forwardRef, useRef, useEffect, type TextareaHTMLAttributes } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../lib/utils";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  maxLength?: number;
  autoResize?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, maxLength, autoResize = true, className, id, value, onChange, ...props }, ref) => {
    const internalRef = useRef<HTMLTextAreaElement | null>(null);
    const charCount = typeof value === "string" ? value.length : 0;

    useEffect(() => {
      if (!autoResize || !internalRef.current) return;
      const el = internalRef.current;
      el.style.height = "auto";
      el.style.height = el.scrollHeight + "px";
    }, [value, autoResize]);

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={id}
            className="mb-1.5 block text-sm font-medium text-gray-700"
          >
            {label}
          </label>
        )}
        <textarea
          ref={(el) => {
            internalRef.current = el;
            if (typeof ref === "function") ref(el);
            else if (ref) ref.current = el;
          }}
          id={id}
          value={value}
          maxLength={maxLength}
          onChange={onChange}
          className={cn(
            "w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm shadow-sm transition-all duration-200 placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:bg-gray-50 disabled:text-gray-500",
            error && "border-danger-500 focus:border-danger-500 focus:ring-danger-500/20",
            autoResize && "resize-none overflow-hidden",
            className,
          )}
          rows={4}
          {...props}
        />
        <div className="mt-1 flex items-center justify-between">
          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="text-sm text-danger-600"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>
          {maxLength && (
            <span
              className={cn(
                "ml-auto text-xs",
                charCount > maxLength * 0.9 ? "text-danger-600" : "text-gray-400",
              )}
            >
              {charCount}/{maxLength}
            </span>
          )}
        </div>
      </div>
    );
  },
);

Textarea.displayName = "Textarea";
