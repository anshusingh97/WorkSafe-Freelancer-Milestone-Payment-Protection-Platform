import { Lock, Send, CheckCircle2, Coins, Scale, Circle } from "lucide-react";
import type { MilestoneStatus } from "../types";

const STEPS: { key: MilestoneStatus; label: string; icon: typeof Lock }[] = [
  { key: "created", label: "Agreed", icon: Circle },
  { key: "funded", label: "Escrowed", icon: Lock },
  { key: "submitted", label: "Submitted", icon: Send },
  { key: "released", label: "Released", icon: Coins },
];

const ORDER: MilestoneStatus[] = ["created", "funded", "submitted", "approved", "released"];

/**
 * A horizontal seal-and-chain timeline: each stage is a wax-seal-like node
 * connected by a bar that fills as the escrow progresses. Disputed/refunded
 * states break the chain visually rather than pretending to fit the happy path.
 */
export function MilestoneTimeline({ status }: { status: MilestoneStatus }) {
  if (status === "disputed" || status === "refunded") {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-rust/30 bg-rust/5 px-4 py-3">
        <Scale size={18} className="text-rust shrink-0" strokeWidth={2} />
        <p className="text-sm text-rust/90 font-sans">
          {status === "disputed"
            ? "This milestone is under dispute review. Escrowed funds are held until an admin resolves it."
            : "This milestone was refunded to the client after dispute resolution."}
        </p>
      </div>
    );
  }

  const currentIndex = ORDER.indexOf(status === "approved" ? "submitted" : status);
  const activeIndex = status === "released" ? 3 : Math.min(currentIndex, 3);

  return (
    <div className="flex items-center w-full">
      {STEPS.map((step, i) => {
        const isDone = i <= activeIndex;
        const isCurrent = i === activeIndex;
        const Icon = step.icon;
        return (
          <div key={step.key} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`relative flex items-center justify-center w-9 h-9 rounded-full border-2 transition-all
                  ${
                    isDone
                      ? "border-brass-500 bg-brass-500/20 text-brass-400"
                      : "border-ink-600 bg-ink-800 text-parchment/30"
                  }
                  ${isCurrent ? "animate-seal-stamp" : ""}
                `}
              >
                <Icon size={15} strokeWidth={2.5} />
              </div>
              <span
                className={`text-[10px] font-mono uppercase tracking-wider ${
                  isDone ? "text-brass-400" : "text-parchment/30"
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className="flex-1 h-[2px] mx-1 -mt-4 bg-ink-600 relative overflow-hidden rounded">
                <div
                  className={`absolute inset-y-0 left-0 bg-brass-500 transition-all duration-500 ${
                    i < activeIndex ? "w-full" : "w-0"
                  }`}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
