import { useEffect } from "react";

export const useMeta = (title: string, icon: string) => {
  useEffect(() => {
    document.title = title;
    document.querySelector("link[rel=icon]")?.setAttribute("href", icon);
  }, [title, icon]);
};
