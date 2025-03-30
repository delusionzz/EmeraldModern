import { createLazyFileRoute, Link } from "@tanstack/react-router";
import GridPattern from "@/components/ui/grid-pattern";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Bot, Send, User, Home } from "lucide-react";
import { useEffect, useState } from "react";
// import { create } from "zustand";
import { Suspense } from "react";
// Needed for markdown
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm"; // <-- lets us use links & tables etc

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

  const sendChat = async (content: string) => {
    if (!content.trim()) return;
    setProcessing(true);

    const userMessage = { role: "user", content };
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

      // Create a variable to accumulate the assistant's response
      let accumulatedContent = "";

      // Add initial empty assistant message
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
              // Accumulate the content
              accumulatedContent += parsed.content;
              // Update the message with the full accumulated content
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
        <div className="h-[80vh] min-w-[70%] max-w-[70%] border rounded-xl border-secondary p-4 overflow-y-auto overflow-x-hidden space-y-3">
          {messages.map((message, i) => (
            <Chat key={i} message={message} />
          ))}
        </div>

        <div className="flex w-[30%] items-center justify-center space-x-2">
          <Link to="/">
            <Button className="rounded-full" variant={"outline"}>
              <Home className="text-secondary-foreground" />
            </Button>
          </Link>

          <div className="flex w-full items-center justify-centerborder-input border pr-2 rounded-3xl group focus-within:ring-1 ring-ring">
            <Input
              onChange={(e) => setUserInput(e.target.value)}
              value={userInput}
              disabled={processing}
              placeholder="Type your message here"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  sendChat(userInput);
                }
              }}
              className="w-full border-none rounded-3xl h-12 text-lg focus-visible:ring-0"
            />
            <Button
              className="rounded-full"
              variant={"outline"}
              disabled={processing}
              onClick={() => sendChat(userInput)}
            >
              <Send className="text-secondary-foreground" />
            </Button>
          </div>
        </div>
      </div>

      <div
        id="thathting"
        className="absolute m-auto top-0 bottom-0 right-5 aspect-auto"
      ></div>
    </>
  );
}

function Chat({ message }: { message: ChatPayload["messages"][number] }) {
  return (
    <div className="flex space-x-4 px-1 overflow-x-auto">
      {message.role === "user" ? (
        <User className="w-8 h-8 flex-shrink-0" size={20} />
      ) : (
        <Bot className="w-8 h-8 flex-shrink-0" size={20} />
      )}
      <div className="flex flex-col space-y-1"></div>
      <Suspense fallback={<>Loading...</>}>
        <ReactMarkdown
          children={message.content}
          remarkPlugins={[remarkGfm]}
          className={"markdownRender"}
          components={{
            // @ts-expect-error yap
            code({ inline, className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || "");
              return !inline && match ? (
                <Prism
                  children={String(children).replace(/\n$/, "")}
                  //@ts-expect-error style being weird
                  style={HighlightStyle}
                  language={match[1]}
                  PreTag="div"
                  {...props}
                />
              ) : (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            },
          }}
        />
      </Suspense>
      {/* <p className="">
        {message.content}
      </p> */}
    </div>
  );
}
