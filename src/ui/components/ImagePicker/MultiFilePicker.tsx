import React, { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  Paperclip,
  Eye,
  Trash2,
  File as FileIcon,
  FileText,
  Image as ImageIcon,
  List,
  InfoIcon,
} from "lucide-react";
import { MultiImageViewer } from "@/ui/components/ImageViewer/ImageViewer";
import useToast from "@/core/hooks/useToast";
import { THEME } from "@/core/constants";

export type FileValue = globalThis.File | string;

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
  onRemoveExisting?: (url: string) => void;
}

/* ================= Helpers ================= */

const normalizeAvailableFiles = (
  input?: string | (string | File)[] | null,
): string[] | undefined => {
  if (!input) return undefined;

  if (typeof input === "string") {
    const t = input.trim();
    return t ? t.split(",").map(s => s.trim()).filter(Boolean) : undefined;
  }

  if (Array.isArray(input)) {
    const onlyStrings = input.filter(i => typeof i === "string") as string[];
    return onlyStrings.length ? onlyStrings : undefined;
  }

  return undefined;
};

/* ================= Component ================= */

export const MultiFilePicker: React.FC<MultiFilePickerProps> = ({
  label,
  required,
  allowedTypes = ["image/jpeg", "image/png", "application/pdf"],
  maxFiles = 5,
  value,
  availableFilesURL,
  onChange,
  placeholder = "Select file(s)...",
  error
}) => {
  const theme = THEME;

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [isListOpen, setIsListOpen] = useState(false);

  /* ===== PORTAL POSITION STATE (ONLY ADDITION) ===== */

  const DRAWER_HEIGHT = 260;

  const [portalPos, setPortalPos] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);

  const updatePortalPosition = useCallback(() => {
    const node = containerRef.current;
    if (!node) return;

    const rect = node.getBoundingClientRect();
    const vh = window.innerHeight;

    const spaceBelow = vh - rect.bottom;
    const spaceAbove = rect.top;

    const openBelow =
      spaceBelow >= DRAWER_HEIGHT + 20 || spaceBelow >= spaceAbove;

    let top = openBelow
      ? rect.bottom + 6
      : rect.top - DRAWER_HEIGHT - 6;

    top = Math.max(8, Math.min(top, vh - DRAWER_HEIGHT - 8));

    setPortalPos({
      left: rect.left,
      top,
      width: rect.width, // 🔒 SAME WIDTH AS INPUT
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
    const handleOutside = (e: MouseEvent) => {
      if (
        isListOpen &&
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsListOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsListOpen(false);
    };
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleKey);
    };
  }, [isListOpen]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

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
    e.target.value = "";
  };

  const getUrl = (item: FileValue | string) =>
    typeof item === "string" ? item : URL.createObjectURL(item);

  const getFileLabel = (item: FileValue | string) =>
    typeof item === "string" ? item.split("/").pop() || item : item.name;

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
    <div ref={containerRef} style={{ width: "100%", position: "relative" }}>
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

      {/* input area */}
      <div
        style={{
          border: "1px solid #ccc",
          borderRadius: 6,
          padding: "8px 12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: theme.colors.backgroundSecondary,
        }}
      >
        <span
          style={{ fontSize: 15, color: totalCount ? "#000" : "#888", cursor: "pointer" }}
          onClick={() => inputRef.current?.click()}
        >
          {totalCount ? `${totalCount} file(s)` : placeholder}
        </span>

        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Paperclip size={18} onClick={() => inputRef.current?.click()} />
          {totalCount > 0 && <List size={18} onClick={() => setIsListOpen(p => !p)} />}
        </span>
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple
        style={{ display: "none" }}
        onChange={handleFileSelect}
        accept={allowedTypes.join(",")}
      />

      {/* ===== PORTAL DRAWER (UI SAME) ===== */}
      {isListOpen &&
        portalPos &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            onMouseDown={e => e.stopPropagation()}
            style={{
              position: "fixed",
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

            <div style={{ maxHeight: DRAWER_HEIGHT, overflowY: "auto" }}>
              {existingUrls.map((url, i) => (
                <div key={i} style={{ display: "flex", padding: 8, gap: 8 }}>
                  {getFileIcon(guessMimeFromUrl(url))}
                  <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis" }}>
                    {getFileLabel(url)}
                  </span>
                  <MultiImageViewer images={[url]} triggerLabel={<Eye size={18} />} />
                  <Trash2 size={18} color="red" onClick={() => setExistingUrls(p => p.filter((_, x) => x !== i))} />
                </div>
              ))}

              {value.map((item, i) => (
                <div key={i} style={{ display: "flex", padding: 8, gap: 8 }}>
                  {getFileIcon(typeof item === "string" ? guessMimeFromUrl(item) : item.type)}
                  <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis" }}>
                    {getFileLabel(item)}
                  </span>
                  <MultiImageViewer images={[getUrl(item)]} triggerLabel={<Eye size={18} />} />
                  <Trash2 size={18} color="red" onClick={() => onChange(value.filter((_, x) => x !== i))} />
                </div>
              ))}
            </div>
          </div>,
          document.body,
        )}

      {error && (
        <div style={{ marginTop: 6, color: theme.colors.error, display: "flex", gap: 6 }}>
          <InfoIcon size={14} /> {error}
        </div>
      )}
    </div>
  );
};

export default MultiFilePicker;
