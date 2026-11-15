"use client";

import { useLayoutEffect, useRef, useState } from "react";

type CopyResult = "copied" | "error";
type CopyStatus = "idle" | "copying" | CopyResult;

export function useCopyToClipboard(content: string, resetKey: string, timeout: number | null) {
  const [state, setState] = useState<{ content: string; resetKey: string; status: CopyStatus }>({
    content,
    resetKey,
    status: "idle",
  });
  const attempt = useRef(0);
  const timer = useRef<number | undefined>(undefined);
  const isCurrent = state.content === content && state.resetKey === resetKey;
  const status = isCurrent ? state.status : "idle";

  if (!isCurrent) setState({ content, resetKey, status: "idle" });

  useLayoutEffect(() => () => {
    attempt.current += 1;
    window.clearTimeout(timer.current);
  }, [content, resetKey]);

  async function copyToClipboard(onResult: (result: CopyResult, resetResult: () => void) => void) {
    if (!content || status === "copying" || status === "copied") return;

    const request = ++attempt.current;
    window.clearTimeout(timer.current);
    setState({ content, resetKey, status: "copying" });

    let result: CopyResult;
    try {
      await navigator.clipboard.writeText(content);
      result = "copied";
    } catch {
      result = "error";
    }

    if (request !== attempt.current) return;
    setState({ content, resetKey, status: result });
    const resetResult = () => {
      if (request === attempt.current) setState({ content, resetKey, status: "idle" });
    };
    if (timeout !== null) timer.current = window.setTimeout(resetResult, timeout);
    onResult(result, resetResult);
  }

  return { status, copyToClipboard };
}
