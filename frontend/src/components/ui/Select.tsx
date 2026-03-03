import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, Search } from "lucide-react";
import { forwardRef, useEffect, useRef, useState } from "react";
import { cn } from "../../lib/utils";

interface SelectOption {
  value: string;
  label: string;
  group?: string;
}

interface SelectProps {
  label?: string;
  error?: string;
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  searchable?: boolean;
  className?: string;
  id?: string;
  disabled?: boolean;
  name?: string;
}

export const Select = forwardRef<HTMLInputElement, SelectProps>(
  (
    {
      label,
      error,
      options,
      value,
      onChange,
      placeholder = "Select...",
      searchable = false,
      className,
      id,
      disabled,
      name,
    },
    ref,
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find((o) => o.value === value);

    const filteredOptions = search
      ? options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()))
      : options;

    // Group options
    const groups = new Map<string, SelectOption[]>();
    for (const opt of filteredOptions) {
      const key = opt.group || "";
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(opt);
    }

    useEffect(() => {
      const handleClick = (e: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
          setIsOpen(false);
          setSearch("");
        }
      };
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    return (
      <div className={cn("w-full", className)} ref={containerRef}>
        {/* Hidden input for form support */}
        <input type="hidden" name={name} value={value || ""} ref={ref} />

        {label && (
          <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}

        <button
          type="button"
          id={id}
          disabled={disabled}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={cn(
            "flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-left text-sm shadow-sm transition-all duration-200 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:bg-gray-50 disabled:cursor-not-allowed",
            error && "border-danger-500 focus:border-danger-500 focus:ring-danger-500/20",
            isOpen && "border-primary-500 ring-2 ring-primary-500/20",
          )}
        >
          <span className={selectedOption ? "text-gray-900" : "text-gray-500"}>
            {selectedOption?.label || placeholder}
          </span>
          <ChevronDown
            className={cn(
              "h-4 w-4 text-gray-400 transition-transform duration-200",
              isOpen && "rotate-180",
            )}
          />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="absolute z-50 mt-1 w-full max-h-60 overflow-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
              style={{ minWidth: containerRef.current?.offsetWidth }}
            >
              {searchable && (
                <div className="border-b border-gray-100 p-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      className="w-full rounded-md border-0 bg-gray-50 py-1.5 pl-8 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                      placeholder="Search..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {Array.from(groups.entries()).map(([group, opts]) => (
                <div key={group}>
                  {group && (
                    <div className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400">
                      {group}
                    </div>
                  )}
                  {opts.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      className={cn(
                        "flex w-full items-center justify-between px-3 py-2 text-sm transition-colors hover:bg-primary-50",
                        opt.value === value && "bg-primary-50 text-primary-700",
                      )}
                      onClick={() => {
                        onChange?.(opt.value);
                        setIsOpen(false);
                        setSearch("");
                      }}
                    >
                      {opt.label}
                      {opt.value === value && <Check className="h-4 w-4 text-primary-600" />}
                    </button>
                  ))}
                </div>
              ))}

              {filteredOptions.length === 0 && (
                <div className="px-3 py-4 text-center text-sm text-gray-500">No options found</div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {error && <p className="mt-1.5 text-sm text-danger-600">{error}</p>}
      </div>
    );
  },
);

Select.displayName = "Select";
