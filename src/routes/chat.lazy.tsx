import { createLazyFileRoute, Link } from "@tanstack/react-router";
import GridPattern from "@/components/ui/grid-pattern";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Bot, Send, User, Home } from "lucide-react";
import { useEffect, useState } from "react";
import { create } from "zustand";
import { Suspense } from "react";
// Needed for markdown
import ReactMarkdown from 'react-markdown'
import remarkGfm from "remark-gfm" // <-- lets us use links & tables etc

//TODO: lazy import these because their massive
import { Prism } from "react-syntax-highlighter"
import { dracula as HighlightStyle } from 'react-syntax-highlighter/dist/esm/styles/prism'

export const Route = createLazyFileRoute("/chat")({
  component: RouteComponent,
});

type ChatPayload = {
  messages: { content: string; role: "user" | "assistant" }[];
  model: "gpt-4o-mini";
};

type MessageStore = {
  messages: ChatPayload["messages"];
  addMessage: (message: ChatPayload["messages"][number]) => void;
  model: ChatPayload["model"];
  clearMessages: () => void;
};

const useMessageStore = create<MessageStore>()((set) => ({
  messages: [],
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  clearMessages: () => set({ messages: [] }),
  model: "gpt-4o-mini",
}));

function RouteComponent() {
  const messageStore = useMessageStore();
  const [userInput, setUserInput] = useState("");
  const [VQDToken, setVQDToken] = useState<string | undefined>();
  const [proccessing, setProcesssing] = useState(false);

  useEffect(() => {
    messageStore.clearMessages();
  }, []);

  const sendChat = (updatedMessages: ChatPayload["messages"]) => {
    if (!userInput || updatedMessages.length === 0) return;
    setProcesssing(true);
    (async () => {
      console.log(updatedMessages);
      const headers = new Headers();
      if (VQDToken) {
        headers.append("X-Vqd-4", VQDToken);
      }
      const response = await fetch("/api/chat", {
        method: "POST",
        body: JSON.stringify({
          messages: updatedMessages,
          model: messageStore.model,
        }),
        headers,
      });

      if (!response.ok) {
        alert("Something went wrong... reloading window");
        window.location.reload()
      }

      if (!response.body) {
        console.log("No response body");
        setProcesssing(false);
        return;
      }

      setVQDToken(response.headers.get("X-Vqd-4") || undefined);
      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");

      let partial = "";
      let messsage = "";
      let done = false;
      while (!done) {
        const { value, done: streamDone } = await reader.read();
        done = streamDone;
        if (value) {
          let decodedData = decoder.decode(value, { stream: false });

          decodedData = decodedData
            .split("\n")
            .map((line) =>
              line.startsWith("data: ") ? line.substring(6) : line
            )
            .join("\n")
            .trim();

          if (decodedData !== "[DONE]") {
            const arr = decodedData.split("\n");
            for (let i = 0; i < arr.length; i++) {
              const el = arr[i].replaceAll("\n", "");
              if (el === "\n") continue;
              if (el === "[DONE]") {
                done = true;
                continue;
              }
              if (el.charAt(el.length - 1) === "}") {
                try {
                  partial += el;
                  const obj = JSON.parse(partial);

                  if (obj.message) messsage += obj.message;
                  //   console.log(obj);
                  partial = "";
                } catch (error) {
                  console.log("Got error while parsing JSON", error);
                  console.log("Partial: ", partial);
                }
              } else {
                partial += el;
              }
            }
          }
        }
      }

      messageStore.addMessage({ role: "assistant", content: messsage });
      setUserInput("");
      setProcesssing(false);
    })();
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
          {messageStore.messages.map((message, i) => {
            return <Chat key={i} message={message} />;
          })}
          {proccessing && (
            <Chat message={{ role: "assistant", content: "Loading..." }} />
          )}
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
              disabled={proccessing}
              placeholder="Type your message here"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const newMessage = {
                    content: userInput,
                    role: "user",
                  } as ChatPayload["messages"][number];
                  messageStore.addMessage(newMessage);
                  sendChat([...messageStore.messages, newMessage]);
                }
              }}
              className="w-full border-none rounded-3xl h-12 text-lg focus-visible:ring-0"
            />
            <Button
              className="rounded-full"
              variant={"outline"}
              disabled={proccessing}
              onClick={() => {
                const newMessage = {
                  content: userInput,
                  role: "user",
                } as ChatPayload["messages"][number];
                messageStore.addMessage(newMessage);
                sendChat([...messageStore.messages, newMessage]); // Pass updated messages
              }}
            >
              <Send className="text-secondary-foreground" />
            </Button>
          </div>
        </div>
      </div>
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
            // @ts-expect-error
            code({ node, inline, className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || '')
              return !inline && match ? (
                <Prism
                  children={String(children).replace(/\n$/, '')}
                  //@ts-ignore
                  style={HighlightStyle}
                  language={match[1]}
                  PreTag="div"
                  {...props}
                />
              ) : (
                <code className={className} {...props}>
                  {children}
                </code>
              )
            }
          }}
        />
      </Suspense>
      {/* <p className="">
        {message.content}
      </p> */}
    </div>
  );
}
