import { Link } from "react-router-dom";
import { Lock, Send, CheckCircle2, Coins, ShieldCheck, Scale, Zap, Eye } from "lucide-react";

const FLOW = [
  { icon: Lock, title: "Client locks payment", body: "Funds move into the contract's own address the moment a milestone is agreed — not into anyone's personal wallet." },
  { icon: Send, title: "Freelancer delivers", body: "Work is submitted with a proof link once the milestone is escrowed and underway." },
  { icon: CheckCircle2, title: "Client approves", body: "One signature confirms the milestone is done to spec." },
  { icon: Coins, title: "Contract releases funds", body: "Payment moves to the freelancer automatically. No invoicing, no chasing." },
];

const PRINCIPLES = [
  { icon: ShieldCheck, title: "Funds held by code, not by us", body: "WorkSafe never custodies your money. The Soroban contract holds escrow — the same rules apply to every project, every time." },
  { icon: Zap, title: "Stellar settlement speed", body: "Releases confirm in seconds, for a fraction of a cent, instead of waiting on bank rails or platform payout schedules." },
  { icon: Scale, title: "Disputes have a real process", body: "If a milestone goes sideways, either side can escalate. An admin reviews evidence and resolves it on-chain." },
  { icon: Eye, title: "Every transaction is verifiable", body: "Escrow and release transactions link straight to Stellar's public ledger — nothing to take on faith." },
];

export function Landing() {
  return (
    <div className="relative overflow-hidden">
      {/* Hero */}
      <section className="relative border-b border-ink-700/60">
        <div className="absolute inset-0 bg-seal-radial pointer-events-none" />
        <div className="relative mx-auto max-w-6xl px-6 pt-24 pb-28 sm:pt-32 sm:pb-36">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-brass-500/30 bg-brass-500/10 px-3 py-1 text-xs font-mono uppercase tracking-wider text-brass-400">
              Built on Stellar · Soroban smart contracts
            </span>
            <h1 className="mt-6 font-display text-5xl sm:text-6xl lg:text-7xl font-semibold leading-[1.05] tracking-tight">
              Payment locked in escrow.
              <br />
              <span className="text-brass-400">Released the moment work is approved.</span>
            </h1>
            <p className="mt-6 text-lg text-parchment/70 max-w-xl leading-relaxed">
              WorkSafe is decentralized milestone escrow for freelance work. Clients fund a
              contract, not a person. Freelancers get paid the instant a milestone clears —
              no invoices, no platform holding your money hostage.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link to="/register" className="btn-primary text-base px-6 py-3">
                Start a project
              </Link>
              <Link to="/projects" className="btn-secondary text-base px-6 py-3">
                Browse open work
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Flow */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="font-display text-3xl font-semibold text-center mb-3">How the escrow moves</h2>
        <p className="text-center text-parchment/60 mb-14 max-w-lg mx-auto">
          Four steps, each recorded on-chain, from locked payment to released funds.
        </p>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FLOW.map((step, i) => (
            <div key={step.title} className="relative glass-card p-6">
              <span className="absolute -top-3 -left-3 flex h-8 w-8 items-center justify-center rounded-full bg-ink-950 border-2 border-brass-500 font-mono text-sm text-brass-400">
                {i + 1}
              </span>
              <step.icon size={24} className="text-brass-400 mb-4" strokeWidth={1.75} />
              <h3 className="font-sans font-semibold mb-2">{step.title}</h3>
              <p className="text-sm text-parchment/60 leading-relaxed">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="seal-divider max-w-6xl mx-auto" />

      {/* Principles */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="font-display text-3xl font-semibold text-center mb-14">
          Why escrow belongs on-chain
        </h2>
        <div className="grid gap-8 sm:grid-cols-2">
          {PRINCIPLES.map((p) => (
            <div key={p.title} className="flex gap-4">
              <div className="shrink-0 flex h-11 w-11 items-center justify-center rounded-lg bg-ink-800 border border-ink-600">
                <p.icon size={20} className="text-verdigris-400" strokeWidth={1.75} />
              </div>
              <div>
                <h3 className="font-sans font-semibold mb-1.5">{p.title}</h3>
                <p className="text-sm text-parchment/60 leading-relaxed">{p.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-4xl px-6 py-20 border-t border-ink-700/60">
        <h2 className="font-display text-3xl font-semibold text-center mb-10">
          Frequently Asked Questions
        </h2>
        <div className="space-y-6">
          <div className="glass-card p-6">
            <h3 className="font-sans font-semibold mb-2">What is WorkSafe?</h3>
            <p className="text-sm text-parchment/60 leading-relaxed">WorkSafe is a decentralized milestone escrow platform built on the Stellar blockchain, designed to protect both freelancers and clients from non-payment and non-delivery.</p>
          </div>
          <div className="glass-card p-6">
            <h3 className="font-sans font-semibold mb-2">How does the smart contract escrow work?</h3>
            <p className="text-sm text-parchment/60 leading-relaxed">When a client funds a milestone, the XLM is sent directly to a secure Soroban smart contract, not a personal wallet. The funds are only released to the freelancer once the client signs an approval transaction.</p>
          </div>
          <div className="glass-card p-6">
            <h3 className="font-sans font-semibold mb-2">Do I need a crypto wallet to use this?</h3>
            <p className="text-sm text-parchment/60 leading-relaxed">Yes. You will need the Freighter browser extension wallet to sign transactions on the Stellar network. Setting it up takes less than two minutes.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-ink-700/60 bg-ink-900/50">
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <h2 className="font-display text-3xl font-semibold mb-4">
            Stop trusting. Start verifying.
          </h2>
          <p className="text-parchment/60 mb-8">
            Create your account, connect a Stellar wallet, and fund your first milestone in
            minutes.
          </p>
          <Link to="/register" className="btn-primary text-base px-7 py-3 inline-flex">
            Create free account
          </Link>
        </div>
      </section>
    </div>
  );
}
