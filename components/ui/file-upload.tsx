"use client";

import FileImageIcon from "@hugeicons/core-free-icons/FileImageIcon";
import FileSpreadsheetIcon from "@hugeicons/core-free-icons/FileSpreadsheetIcon";
import FileUploadIcon from "@hugeicons/core-free-icons/FileUploadIcon";
import Upload01Icon from "@hugeicons/core-free-icons/Upload01Icon";
import { HugeiconsIcon } from "@hugeicons/react";
import { XIcon } from "lucide-react";
import { useEffect, useId, useRef, useState, type ComponentProps, type DragEvent } from "react";
import { BorderBeam } from "@/components/ui/border-beam";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import styles from "./file-upload.module.css";

export interface FileUploadItem {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
}

export interface AcceptedFileType {
  label: string;
  icon: ComponentProps<typeof HugeiconsIcon>["icon"];
}

export interface FileUploadProps {
  accept?: string;
  acceptedFileTypes?: readonly AcceptedFileType[];
  browseLabel?: string;
  className?: string;
  description?: string;
  draggingLabel?: string;
  multiple?: boolean;
  showBorderBeam?: boolean;
  showFileList?: boolean;
  title?: string;
  onFilesAccepted?: (files: File[]) => void;
  /** Object URLs are valid for as long as the corresponding items remain selected. */
  onFilesChange?: (files: FileUploadItem[]) => void;
}

const defaultFileTypes: AcceptedFileType[] = [
  { label: "Image", icon: FileImageIcon },
  { label: "Document", icon: FileUploadIcon },
  { label: "Sheet", icon: FileSpreadsheetIcon },
];

const defaultAccept = [
  ".pdf", ".doc", ".docx", ".xlsx", ".csv", ".png", ".jpg", ".jpeg",
  "application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "text/csv", "image/png", "image/jpeg",
].join(",");

function matchesAccept(file: File, accept: string) {
  const conditions = accept.toLowerCase().split(",").map(value => value.trim()).filter(Boolean);
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  return !conditions.length || conditions.some(condition => {
    if (condition.startsWith(".")) return name.endsWith(condition);
    if (condition.endsWith("/*")) return type.startsWith(condition.slice(0, -1));
    return type === condition;
  });
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
}

function FileThumbnail({ file }: { file: FileUploadItem }) {
  const [failed, setFailed] = useState(false);
  const image = file.type.startsWith("image/") || (!file.type && /\.(png|jpe?g|webp|gif)$/i.test(file.name));

  return (
    <span className={styles.thumbnail} aria-hidden="true">
      {image && !failed ? (
        // eslint-disable-next-line @next/next/no-img-element -- Local object URLs cannot use the image optimizer.
        <img src={file.url} alt="" loading="lazy" decoding="async" draggable={false} onError={() => setFailed(true)} />
      ) : <HugeiconsIcon icon={image ? FileImageIcon : FileUploadIcon} />}
    </span>
  );
}

export function FileUpload({
  accept = defaultAccept, acceptedFileTypes = defaultFileTypes, browseLabel = "Browse files", className,
  description = "PDF, DOC/DOCX, XLSX, CSV, PNG or JPG", draggingLabel = "Drop to preview", multiple = true,
  showBorderBeam = true, showFileList = true, title = "Choose files or drop them here", onFilesAccepted, onFilesChange,
}: FileUploadProps) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const browse = useRef<HTMLButtonElement>(null);
  const currentFiles = useRef<FileUploadItem[]>([]);
  const nextId = useRef(0);
  const dragDepth = useRef(0);
  const [dragging, setDragging] = useState(false);
  const [files, setFiles] = useState<FileUploadItem[]>([]);
  const [feedback, setFeedback] = useState("");

  useEffect(() => () => {
    currentFiles.current.forEach(file => URL.revokeObjectURL(file.url));
    currentFiles.current = [];
  }, []);

  function replaceFiles(next: FileUploadItem[]) {
    currentFiles.current.forEach(file => {
      if (!next.includes(file)) URL.revokeObjectURL(file.url);
    });
    currentFiles.current = next;
    setFiles(next);
    onFilesChange?.(next);
  }

  function selectFiles(selection: FileList) {
    const picked = Array.from(selection);
    if (!picked.length) return;
    const matching = picked.filter(file => matchesAccept(file, accept));
    if (!matching.length) {
      setFeedback("Choose a supported file type.");
      return;
    }

    const accepted = multiple ? matching : matching.slice(0, 1);
    replaceFiles(accepted.map(file => ({
      id: String(++nextId.current), name: file.name, type: file.type, size: file.size, url: URL.createObjectURL(file),
    })));
    const rejected = picked.length - matching.length;
    setFeedback(rejected > 0
      ? `${rejected === 1 ? "One file was" : `${rejected} files were`} skipped because of the file type.`
      : !multiple && matching.length > 1 ? "The first file was selected." : "");
    onFilesAccepted?.(accepted);
  }

  function beginDrag(event: DragEvent<HTMLButtonElement>) {
    if (!event.dataTransfer.types.includes("Files")) return;
    event.preventDefault();
    dragDepth.current += 1;
    setDragging(true);
  }

  const dropzone = (
    <button
      ref={browse}
      type="button"
      data-slot="file-upload-dropzone"
      data-dragging={dragging || undefined}
      aria-label={browseLabel}
      aria-describedby={description ? id : undefined}
      className={styles.dropzone}
      onClick={() => input.current?.click()}
      onDragEnter={beginDrag}
      onDragOver={event => {
        if (!event.dataTransfer.types.includes("Files")) return;
        event.preventDefault();
        event.dataTransfer.dropEffect = "copy";
      }}
      onDragLeave={() => {
        dragDepth.current = Math.max(0, dragDepth.current - 1);
        if (!dragDepth.current) setDragging(false);
      }}
      onDrop={event => {
        if (!event.dataTransfer.types.includes("Files")) return;
        event.preventDefault();
        dragDepth.current = 0;
        setDragging(false);
        selectFiles(event.dataTransfer.files);
      }}
    >
      <span className={styles.illustration} aria-hidden="true">
        {acceptedFileTypes.map(type => (
          <span key={type.label} className={styles.fileIcon}><HugeiconsIcon icon={type.icon} /></span>
        ))}
      </span>
      <span className={styles.title}>{title}</span>
      {description && <span id={id} className={styles.description}>{description}</span>}
      <span className={styles.browse}><HugeiconsIcon icon={Upload01Icon} aria-hidden="true" />{dragging ? draggingLabel : browseLabel}</span>
    </button>
  );

  return (
    <div data-slot="file-upload" className={cn(styles.root, className)}>
      <input
        ref={input}
        type="file"
        data-slot="file-upload-input"
        accept={accept || undefined}
        multiple={multiple}
        hidden
        onChange={event => {
          if (event.currentTarget.files) selectFiles(event.currentTarget.files);
          event.currentTarget.value = "";
        }}
      />
      {showBorderBeam ? (
        <BorderBeam className={styles.beam} color="var(--signature-red)" speed={2.4} reveal={dragging}>
          {dropzone}
        </BorderBeam>
      ) : dropzone}
      <p role="status" className={feedback ? styles.feedback : "sr-only"}>
        {feedback || (files.length ? `${files.length} ${files.length === 1 ? "file" : "files"} selected.` : "")}
      </p>
      {showFileList && files.length > 0 && (
        <ul className={styles.files} aria-label="Selected files">
          {files.map(file => (
            <li key={file.id} className={styles.file} data-slot="file-upload-item">
              <FileThumbnail file={file} />
              <div className={styles.fileInfo}>
                <span className={styles.name}>{file.name}</span>
                <span className={styles.description}>{formatSize(file.size)}</span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={`Remove ${file.name}`}
                className="min-h-11 min-w-11"
                onClick={() => {
                  replaceFiles(currentFiles.current.filter(item => item !== file));
                  setFeedback("");
                  browse.current?.focus();
                }}
              >
                <XIcon aria-hidden="true" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default FileUpload;
