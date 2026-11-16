"use client";

import * as React from "react";
import { Toast, type ToastManagerPositionerProps } from "@base-ui/react/toast";
import Cancel01Icon from "@hugeicons/core-free-icons/Cancel01Icon";
import Copy01Icon from "@hugeicons/core-free-icons/Copy01Icon";
import Tick02Icon from "@hugeicons/core-free-icons/Tick02Icon";
import { HugeiconsIcon } from "@hugeicons/react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { useCopyToClipboard } from "./copy-button-utils/use-copy-to-clipboard";
import styles from "./copy-button.module.css";

type CopyButtonToastConfig = Pick<ToastManagerPositionerProps, "side" | "sideOffset" | "align" | "alignOffset"> & {
  title?: React.ReactNode;
  description?: React.ReactNode;
  arrow?: boolean;
  duration?: number;
  onClose?: () => void;
};

interface CopyButtonProps extends Omit<React.ComponentProps<typeof Button>, "onClick" | "children" | "size" | "variant"> {
  content: string;
  label?: string;
  timeout?: number;
  resetKey?: string;
  copyIcon?: React.ReactNode;
  checkIcon?: React.ReactNode;
  errorIcon?: React.ReactNode;
  onCopied?: (text: string) => void;
  onCopyError?: (text: string) => void;
  toast?: true | CopyButtonToastConfig;
  statusClassName?: string;
  messages?: { copied?: string; error?: string };
}

const defaultIcons = [
  <HugeiconsIcon key="copy" icon={Copy01Icon} strokeWidth={2} className="size-4" />,
  <HugeiconsIcon key="check" icon={Tick02Icon} strokeWidth={2} className="size-4 text-[var(--copy-success,#22c55e)]" />,
  <HugeiconsIcon key="error" icon={Cancel01Icon} strokeWidth={2} className="size-4 text-[var(--copy-error,#ef4444)]" />,
];

function CopyButtonControl({
  content,
  label,
  timeout = 2000,
  resetKey = content,
  className,
  copyIcon,
  checkIcon,
  errorIcon,
  onCopied,
  onCopyError,
  toast,
  statusClassName = "sr-only",
  messages,
  disabled,
  type = "button",
  "aria-label": ariaLabel,
  ref,
  ...props
}: CopyButtonProps) {
  const anchor = React.useRef<HTMLButtonElement>(null);
  const toastId = React.useId();
  const toastEnabled = Boolean(toast);
  const options = toast === true ? {} : toast;
  const { add, close, toasts } = Toast.useToastManager<{ arrow: boolean }>();
  const { status, copyToClipboard } = useCopyToClipboard(content, resetKey, toastEnabled ? null : timeout);

  React.useEffect(() => {
    if (toastEnabled) return () => close(toastId);
  }, [close, content, resetKey, toastEnabled, toastId]);

  const mergedRef = React.useCallback((node: HTMLButtonElement | null) => {
    anchor.current = node;
    if (typeof ref === "function") {
      const cleanup = ref(node);
      if (typeof cleanup === "function") return () => {
        anchor.current = null;
        cleanup();
      };
    } else if (ref) {
      ref.current = node;
    }
  }, [ref]);

  const copied = status === "copied";
  const error = status === "error";
  const locked = copied || status === "copying";
  const unavailable = disabled || !content;
  const successMessage = messages?.copied ?? "Copied to clipboard";
  const errorMessage = messages?.error ?? "Failed to copy to clipboard. Copy it manually.";
  const icons = [copyIcon ?? defaultIcons[0], checkIcon ?? defaultIcons[1], errorIcon ?? defaultIcons[2]];
  const activeIcon = copied ? 1 : error ? 2 : 0;

  return (
    <span className="contents">
      <Button
        {...props}
        ref={mergedRef}
        type={type}
        data-slot="copy-button"
        size="icon-xs"
        variant="ghost"
        data-copied={copied || undefined}
        data-error={error || undefined}
        disabled={unavailable || locked}
        focusableWhenDisabled={!unavailable && locked}
        aria-label={ariaLabel ?? label ?? "Copy to clipboard"}
        title={copied ? "Copied!" : error ? "Copy failed" : label ?? "Copy"}
        className={cn("size-auto rounded-md p-1.5 text-muted-foreground", className)}
        onClick={() => {
          if (unavailable || locked) return;
          void copyToClipboard((result, resetResult) => {
            const isCopied = result === "copied";
            (isCopied ? onCopied : onCopyError)?.(content);
            if (!options || !anchor.current) return;
            add({
              id: toastId,
              title: options.title,
              description: isCopied ? options.description ?? successMessage : errorMessage,
              timeout: options.duration ?? timeout,
              positionerProps: {
                anchor: anchor.current,
                side: options.side ?? "top",
                sideOffset: options.sideOffset ?? 8,
                align: options.align,
                alignOffset: options.alignOffset,
              },
              data: { arrow: options.arrow ?? true },
              onClose: () => {
                resetResult();
                options.onClose?.();
              },
            });
          });
        }}
      >
        <span data-slot="copy-button-stack" aria-hidden="true" className="grid place-items-center">
          {icons.map((icon, index) => (
            <span
              key={index}
              className={cn(
                "col-start-1 row-start-1 flex items-center justify-center transition-[scale,opacity,filter] duration-300 motion-reduce:transition-none",
                index === activeIcon ? "scale-100 opacity-100 blur-none" : "scale-50 opacity-0 blur-xs",
              )}
            >
              {icon}
            </span>
          ))}
        </span>
        {label && <span>{label}</span>}
      </Button>
      {toastEnabled ? (
        <Toast.Portal>
          <Toast.Viewport>
            {toasts.map((item) => (
              <Toast.Positioner key={item.id} toast={item} className={styles.positioner}>
                <Toast.Root toast={item} className={styles.toast}>
                  {item.data?.arrow && <Toast.Arrow className={styles.arrow} />}
                  <Toast.Content>
                    {item.title && <Toast.Title />}
                    <Toast.Description />
                    {item.timeout === 0 && (
                      <Toast.Close aria-label="Dismiss copy notification" className={styles.close}>×</Toast.Close>
                    )}
                  </Toast.Content>
                </Toast.Root>
              </Toast.Positioner>
            ))}
          </Toast.Viewport>
        </Toast.Portal>
      ) : (
        <span role="status" className={statusClassName}>
          {copied ? successMessage : error ? errorMessage : ""}
        </span>
      )}
    </span>
  );
}

function CopyButton(props: CopyButtonProps) {
  return (
    <Toast.Provider limit={1}>
      <CopyButtonControl {...props} />
    </Toast.Provider>
  );
}

export { CopyButton };
export default CopyButton;
