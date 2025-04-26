import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SettingState {
  proxy: "uv" | "scramjet";
  setProxy: (proxy: "uv" | "scramjet") => void;
  searchEngine: {
    name: string;
    url: string;
  };
  siteType: "browser" | "default";
  setSiteType: (siteType: "browser" | "default") => void;
  cloak: "none" | "aboutBlank";
  setCloak: (cloak: "none" | "aboutBlank") => void;
  transport: {
    path: "/libcurl/index.mjs" | "/epoxy/index.mjs";
    name: "libcurl" | "epoxy";
  };
  setTransport: (
    path: "/libcurl/index.mjs" | "/epoxy/index.mjs",
    name: "libcurl" | "epoxy"
  ) => void;
  wispUrl: string;
  title: string;
  setTitle: (title: string) => void;
  icon: string;
  setIcon: (icon: string) => void;
  setWispUrl: (wispUrl: string) => void;
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
      setTransport: (
        path: "/libcurl/index.mjs" | "/epoxy/index.mjs",
        name: "libcurl" | "epoxy"
      ) => set(() => ({ transport: { path, name } })),
      cloak: "none",
      siteType: "browser",
      setSiteType: (siteType: "browser" | "default") =>
        set(() => ({ siteType })),
      setCloak: (cloak: "none" | "aboutBlank") => set(() => ({ cloak })),
      title: "Emerald ✨",
      setTitle: (title: string) => set(() => ({ title })),
      icon: "/emerald.png",
      setIcon: (icon: string) => set(() => ({ icon })),
      searchEngine: {
        name: "Brave",
        url: "https://search.brave.com/search?q=",
      },
      // defaults to current websites wisp url
      wispUrl: `${location.protocol.includes("https") ? "wss://" : "ws://"}${
        location.host
      }/w/`,
      setWispUrl: (wispUrl: string) => set(() => ({ wispUrl })),
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
