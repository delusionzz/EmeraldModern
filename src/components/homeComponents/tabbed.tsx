import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Plus,
  Maximize,
  Minimize,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Settings,
  Search,
  Home,
  Bookmark,
} from "lucide-react";
import { Checkbox } from "../ui/checkbox";
import { cn } from "@/lib/utils";
import GridPattern from "../ui/grid-pattern";
import { Input } from "../ui/input";
import { useSettings } from "@/store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Separator } from "../ui/separator";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Obfuscate } from "../obf";
import { VERSION } from "@/constants";
interface Tab {
  id: string;
  title: string;
  url: string;
  favicon?: string;
  isActive: boolean;
}

interface Bookmark {
  id: string;
  title: string;
  url: string;
  favicon?: string;
  color?: string;
}

const defaultBookmarks: Bookmark[] = [
  {
    id: "google",
    title: "Google",
    url: "https://www.google.com",
    favicon: "/searchEngines/Google.png",
    color: "#4285F4",
  },
  {
    id: "discord",
    title: "Discord",
    url: "https://discord.com",
    favicon: "/logos/discord.svg",
    color: "#4285F4",
  },
  {
    id: "youtube",
    title: "YouTube",
    url: "https://www.youtube.com",
    favicon: "/logos/youtube.png",
    color: "#FF0000",
  },
  {
    id: "github",
    title: "GitHub",
    url: "https://github.com",
    favicon: "/logos/github.svg",
    color: "#24292e",
  },
  {
    id: "twitter",
    title: "Twitter",
    url: "https://twitter.com",
    favicon: "/logos/x.png",
    color: "#1DA1F2",
  },
  {
    id: "reddit",
    title: "Reddit",
    url: "https://www.reddit.com",
    favicon: "/logos/reddit.svg",
    color: "#FF4500",
  },
];

const BookmarkItem = ({
  bookmark,
  onClick,
}: {
  bookmark: Bookmark;
  onClick: () => void;
}) => {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center p-4 rounded-xl bg-card/50 hover:bg-card/80 border border-border/30 transition-colors h-[120px]"
    >
      {bookmark.favicon ? (
        <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center mb-2 overflow-hidden">
          <img src={bookmark.favicon} alt="" className="w-6 h-6" />
        </div>
      ) : (
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center mb-2 text-white font-bold"
          style={{ backgroundColor: bookmark.color || "#6366F1" }}
        >
          {bookmark.title.charAt(0).toUpperCase()}
        </div>
      )}
      <span className="text-sm font-medium truncate max-w-full">
        {bookmark.title}
      </span>
    </button>
  );
};

const SettingsPage = () => {
  const settingsStore = useSettings();
  return (
    <AnimatePresence mode="wait">
      <div className="w-full h-full overflow-auto bg-gradient-to-br from-background to-background/90 p-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h1 className="text-4xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
              Settings
            </h1>
          </motion.div>

          <Tabs defaultValue="appearance" className="w-full relative">
            <TabsList className="mb-6 p-1.5 bg-background/50 border border-border/20 backdrop-blur-md rounded-xl">
              <TabsTrigger value="appearance" className="text-sm rounded-lg">
                Appearance
              </TabsTrigger>

              <TabsTrigger value="search" className="text-sm rounded-lg">
                Search Engine
              </TabsTrigger>
              <TabsTrigger value="proxy" className="text-sm rounded-lg">
                Proxy Settings
              </TabsTrigger>
              <TabsTrigger value="about" className="text-sm rounded-lg">
                About
              </TabsTrigger>
            </TabsList>

            <motion.div className="relative min-h-[500px]">
              <AnimatePresence mode="wait">
                <TabsContent
                  value="appearance"
                  className="space-y-6 absolute top-0 left-0 w-full data-[state=inactive]:hidden data-[state=inactive]:pointer-events-none"
                >
                  <Card className="border-border/30 bg-card/80 backdrop-blur-xl shadow-lg rounded-xl overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent pb-6">
                      <CardTitle className="text-xl flex items-center gap-2">
                        <Settings className="h-5 w-5 text-primary" />
                        Appearance
                      </CardTitle>
                      <CardDescription>
                        Customize how Emerald looks
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8 pt-6">
                      <div>
                        <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                          <span className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            1
                          </span>
                          Page Title
                        </h3>
                        <Input
                          value={settingsStore.title}
                          onChange={(e) =>
                            settingsStore.setTitle(e.target.value)
                          }
                          className="max-w-md bg-background/50 border-border/30 focus-visible:ring-primary/30 focus-visible:border-primary/50 transition-all"
                        />
                        <p className="text-sm text-muted-foreground mt-2 ml-8">
                          This will the current title that appears in your
                          browser
                        </p>
                      </div>

                      <Separator className="bg-border/20" />

                      <div>
                        <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                          <span className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            2
                          </span>
                          Favicon
                        </h3>
                        <Input
                          value={settingsStore.icon}
                          onChange={(e) =>
                            settingsStore.setIcon(e.target.value)
                          }
                          className="max-w-md bg-background/50 border-border/30 focus-visible:ring-primary/30 focus-visible:border-primary/50 transition-all"
                        />
                        <p className="text-sm text-muted-foreground mt-2 ml-8">
                          URL to the icon that will appear in your browser tab
                        </p>
                      </div>
                      <Separator className="bg-border/20" />

                      <div>
                        <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                          <span className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            3
                          </span>
                          Site Type
                        </h3>
                        <Select
                          value={settingsStore.siteType}
                          onValueChange={(value) =>
                            settingsStore.setSiteType(
                              value as "browser" | "default"
                            )
                          }
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select site type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="browser">Browser</SelectItem>
                            <SelectItem value="default">Default</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-sm text-muted-foreground mt-2 ml-8">
                          The main look of Emerald that YOU can change
                        </p>
                      </div>

                      <Separator className="bg-border/20" />

                      <div>
                        <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                          <span className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            4
                          </span>
                          Cloaking
                        </h3>
                        <Select
                          value={settingsStore.cloak}
                          onValueChange={(value) =>
                            settingsStore.setCloak(
                              value as "none" | "aboutBlank"
                            )
                          }
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select cloaking method" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            <SelectItem value="aboutBlank">
                              About:Blank
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-sm text-muted-foreground mt-2 ml-8">
                          Hide Emerald using cloaking methods
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </AnimatePresence>

              <TabsContent
                value="search"
                className="space-y-6 absolute top-0 left-0 w-full data-[state=inactive]:hidden data-[state=inactive]:pointer-events-none"
              >
                <Card className="border-border/30 bg-card/80 backdrop-blur-xl shadow-lg rounded-xl overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-green-500/10 to-transparent pb-6">
                    <CardTitle className="text-xl flex items-center gap-2">
                      <Search className="h-5 w-5 text-green-500" />
                      Search Engine
                    </CardTitle>
                    <CardDescription>
                      Configure your preferred search engine
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8 pt-6">
                    <div>
                      <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                        <span className="h-6 w-6 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                          1
                        </span>
                        Search Engine Name
                      </h3>
                      <Input
                        value={settingsStore.searchEngine.name}
                        onChange={(e) => {
                          settingsStore.setSearchEngine(
                            e.target.value,
                            settingsStore.searchEngine.url
                          );
                        }}
                        className="max-w-md bg-background/50 border-border/30 focus-visible:ring-green-500/30 focus-visible:border-green-500/50 transition-all"
                        placeholder="Google"
                      />
                      <p className="text-sm text-muted-foreground mt-2 ml-8">
                        The name of your preferred search engine
                      </p>
                    </div>

                    <Separator className="bg-border/20" />

                    <div>
                      <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                        <span className="h-6 w-6 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                          2
                        </span>
                        Search URL
                      </h3>
                      <Input
                        value={settingsStore.searchEngine.url}
                        onChange={(e) => {
                          settingsStore.setSearchEngine(
                            settingsStore.searchEngine.name,
                            e.target.value
                          );
                        }}
                        className="max-w-md bg-background/50 border-border/30 focus-visible:ring-green-500/30 focus-visible:border-green-500/50 transition-all"
                        placeholder="https://www.google.com/search?q="
                      />
                      <p className="text-sm text-muted-foreground mt-2 ml-8">
                        The URL used for searches (must end with the query
                        parameter)
                      </p>
                    </div>

                    <Separator className="bg-border/20" />

                    <div>
                      <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                        <span className="h-6 w-6 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                          3
                        </span>
                        Preset Search Engines
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                        <button
                          onClick={() => {
                            settingsStore.setSearchEngine(
                              "Google",
                              "https://www.google.com/search?q="
                            );
                            toast.success("Google search engine selected");
                          }}
                          className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border border-border/30 hover:bg-background/80 transition-colors"
                        >
                          <div className="w-8 h-8 rounded-full bg-[#4285F4] flex items-center justify-center text-white font-bold">
                            G
                          </div>
                          <span>Google</span>
                        </button>

                        <button
                          onClick={() => {
                            settingsStore.setSearchEngine(
                              "Bing",
                              "https://www.bing.com/search?q="
                            );
                            toast.success("Bing search engine selected");
                          }}
                          className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border border-border/30 hover:bg-background/80 transition-colors"
                        >
                          <div className="w-8 h-8 rounded-full bg-[#008373] flex items-center justify-center text-white font-bold">
                            B
                          </div>
                          <span>Bing</span>
                        </button>

                        <button
                          onClick={() => {
                            settingsStore.setSearchEngine(
                              "DuckDuckGo",
                              "https://duckduckgo.com/?q="
                            );
                            toast.success("DuckDuckGo search engine selected");
                          }}
                          className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border border-border/30 hover:bg-background/80 transition-colors"
                        >
                          <div className="w-8 h-8 rounded-full bg-[#DE5833] flex items-center justify-center text-white font-bold">
                            D
                          </div>
                          <span>DuckDuckGo</span>
                        </button>

                        <button
                          onClick={() => {
                            settingsStore.setSearchEngine(
                              "Yahoo",
                              "https://search.yahoo.com/search?p="
                            );
                            toast.success("Yahoo search engine selected");
                          }}
                          className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border border-border/30 hover:bg-background/80 transition-colors"
                        >
                          <div className="w-8 h-8 rounded-full bg-[#5F01D1] flex items-center justify-center text-white font-bold">
                            Y
                          </div>
                          <span>Yahoo</span>
                        </button>

                        <button
                          onClick={() => {
                            settingsStore.setSearchEngine(
                              "brave",
                              "https://search.brave.com/search?q="
                            );
                            toast.success(
                              "Brave Search search engine selected"
                            );
                          }}
                          className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border border-border/30 hover:bg-background/80 transition-colors"
                        >
                          <div className="w-8 h-8 rounded-full bg-[#FB542B] flex items-center justify-center text-white font-bold">
                            B
                          </div>
                          <span>Brave Search</span>
                        </button>

                        <button
                          onClick={() => {
                            settingsStore.setSearchEngine(
                              "Ecosia",
                              "https://www.ecosia.org/search?q="
                            );
                            toast.success("Ecosia search engine selected");
                          }}
                          className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border border-border/30 hover:bg-background/80 transition-colors"
                        >
                          <div className="w-8 h-8 rounded-full bg-[#4C7D41] flex items-center justify-center text-white font-bold">
                            E
                          </div>
                          <span>Ecosia</span>
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent
                value="proxy"
                className="space-y-6 absolute top-0 left-0 w-full data-[state=inactive]:hidden data-[state=inactive]:pointer-events-none"
              >
                <Card className="border-border/30 bg-card/80 backdrop-blur-xl shadow-lg rounded-xl overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-purple-500/10 to-transparent pb-6">
                    <CardTitle className="text-xl flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-5 w-5 text-purple-500"
                      >
                        <path d="M4 11a9 9 0 0 1 9 9"></path>
                        <path d="M4 4a16 16 0 0 1 16 16"></path>
                        <circle cx="5" cy="19" r="2"></circle>
                      </svg>
                      <Obfuscate text="Proxy" /> Settings
                    </CardTitle>
                    <CardDescription>
                      Configure proxy settings for web browsing
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8 pt-6">
                    <div>
                      <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                        <span className="h-6 w-6 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                          1
                        </span>
                        Choose your <Obfuscate text="Proxy" />
                      </h3>
                      <Select
                        value={settingsStore.proxy}
                        onValueChange={(value) => {
                          settingsStore.setProxy(value as "uv" | "scramjet");
                          toast.success(`${value} selected`);
                        }}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Select value" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="uv">
                            <div className="flex items-center gap-2">
                              <span>
                                <Obfuscate text="Ultraviolet" />
                              </span>
                            </div>
                          </SelectItem>
                          <SelectItem value="scramjet">
                            <div className="flex items-center gap-2">
                              <span>
                                <Obfuscate text="Scramjet" />
                              </span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-muted-foreground mt-2 ml-8">
                        The <Obfuscate text="proxy" /> you want to use for web
                        browsing
                      </p>
                    </div>

                    <Separator className="bg-border/20" />

                    <div>
                      <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                        <span className="h-6 w-6 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500">
                          2
                        </span>
                        Tab Features
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500 border border-yellow-200 dark:border-yellow-800/30">
                          Experimental
                        </span>
                      </h3>
                      {/**
                       * TODO: fix styling for this bcs i really like it but its prettty ugly
                       */}
                      {/* <div className="mb-4 p-2 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/30 rounded-lg text-amber-800 dark:text-amber-500 text-sm flex items-start gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-5 w-5 mt-0.5 flex-shrink-0"
                        >
                          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                          <line x1="12" y1="9" x2="12" y2="13"></line>
                          <line x1="12" y1="17" x2="12.01" y2="17"></line>
                        </svg>
                        <div>
                          <p className="font-medium">Experimental Feature</p>
                          <p className="mt-1">
                            These features are still in development and may
                            cause unexpected behavior. Use with caution.
                          </p>
                        </div>
                      </div> */}

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="allow-tab-reordering"
                          checked={settingsStore.allowTabReordering}
                          onCheckedChange={(checked) => {
                            settingsStore.setAllowTabReordering(
                              checked === true
                            );
                            toast.success(
                              `Tab reordering ${checked ? "enabled" : "disabled"}`
                            );
                          }}
                        />
                        <label
                          htmlFor="allow-tab-reordering"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Allow tab reordering
                        </label>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2 ml-8">
                        Enable or disable the ability to reorder tabs by
                        dragging them
                      </p>
                    </div>

                    <Separator className="bg-border/20" />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent
                value="about"
                className="space-y-6 absolute top-0 left-0 w-full data-[state=inactive]:hidden data-[state=inactive]:pointer-events-none"
              >
                <Card className="border-border/30 bg-card/80 backdrop-blur-xl shadow-lg rounded-xl overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-amber-500/10 to-transparent pb-6">
                    <CardTitle className="text-xl flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-5 w-5 text-amber-500"
                      >
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="M12 16v-4"></path>
                        <path d="M12 8h.01"></path>
                      </svg>
                      About Emerald
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-8 pt-6">
                    <div className="flex flex-col items-center justify-center py-6">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center mb-4 shadow-lg">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-white"
                        >
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                        </svg>
                      </div>
                      <h3 className="text-2xl font-bold mb-2">
                        Emerald Modern
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Version {VERSION}
                      </p>
                      <p className="text-sm text-center max-w-md mb-6">
                        A modern, sleek web browser interface built with React
                        and Tailwind CSS.
                      </p>
                      <div className="text-sm text-muted-foreground">
                        Created with ❤️ by illusions
                      </div>
                      <data className="text-sm text-muted-foreground">
                        This project uses <Obfuscate text="Scramjet" /> created
                        by mercury workshop, join their{" "}
                        <a href="https://discord.gg/88CapFYSEd">
                          <Obfuscate text="Discord here" />
                        </a>
                      </data>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </motion.div>
          </Tabs>
        </div>
      </div>
    </AnimatePresence>
  );
};

const TabbedHome = () => {
  const [tabs, setTabs] = useState<Tab[]>([
    { id: "default", title: "New Tab", url: "", favicon: "", isActive: true },
  ]);
  const [inputUrl, setInputUrl] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(defaultBookmarks);
  const [draggedTabId, setDraggedTabId] = useState<string | null>(null);
  const iframeRefs = useRef<{ [key: string]: HTMLIFrameElement | null }>({});
  const tabBarRef = useRef<HTMLDivElement>(null);
  const urlInputRef = useRef<HTMLInputElement>(null);
  const settingsStore = useSettings();

  const handleBookmarkClick = (bookmark: Bookmark) => {
    const activeTabIndex = tabs.findIndex((tab) => tab.isActive);
    if (activeTabIndex !== -1) {
      const updatedTabs = [...tabs];
      updatedTabs[activeTabIndex] = {
        ...updatedTabs[activeTabIndex],
        url: bookmark.url,
        title: bookmark.title,
      };
      setTabs(updatedTabs);
      setInputUrl(bookmark.url);

      const activeTabId = updatedTabs[activeTabIndex].id;
      if (iframeRefs.current[activeTabId]) {
        const encodedUrl = encodeURIComponent(bookmark.url);
        iframeRefs.current[activeTabId]!.src =
          `/~/${settingsStore.proxy}/${encodedUrl}`;
      }
    }
  };

  const handleAddBookmark = () => {
    const activeTab = tabs.find((tab) => tab.isActive);
    if (activeTab && activeTab.url && !activeTab.url.startsWith("about:")) {
      const newBookmark: Bookmark = {
        id: `bookmark-${Date.now()}`,
        title: activeTab.title,
        url: activeTab.url,
        favicon: activeTab.favicon,
        color: "#6366F1",
      };
      setBookmarks((prevBookmarks) => [...prevBookmarks, newBookmark]);
      toast.success("Bookmark added!");
    } else {
      toast.error("No active tab or the current tab is a internal tab.");
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "s") {
        e.preventDefault();
        if (urlInputRef.current) {
          urlInputRef.current.focus();
          urlInputRef.current.select();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    const updateTabWidths = () => {
      if (!tabBarRef.current) return;
      const containerWidth = tabBarRef.current.clientWidth;
      const tabCount = tabs.length;
      const addButtonWidth = 40;
      const controlsWidth = 0;
      const tabMargin = 4;

      const availableWidth = containerWidth - addButtonWidth - controlsWidth;
      const idealTabWidth = 180;
      const minTabWidth = 100;

      let tabWidth = idealTabWidth;
      if (tabCount * (idealTabWidth + tabMargin) > availableWidth) {
        tabWidth = Math.max(minTabWidth, availableWidth / tabCount - tabMargin);
      }

      const tabElements = tabBarRef.current.querySelectorAll("[data-tab-id]");
      tabElements.forEach((tab) => {
        (tab as HTMLElement).style.width = `${tabWidth}px`;
        (tab as HTMLElement).style.minWidth = `${tabWidth}px`;
        (tab as HTMLElement).style.maxWidth = `${idealTabWidth}px`;
      });
    };

    updateTabWidths();
    window.addEventListener("resize", updateTabWidths);
    return () => window.removeEventListener("resize", updateTabWidths);
  }, [tabs.length]);

  const addTab = () => {
    const newTab: Tab = {
      id: `tab-${Date.now()}`,
      title: "New Tab",
      url: "",
      favicon: "",
      isActive: true,
    };
    setTabs((prevTabs) =>
      prevTabs.map((tab) => ({ ...tab, isActive: false })).concat(newTab)
    );
    setInputUrl("");
    if (urlInputRef.current) {
      urlInputRef.current.focus();
    }
  };

  const closeTab = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (tabs.length === 1 && tabs[0].id === id) {
      setTabs([
        {
          id: "default",
          title: "New Tab",
          url: "",
          favicon: "",
          isActive: true,
        },
      ]);
      setInputUrl("");
      return;
    }

    const tabIndex = tabs.findIndex((tab) => tab.id === id);
    if (tabIndex === -1) return; // Should not happen

    const wasActive = tabs[tabIndex].isActive;
    const newTabs = tabs.filter((tab) => tab.id !== id);

    if (wasActive && newTabs.length > 0) {
      const newActiveIndex = Math.max(0, tabIndex - 1);
      newTabs[newActiveIndex].isActive = true;
      setInputUrl(newTabs[newActiveIndex].url);
    } else if (newTabs.length > 0 && !newTabs.some((t) => t.isActive)) {
      newTabs[0].isActive = true;
      setInputUrl(newTabs[0].url);
    }

    setTabs(newTabs);
    // delete iframeRefs.current[id];
  };

  const activateTab = (id: string) => {
    setTabs((prevTabs) =>
      prevTabs.map((tab) => ({
        ...tab,
        isActive: tab.id === id,
      }))
    );
    const activeTab = tabs.find((tab) => tab.id === id);
    if (activeTab) {
      setInputUrl(activeTab.url);
    }
  };

  useEffect(() => {
    const cleanupFunctions: { [tabId: string]: () => void } = {};

    tabs.forEach((tab) => {
      if (!tab.url || tab.url.startsWith("about:")) return; // No need for listener on blank or internal tabs

      const iframe = iframeRefs.current[tab.id];
      if (!iframe) return;

      const handleIframeLoad = () => {
        try {
          if (iframe.contentWindow && iframe.contentWindow.document) {
            const iframeDocument = iframe.contentWindow.document;
            const pageTitle = iframeDocument.title;
            let pageFavicon = "";

            const faviconLink = iframeDocument.querySelector(
              "link[rel='icon'], link[rel='shortcut icon']"
            ) as HTMLLinkElement;
            if (faviconLink) {
              pageFavicon = faviconLink.href;
            }
            setTabs((prevTabs) =>
              prevTabs.map((prevTab) =>
                prevTab.id === tab.id
                  ? {
                      ...prevTab,
                      title: pageTitle || prevTab.title,
                      favicon: pageFavicon || prevTab.favicon,
                    }
                  : prevTab
              )
            );
          }
        } catch (error) {
          console.warn(
            `Could not access iframe content for title/favicon update (tab ${tab.id}):`,
            error
          );
          setTabs((prevTabs) =>
            prevTabs.map((prevTab) =>
              prevTab.id === tab.id && !prevTab.title.includes(".")
                ? {
                    ...prevTab,
                    title: prevTab.url.split("/")[2] || prevTab.url,
                  }
                : prevTab
            )
          );
        }
      };

      iframe.addEventListener("load", handleIframeLoad);
      cleanupFunctions[tab.id] = () => {
        iframe.removeEventListener("load", handleIframeLoad);
      };
    });

    return () => {
      Object.values(cleanupFunctions).forEach((cleanup) => cleanup());
    };
  }, [tabs]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        alert(
          `Error attempting to enable full-screen mode: ${err.message} (${err.name})`
        );
      });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    if (!settingsStore.allowTabReordering) return;

    setDraggedTabId(id);
    // Set a transparent drag image
    const img = new Image();
    img.src =
      "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
    e.dataTransfer.setDragImage(img, 0, 0);
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (
      !settingsStore.allowTabReordering ||
      !draggedTabId ||
      draggedTabId === id
    )
      return;

    const draggedTabIndex = tabs.findIndex((tab) => tab.id === draggedTabId);
    const targetTabIndex = tabs.findIndex((tab) => tab.id === id);

    if (draggedTabIndex === -1 || targetTabIndex === -1) return;

    // Reorder the tabs
    const newTabs = [...tabs];
    const [draggedTab] = newTabs.splice(draggedTabIndex, 1);
    newTabs.splice(targetTabIndex, 0, draggedTab);

    setTabs(newTabs);
  };

  const handleDragEnd = () => {
    setDraggedTabId(null);
  };

  const openSettings = () => {
    const settingsTabIndex = tabs.findIndex(
      (tab) => tab.url === "about:settings"
    );

    if (settingsTabIndex !== -1) {
      activateTab(tabs[settingsTabIndex].id);
    } else {
      // Open settings in a new tab
      const newTab: Tab = {
        id: `tab-${Date.now()}`,
        title: "Settings",
        url: "about:settings",
        favicon: "",
        isActive: true,
      };
      setTabs((prevTabs) =>
        prevTabs.map((tab) => ({ ...tab, isActive: false })).concat(newTab)
      );
      setInputUrl("about:settings");
    }
  };

  const refreshPage = () => {
    const activeTab = tabs.find((tab) => tab.isActive);
    if (
      activeTab &&
      iframeRefs.current[activeTab.id] &&
      !activeTab.url.startsWith("about:")
    ) {
      try {
        iframeRefs.current[activeTab.id]!.contentWindow?.location.reload();
      } catch (error) {
        console.error("Could not reload iframe:", error);
        iframeRefs.current[activeTab.id]!.src =
          iframeRefs.current[activeTab.id]!.src;
      }
    }
  };

  const goBack = () => {
    const activeTab = tabs.find((tab) => tab.isActive);
    if (
      activeTab &&
      iframeRefs.current[activeTab.id] &&
      !activeTab.url.startsWith("about:")
    ) {
      try {
        iframeRefs.current[activeTab.id]!.contentWindow?.history.back();
      } catch (error) {
        console.error("Could not navigate back:", error);
      }
    }
  };

  const goForward = () => {
    const activeTab = tabs.find((tab) => tab.isActive);
    if (
      activeTab &&
      iframeRefs.current[activeTab.id] &&
      !activeTab.url.startsWith("about:")
    ) {
      try {
        iframeRefs.current[activeTab.id]!.contentWindow?.history.forward();
      } catch (error) {
        console.error("Could not navigate forward:", error);
      }
    }
  };

  const handleUrlSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputUrl || inputUrl.startsWith("about:")) return;

    let processedUrl = inputUrl.trim();
    let isSearch = false;

    const looksLikeUrl =
      processedUrl.includes(".") && !processedUrl.includes(" ");

    if (
      !processedUrl.startsWith("http://") &&
      !processedUrl.startsWith("https://")
    ) {
      if (looksLikeUrl) {
        processedUrl = `https://${processedUrl}`;
      } else {
        processedUrl = `${settingsStore.searchEngine.url}${encodeURIComponent(processedUrl)}`;
        isSearch = true;
      }
    }

    const activeTabIndex = tabs.findIndex((tab) => tab.isActive);
    if (activeTabIndex !== -1) {
      const updatedTabs = [...tabs];
      const currentTab = updatedTabs[activeTabIndex];

      updatedTabs[activeTabIndex] = {
        ...currentTab,
        url: processedUrl,
        title: isSearch
          ? `Search: ${inputUrl}`
          : looksLikeUrl
            ? inputUrl
            : "Loading...",
        favicon: "",
      };
      setTabs(updatedTabs);

      const activeTabId = updatedTabs[activeTabIndex].id;
      if (iframeRefs.current[activeTabId]) {
        const encodedUrl = encodeURIComponent(processedUrl);
        iframeRefs.current[activeTabId]!.src =
          `/~/${settingsStore.proxy}/${encodedUrl}`;
      }
    }
  };

  return (
    <div className="flex flex-col w-full h-screen overflow-hidden bg-background/95 backdrop-blur-sm">
      {/* Tab bar */}
      <div className="flex items-center bg-background/80 backdrop-blur-md border-b border-border/40 h-12 px-1">
        <div
          ref={tabBarRef}
          className="flex-1 flex items-center overflow-x-auto overflow-y-hidden h-full"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {tabs.map((tab) => (
            <motion.div
              key={tab.id}
              data-tab-id={tab.id}
              onClick={() => activateTab(tab.id)}
              draggable
              onDragStart={(e) =>
                // @ts-expect-error blerb
                settingsStore.allowTabReordering && handleDragStart(e, tab.id)
              }
              onDragOver={(e) => handleDragOver(e, tab.id)}
              onDragEnd={handleDragEnd}
              className={cn(
                "flex-shrink-0 flex items-center justify-between h-9 px-3 relative rounded-t-lg mr-1 text-sm transition-all cursor-pointer group",
                tab.isActive
                  ? "bg-card text-card-foreground shadow-sm z-10"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted/80 mt-1",
                draggedTabId === tab.id && "opacity-50"
              )}
              initial={{ opacity: 0.8, y: 4 }}
              animate={{ opacity: 1, y: tab.isActive ? 0 : 4 }}
              transition={{ duration: 0.15 }}
              layout
            >
              <div className="flex items-center overflow-hidden mr-1">
                {tab.favicon ? (
                  <img
                    src={tab.favicon}
                    alt=""
                    className="w-4 h-4 mr-2 flex-shrink-0"
                    onError={(e) => (e.currentTarget.style.display = "none")}
                  />
                ) : (
                  !tab.url.startsWith("about:") && (
                    <div className="w-4 h-4 mr-2 flex-shrink-0 rounded-sm bg-primary/10 flex items-center justify-center">
                      <Home size={10} className="text-primary" />
                    </div>
                  )
                )}
                <span className="truncate font-medium">{tab.title}</span>
              </div>
              <button
                onClick={(e) => closeTab(tab.id, e)}
                className="ml-1 p-0.5 rounded-full hover:bg-muted-foreground/20 flex-shrink-0 opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity"
              >
                <X size={14} />
              </button>
              {!tab.isActive && (
                <div className="absolute right-0 top-1 bottom-1 w-px bg-border/30 group-hover:bg-transparent"></div>
              )}
              {tab.isActive && (
                <motion.div
                  className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-primary rounded-full"
                  layoutId="activeTabIndicator"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                ></motion.div>
              )}
            </motion.div>
          ))}
          <button
            onClick={addTab}
            className="flex-shrink-0 flex items-center justify-center w-8 h-8 min-w-[32px] rounded-full hover:bg-muted ml-1 transition-colors"
            title="New tab"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      {/* URL bar and controls */}
      <div className="flex items-center px-4 py-2 bg-background/60 backdrop-blur-sm border-b border-border/30">
        <div className="flex items-center mr-3 space-x-1">
          <button
            onClick={goBack}
            className="p-1.5 rounded-full hover:bg-muted/80 transition-colors disabled:opacity-50"
            title="Go back"
          >
            <ChevronLeft size={18} className="text-foreground/70" />
          </button>
          <button
            onClick={goForward}
            className="p-1.5 rounded-full hover:bg-muted/80 transition-colors disabled:opacity-50"
            title="Go forward"
          >
            <ChevronRight size={18} className="text-foreground/70" />
          </button>
          <button
            onClick={refreshPage}
            className="p-1.5 rounded-full hover:bg-muted/80 transition-colors disabled:opacity-50"
            title="Reload page"
          >
            <RotateCcw size={18} className="text-foreground/70" />
          </button>
        </div>

        <form onSubmit={handleUrlSubmit} className="flex-1 relative group mx-2">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground z-10 pointer-events-none">
            <Search size={16} />
          </div>
          <Input
            ref={urlInputRef}
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder="Search or enter website address"
            className="w-full rounded-full bg-muted/50 hover:bg-muted/70 focus:bg-card pl-9 pr-4 h-9 transition-all border border-transparent focus:border-primary/30 focus:ring-1 focus:ring-primary/30 outline-none"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleUrlSubmit();
            }}
          />
        </form>

        <div className="flex items-center ml-3 space-x-1">
          <button
            onClick={handleAddBookmark}
            className="p-1.5 rounded-full hover:bg-muted/80 transition-colors"
            title="Add bookmark"
          >
            <Bookmark size={18} className="text-foreground/70" />{" "}
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-full hover:bg-muted/80 transition-colors"
            title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {isFullscreen ? (
              <Minimize size={18} className="text-foreground/70" />
            ) : (
              <Maximize size={18} className="text-foreground/70" />
            )}
          </button>
          <button
            onClick={openSettings}
            className="p-1.5 rounded-full hover:bg-muted/80 transition-colors"
            title="Settings"
          >
            <Settings size={18} className="text-foreground/70" />
          </button>
        </div>
      </div>

      <div className="flex-1 relative bg-background">
        <AnimatePresence mode="wait">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className={cn("w-full h-full absolute inset-0 bg-background", {
                invisible: !tab.isActive,
                visible: tab.isActive,
              })}
              aria-hidden={!tab.isActive}
            >
              {tab.url === "about:settings" ? (
                <div className="w-full h-full overflow-auto">
                  <SettingsPage />
                </div>
              ) : tab.url ? (
                <iframe
                  ref={(el) => {
                    if (el) iframeRefs.current[tab.id] = el;
                  }}
                  src={
                    tab.url
                      ? `/~/${settingsStore.proxy}/${encodeURIComponent(tab.url)}`
                      : ""
                  }
                  className="w-full h-full border-0"
                  sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-presentation allow-top-navigation-by-user-activation"
                  title={tab.title}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-start pt-20 bg-gradient-to-b from-background to-background/80 overflow-auto">
                  <GridPattern
                    width={40}
                    height={40}
                    x={-1}
                    y={-1}
                    strokeDasharray={"4 2"}
                    className={cn(
                      `[mask-image:radial-gradient(1000px_circle_at_center,white,transparent)] absolute inset-0 z-0 opacity-30`
                    )}
                  />
                  <div className="z-10 text-center max-w-4xl w-full px-6 flex flex-col items-center">
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                      className="mb-10"
                    >
                      <h2 className="text-6xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                        Emerald
                      </h2>
                      <p className="text-muted-foreground text-md">
                        Your secure gateway to the web
                      </p>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4, delay: 0.1 }}
                      className="w-full max-w-lg mb-10"
                    >
                      <form
                        onSubmit={handleUrlSubmit}
                        className="relative group"
                      >
                        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none">
                          <Search size={20} />
                        </div>
                        <Input
                          type="text"
                          value={inputUrl}
                          onChange={(e) => setInputUrl(e.target.value)}
                          placeholder="Search the web or enter address"
                          className="w-full rounded-full bg-card/90 hover:bg-card focus:bg-card pl-12 pr-12 h-12 text-md transition-all border border-border/30 focus:border-primary/50 shadow-md focus:ring-2 focus:ring-primary/20 outline-none"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleUrlSubmit();
                          }}
                        />
                        <button
                          type="submit"
                          className="absolute right-2.5 top-1/2 transform -translate-y-1/2 bg-primary/90 hover:bg-primary text-primary-foreground rounded-full p-2 transition-colors"
                          title="Go"
                        >
                          <ChevronRight size={20} />
                        </button>
                      </form>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.2 }}
                      className="w-full"
                    >
                      <h3 className="text-lg font-medium mb-4 text-foreground/80 text-left px-2">
                        Bookmarks
                      </h3>
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4 px-2">
                        {bookmarks.map((bookmark) => (
                          <BookmarkItem
                            key={bookmark.id}
                            bookmark={bookmark}
                            onClick={() => handleBookmarkClick(bookmark)}
                          />
                        ))}
                      </div>
                    </motion.div>
                  </div>
                  <a href="https://discord.gg/Dpj8C8SAmH" target="_blank">
                    <img
                      src="/logos/discord.svg"
                      alt="d!sc0rd"
                      className="absolute right-5 bottom-5 w-8 h-8"
                    />
                  </a>
                </div>
              )}
            </div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TabbedHome;
