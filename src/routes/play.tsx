import { createFileRoute, Link } from "@tanstack/react-router";
import GridPattern from "@/components/ui/grid-pattern";
import { cn } from "@/lib/utils";
import { Home, FullscreenIcon, Gamepad } from "lucide-react";
import { useEffect, useRef } from "react";
import useRuffle from "@/components/hooks/useRuffle";
type GameSearch = {
  title: string;
  type: GameType;
  path: string;
  img: string;
};

export enum GameType {
  HTML = "html",
  FLASH = "flash",
}

export const Route = createFileRoute("/play")({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>): GameSearch => {
    return {
      title: search.title as string,
      type: search.type as GameType,
      path: search.path as string,
      img: search.img as string,
    };
  },
});

function RouteComponent() {
  const search = Route.useSearch();
  const container = useRef<HTMLDivElement>(null);
  const iframe = useRef<HTMLIFrameElement>(null);
  console.log(search);
  if (search.type === GameType.FLASH) {
    console.log(search.path);
    useRuffle(
      container,
      `/cdn${decodeURIComponent(search.path)}`,
      "100%",
      "100%"
    );
  }
  return (
    <>
      <GridPattern
        width={30}
        height={30}
        x={-1}
        y={-1}
        strokeDasharray={"1 2"}
        className={cn(
          `[mask-image:radial-gradient(500px_circle_at_center,white,transparent)] z-[0]`
        )}
      />
      <div className="w-full min-h-screen flex flex-col items-center justify-center z-20 space-y-4">
        <div className="w-full flex space-x-2 min-w-[80%] max-w-[80%] items-center">
          <img
            src={`/cdn${decodeURIComponent(search.img)}`}
            className="rounded-xl object-cover h-[5rem] w-[5rem]"
            width={90}
            height={45}
            alt={search.title}
          />
          <div className="flex flex-col space-y-1">
            <h1 className="text-2xl font-bold">
              {decodeURIComponent(search.title)}
            </h1>
            <p className="text-muted-foreground">{search.type}</p>
          </div>
        </div>
        <div
          ref={container}
          className="h-[70vh] relative min-w-[80%] max-w-[80%] border rounded-xl border-secondary overflow-y-auto overflow-x-hidden space-y-2 flex flex-wrap"
        >
          {search.type === GameType.HTML && (
            <iframe
              src={`/cdn${decodeURIComponent(search.path)}`}
              sandbox="allow-scripts allow-same-origin allow-pointer-lock"
              ref={iframe}
              className="border-0 w-full h-full"
            ></iframe>
          )}
        </div>
        <div className="w-full flex space-x-4 min-w-[80%] max-w-[80%] items-center">
          <Link to="/" className="flex items-center space-x-2">
            <Home className="w-8 h-8" />
          </Link>
          <Link to="/games" className="flex items-center space-x-2">
            <Gamepad className="w-8 h-8" />
          </Link>
          <button
            onClick={() => {
              iframe.current?.requestFullscreen();
            }}
            className="flex items-center space-x-2"
          >
            <FullscreenIcon className="w-8 h-8" />
          </button>
        </div>
      </div>
    </>
  );
}
