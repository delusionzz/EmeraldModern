import { useEffect } from "react";
import { useSettings } from "@/store";
export const useMeta = (title: string, icon: string) => {
  const settings = useSettings();
  useEffect(() => {
    if (title === "") {
      settings.setTitle("Emerald");
    }
    if (icon === "") {
      settings.setIcon("/emerald.png");
    }
    document.title = title;
    document.querySelector("link[rel=icon]")?.setAttribute("href", icon);
  }, [title, icon]);
};
