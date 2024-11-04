import { createLazyFileRoute, Link } from "@tanstack/react-router";
import GridPattern from "@/components/ui/grid-pattern";
import { cn } from "../lib/utils";
import { Input } from "../components/ui/input";
// import LetterPullup from "./components/ui/letter-pullup";
import { useSettings } from "../store";
import PopularSites from "../sites.json";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Separator } from "../components/ui/separator";
import Draggable from "react-draggable";
import { Dock, DockIcon } from "../components/ui/dock";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  House,
  Gamepad,
  Cog,
  Search,
  AlignJustify,
  ArrowLeft,
  ArrowRight,
  MessageCircle,
} from "lucide-react";
import ReactGA from "react-ga4";
import useSw from "../components/hooks/useSw";

export const Route = createLazyFileRoute("/")({
  component: Home,
});

type Sponser = {
  title: string;
  icon: string;
  url: string;
  discord: string;
};

function Home() {
  const settingStore = useSettings();
  const [term, setTerm] = useState("");
  const [suggestions, setSuggestions] = useState<{ phrase: string }[]>([]);
  const [shouldOpen, setShouldOpen] = useState(false);
  const [openSearch, setOpenSearch] = useState(false);
  const [openSettings, setOpenSettings] = useState(false);
  const [sponser, setSponser] = useState<Sponser>();
  const frame = useRef<HTMLIFrameElement>(null);
  const dock = useRef<HTMLDivElement>(null);
  useSw("/sw.js");

  ReactGA.initialize("G-PBTEBTLRLZ");
  ReactGA.event("page_view", {
    page_location: window.location.href,
    page_title: "Emerald",
    user_agent: navigator.userAgent ?? "no ua??",
  });
  useEffect(() => {
    setSuggestions([]);
    const delayDebounceFn = setTimeout(async () => {
      if (term.length > 0) {
        const res = await fetch("/api/search?query=" + term);
        const terms = await res.json();
        setSuggestions(terms);
      } else {
        setSuggestions([]);
      }
    }, 500);

    return () => {
      clearTimeout(delayDebounceFn);
    };
  }, [term]);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/sponser");
      const sponser = await res.json();
      setSponser(sponser as unknown as Sponser);
    })();
  }, []);

  const containerVariants = {
    hidden: {
      opacity: 0,
    },
    visible: {
      opacity: 1,
      transition: {},
    },
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 100,
    },
    visible: {
      opacity: 1,
      y: 0,
    },
    exit: {
      opacity: 0,
      y: 100,
    },
  };
  const canParse = (p: string) => {
    try {
      new URL(p);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSearch = (p?: string, isPhrase = false) => {
    if (p && canParse(p)) {
      setShouldOpen(true);
      const encoding = encodeURIComponent(p);
      frame.current!.src = `/~/${settingStore.proxy}/${encoding}`;
      return;
    }
    if (p && isPhrase) {
      setShouldOpen(true);
      const encoding = encodeURIComponent(settingStore.searchEngine.url + p);
      frame.current!.src = `/~/${settingStore.proxy}/${encoding}`;
    } else {
      setShouldOpen(true);
      const encoding = encodeURIComponent(settingStore.searchEngine.url + term);
      frame.current!.src = `/~/${settingStore.proxy}/${encoding}`;
    }
  };

  return (
    <>
      <AnimatePresence>
        {openSearch && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute z-[999999] min-w-full min-h-screen bg-card/30 backdrop-blur-md dark:bg-black/30 flex items-center justify-center"
              onClick={() => setOpenSearch(false)}
            ></motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute z-[999999] w-full -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 flex items-center justify-center flex-col space-y-2"
            >
              <Input
                className="text-white w-[30%] rounded-2xl bg-card focus-visible:ring-0 border-none"
                placeholder={`Using ${settingStore.searchEngine.name} as search engine`}
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch();
                    setOpenSearch(false);
                  }
                }}
              />
              <motion.div className="relative w-3/12 h-fit">
                <AnimatePresence mode="wait">
                  {suggestions.length > 0 && (
                    <motion.div
                      className="flex flex-col rounded-md absolute min-w-[100%] space-y-3"
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                    >
                      {suggestions.slice(0, 5).map((suggestion, index) => (
                        <motion.div
                          key={index}
                          variants={itemVariants}
                          className="bg-card/30 min-w-[100%] md:h-12  transform hover:translate-y-2 backdrop-blur-md border border-white/20 rounded-xl select-none cursor-pointer shadow-lg p-3 hover:shadow-2xl transition-shadow"
                          transition={{
                            delay: 0.05 * index,
                          }}
                          onClick={() => {
                            setSuggestions([]);

                            handleSearch(suggestion.phrase, true);
                            setOpenSearch(false);
                          }}
                        >
                          {suggestion.phrase}
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <GridPattern
        width={30}
        height={30}
        x={-1}
        y={-1}
        strokeDasharray={"1 2"}
        className={cn(
          `[mask-image:radial-gradient(500px_circle_at_center,white,transparent)] z-[0] ${
            shouldOpen ? "hidden" : ""
          }`
        )}
      />
      <iframe
        src=""
        ref={frame}
        className={`w-full h-screen  ${shouldOpen ? "" : "hidden"} z-20`}
      ></iframe>
      <div
        className={`w-full min-h-screen flex items-center justify-center z-20 ${
          shouldOpen ? "hidden" : ""
        }`}
      >
        <div className="flex-col space-y-4 flex w-full h-full items-center justify-center">
          <h2 className="select-none font-display text-center text-2xl text-primary font-semibold  md:text-7xl md:leading-[5rem]">
            Emerald
          </h2>
          <div className="w-3/12 relative rounded-2xl focus:border-primary border border-input flex space-x-2 items-center justify-center pr-2">
            <Input
              className="text-white/40 w-[95%] rounded-2xl focus-visible:ring-0 border-none"
              placeholder={`Using ${settingStore.searchEngine.name} as search engine and ${settingStore.proxy} as proxy`}
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
            />
            <DropdownMenu>
              <DropdownMenuTrigger className="focus:ring-0 outline-none">
                <div className="min-h-8">
                  <img
                    src={`/searchEngines/${settingStore.searchEngine.name}.png`}
                    className="h-8"
                  />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="rounded-2xl p-2 flex items-center justify-center flex-col w-fit">
                <DropdownMenuItem
                  className={`rounded-2xl w-fit flex space-x-2 cursor-pointer disabled:opacity-50 `}
                  disabled={settingStore.searchEngine.name === "DuckDuckgo"}
                  onClick={() =>
                    settingStore.setSearchEngine(
                      "DuckDuckgo",
                      "https://duckduckgo.com/?q="
                    )
                  }
                >
                  <img
                    src="/searchEngines/DuckDuckgo.png"
                    className="h-8"
                    alt=""
                  />
                  <div>DuckDuckgo</div>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className={`rounded-2xl w-fit flex space-x-2 cursor-pointer disabled:opacity-50 min-w-full`}
                  disabled={settingStore.searchEngine.name === "Google"}
                  onClick={() =>
                    settingStore.setSearchEngine(
                      "Google",
                      "https://www.google.com/search?q="
                    )
                  }
                >
                  <img src="/searchEngines/Google.png" className="h-8" alt="" />
                  <div>Google</div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <motion.div className="relative w-3/12 h-fit">
            <AnimatePresence mode="wait">
              {suggestions.length > 0 && (
                <motion.div
                  className="flex flex-col rounded-md absolute min-w-[100%] space-y-3"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                >
                  {suggestions.slice(0, 3).map((suggestion, index) => (
                    <motion.div
                      key={index}
                      variants={itemVariants}
                      className="bg-card/30 min-w-[100%] backdrop-blur-md border border-white/20 rounded-xl select-none cursor-pointer shadow-lg p-3 hover:shadow-2xl transition-shadow"
                      transition={{
                        delay: 0.05 * index,
                      }}
                      onClick={() => {
                        setSuggestions([]);

                        handleSearch(suggestion.phrase);
                      }}
                    >
                      {suggestion.phrase}
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
        <motion.div className="min-h-[50%] w-[16%] border border-card flex absolute right-[10rem] justify-center backdrop-blur-md p-2 bg-transparent transition-colors  rounded-2xl">
          <div className="relative w-full min-h-full flex flex-col items-center justify-center space-y-3">
            <h2 className="sm:text-xs md:text-sm lg:text-2xl">Popular sites</h2>
            <div className="w-full h-full flex flex-col space-y-2">
              {PopularSites.map((site, index) => (
                <div
                  onClick={() => handleSearch(site.url)}
                  key={index}
                  className="w-full p-2 transition-colors hover:bg-muted/15 cursor-pointer focus:bg-accent focus:text-accent-foreground border-card border rounded-2xl flex gap-4 items-center  mx-auto"
                >
                  <img src={site.icon} className="w-8 h-8 " alt={site.name} />
                  <h3 className="w-full text-center sm:text-xs md:text-sm lg:text-base">
                    {site.name}
                  </h3>
                </div>
              ))}
            </div>
            <Separator className="my-4" />
            <div className="w-full h-full flex flex-col items-center justify-center space-y-2">
              {sponser !== undefined && (
                <>
                  <h2 className="sm:text-xs md:text-sm lg:text-xl">
                    🌟 Sponsor 🌟
                  </h2>
                  <motion.div
                    className="w-full h-full flex items-center justify-center px-4 gap-2 border border-card/40 rounded-2xl select-none cursor-pointer shadow-lg p-3 hover:shadow-2xl transition-shadow"
                    onClick={() => handleSearch(sponser.url)}
                    whileHover={{
                      y: -5,
                      transition: { duration: 0.1 },
                    }}
                  >
                    <img
                      src={sponser.icon}
                      alt=""
                      className="w-16 h-16 rounded-2xl"
                    />
                    <div className="w-full h-full flex flex-col items-center justify-center">
                      <h3 className="font-bold text-center sm:text-sm md:text-base lg:text-lg">
                        {sponser.title}
                      </h3>
                      <p className="text-center sm:text-xs md:text-xs lg:xs">
                        Click{" "}
                        <a href={sponser.discord} className="underline">
                          here
                        </a>{" "}
                        to join their discord!
                      </p>
                    </div>
                  </motion.div>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </div>
      <Draggable
        disabled={!shouldOpen}
        handle=".handle"
        positionOffset={{
          x: "-50%",
          y: "-1%",
        }}
      >
        <div className="max-w-[10rem] h-fit flex absolute bottom-5 left-[50%] translate-x-[-50%]">
          {shouldOpen && (
            <div className="handle cursor-move supports-backdrop-blur:bg-white/30 supports-backdrop-blur:dark:bg-black/10 supports-backdrop-blur:dark:bg-black/10 mx-auto mt-8 flex h-[58px] w-max gap-2 rounded-2xl border p-2 backdrop-blur-md rounded-l-2xl rounded-r-none items-center">
              <AlignJustify className="w-6 h-6 text-primary" />
            </div>
          )}
          <Dock
            direction="middle"
            magnification={50}
            className={`${shouldOpen ? "bg-card rounded-l-none" : ""}`}
            ref={dock}
          >
            {shouldOpen && (
              <div className="flex space-x-4">
                <ArrowLeft
                  onClick={() => {
                    frame.current!.contentWindow?.history.back();
                  }}
                  className="transform hover:-translate-y-1 transition-all hover:scale-105 cursor-pointer"
                />
                <ArrowRight
                  className="transform hover:-translate-y-1 transition-all hover:scale-105 cursor-pointer"
                  onClick={() =>
                    frame.current?.contentWindow?.history.forward()
                  }
                />
              </div>
            )}

            <DockIcon>
              <House
                className=" w-6 h-6 hover:w-8 hover:h-8 transition-all transofrm hover:-translate-y-2"
                onClick={() => {
                  window.location.reload();
                }}
              />
            </DockIcon>
            <DockIcon>
              <Gamepad className="w-6 h-6 hover:w-7 hover:h-7 transition-all transofrm hover:-translate-y-2" />
            </DockIcon>
            <DockIcon>
              <Link to="/chat">
                <MessageCircle className="w-6 h-6 hover:w-7 hover:h-7 transition-all transofrm hover:-translate-y-2" />
              </Link>
            </DockIcon>
            <DockIcon>
              <Cog
                onClick={() => setOpenSettings(true)}
                className="  w-6 h-6 hover:w-7 hover:h-7 transition-all transofrm hover:-translate-y-2"
              />
            </DockIcon>
            <DockIcon>
              <img
                src="/discordDock.svg"
                className="w-6 h-6 hover:w-7 hover:h-7 transition-all transofrm hover:-translate-y-2"
                onClick={() =>
                  window.open("https://discord.gg/Dpj8C8SAmH", "_blank")
                }
                alt=""
              />
            </DockIcon>
            {shouldOpen && (
              <DockIcon>
                <Search
                  className="w-6 h-6 hover:w-7 hover:h-7 transition-all transofrm hover:-translate-y-2"
                  onClick={() => setOpenSearch(!openSearch)}
                />
              </DockIcon>
            )}
          </Dock>
        </div>
      </Draggable>

      <Dialog open={openSettings} onOpenChange={setOpenSettings}>
        <DialogContent className="max-w-[30rem] border-none overflow-y-auto flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-4xl">Settings</DialogTitle>
            <DialogDescription>
              Change the look or behavior of Emerald
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col space-y-2">
            <h2 className="text-2xl">Proxy</h2>
            <div className="flex justify-between px-4">
              <h3>Current proxy</h3>
              <Select
                onValueChange={(e) =>
                  settingStore.setProxy(e as "uv" | "scramjet")
                }
              >
                <SelectTrigger className="w-[170px] rounded-2xl">
                  <SelectValue placeholder={`${settingStore.proxy}`} />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  <SelectItem
                    className="rounded-2xl"
                    value="uv"
                    disabled={settingStore.proxy === "uv"}
                  >
                    Ultraviolet
                  </SelectItem>
                  <SelectItem
                    value="scramjet"
                    className="rounded-xl hover:bg-accent/10 transition-colors cursor-pointer"
                    disabled={settingStore.proxy === "scramjet"}
                  >
                    Scramjet (BETA)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-between px-4">
              <h3>Cloak</h3>
              <Select
                onValueChange={(e) =>
                  settingStore.setCloak(e as "none" | "aboutBlank")
                }
              >
                <SelectTrigger className="w-[170px] rounded-2xl">
                  <SelectValue placeholder={`${settingStore.cloak}`} />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  <SelectItem
                    className="rounded-2xl"
                    value="none"
                    disabled={settingStore.cloak === "none"}
                  >
                    None
                  </SelectItem>
                  <SelectItem
                    value="aboutBlank"
                    className="rounded-xl hover:bg-accent/10 transition-colors cursor-pointer"
                    disabled={settingStore.cloak === "aboutBlank"}
                  >
                    About Blank
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
