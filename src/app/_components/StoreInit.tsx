"use client";

import { useEffect } from "react";
import userStore from "../_stores/userStore";

export default function StoreInitializer() {
  useEffect(() => {
    userStore.rehydrate();
    return () => {
      userStore.destroy();
    };
  }, []);

  return null;
}
