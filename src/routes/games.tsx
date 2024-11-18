import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import GridPattern from "@/components/ui/grid-pattern";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GameType } from "./play";

type Game = {
  name: string;
  path: string;
  type: string;
  img: string;
  visible: boolean;
};

const getList = async (): Promise<Game[]> => {
  const res = await fetch("/cdn/list");
  return await res.json();
};

export const Route = createFileRoute("/games")({
  component: RouteComponent,
  loader: async () => await getList(),
});

function RouteComponent() {
  const list = Route.useLoaderData();

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
        <div className="h-[80vh] min-w-[90%] max-w-[90%] border rounded-xl border-secondary items-center justify-center overflow-y-auto overflow-x-hidden flex flex-wrap">
          {list
            .filter((game: Game) => game.visible)
            .map((game: Game, i) => (
              <Card
                className="m-2 max-h-[20rem] bg-card transition-all"
                key={i}
              >
                <CardHeader className="flex w-full items-center">
                  <CardTitle>{game.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <img
                    src={`/cdn${game.img}`}
                    alt={game.name}
                    className=" rounded-xl object-cover h-[10rem] w-[10rem] "
                    width={150}
                    height={150}
                  />
                </CardContent>
                <CardFooter>
                  <Link
                    to="/play"
                    search={{
                      title: encodeURIComponent(game.name),
                      type: game.type as GameType,
                      path: encodeURIComponent(game.path),
                      img: encodeURIComponent(game.img),
                    }}
                    className="w-full"
                  >
                    <Button className="w-full rounded-[0.5rem] text-card-foreground">
                      Play
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
        </div>
      </div>
    </>
  );
}
