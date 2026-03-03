import { AnimatePresence, motion } from "framer-motion";
import { forwardRef, type InputHTMLAttributes, type ReactNode, useState } from "react";
import { cn } from "../../lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { label, error, leadingIcon, trailingIcon, className, id, value, defaultValue, ...props },
    ref,
  ) => {
    const [focused, setFocused] = useState(false);
    const hasValue = value !== undefined ? Boolean(value) : Boolean(defaultValue);
    const isFloating = focused || hasValue;

    return (
      <div className="w-full">
        <div className="relative">
          {leadingIcon && (
            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-surface-400">
              {leadingIcon}
            </div>
          )}
          <input
            ref={ref}
            id={id}
            value={value}
            defaultValue={defaultValue}
            className={cn(
              "peer w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm shadow-sm transition-all duration-200 placeholder:text-transparent focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:bg-gray-50 disabled:text-gray-500",
              error && "border-danger-500 focus:border-danger-500 focus:ring-danger-500/20",
              leadingIcon && "pl-10",
              trailingIcon && "pr-10",
              label && "pt-5 pb-1.5",
              className,
            )}
            placeholder={label || props.placeholder || " "}
            onFocus={(e) => {
              setFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              props.onBlur?.(e);
            }}
            {...props}
          />
          {label && (
            <label
              htmlFor={id}
              className={cn(
                "absolute left-3 transition-all duration-200 pointer-events-none",
                leadingIcon && "left-10",
                isFloating
                  ? "top-1.5 text-xs font-medium text-primary-600"
                  : "top-1/2 -translate-y-1/2 text-sm text-gray-500",
                error && isFloating && "text-danger-600",
              )}
            >
              {label}
            </label>
          )}
          {trailingIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400">
              {trailingIcon}
            </div>
          )}
        </div>
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="mt-1.5 text-sm text-danger-600"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  },
);

Input.displayName = "Input";
