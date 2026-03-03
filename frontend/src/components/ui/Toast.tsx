import toast, { Toaster as HotToaster } from "react-hot-toast";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";
import { cn } from "../../lib/utils";

export function Toaster() {
  return (
    <HotToaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: "white",
          color: "#1e293b",
          borderRadius: "12px",
          padding: "12px 16px",
          boxShadow: "0 10px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.08)",
          border: "1px solid #e2e8f0",
          fontSize: "14px",
          maxWidth: "400px",
        },
      }}
    />
  );
}

interface ToastOptions {
  description?: string;
  duration?: number;
}

function createToast(
  message: string,
  icon: React.ReactNode,
  iconColor: string,
  options?: ToastOptions,
) {
  return toast.custom(
    (t) => (
      <div
        className={cn(
          "flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-lg transition-all",
          t.visible ? "animate-fade-in" : "opacity-0",
        )}
        style={{ maxWidth: "400px" }}
      >
        <span className={cn("shrink-0 mt-0.5", iconColor)}>{icon}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900">{message}</p>
          {options?.description && (
            <p className="mt-1 text-sm text-gray-500">{options.description}</p>
          )}
        </div>
        <button
          onClick={() => toast.dismiss(t.id)}
          className="shrink-0 rounded-md p-1 text-gray-400 hover:text-gray-600"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    ),
    { duration: options?.duration ?? 4000 },
  );
}

export const showToast = {
  success: (message: string, options?: ToastOptions) =>
    createToast(message, <CheckCircle className="h-5 w-5" />, "text-success-500", options),
  error: (message: string, options?: ToastOptions) =>
    createToast(message, <XCircle className="h-5 w-5" />, "text-danger-500", options),
  warning: (message: string, options?: ToastOptions) =>
    createToast(message, <AlertTriangle className="h-5 w-5" />, "text-warning-500", options),
  info: (message: string, options?: ToastOptions) =>
    createToast(message, <Info className="h-5 w-5" />, "text-primary-500", options),
};
