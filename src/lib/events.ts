import { EventEmitter } from "node:events";

export type AppEvent =
  | { type: "payment"; id: string; status: "reserved" | "sent" | "confirmed" | "failed"; amount: number; payee: string; latencyMs?: number }
  | { type: "chain"; id: string; txHash: string; explorer: string }
  | { type: "log"; level: "info" | "ok" | "warn" | "error"; message: string };

declare global {
  var __ureadyBus: EventEmitter | undefined;
}

export const bus: EventEmitter = globalThis.__ureadyBus ?? (globalThis.__ureadyBus = new EventEmitter().setMaxListeners(100));

export function emit(e: AppEvent) {
  bus.emit("event", { ...e, at: new Date().toISOString() });
}

export function log(level: "info" | "ok" | "warn" | "error", message: string) {
  emit({ type: "log", level, message });
}
