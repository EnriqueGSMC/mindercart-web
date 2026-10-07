"use client";

import React from "react";
import { CHANGE_EVENT, readState } from "@/lib/mindercart/storage";
import type { MinderCartState } from "@/lib/mindercart/types";

const EMPTY_STATE: MinderCartState = {
  itemsMaster: [],
  generalListItems: [],
  activeShoppingListItems: [],
  shoppingHistory: [],
  storeProfiles: [],
  settings: {
    language: "es",
    preferredStore: "HEB",
    fontScale: "normal",
  },
};

export function useMinderCartState() {
  const [state, setState] = React.useState<MinderCartState>(EMPTY_STATE);
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    const reload = () => {
      // Event detail may contain canonical server names (e.g. Leche).
      // Use the same localized snapshot on live updates as on initial loading.
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
