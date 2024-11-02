import { useSettings } from "@/store";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import React, { Suspense } from "react";
import { useEffect } from "react";

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
    // console.log(window.location === window.parent.location);
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
      {/* <div className="p-2 flex gap-2">
      <Link to="/" className="[&.active]:font-bold">
        Home
      </Link>{' '}
      <Link to="/about" className="[&.active]:font-bold">
        About
      </Link>
    </div>
    <hr /> */}
      <Outlet />
      <Suspense>
        <TanStackRouterDevtools />
      </Suspense>
    </>
  );
}
