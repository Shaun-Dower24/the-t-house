"use client";

import { useSyncExternalStore } from "react";

function subscribe() {
  return () => {};
}

export function useEnhancedControls() {
  return useSyncExternalStore(subscribe, () => true, () => false);
}
