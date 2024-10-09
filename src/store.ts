import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SettingState {
  proxy: "uv" | "scramjet";
  setProxy: (proxy: "uv" | "scramjet") => void;
  searchEngine: {
    name: string;
    url: string;
  };
  transport: {
    path: string;
    name: string;
  };
  setSearchEngine: (name: string, url: string) => void;
}

const useSettings = create<SettingState>()(
  persist(
    (set) => ({
      proxy: "uv",
      transport: {
        path: "/libcurl/index.mjs",
        name: "libcurl",
      },
      searchEngine: {
        name: "Google",
        url: "https://www.google.com/search?q=",
      },
      setProxy: (proxy: "uv" | "scramjet") => set(() => ({ proxy })),
      setSearchEngine: (name: string, url: string) =>
        set(() => ({
          searchEngine: {
            name,
            url,
          },
        })),
    }),
    {
      name: "settings",
    }
  )
);

export { useSettings };
