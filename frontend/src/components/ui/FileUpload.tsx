import { CheckCircle, FileText, Upload, X } from "lucide-react";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { cn } from "../../lib/utils";
import { ProgressBar } from "./Progress";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: Record<string, string[]>;
  maxSize?: number; // bytes
  label?: string;
  description?: string;
  progress?: number;
  uploaded?: boolean;
  className?: string;
}

export function FileUpload({
  onFileSelect,
  accept,
  maxSize = 10 * 1024 * 1024, // 10MB
  label = "Upload a file",
  description = "Drag & drop or click to browse",
  progress,
  uploaded,
  className,
}: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: unknown[]) => {
      if (rejectedFiles.length > 0) {
        setError(`Invalid file. Max size: ${Math.round(maxSize / 1024 / 1024)}MB`);
        return;
      }
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setSelectedFile(file);
        setError(null);
        onFileSelect(file);
      }
    },
    [maxSize, onFileSelect],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple: false,
  });

  return (
    <div className={cn("w-full", className)}>
      <div
        {...getRootProps()}
        className={cn(
          "cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition-all duration-200",
          isDragActive
            ? "border-primary-400 bg-primary-50"
            : "border-gray-300 bg-gray-50 hover:border-primary-300 hover:bg-gray-100",
          uploaded && "border-success-400 bg-success-50",
        )}
      >
        <input {...getInputProps()} />

        {uploaded ? (
          <div className="flex flex-col items-center gap-2">
            <CheckCircle className="h-10 w-10 text-success-500" />
            <p className="text-sm font-medium text-success-700">Upload complete!</p>
          </div>
        ) : selectedFile ? (
          <div className="flex flex-col items-center gap-2">
            <FileText className="h-10 w-10 text-primary-500" />
            <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
            <p className="text-xs text-gray-500">{(selectedFile.size / 1024).toFixed(1)} KB</p>
            {progress !== undefined && progress < 100 && (
              <ProgressBar value={progress} size="sm" className="mt-2 max-w-xs" />
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload
              className={cn("h-10 w-10", isDragActive ? "text-primary-500" : "text-gray-400")}
            />
            <p className="text-sm font-medium text-gray-700">{label}</p>
            <p className="text-xs text-gray-500">{description}</p>
          </div>
        )}
      </div>

      {error && <p className="mt-2 text-sm text-danger-600">{error}</p>}

      {selectedFile && !uploaded && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedFile(null);
            setError(null);
          }}
          className="mt-2 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <X className="h-3.5 w-3.5" />
          Remove
        </button>
      )}
    </div>
  );
}
