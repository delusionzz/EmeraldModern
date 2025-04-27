import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import "./index.css";
import { Toaster } from "@/components/ui/sonner";
// Import the generated route tree
import { routeTree } from "./routeTree.gen";
import { PostHogProvider } from "posthog-js/react";
// Create a new router instance
const router = createRouter({ routeTree, defaultStaleTime: Infinity });

const options = {
  api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
  ignoreErrors: [/uv\.sw\.js$/],
};
// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
  const root = createRoot(rootElement);
  root.render(
    <StrictMode>
      <PostHogProvider
        apiKey={import.meta.env.VITE_PUBLIC_POSTHOG_KEY}
        options={options}
      >
        <RouterProvider router={router} />
        <Toaster />
      </PostHogProvider>
    </StrictMode>
  );
}
