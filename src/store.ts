import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SettingValues {
  version: string;
  proxy: "uv" | "scramjet";
  transport: {
    path: "/libcurl/index.mjs" | "/epoxy/index.mjs";
    name: "libcurl" | "epoxy";
  };
  cloak: "none" | "aboutBlank";
  siteType: "browser" | "default";
  title: string;
  icon: string;
  searchEngine: {
    name: string;
    url: string;
  };
  wispUrl: string;
  allowTabReordering: boolean;
}

interface SettingSetters {
  setVersion: (version: string) => void;
  setProxy: (proxy: "uv" | "scramjet") => void;
  setTransport: (
    path: "/libcurl/index.mjs" | "/epoxy/index.mjs",
    name: "libcurl" | "epoxy"
  ) => void;
  setCloak: (cloak: "none" | "aboutBlank") => void;
  setSiteType: (siteType: "browser" | "default") => void;
  setTitle: (title: string) => void;
  setIcon: (icon: string) => void;
  setWispUrl: (wispUrl: string) => void;
  setSearchEngine: (name: string, url: string) => void;
  setDefault: () => void;
  setAllowTabReordering: (allow: boolean) => void;
}

const DEFAULT_SETTINGS: SettingValues = {
  version: "1.0.0",
  proxy: "scramjet",
  transport: {
    path: "/libcurl/index.mjs",
    name: "libcurl",
  },
  allowTabReordering: false,
  cloak: "none",
  siteType: "browser",
  title: "Emerald ✨",
  icon: "/emerald.png",
  searchEngine: {
    name: "Brave",
    url: "https://search.brave.com/search?q=",
  },
  wispUrl: `${location.protocol.includes("https") ? "wss://" : "ws://"}${
    location.host
  }/w/`,
};

type SettingsStore = SettingValues & SettingSetters;

const useSettings = create<SettingsStore>()(
  persist(
    (set) => ({
      version: "1.0.0",
      setVersion: (version: string) => set(() => ({ version })),
      proxy: "scramjet",
      transport: {
        path: "/libcurl/index.mjs",
        name: "libcurl",
      },
      allowTabReordering: false,
      setAllowTabReordering: (allow: boolean) =>
        set(() => ({ allowTabReordering: allow })),
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
      setDefault: () => set(() => DEFAULT_SETTINGS),
    }),
    {
      name: "settings",
    }
  )
);

export { useSettings };
