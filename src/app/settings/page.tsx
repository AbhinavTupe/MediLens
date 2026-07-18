"use client";

import { useEffect, useState } from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { motion } from "framer-motion";
import { Palette, Bell, BrainCircuit, Info, Sun, Moon, Laptop } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SectionHeader } from "@/components/shared/section-header";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { fetchSettings, updateSettings } from "@/lib/api";

function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <div className="flex items-center justify-between py-3">
      <span className="text-sm text-foreground">{label}</span>
      <SwitchPrimitive.Root
        checked={checked}
        onCheckedChange={onChange}
        className={cn(
          "relative h-6 w-11 rounded-full transition-colors",
          checked ? "bg-primary" : "bg-black/[0.12]"
        )}
      >
        <SwitchPrimitive.Thumb className="block h-5 w-5 translate-x-0.5 rounded-full bg-white shadow transition-transform data-[state=checked]:translate-x-[22px]" />
      </SwitchPrimitive.Root>
    </div>
  );
}

const themes = [
  { id: "light", label: "Light", icon: Sun },
  { id: "dark", label: "Dark", icon: Moon },
  { id: "system", label: "System", icon: Laptop },
];

const providers = [
  { id: "groq", label: "Groq" },
  { id: "openai", label: "OpenAI" },
  { id: "ollama", label: "Ollama" },
];

export default function SettingsPage() {
  const [theme, setTheme] = useState("system");
  const [provider, setProvider] = useState("groq");
  const [email, setEmail] = useState(true);
  const [highRisk, setHighRisk] = useState(true);
  const [weekly, setWeekly] = useState(false);
  const [updates, setUpdates] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const s = await fetchSettings();
        if (!s) return;
        if (s.theme) setTheme(s.theme);
        if (s.ai_provider) setProvider(s.ai_provider);
        if (s.notifications) {
          setEmail(!!s.notifications.email);
          setHighRisk(!!s.notifications.high_risk);
          setWeekly(!!s.notifications.weekly);
          setUpdates(!!s.notifications.updates);
        }
      } catch (e) {
        // ignore
      }
    })();
  }, []);

  const save = async (overrides: Record<string, any> = {}) => {
    const payload = {
      ...overrides,
      theme: overrides.theme ?? theme,
      ai_provider: overrides.ai_provider ?? provider,
      notifications: {
        email,
        high_risk: highRisk,
        weekly,
        updates,
        ...(overrides.notifications ?? {}),
      },
    };
    try {
      await updateSettings(payload);
    } catch (e) {
      // ignore
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <SectionHeader eyebrow="Preferences" title="Settings" description="Manage how MediLens looks, notifies you, and analyzes your reports." />

      <div className="mt-8 space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Palette className="h-4 w-4 text-primary-dark" />
              <CardTitle>Appearance</CardTitle>
            </div>
            <CardDescription>Choose how MediLens looks on your device.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              {themes.map((t) => (
                <button
                  key={t.id}
                  onClick={async () => {
                    setTheme(t.id);
                    await save({ theme: t.id });
                  }}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-xl border p-4 transition-colors",
                    theme === t.id ? "border-primary bg-primary-tint" : "border-border hover:bg-black/[0.02]"
                  )}
                >
                  <t.icon className={cn("h-5 w-5", theme === t.id ? "text-primary-dark" : "text-muted")} />
                  <span className={cn("text-xs font-medium", theme === t.id ? "text-primary-dark" : "text-muted")}>{t.label}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary-dark" />
              <CardTitle>Notifications</CardTitle>
            </div>
            <CardDescription>Control which updates MediLens sends you.</CardDescription>
          </CardHeader>
          <CardContent className="divide-y divide-border">
            <Switch checked={email} onChange={(v) => { setEmail(v); void save({ notifications: { email: v } }); }} label="Email me when a report finishes analyzing" />
            <Switch checked={highRisk} onChange={(v) => { setHighRisk(v); void save({ notifications: { high_risk: v } }); }} label="High-risk result alerts" />
            <Switch checked={weekly} onChange={(v) => { setWeekly(v); void save({ notifications: { weekly: v } }); }} label="Weekly health score summary" />
            <Switch checked={updates} onChange={(v) => { setUpdates(v); void save({ notifications: { updates: v } }); }} label="Product updates and tips" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <BrainCircuit className="h-4 w-4 text-primary-dark" />
              <CardTitle>AI Provider</CardTitle>
            </div>
            <CardDescription>Select the generative model used for explanations and chat.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-3">
            {providers.map((p) => (
              <button
                key={p.id}
                onClick={async () => { setProvider(p.id); await save({ ai_provider: p.id }); }}
                className={cn(
                  "rounded-xl border p-4 text-left transition-colors",
                  provider === p.id ? "border-primary bg-primary-tint" : "border-border hover:bg-black/[0.02]"
                )}
              >
                <p className={cn("text-sm font-semibold", provider === p.id ? "text-primary-dark" : "text-foreground")}>{p.label}</p>
                <p className="mt-0.5 text-xs text-muted">via provider abstraction</p>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-primary-dark" />
              <CardTitle>About MediLens</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted">
            <p>Version 1.4.2 · Last updated July 2026</p>
            <p>MediLens combines OCR, machine learning, and generative AI to help you understand medical reports faster.</p>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" size="sm">Privacy Policy</Button>
              <Button variant="outline" size="sm">Terms of Service</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
