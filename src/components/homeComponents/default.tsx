import { useSettings } from "@/store";
import { useEffect, useRef, useState } from "react";
import { Input } from "../ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Route } from "@/routes/index";
import { useMeta } from "../hooks/useMeta";
import { AnimatePresence, motion } from "framer-motion";
import GridPattern from "../ui/grid-pattern";
import PopularSites from "../../sites.json";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Separator } from "../ui/separator";
import Draggable from "react-draggable";
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
import { Dock, DockIcon } from "../ui/dock";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Button } from "../ui/button";
const DefaultHome = () => {
  const settingStore = useSettings();
  const [term, setTerm] = useState("");
  const [suggestions, setSuggestions] = useState<{ phrase: string }[]>([]);
  const [shouldOpen, setShouldOpen] = useState(false);
  const [openSearch, setOpenSearch] = useState(false);
  const [openSettings, setOpenSettings] = useState(false);
  const [changedTitle, setChangedTitle] = useState("");
  const [changedIcon, setChangedIcon] = useState("");
  const sponser = Route.useLoaderData();
  const frame = useRef<HTMLIFrameElement>(null);
  const dock = useRef<HTMLDivElement>(null);
  useMeta(settingStore.title, settingStore.icon);

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
  const canParse = (val: string): boolean => {
    val = val.trim();
    return (
      /^http(s?):\/\//.test(val) || (val.includes(".") && !val.startsWith(" "))
    );
  };
  const handleSearch = (p?: string, isPhrase = false) => {
    if (p && canParse(p)) {
      if (!p.startsWith("http://") && !p.startsWith("https://")) {
        p = "https://" + p;
      }
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
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute z-[999999] w-full -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 flex items-center justify-center flex-col space-y-2"
            >
              <Input
                className="text-white w-[30%] rounded-2xl bg-card/80 focus-visible:ring-primary/30 border-primary/20 shadow-lg"
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
                          className="bg-card/70 min-w-[100%] md:h-12 transform hover:translate-y-1 backdrop-blur-md border border-primary/10 rounded-xl select-none cursor-pointer shadow-lg p-3 hover:shadow-2xl hover:bg-card/90 transition-all"
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
          `[mask-image:radial-gradient(600px_circle_at_center,white,transparent)] z-[0] ${
            shouldOpen ? "hidden" : ""
          }`
        )}
      />
      <iframe
        src=""
        ref={frame}
        className={`w-full h-screen ${shouldOpen ? "" : "hidden"} z-20`}
      ></iframe>
      <div
        className={`w-full min-h-screen flex items-center justify-center z-20 ${
          shouldOpen ? "hidden" : ""
        }`}
      >
        <div className="flex-col space-y-8 flex w-full h-full items-center justify-center">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="select-none font-display text-center text-5xl sm:text-2xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70 font-semibold md:text-7xl md:leading-[5rem]"
          >
            Emerald
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="sm:w-3/12 w-11/12 relative rounded-2xl focus:border-primary border border-input/30 bg-card/20 backdrop-blur-md shadow-lg flex space-x-2 items-center justify-center pr-2 hover:shadow-xl transition-all"
          >
            <Input
              className="text-white/80 sm:w-[95%] w-full rounded-2xl focus-visible:ring-0 border-none bg-transparent"
              placeholder={`Using ${settingStore.searchEngine.name} as search engine and ${settingStore.proxy} as proxy`}
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch(term);
                }
              }}
            />
            <DropdownMenu>
              <DropdownMenuTrigger className="focus:ring-0 outline-none">
                <div className="min-h-8 hover:scale-110 transition-transform">
                  {["DuckDuckgo", "Google", "brave"].includes(
                    settingStore.searchEngine.name
                  ) ? (
                    <img
                      src={`/searchEngines/${settingStore.searchEngine.name}.png`}
                      alt={`${settingStore.searchEngine.name} search Engine`}
                      className="h-8"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Search className="h-6 w-6 text-primary" />
                    </div>
                  )}
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="rounded-2xl p-2 flex items-center justify-center flex-col w-fit bg-card/80 backdrop-blur-md border-primary/10">
                <DropdownMenuItem
                  className={`rounded-2xl w-fit flex space-x-2 cursor-pointer disabled:opacity-50 hover:bg-primary/10 transition-colors`}
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
                  className={`rounded-2xl w-full flex space-x-2 cursor-pointer disabled:opacity-50 hover:bg-primary/10 transition-colors`}
                  disabled={settingStore.searchEngine.name === "brave"}
                  onClick={() =>
                    settingStore.setSearchEngine(
                      "brave",
                      "https://search.brave.com/search?q="
                    )
                  }
                >
                  <img src="/searchEngines/brave.png" className="h-8" alt="" />
                  <div>Brave</div>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className={`rounded-2xl w-fit flex space-x-2 cursor-pointer disabled:opacity-50 min-w-full hover:bg-primary/10 transition-colors`}
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
          </motion.div>
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
                      className="bg-card/50 min-w-[100%] backdrop-blur-md border border-primary/10 rounded-xl select-none cursor-pointer shadow-lg p-3 hover:shadow-2xl hover:bg-card/70 transition-all"
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
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="min-h-[50%] w-[20%] xl:w-[16%] border border-primary/10 sm:flex hidden absolute right-[10rem] justify-center backdrop-blur-md p-4 bg-card/20 rounded-2xl shadow-lg hover:shadow-xl"
        >
          <div className="relative w-full min-h-full flex flex-col items-center justify-center space-y-3">
            <h2 className="sm:text-xs md:text-sm lg:text-2xl font-medium bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
              Popular sites
            </h2>
            <div className="w-full h-full flex flex-col space-y-2 ">
              {PopularSites.map((site, index) => (
                <motion.div
                  whileHover={{ scale: 1.03, y: -2 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  onClick={() => handleSearch(site.url)}
                  key={index}
                  className="w-full p-2  hover:bg-primary/5 cursor-pointer focus:bg-accent focus:text-accent-foreground border-card/30 border rounded-2xl flex gap-4 items-center mx-auto"
                >
                  <img
                    src={site.icon}
                    className="w-8 h-8 rounded-full shadow-sm"
                    alt={site.name}
                  />
                  <h3 className="w-full text-center sm:text-xs md:text-sm lg:text-base">
                    {site.name}
                  </h3>
                </motion.div>
              ))}
            </div>
            <Separator className="my-4 bg-primary/10" />
            <div className="w-full h-full flex flex-col items-center justify-center space-y-2">
              {sponser !== undefined && (
                <>
                  <h2 className="sm:text-xs md:text-sm lg:text-xl font-medium bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-amber-600">
                    🌟 Spotlight 🌟
                  </h2>
                  <motion.div
                    className="w-full h-full flex items-center justify-center px-4 gap-2 border border-amber-500/20 rounded-2xl select-none cursor-pointer shadow-lg p-3 hover:shadow-2xl bg-gradient-to-br from-amber-500/5 to-transparent"
                    onClick={() => handleSearch(sponser.url)}
                    whileHover={{
                      y: -5,
                      transition: { duration: 0.1 },
                      boxShadow: "0 10px 25px -5px rgba(245, 158, 11, 0.1)",
                    }}
                  >
                    <img
                      src={sponser.icon}
                      alt={sponser.title}
                      className="w-16 h-16 rounded-2xl shadow-md"
                    />
                    <div className="w-full h-full flex flex-col items-center justify-center">
                      <h3 className="font-bold text-center sm:text-sm md:text-base lg:text-lg">
                        {sponser.title}
                      </h3>
                      <a
                        href={sponser.discord}
                        className="underline text-amber-500 hover:text-amber-400 transition-colors"
                      >
                        <p className="text-center sm:text-xs md:text-xs lg:xs">
                          Click here to join their discord!
                        </p>
                      </a>
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
        <div className="max-w-[10rem] h-fit flex absolute bottom-5 left-[47.7%] translate-x-[-50%]">
          {shouldOpen && (
            <div className="handle cursor-move supports-backdrop-blur:bg-white/30 supports-backdrop-blur:dark:bg-black/10 mx-auto mt-8 flex h-[58px] w-max gap-2 rounded-2xl border border-primary/20 p-2 backdrop-blur-md rounded-l-2xl rounded-r-none items-center shadow-md">
              <AlignJustify className="w-6 h-6 text-primary" />
            </div>
          )}
          <Dock
            direction="middle"
            magnification={50}
            className={`${shouldOpen ? "bg-card/90 backdrop-blur-md border border-primary/20 shadow-lg rounded-l-none" : "bg-card/50 backdrop-blur-md border border-primary/10 shadow-lg"}`}
            ref={dock}
          >
            {shouldOpen && (
              <div className="flex space-x-4">
                <ArrowLeft
                  onClick={() => {
                    frame.current!.contentWindow?.history.back();
                  }}
                  className="transform hover:-translate-y-1 transition-all hover:scale-105 cursor-pointer text-primary/80 hover:text-primary"
                />
                <ArrowRight
                  className="transform hover:-translate-y-1 transition-all hover:scale-105 cursor-pointer text-primary/80 hover:text-primary"
                  onClick={() =>
                    frame.current?.contentWindow?.history.forward()
                  }
                />
              </div>
            )}

            <DockIcon>
              <House
                className="w-6 h-6 hover:w-8 hover:h-8 transition-all transform hover:-translate-y-2 text-primary/80 hover:text-primary"
                onClick={() => {
                  window.location.reload();
                }}
              />
            </DockIcon>
            <DockIcon>
              <Link to="/games">
                <Gamepad className="w-6 h-6 hover:w-7 hover:h-7 transition-all transform hover:-translate-y-2 text-primary/80 hover:text-primary" />
              </Link>
            </DockIcon>
            <DockIcon>
              <Link to="/chat">
                <MessageCircle className="w-6 h-6 hover:w-7 hover:h-7 transition-all transform hover:-translate-y-2 text-primary/80 hover:text-primary" />
              </Link>
            </DockIcon>
            <DockIcon>
              <Cog
                onClick={() => setOpenSettings(true)}
                className="w-6 h-6 hover:w-7 hover:h-7 transition-all transform hover:-translate-y-2 text-primary/80 hover:text-primary"
              />
            </DockIcon>
            <DockIcon>
              <motion.img
                whileHover={{ scale: 1.2, y: -5 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                src="/discordDock.svg"
                className="w-6 h-6 transition-all"
                onClick={() =>
                  window.open("https://discord.gg/Dpj8C8SAmH", "_blank")
                }
                alt={"Discord Logo"}
              />
            </DockIcon>
            {shouldOpen && (
              <DockIcon>
                <Search
                  className="w-6 h-6 hover:w-7 hover:h-7 transition-all transform hover:-translate-y-2 text-primary/80 hover:text-primary"
                  onClick={() => setOpenSearch(!openSearch)}
                />
              </DockIcon>
            )}
          </Dock>
        </div>
      </Draggable>

      <Dialog open={openSettings} onOpenChange={setOpenSettings}>
        <DialogContent
          className="max-w-[45rem] border-none overflow-y-auto flex flex-col bg-card/90 backdrop-blur-xl shadow-xl"
          style={{ borderRadius: 15 }}
        >
          <DialogHeader>
            <DialogTitle className="text-5xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
              Settings
            </DialogTitle>
            <DialogDescription className="text-base">
              Change the look or behavior of Emerald
            </DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="proxy">
            <TabsList className="flex space-x-4 bg-transparent">
              <TabsTrigger
                value="proxy"
                className="text-2xl p-2 hover:bg-secondary-foreground/15 hover:text-primary rounded-[0.4rem] transition-all"
              >
                Proxy
              </TabsTrigger>
              <TabsTrigger
                value="appearance"
                className="text-2xl p-2 hover:bg-secondary-foreground/15 hover:text-primary rounded-[0.4rem] transition-all"
              >
                Appearance
              </TabsTrigger>
            </TabsList>
            <TabsContent
              value="proxy"
              className="outline-none focus-within:ring-0"
            >
              <div className="flex flex-col space-y-2">
                <Separator className="my-2 bg-primary/10" />
                <div className="flex justify-between px-4 items-center">
                  <h3 className="text-xl font-medium">Current proxy</h3>
                  <Select
                    onValueChange={(e) =>
                      settingStore.setProxy(e as "uv" | "scramjet")
                    }
                  >
                    <SelectTrigger className="w-[40%] rounded-2xl bg-card/50 border-primary/10 hover:border-primary/30 transition-colors">
                      <SelectValue placeholder={`${settingStore.proxy}`} />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl bg-card/90 backdrop-blur-xl border-primary/10">
                      <SelectItem
                        className="rounded-2xl"
                        value="uv"
                        disabled={settingStore.proxy === "uv"}
                      >
                        Ultraviolet
                      </SelectItem>
                      <SelectItem
                        value="scramjet"
                        className="rounded-xl hover:bg-primary/5 transition-colors cursor-pointer"
                        disabled={settingStore.proxy === "scramjet"}
                      >
                        Scramjet (BETA)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-between px-4 items-center">
                  <h3 className="text-xl font-medium">Transport</h3>
                  <Select
                    onValueChange={(e) =>
                      settingStore.setTransport(
                        (e as "libcurl" | "epoxy") == "libcurl"
                          ? "/libcurl/index.mjs"
                          : "/epoxy/index.mjs",
                        e as "libcurl" | "epoxy"
                      )
                    }
                  >
                    <SelectTrigger className="w-[40%] rounded-2xl bg-card/50 border-primary/10 hover:border-primary/30 transition-colors">
                      <SelectValue
                        placeholder={`${settingStore.transport.name}`}
                      />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl bg-card/90 backdrop-blur-xl border-primary/10">
                      <SelectItem
                        className="rounded-2xl"
                        value="libcurl"
                        disabled={settingStore.transport.name === "libcurl"}
                      >
                        Libcurl
                      </SelectItem>
                      <SelectItem
                        value="epoxy"
                        className="rounded-xl hover:bg-primary/5 transition-colors cursor-pointer"
                        disabled={settingStore.transport.name === "epoxy"}
                      >
                        Epoxy
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>
            <TabsContent
              value="appearance"
              className="outline-none focus-within:ring-0"
            >
              <div className="flex flex-col space-y-2">
                <Separator className="my-2 bg-primary/10" />
                <div className="flex justify-between px-4 items-center">
                  <h3 className="text-xl font-medium">Site Type</h3>
                  <Select
                    onValueChange={(e) =>
                      settingStore.setSiteType(e as "browser" | "default")
                    }
                  >
                    <SelectTrigger className="w-[40%] rounded-2xl bg-card/50 border-primary/10 hover:border-primary/30 transition-colors">
                      <SelectValue placeholder={`${settingStore.siteType}`} />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl bg-card/90 backdrop-blur-xl border-primary/10">
                      <SelectItem
                        className="rounded-2xl"
                        value="default"
                        disabled={settingStore.siteType === "default"}
                      >
                        Default
                      </SelectItem>
                      <SelectItem
                        value="browser"
                        className="rounded-xl hover:bg-primary/5 transition-colors cursor-pointer"
                        disabled={settingStore.siteType === "browser"}
                      >
                        Browser
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-between px-4 items-center">
                  <h3 className="text-xl font-medium">Title</h3>
                  <Input
                    className="w-[40%] rounded-2xl bg-card/50 border-primary/10 hover:border-primary/30 transition-colors focus-visible:ring-primary/20 focus-visible:border-primary/40"
                    value={changedTitle}
                    onChange={(e) => setChangedTitle(e.target.value)}
                    placeholder={`${settingStore.title}`}
                  />
                </div>
                <div className="flex justify-between px-4 items-center">
                  <h3 className="text-xl font-medium">Icon</h3>
                  <Input
                    className="w-[40%] rounded-2xl bg-card/50 border-primary/10 hover:border-primary/30 transition-colors focus-visible:ring-primary/20 focus-visible:border-primary/40"
                    value={changedIcon}
                    onChange={(e) => setChangedIcon(e.target.value)}
                    placeholder={`${settingStore.icon}`}
                  />
                </div>
                <div className="flex justify-between px-4 items-center">
                  <h3 className="text-xl font-medium">Cloak</h3>
                  <Select
                    onValueChange={(e) =>
                      settingStore.setCloak(e as "none" | "aboutBlank")
                    }
                  >
                    <SelectTrigger className="w-[40%] rounded-2xl bg-card/50 border-primary/10 hover:border-primary/30 transition-colors">
                      <SelectValue placeholder={`${settingStore.cloak}`} />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl bg-card/90 backdrop-blur-xl border-primary/10">
                      <SelectItem
                        className="rounded-2xl"
                        value="none"
                        disabled={settingStore.cloak === "none"}
                      >
                        None
                      </SelectItem>
                      <SelectItem
                        value="aboutBlank"
                        className="rounded-xl hover:bg-primary/5 transition-colors cursor-pointer"
                        disabled={settingStore.cloak === "aboutBlank"}
                      >
                        About:Blank
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-center px-4 py-4">
                  <Button
                    className="rounded-2xl bg-primary/80 hover:bg-primary transition-colors shadow-md hover:shadow-lg"
                    onClick={() => {
                      if (changedTitle) {
                        settingStore.setTitle(changedTitle);
                      }
                      if (changedIcon) {
                        settingStore.setIcon(changedIcon);
                      }
                      setChangedTitle("");
                      setChangedIcon("");
                    }}
                  >
                    Save
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DefaultHome;
