import { Camera } from "lucide-react";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { cn, getInitials } from "../../lib/utils";

interface PhotoUploadProps {
  onFileSelect: (file: File) => void;
  currentUrl?: string | null;
  name?: string;
  size?: "md" | "lg" | "xl";
  className?: string;
}

const sizes = {
  md: "h-20 w-20",
  lg: "h-28 w-28",
  xl: "h-36 w-36",
};

export function PhotoUpload({
  onFileSelect,
  currentUrl,
  name = "",
  size = "lg",
  className,
}: PhotoUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setPreview(URL.createObjectURL(file));
        onFileSelect(file);
      }
    },
    [onFileSelect],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".webp"] },
    maxSize: 5 * 1024 * 1024,
    multiple: false,
  });

  const imageUrl = preview || currentUrl;

  return (
    <div
      {...getRootProps()}
      className={cn(
        "group relative cursor-pointer rounded-full transition-all",
        sizes[size],
        className,
      )}
    >
      <input {...getInputProps()} />

      {imageUrl ? (
        <img
          src={imageUrl}
          alt="Profile photo"
          className={cn("rounded-full object-cover", sizes[size])}
        />
      ) : (
        <div
          className={cn(
            "flex items-center justify-center rounded-full bg-primary-100 text-2xl font-semibold text-primary-700",
            sizes[size],
          )}
        >
          {getInitials(name)}
        </div>
      )}

      <div
        className={cn(
          "absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100",
          isDragActive && "opacity-100",
        )}
      >
        <Camera className="h-6 w-6 text-white" />
      </div>
    </div>
  );
}
