// FILE: src/lib/mindercart/hooks.ts
"use client";

import React from "react";
import { readState, CHANGE_EVENT } from "@/lib/mindercart/storage";
import type { MinderCartState } from "@/lib/mindercart/types";

const EMPTY_STATE: MinderCartState = {
  itemsMaster: [],
  generalListItems: [],
  activeShoppingListItems: [],
  shoppingHistory: [],
  settings: {
    language: "es",
    preferredStore: "Walmart",
  },
};

export function useMinderCartState() {
  const [state, setState] = React.useState<MinderCartState>(EMPTY_STATE);
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    const reload = () => {
      setState(readState());
      setHydrated(true);
    };

    reload();
    window.addEventListener(CHANGE_EVENT, reload as EventListener);
    window.addEventListener("storage", reload);

    return () => {
      window.removeEventListener(CHANGE_EVENT, reload as EventListener);
      window.removeEventListener("storage", reload);
    };
  }, []);

  return { ...state, hydrated };
}