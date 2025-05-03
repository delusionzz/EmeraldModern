import useSw from "@/components/hooks/useSw";
import { useSettings } from "@/store";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import React, { Suspense } from "react";
import { useEffect } from "react";
import { VERSION } from "@/constants";
import { toast } from "sonner";
const TanStackRouterDevtools =
  process.env.NODE_ENV === "production"
    ? () => null // Render nothing in production
    : React.lazy(() =>
        // Lazy load in development
        import("@tanstack/router-devtools").then((res) => ({
          default: res.TanStackRouterDevtools,
          // For Embedded Mode
          // default: res.TanStackRouterDevtoolsPanel
        }))
      );

export const Route = createRootRoute({
  component: RenderComponent,
});

function RenderComponent() {
  const settingStore = useSettings();
  useEffect(() => {
    // check query param for version
    const urlParams = new URLSearchParams(window.location.search);
    const message = urlParams.get("m");
    console.log(message);
    if (message === `u${VERSION}`) {
      toast.success(`Updated Emerald to version ${VERSION}`);
      urlParams.delete("m");
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);
  useEffect(() => {
    if (settingStore.version !== VERSION) {
      // reset all settings
      const currentType = settingStore.siteType;
      settingStore.setDefault();
      settingStore.setSiteType(currentType);
      settingStore.setVersion(VERSION);
      window.location.href = window.location.href + "?m=u" + VERSION;
    }
  }, []);
  useSw("/sw.js", "/");
  useEffect(() => {
    if (
      settingStore.cloak === "aboutBlank" &&
      window.location === window.parent.location
    ) {
      const page = window.open();
      page!.document.body.innerHTML =
        `<iframe style="height:100%; width: 100%; border: none; position: fixed; top: 0; right: 0; left: 0; bottom: 0; border: none"  src="` +
        window.location.href +
        `"></iframe>`;
      window.location.replace("https://google.com");
    }
  }, [settingStore.cloak]);

  return (
    <>
      <Outlet />
      <Suspense>
        <TanStackRouterDevtools />
      </Suspense>
    </>
  );
}
