import React, { useEffect, useRef, useState } from "react";
import {
  Paperclip,
  Eye,
  Trash2,
  File,
  FileText,
  Image as ImageIcon,
  List,
} from "lucide-react";
import { MultiImageViewer } from "@/ui/components/ImageViewer/ImageViewer";
import useToast from "@/core/hooks/useToast";
import { THEME } from "@/core/constants";

export type FileValue = File | string;

interface MultiFilePickerProps {
  label?: string;
  required?: boolean;
  allowedTypes?: string[];
  maxSizeMB?: number;
  maxFiles?: number;
  value: FileValue[];
  availableFilesURL?: string;
  onChange: (files: FileValue[]) => void;
  placeholder?: string;
  error?: string;
  onRemoveExisting?: (url: string) => void;
}

const parseUrls = (urls?: string): string[] =>
  (urls || "")
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s !== "");

export const MultiFilePicker: React.FC<MultiFilePickerProps> = ({
  label,
  required,
  allowedTypes = ["image/jpeg", "image/png", "application/pdf"],
  maxSizeMB = 5,
  maxFiles = 5,
  value,
  availableFilesURL,
  onChange,
  placeholder = "Select file(s)...",
  error,
  onRemoveExisting,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const theme = THEME
  const [isListOpen, setIsListOpen] = useState(false);
  const [openUpwards, setOpenUpwards] = useState(false);
  const [existingUrls, setExistingUrls] = useState<string[]>(() =>
    parseUrls(availableFilesURL),
  );

  const { addToast } = useToast();

  // 🔄 Sync state with prop changes
  useEffect(() => {
    setExistingUrls(parseUrls(availableFilesURL));
  }, [availableFilesURL]);

  // 🔥 Auto close drawer when all files removed
  useEffect(() => {
    if (existingUrls.length + value.length === 0) {
      setIsListOpen(false);
    }
  }, [existingUrls, value]);

  // ---- file select ----
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files;
    if (!selected) return;

    const newFiles: FileValue[] = [...value];

    for (const file of Array.from(selected)) {
      if (!allowedTypes.includes(file.type)) {
        addToast({ type: "error", title: `File type not allowed: ${file.name}` });
        continue;
      }

      if (file.size > maxSizeMB * 1024 * 1024) {
        addToast({
          type: "error",
          title: `${file.name} is larger than ${maxSizeMB}MB`,
        });
        continue;
      }

      if (existingUrls.length + newFiles.length >= maxFiles) {
        addToast({ type: "error", title: `Maximum ${maxFiles} files allowed` });
        break;
      }

      newFiles.push(file);
    }

    onChange(newFiles);
    e.target.value = "";
  };

  const getUrl = (item: FileValue | string) =>
    typeof item === "string" ? item : URL.createObjectURL(item);

  const getFileLabel = (item: FileValue | string) => {
    if (typeof item === "string") {
      try {
        const u = new URL(item);
        const p = u.pathname.split("/");
        return p[p.length - 1] || item;
      } catch {
        return item;
      }
    }
    return item.name;
  };

  const guessMimeFromUrl = (url: string): string | undefined => {
    const lower = url.toLowerCase();
    if (lower.match(/\.(jpg|jpeg|png|gif|bmp|webp|svg)$/)) return "image/jpeg";
    if (lower.endsWith(".pdf")) return "application/pdf";
    if (lower.match(/\.(xls|xlsx|xlsm|csv)$/))
      return "application/vnd.ms-excel";
    return undefined;
  };

  const getFileIcon = (mime?: string) => {
    if (!mime) return <File size={16} />;
    if (mime.startsWith("image/")) return <ImageIcon size={16} />;
    if (mime === "application/pdf") return <FileText size={16} />;
    return <File size={16} />;
  };

  // ❌ Delete existing file
  const removeExisting = (index: number) => {
    const urlToRemove = existingUrls[index];
    setExistingUrls((prev) => prev.filter((_, i) => i !== index));

    if (onRemoveExisting && urlToRemove) {
      onRemoveExisting(urlToRemove);
    }
  };

  // ❌ Delete uploaded file
  const removeUploaded = (index: number) => {
    const updated = value.filter((_, i) => i !== index);
    onChange(updated);
  };

  const totalCount = existingUrls.length + value.length;

  // ---- Drawer open up/down check ----
  const toggleDrawer = () => {
    setIsListOpen((prev) => {
      const willOpen = !prev;

      if (willOpen) {
        setTimeout(() => {
          if (!containerRef.current) return;
          const rect = containerRef.current.getBoundingClientRect();
          const spaceBelow = window.innerHeight - rect.bottom;
          const drawerHeight = 260;

          setOpenUpwards(spaceBelow < drawerHeight + 20);
        }, 10);
      }

      return willOpen;
    });
  };

  return (
    <div ref={containerRef} style={{ width: "100%", position: "relative" }}>

      {/* === LABEL LIKE INPUT === */}
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
          {required && (
            <span style={{ color: theme.colors.error, marginLeft: 4 }}>*</span>
          )}
        </label>
      )}

      {/* Top INPUT BOX */}
      <div
        style={{
          border: "1px solid #ccc",
          borderRadius: 6,
          padding: "8px 12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "#fff",
        }}
      >
        <span
          style={{
            fontSize: 15,
            color: totalCount ? "#000" : "#888",
            cursor: "pointer",
          }}
          onClick={() => inputRef.current?.click()}
        >
          {totalCount ? `${totalCount} file(s)` : placeholder}
        </span>

        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Paperclip
            size={18}
            style={{ cursor: "pointer" }}
            onClick={() => inputRef.current?.click()}
          />

          {totalCount > 0 && (
            <List
              size={18}
              style={{ cursor: "pointer" }}
              onClick={toggleDrawer}
            />
          )}
        </span>
      </div>

      {/* FILE INPUT (Hidden) */}
      <input
        type="file"
        multiple
        ref={inputRef}
        style={{ display: "none" }}
        onChange={handleFileSelect}
        accept={allowedTypes.join(",")}
      />

      {/* DRAWER */}
      {isListOpen && (
        <div
          style={{
            position: "absolute",
            top: openUpwards ? "auto" : "105%",
            bottom: openUpwards ? "105%" : "auto",
            left: 0,
            right: 0,
            border: "1px solid #ccc",
            borderRadius: 6,
            background: "#fff",
            marginTop: openUpwards ? 0 : 6,
            marginBottom: openUpwards ? 6 : 0,
            overflow: "hidden",
            zIndex: 31,
            boxShadow: "0 5px 10px rgba(0,0,0,0.12)",
          }}
        >
          {/* Drawer HEADER */}
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

          {/* Scrollable LIST */}
          <div style={{ maxHeight: 260, overflowY: "auto" }}>
            {/* EXISTING URLs */}
            {existingUrls.map((url, index) => {
              const mime = guessMimeFromUrl(url);
              return (
                <div
                  key={"old-" + index}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "8px 10px",
                    borderBottom: "1px solid #f2f2f2",
                    gap: 8,
                  }}
                >
                  {getFileIcon(mime)}
                  <span
                    style={{
                      flex: 1,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                    title={url}
                  >
                    {getFileLabel(url)}
                  </span>

                  <MultiImageViewer
                    images={[url]}
                    title={label || "Document"}
                    size="xl"
                    triggerLabel={<Eye size={18} style={{ cursor: "pointer" }} />}
                  />

                  <Trash2
                    size={18}
                    color="red"
                    style={{ cursor: "pointer" }}
                    onClick={() => removeExisting(index)}
                  />
                </div>
              );
            })}

            {/* NEW UPLOADED FILES */}
            {value.map((item, index) => {
              const url = getUrl(item);
              const mime =
                typeof item === "string" ? guessMimeFromUrl(item) : item.type;

              return (
                <div
                  key={"new-" + index}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "8px 10px",
                    borderBottom: "1px solid #f2f2f2",
                    gap: 8,
                  }}
                >
                  {getFileIcon(mime)}
                  <span
                    style={{
                      flex: 1,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                    title={typeof item === "string" ? item : item.name}
                  >
                    {getFileLabel(item)}
                  </span>

                  <MultiImageViewer
                    images={[{ url, mimeType: mime }]}
                    title={label || "Document"}
                    size="sm"
                    triggerLabel={<Eye size={18} style={{ cursor: "pointer" }} />}
                  />

                  <Trash2
                    size={18}
                    color="red"
                    style={{ cursor: "pointer" }}
                    onClick={() => removeUploaded(index)}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ERROR MESSAGE BLOCK (MATCHES INPUT STYLE) */}
      {(error) && (
        <div
          style={{
            marginTop: theme.spacing.sm,
            fontSize: theme.fontSize.sm,
            color: error ? theme.colors.error : theme.colors.textSecondary,
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
};
