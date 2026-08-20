import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  type DragEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { Eye, Trash2, File as FileIcon, FileText, Image as ImageIcon, List, InfoIcon, Upload } from "lucide-react";
import { MultiImageViewer } from "@/ui/components/ImageViewer/ImageViewer";
import useToast from "@/core/hooks/useToast";
import { THEME } from "@/core/constants";

export type FileValue = globalThis.File | string;
type MultiFilePickerVariant = "input" | "dropzone";
type MultiFilePickerTone = "indigo" | "blue" | "coral";
type MultiFilePickerDropzoneSize = "default" | "compact";

interface MultiFilePickerProps {
  label?: string;
  required?: boolean;
  allowedTypes?: string[];
  maxSizeMB?: number;
  maxFiles?: number;
  value: FileValue[];
  availableFilesURL?: string | (string | File)[] | null;
  onChange: (files: FileValue[]) => void;
  placeholder?: string;
  error?: string;
  size?: "sm" | "md" | "lg";
  onRemoveExisting?: (url: string) => void;
  disabled?: boolean;
  variant?: MultiFilePickerVariant;
  dropzoneTitle?: ReactNode;
  dropzoneDescription?: string;
  dropzoneIcon?: ReactNode;
  dropzoneTone?: MultiFilePickerTone;
  dropzoneSize?: MultiFilePickerDropzoneSize;
  className?: string;
}

const dropzoneToneClasses: Record<MultiFilePickerTone, string> = {
  indigo: "bg-[#E3E5FF] text-[#235EEE]",
  blue: "bg-[#DCEBFF] text-[#3B5F8F]",
  coral: "bg-[#FFE2D9] text-[#D85B36]",
};

/* ================= Helpers ================= */

const normalizeAvailableFiles = (input?: string | (string | File)[] | null): string[] | undefined => {
  if (!input) return undefined;

  if (typeof input === "string") {
    const t = input.trim();
    return t
      ? t
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : undefined;
  }

  if (Array.isArray(input)) {
    const onlyStrings = input.filter((i) => typeof i === "string") as string[];
    return onlyStrings.length ? onlyStrings : undefined;
  }

  return undefined;
};

/* ================= Component ================= */

export const MultiFilePicker: React.FC<MultiFilePickerProps> = ({
  label,
  required,
  allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf", "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/octet-stream", "text/csv"],
  maxFiles = 100,
  value,
  availableFilesURL,
  onChange,
  placeholder = "Select Excel File(s)",
  error,
  size = "md",
  onRemoveExisting,
  disabled = false,
  variant = "input",
  dropzoneTitle,
  dropzoneDescription = "Click or drag to upload",
  dropzoneIcon,
  dropzoneTone = "blue",
  dropzoneSize = "default",
  className = "",
}) => {
  const theme = THEME;

  const sizeConfig = {
    sm: {
      height: "36px",
      padding: `${theme.spacing.sm} ${theme.spacing.md}`,
      fontSize: theme.fontSize.sm,
      iconSize: "16px",
    },
    md: {
      height: "44px",
      padding: `${theme.spacing.md} ${theme.spacing.lg}`,
      fontSize: theme.fontSize.md,
      iconSize: "20px",
    },
    lg: {
      height: "52px",
      padding: `${theme.spacing.lg} ${theme.spacing.xl}`,
      fontSize: theme.fontSize.lg,
      iconSize: "24px",
    },
  };

  const currentSize = sizeConfig[size];

  const anchorRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [isListOpen, setIsListOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  /* ===== PORTAL POSITION STATE (ONLY ADDITION) ===== */

  const DRAWER_HEIGHT = 260;

  const [portalPos, setPortalPos] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);

  const updatePortalPosition = useCallback(() => {
    const node = anchorRef.current;
    if (!node) return;

    const rect = node.getBoundingClientRect();

    setPortalPos({
      left: rect.left,
      top: rect.bottom + 6,
      width: rect.width,
    });
  }, []);

  useEffect(() => {
    if (!isListOpen) return;

    updatePortalPosition();

    const onUpdate = () => updatePortalPosition();
    window.addEventListener("resize", onUpdate);
    window.addEventListener("scroll", onUpdate, true);

    return () => {
      window.removeEventListener("resize", onUpdate);
      window.removeEventListener("scroll", onUpdate, true);
    };
  }, [isListOpen, updatePortalPosition]);

  /* ================= Existing Logic ================= */

  const initialExisting = normalizeAvailableFiles(availableFilesURL) ?? [];
  const [existingUrls, setExistingUrls] = useState<string[]>(initialExisting);

  const { addToast } = useToast();

  useEffect(() => {
    setExistingUrls(normalizeAvailableFiles(availableFilesURL) ?? []);
  }, [availableFilesURL]);

  useEffect(() => {
    if (existingUrls.length + value.length === 0) setIsListOpen(false);
  }, [existingUrls, value]);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (!anchorRef.current?.contains(e.target as Node)) setIsListOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const addFiles = (files: FileList | File[]) => {
    const updated: FileValue[] = [...value];

    for (const file of Array.from(files)) {
      if (!allowedTypes.includes(file.type)) {
        addToast({ type: "error", title: `File type not allowed: ${file.name}` });
        continue;
      }

      if (existingUrls.length + updated.length >= maxFiles) {
        addToast({ type: "error", title: `Maximum ${maxFiles} files allowed` });
        break;
      }

      updated.push(file);
    }

    onChange(updated);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    addFiles(files);
    e.target.value = "";
  };

  const handleDrop = (event: DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setIsDragging(false);
    if (!disabled && event.dataTransfer.files.length > 0) {
      addFiles(event.dataTransfer.files);
    }
  };

  const getUrl = (item: FileValue | string) => (typeof item === "string" ? item : URL.createObjectURL(item));

  const getFileLabel = (item: FileValue | string) => (typeof item === "string" ? item.split("/").pop() || item : item.name);

  const guessMimeFromUrl = (url: string) => {
    const l = url.toLowerCase();
    if (l.match(/\.(jpg|jpeg|png|gif|webp)$/)) return "image/jpeg";
    if (l.endsWith(".pdf")) return "application/pdf";
    return undefined;
  };

  const getFileIcon = (mime?: string) => {
    if (!mime) return <FileIcon size={16} />;
    if (mime.startsWith("image/")) return <ImageIcon size={16} />;
    if (mime === "application/pdf") return <FileText size={16} />;
    return <FileIcon size={16} />;
  };

  const totalCount = existingUrls.length + value.length;

  /* ================= Render ================= */

  return (
    <div className={className} style={{ width: "100%" }}>
      {label && (
        <label
          style={{
            display: "block",
            fontSize: theme.fontSize.sm,
            fontWeight: theme.fontWeight.medium,
            color: theme.colors.text,
            marginBottom: theme.spacing.sm,
          }}
        >
          {label}
          {required && <span style={{ color: theme.colors.error, marginLeft: 4 }}>*</span>}
        </label>
      )}

      {variant === "dropzone" ? (
        <div ref={anchorRef}>
          <button
            type="button"
            disabled={disabled}
            onClick={() => inputRef.current?.click()}
            onDragEnter={(event) => {
              event.preventDefault();
              if (!disabled) setIsDragging(true);
            }}
            onDragOver={(event) => event.preventDefault()}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`flex w-full flex-col items-center justify-center rounded-md border border-dashed px-4 text-center transition-colors ${
              dropzoneSize === "compact" ? "min-h-[112px] py-4" : "min-h-[148px] py-5"
            } ${
              isDragging
                ? "border-[#235EEE] bg-[#F4F7FF]"
                : "border-[#9FB4DF] bg-white hover:border-[#5B8CFF] hover:bg-[#FAFCFF]"
            } ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
          >
            <span
              className={`flex items-center justify-center ${
                dropzoneSize === "compact"
                  ? "h-10 w-10 rounded-lg"
                  : "h-12 w-12 rounded-xl"
              } ${dropzoneToneClasses[dropzoneTone]}`}
            >
              {dropzoneIcon ?? <Upload className="h-6 w-6" />}
            </span>
            <span className={`${dropzoneSize === "compact" ? "mt-2 text-base" : "mt-3 text-sm"} font-semibold leading-6 text-[#30323A]`}>
              {dropzoneTitle ?? label ?? "Document"}
            </span>
            <span className="mt-1 text-sm font-normal leading-5 text-[#7B838D]">
              {totalCount > 0
                ? `${totalCount} file${totalCount === 1 ? "" : "s"} selected`
                : dropzoneDescription}
            </span>
          </button>
        </div>
      ) : (
        <div
          ref={anchorRef}
          style={{
            height: currentSize.height,
            border: `0.5px solid ${error ? theme.colors.error : theme.colors.border}`,
            borderRadius: theme.borderRadius.lg,
            padding: currentSize.padding,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: theme.colors.backgroundSecondary,
            fontSize: currentSize.fontSize,
            fontWeight: theme.fontWeight.normal,
            outline: "none",
            transition: theme.transitions.normal,
            boxSizing: "border-box" as const,
          }}
        >
          <span
            style={{
              fontSize: 15,
              color: totalCount ? "#000" : "#888",
              cursor: "pointer",
            }}
            onClick={() => {
              if (!disabled) inputRef.current?.click();
            }}
          >
            {totalCount ? `${totalCount} file(s)` : placeholder}
          </span>

          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Upload
              size={18}
              onClick={() => {
                if (!disabled) inputRef.current?.click();
              }}
            />
            {totalCount > 0 && (
              <List
                size={18}
                onClick={() => {
                  setIsListOpen((p) => !p);
                }}
              />
            )}
          </span>
        </div>
      )}

      <input ref={inputRef} type="file" multiple disabled={disabled} style={{ display: "none" }} onChange={handleFileSelect} accept={allowedTypes.join(",")} />

      {/* ===== PORTAL DRAWER (UI SAME) ===== */}
      {isListOpen &&
        portalPos &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            onMouseDown={(e) => e.stopPropagation()}
            style={{
              position: "absolute",
              left: portalPos.left,
              top: portalPos.top,
              width: portalPos.width,
              border: "1px solid #ccc",
              borderRadius: 6,
              background: "#fff",
              overflow: "hidden",
              zIndex: 9999,
              boxShadow: "0 5px 10px rgba(0,0,0,0.12)",
            }}
          >
            <div
              style={{
                padding: "10px",
                borderBottom: "1px solid #eee",
                background: "#fafafa",
                fontWeight: 600,
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span>{label || "Documents"}</span>
              <span>{totalCount} file(s)</span>
            </div>

            <div className="thin-scroll" style={{ maxHeight: DRAWER_HEIGHT, overflowY: "auto" }}>
              {existingUrls.map((url, i) => (
                <div key={i} style={{ display: "flex", padding: 8, gap: 8 }}>
                  {getFileIcon(guessMimeFromUrl(url))}
                  <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis" }}>{getFileLabel(url)}</span>
                  <MultiImageViewer title={label} images={[url]} isIcon={false} triggerLabel={<Eye size={18} />} />
                  {!disabled && (
                    <Trash2
                      size={18}
                      color="red"
                      onClick={() => {
                        if (disabled) return;
                        onRemoveExisting?.(existingUrls[i]); // <-- notify parent
                        setExistingUrls((p) => p.filter((_, x) => x !== i));
                      }}
                    />
                  )}
                </div>
              ))}

              {value.map((item, i) => (
                <div key={i} style={{ display: "flex", padding: 8, gap: 8 }}>
                  {getFileIcon(typeof item === "string" ? guessMimeFromUrl(item) : item.type)}
                  <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis" }}>{getFileLabel(item)}</span>
                  <MultiImageViewer title={label} images={[getUrl(item)]} isIcon={false} triggerLabel={<Eye size={18} />} />
                  {!disabled && (
                    <Trash2
                      size={18}
                      color="red"
                      onClick={() => {
                        if (disabled) return;

                        onChange(value.filter((_, x) => x !== i));
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>,
          document.body,
        )}

      {error && (
        <div
          style={{
            marginTop: theme.spacing.sm,
            fontSize: theme.fontSize.sm,
            color: error ? theme.colors.error : theme.colors.textSecondary,
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <InfoIcon
            style={{
              fontSize: theme.fontSize.xs,
              color: error ? theme.colors.error : theme.colors.textSecondary,
              height: 14,
            }}
          />

          {error}
        </div>
      )}
    </div>
  );
};

export default MultiFilePicker;
