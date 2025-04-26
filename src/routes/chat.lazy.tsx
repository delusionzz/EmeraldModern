import { createLazyFileRoute, Link } from "@tanstack/react-router";
import GridPattern from "@/components/ui/grid-pattern";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Bot, Send, User, Home, Loader2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Suspense } from "react";
// Needed for markdown
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion, AnimatePresence } from "framer-motion";

//TODO: lazy import these because their massive
import { Prism } from "react-syntax-highlighter";
import { dracula as HighlightStyle } from "react-syntax-highlighter/dist/esm/styles/prism";

export const Route = createLazyFileRoute("/chat")({
  component: RouteComponent,
});

type ChatPayload = {
  messages: { content: string; role: "user" | "assistant" }[];
  model: "google/gemini-2.0-flash-001";
};

function RouteComponent() {
  const [messages, setMessages] = useState<ChatPayload["messages"]>([]);
  const [userInput, setUserInput] = useState("");
  const [processing, setProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const sendChat = async (content: string) => {
    if (!content.trim()) return;
    setProcessing(true);

    const userMessage: {
      content: string;
      role: "user" | "assistant";
    } = {
      content,
      role: "user",
    };
    setMessages((prev) => [...prev, userMessage]);
    setUserInput("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          model: "google/gemini-2.0-flash-001",
        }),
      });

      if (!response.body) throw new Error("No response body");

      let accumulatedContent = "";

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (!line.trim() || !line.startsWith("data: ")) continue;

          const data = line.slice(6); // Remove "data: "
          if (data === "[DONE]") break;

          try {
            const parsed = JSON.parse(data);
            if (parsed.content) {
              accumulatedContent += parsed.content;
              setMessages((prev) => {
                const updated = [...prev];
                const lastMessage = updated[updated.length - 1];
                if (lastMessage.role === "assistant") {
                  lastMessage.content = accumulatedContent;
                }
                return updated;
              });
            }
          } catch (e) {
            console.error("Failed to parse chunk:", e);
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, there was an error processing your request.",
        },
      ]);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-background to-background/90">
      <GridPattern
        width={30}
        height={30}
        x={-1}
        y={-1}
        strokeDasharray={"1 2"}
        className={cn(
          `[mask-image:radial-gradient(600px_circle_at_center,white,transparent)] fixed inset-0 z-0 opacity-40`
        )}
      />

      {/* Welcome message when no messages */}
      {messages.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-md px-6"
          >
            <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
              Emerald AI
            </h1>
            <p className="text-muted-foreground">
              Ask me anything and I'll do my best to help you.
            </p>
          </motion.div>
        </div>
      )}

      <div className="w-full min-h-screen max-h-screen flex flex-col items-center justify-between z-10 py-6 px-4">
        <div className="w-full max-w-4xl h-[80vh] flex-1 mb-6 rounded-2xl border border-border/30 bg-background/60 backdrop-blur-md shadow-lg overflow-hidden flex flex-col">
          {/* Messages area */}
          <div
            ref={messagesContainerRef}
            className="flex-1 p-6 overflow-y-auto overflow-x-hidden space-y-6"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "rgba(var(--primary), 0.2) transparent",
              WebkitOverflowScrolling:
                "touch" /* For smoother scrolling on iOS */,
            }}
          >
            <div className="min-h-min overflow-y-auto">
              <AnimatePresence initial={false}>
                {messages.map((message, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Chat message={message} />
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>
          </div>

          <div className="p-4 border-t border-border/30 bg-background/80 backdrop-blur-md">
            <div className="flex items-center gap-2 max-w-4xl mx-auto">
              <Link to="/">
                <Button
                  size="icon"
                  variant="ghost"
                  className="rounded-full h-10 w-10 flex-shrink-0"
                >
                  <Home className="h-5 w-5" />
                </Button>
              </Link>

              <div className="relative flex-1">
                <Input
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  disabled={processing}
                  placeholder="Type your message here..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendChat(userInput);
                    }
                  }}
                  className="pr-12 py-6 bg-background/50 border-border/50 rounded-full text-base focus-visible:ring-primary/30 focus-visible:border-primary/50 transition-all"
                />
                <Button
                  size="icon"
                  disabled={processing || !userInput.trim()}
                  onClick={() => sendChat(userInput)}
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-primary hover:bg-primary/90 transition-all"
                >
                  {processing ? (
                    <Loader2 className="h-5 w-5 animate-spin text-white" />
                  ) : (
                    <Send className="h-5 w-5 text-white" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Chat({ message }: { message: ChatPayload["messages"][number] }) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex gap-4 max-w-full",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn("flex gap-3 max-w-[85%]", isUser && "flex-row-reverse")}
      >
        <div
          className={cn(
            "flex-shrink-0 h-9 w-9 rounded-full flex items-center justify-center",
            isUser ? "bg-primary/10" : "bg-secondary/50"
          )}
        >
          {isUser ? (
            <User className="h-5 w-5 text-primary" />
          ) : (
            <Bot className="h-5 w-5 text-secondary " color="white" />
          )}
        </div>

        <div
          className={cn(
            "rounded-2xl px-4 py-3 shadow-sm",
            isUser
              ? "text-primary-foreground rounded-tr-none"
              : "rounded-tl-none"
          )}
        >
          <Suspense fallback={<div className="animate-pulse">Loading...</div>}>
            <ReactMarkdown
              children={message.content}
              remarkPlugins={[remarkGfm]}
              className={cn(
                "markdownRender prose prose-sm max-w-none",
                isUser ? "prose-invert" : ""
              )}
              components={{
                // @ts-expect-error yap
                code({ inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || "");
                  return !inline && match ? (
                    <div className="rounded-md overflow-hidden my-2">
                      <Prism
                        children={String(children).replace(/\n$/, "")}
                        //@ts-expect-error style being weird
                        style={HighlightStyle}
                        language={match[1]}
                        PreTag="div"
                        {...props}
                      />
                    </div>
                  ) : (
                    <code
                      className={cn(
                        "bg-muted px-1 py-0.5 rounded text-sm",
                        className
                      )}
                      {...props}
                    >
                      {children}
                    </code>
                  );
                },
              }}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
