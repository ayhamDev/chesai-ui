import type { Meta, StoryObj } from "@storybook/react";
import { useState, useRef, useEffect } from "react";
import {
  ArrowDown,
  Send,
  MessageSquare,
  Bot,
  User,
  Trash2,
} from "lucide-react";
import { ReverseInfiniteScroll, type ReverseInfiniteScrollRef } from "./index";
import { Button } from "../button";
import { Typography } from "../typography";
import { Card } from "../card";
import { Avatar } from "../avatar";

const meta: Meta<typeof ReverseInfiniteScroll> = {
  title: "Components/Data/ReverseInfiniteScroll",
  component: ReverseInfiniteScroll,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof ReverseInfiniteScroll>;

interface Message {
  id: string;
  sender: "user" | "agent";
  text: string;
  timestamp: string;
}

// Helper to generate mock historical context
const generateHistory = (startIndex: number, count: number): Message[] => {
  return Array.from({ length: count })
    .map((_, i) => {
      const messageIndex = startIndex - i;
      return {
        id: `msg-${messageIndex}`,
        sender: messageIndex % 2 === 0 ? "user" : "agent",
        text: `[Archive Message #${messageIndex}] This is a recorded conversation fragment representing older timeline logs.`,
        timestamp: new Date(
          Date.now() - (startIndex - messageIndex) * 60000,
        ).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
    })
    .reverse();
};

export const LiveChatSandbox: Story = {
  name: "Headless Live Chat Agent Simulation",
  render: function Render() {
    const scrollRef = useRef<ReverseInfiniteScrollRef>(null);
    const [messages, setMessages] = useState<Message[]>(() => [
      {
        id: "1",
        sender: "agent",
        text: "Hello! I am your AI partner. Scroll up to read historical context or ask me anything.",
        timestamp: "10:00 AM",
      },
      {
        id: "2",
        sender: "user",
        text: "Excellent, let's test how you manage layout changes and offset pinning.",
        timestamp: "10:01 AM",
      },
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [archiveCount, setArchiveCount] = useState(30); // Track next index to load
    const [inputValue, setInputValue] = useState("");
    const [showScrollBadge, setShowScrollBadge] = useState(false);

    // Load Older (History Prepend) Handler
    const handleLoadOlder = async () => {
      if (isLoading || !hasMore) return;
      setIsLoading(true);

      // Simulate network request
      await new Promise((resolve) => setTimeout(resolve, 1200));

      const batchSize = 10;
      const history = generateHistory(archiveCount, batchSize);

      setMessages((prev) => [...history, ...prev]);
      setArchiveCount((prev) => prev + batchSize);

      if (archiveCount >= 50) {
        setHasMore(false);
      }
      setIsLoading(false);
    };

    // User Message Post (Append Handler)
    const handleSendMessage = (e?: React.FormEvent) => {
      e?.preventDefault();
      if (!inputValue.trim()) return;

      const userMsg: Message = {
        id: crypto.randomUUID(),
        sender: "user",
        text: inputValue,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages((prev) => [...prev, userMsg]);
      setInputValue("");

      // Simulate an AI Agent instant response a moment later
      setTimeout(() => {
        const agentResponse: Message = {
          id: crypto.randomUUID(),
          sender: "agent",
          text: `[Agent Feedback] Automatically received message: "${userMsg.text}". Testing standard offset pinning.`,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
        setMessages((prev) => [...prev, agentResponse]);
      }, 800);
    };

    return (
      <div className="w-[450px] h-[600px] border border-outline-variant rounded-2xl bg-surface flex flex-col overflow-hidden shadow-xl">
        {/* Chat Header */}
        <div className="px-5 py-4 border-b border-outline-variant bg-surface-container flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Bot size={22} />
            </div>
            <div>
              <Typography variant="title-medium" className="font-bold">
                Chesai Support Agent
              </Typography>
              <Typography
                variant="body-small"
                className="text-emerald-500 font-medium"
              >
                Active Simulator
              </Typography>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setMessages([]);
              setHasMore(true);
              setArchiveCount(30);
            }}
          >
            <Trash2 size={16} />
          </Button>
        </div>

        {/* Core Scroll Viewport */}
        <div className="flex-1 min-h-0 relative">
          <ReverseInfiniteScroll
            ref={scrollRef}
            hasMore={hasMore}
            isLoading={isLoading}
            onLoadOlder={handleLoadOlder}
            onAtBottomChange={(isAtBottom) => {
              // Hide badge if user is docked back at the bottom
              setShowScrollBadge(!isAtBottom);
            }}
            viewportClassName="px-4 bg-surface-container-lowest"
            className="gap-4 py-4"
          >
            {messages.map((msg) => {
              const isAgent = msg.sender === "agent";
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2.5 max-w-[85%] ${
                    isAgent ? "self-start" : "self-end flex-row-reverse"
                  }`}
                >
                  <Avatar
                    fallback={isAgent ? "AI" : "ME"}
                    className={
                      isAgent
                        ? "bg-primary text-on-primary"
                        : "bg-secondary text-on-secondary"
                    }
                    size="sm"
                  />
                  <div className="flex flex-col">
                    <Card
                      variant={isAgent ? "surface" : "primary"}
                      shape="minimal"
                      className={`py-2.5 px-4 shadow-sm ${
                        isAgent
                          ? "bg-surface-container-high text-on-surface"
                          : "bg-primary text-on-primary"
                      }`}
                    >
                      <Typography
                        variant="body-medium"
                        className="leading-snug break-words"
                      >
                        {msg.text}
                      </Typography>
                    </Card>
                    <Typography
                      variant="body-small"
                      className={`text-[10px] mt-1 opacity-50 ${isAgent ? "self-start" : "self-end"}`}
                    >
                      {msg.timestamp}
                    </Typography>
                  </div>
                </div>
              );
            })}
          </ReverseInfiniteScroll>

          {/* HEADLESS FEEDBACK BADGE OVERLAY */}
          {showScrollBadge && (
            <button
              onClick={() => scrollRef.current?.scrollToBottom("smooth")}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-primary text-on-primary px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 text-xs font-semibold hover:bg-primary-container hover:text-on-primary-container transition-all animate-bounce"
            >
              <ArrowDown size={14} />
              Recent messages below
            </button>
          )}
        </div>

        {/* Input Footer Form */}
        <form
          onSubmit={handleSendMessage}
          className="p-4 border-t border-outline-variant bg-surface flex gap-2"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Write a message..."
            className="flex-1 bg-surface-container border border-outline-variant rounded-xl px-4 text-sm focus:outline-none focus:border-primary transition-colors text-on-surface"
          />
          <Button type="submit" size="md" className="shrink-0" shape="minimal">
            <Send size={16} />
          </Button>
        </form>
      </div>
    );
  },
};
