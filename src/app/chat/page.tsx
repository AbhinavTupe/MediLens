"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { SendHorizonal, Sparkles, MessageSquarePlus } from "lucide-react";
import { ChatBubble, TypingIndicator } from "@/components/shared/chat-bubble";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { chatWithReport, fetchChatHistory, streamChatWithReport } from "@/lib/api";
import { mapChatHistoryResponse } from "@/lib/report-mappers";
import type { ChatMessage } from "@/lib/types";

const suggestedQuestions = [
  "What does low hemoglobin mean?",
  "Explain my glucose reading.",
  "Why is my cholesterol high?",
  "Is my kidney function improving?",
  "What does elevated creatinine indicate?",
];

const initialChatMessages: ChatMessage[] = [
  {
    id: "m1",
    role: "assistant",
    content: "Hi, I can help explain your uploaded reports in plain language using the report details and reference context.",
    timestamp: "Now",
  },
];

const defaultSuggestedQuestions = [
  "What does low hemoglobin mean?",
  "Explain my glucose reading.",
  "Why is my cholesterol high?",
  "Is my kidney function improving?",
  "What does elevated creatinine indicate?",
];

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [reportId, setReportId] = useState<string | undefined>(undefined);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  useEffect(() => {
    let cancelled = false;
    async function loadHistory() {
      try {
        const response = await fetchChatHistory();
        if (cancelled) return;
        const mapped = mapChatHistoryResponse(response);
        setReportId(mapped.reportId);
        setMessages(mapped.messages.length > 0 ? mapped.messages : initialChatMessages);
        setSuggestedQuestions(mapped.suggestedQuestions.length > 0 ? mapped.suggestedQuestions : defaultSuggestedQuestions);
      } catch {
        if (!cancelled) {
          setMessages(initialChatMessages);
          setSuggestedQuestions(defaultSuggestedQuestions);
        }
      } finally {
        if (!cancelled) {
          setLoadingHistory(false);
        }
      }
    }
    void loadHistory();
    return () => {
      cancelled = true;
    };
  }, []);

  const resetConversation = () => {
    setMessages(initialChatMessages);
    setReportId(undefined);
    setInput("");
    setSuggestedQuestions(defaultSuggestedQuestions);
  };

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || typing || loadingHistory) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
      timestamp: new Date().toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" }),
    };
    const assistantId = crypto.randomUUID();
    setMessages((prev) => [
      ...prev,
      userMsg,
      {
        id: assistantId,
        role: "assistant",
        content: "",
        timestamp: new Date().toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" }),
      },
    ]);
    setInput("");
    setTyping(true);

    try {
      const response = await streamChatWithReport(trimmed, reportId);
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("Streaming is unavailable");
      }

      const decoder = new TextDecoder();
      let assistantText = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        assistantText += decoder.decode(value, { stream: true });
        setMessages((prev) => prev.map((message) => (message.id === assistantId ? { ...message, content: assistantText } : message)));
      }
      assistantText += decoder.decode();
      if (!assistantText.trim()) {
        const fallback = await chatWithReport(trimmed, reportId);
        assistantText = fallback.response;
        setMessages((prev) => prev.map((message) => (message.id === assistantId ? { ...message, content: assistantText } : message)));
      }
    } catch {
      try {
        const fallback = await chatWithReport(trimmed, reportId);
        setMessages((prev) => prev.map((message) => (message.id === assistantId ? { ...message, content: fallback.response } : message)));
      } catch {
        setMessages((prev) => prev.map((message) =>
          message.id === assistantId
            ? { ...message, content: "I could not reach the AI service right now. Please try again in a moment." }
            : message
        ));
      }
    } finally {
      setTyping(false);
    }
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-4rem)] max-w-7xl">
      {/* Sidebar */}
      <aside className="hidden w-72 shrink-0 flex-col border-r border-border px-5 py-6 lg:flex">
        <Button variant="outline" className="justify-start" size="sm" onClick={resetConversation}>
          <MessageSquarePlus className="h-4 w-4" />
          New Conversation
        </Button>

        <p className="mb-3 mt-7 text-xs font-semibold uppercase tracking-wide text-muted">Suggested Questions</p>
        <div className="flex flex-col gap-2">
          {(suggestedQuestions.length ? suggestedQuestions : defaultSuggestedQuestions).slice(0, 5).map((q) => (
            <button
              key={q}
              onClick={() => send(q)}
              disabled={loadingHistory}
              className="rounded-xl border border-border bg-white px-3.5 py-2.5 text-left text-sm text-foreground transition-colors hover:border-primary/40 hover:bg-primary-tint"
            >
              {q}
            </button>
          ))}
        </div>

        <div className="mt-auto rounded-xl bg-primary-tint p-4">
          <div className="flex items-center gap-2 text-primary-dark">
            <Sparkles className="h-4 w-4" />
            <p className="text-xs font-semibold">Grounded in your reports</p>
          </div>
          <p className="mt-1.5 text-xs leading-relaxed text-primary-dark/80">
            MediLens AI references your uploaded lab data to keep answers relevant to you.
          </p>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col">
        <div ref={scrollRef} className="flex-1 space-y-5 overflow-y-auto px-4 py-6 scrollbar-thin sm:px-8">
          {loadingHistory && messages.length === 0 ? <TypingIndicator /> : messages.map((m) => <ChatBubble key={m.id} message={m} />)}
          {typing && <TypingIndicator />}

          <div className="pt-2 lg:hidden">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Try asking</p>
            <div className="flex flex-wrap gap-2">
              {(suggestedQuestions.length ? suggestedQuestions : ["What do my results mean?", "Which values need follow-up?", "What should I ask my doctor?"]).slice(0, 3).map((q) => (
                <button
                  key={q}
                  onClick={() => send(q)}
                  disabled={loadingHistory}
                  className="rounded-full border border-border bg-white px-3 py-1.5 text-xs text-foreground"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-border p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-end gap-3 rounded-2xl border border-border bg-white p-2 shadow-sm"
          >
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              placeholder="Ask MediLens about your reports..."
              disabled={loadingHistory}
              className="min-h-[44px] flex-1 resize-none border-0 shadow-none focus-visible:ring-0"
              rows={1}
            />
            <Button size="icon" onClick={() => send(input)} disabled={!input.trim() || typing || loadingHistory}>
              <SendHorizonal className="h-4 w-4" />
            </Button>
          </motion.div>
          <p className="mt-2 text-center text-[11px] text-muted">
            MediLens AI can make mistakes. Always confirm important findings with your physician.
          </p>
        </div>
      </div>
    </div>
  );
}
