import { useEffect, useState } from "react";

const STORAGE_KEY = "plus.sidebarOpen";

function readInitial(): boolean {
  if (typeof window === "undefined") return true;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw === null) return true;
  return raw === "true";
}

export function useSidebarState(): [boolean, (next: boolean | ((prev: boolean) => boolean)) => void] {
  const [open, setOpen] = useState<boolean>(readInitial);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, String(open));
  }, [open]);

  return [open, setOpen];
}
