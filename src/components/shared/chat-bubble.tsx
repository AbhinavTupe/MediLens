"use client";

import { motion } from "framer-motion";
import { Activity } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { ChatMessage } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ChatBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn("flex items-end gap-2.5", isUser && "flex-row-reverse")}
    >
      {isUser ? (
        <Avatar className="h-7 w-7 shrink-0">
          <AvatarFallback className="text-[11px]">AM</AvatarFallback>
        </Avatar>
      ) : (
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-white">
          <Activity className="h-3.5 w-3.5" />
        </span>
      )}

      <div className={cn("max-w-[78%] sm:max-w-[65%]")}>
        <div
          className={cn(
            "rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
            isUser
              ? "rounded-br-md bg-primary text-white"
              : "rounded-bl-md border border-border bg-white text-foreground"
          )}
        >
          {message.content}
        </div>
        <span className={cn("mt-1 block text-[11px] text-muted", isUser && "text-right")}>{message.timestamp}</span>
      </div>
    </motion.div>
  );
}

export function TypingIndicator() {
  return (
    <div className="flex items-end gap-2.5">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-white">
        <Activity className="h-3.5 w-3.5" />
      </span>
      <div className="flex items-center gap-1 rounded-2xl rounded-bl-md border border-border bg-white px-4 py-3.5">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-muted"
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </div>
    </div>
  );
}
