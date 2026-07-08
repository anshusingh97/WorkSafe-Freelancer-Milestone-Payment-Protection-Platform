import { useState, FormEvent } from "react";
import toast from "react-hot-toast";
import { Star } from "lucide-react";
import { api, apiErrorMessage } from "../services/api";
import { track } from "../services/analytics";

export function FeedbackForm() {
  const [rating, setRating] = useState(0);
  const [liked, setLiked] = useState("");
  const [problemFaced, setProblemFaced] = useState("");
  const [wouldUse, setWouldUse] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }
    setLoading(true);
    try {
      await api.post("/feedback", {
        rating,
        liked,
        problemFaced,
        wouldUse: wouldUse ?? undefined,
      });
      track("feedback_submitted", { rating });
      setSubmitted(true);
    } catch (err) {
      toast.error(apiErrorMessage(err, "Could not submit feedback"));
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-lg px-6 py-20 text-center">
        <h1 className="font-display text-2xl font-semibold mb-3">Thank you</h1>
        <p className="text-parchment/60">Your feedback helps shape what we build next.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-6 py-12">
      <h1 className="font-display text-3xl font-semibold mb-2">Tell us how it's going</h1>
      <p className="text-parchment/60 mb-8">Two minutes. This directly shapes the roadmap.</p>

      <form onSubmit={onSubmit} className="glass-card p-6 space-y-6">
        <div>
          <label className="block text-sm text-parchment/70 mb-2">Overall rating</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                className="p-1"
                aria-label={`Rate ${n} out of 5`}
              >
                <Star
                  size={28}
                  className={n <= rating ? "fill-brass-400 text-brass-400" : "text-ink-600"}
                />
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm text-parchment/70 mb-1.5">What did you like?</label>
          <textarea
            className="input-field resize-y"
            value={liked}
            onChange={(e) => setLiked(e.target.value)}
            placeholder="The escrow flow felt trustworthy…"
          />
        </div>

        <div>
          <label className="block text-sm text-parchment/70 mb-1.5">What problem did you face?</label>
          <textarea
            className="input-field resize-y"
            value={problemFaced}
            onChange={(e) => setProblemFaced(e.target.value)}
            placeholder="Wallet connection was confusing…"
          />
        </div>

        <div>
          <label className="block text-sm text-parchment/70 mb-2">
            Would you use this for real freelance work?
          </label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setWouldUse(true)}
              className={`flex-1 rounded-lg border py-2 text-sm ${
                wouldUse === true ? "border-verdigris-500 bg-verdigris-500/10 text-verdigris-400" : "border-ink-600 text-parchment/60"
              }`}
            >
              Yes
            </button>
            <button
              type="button"
              onClick={() => setWouldUse(false)}
              className={`flex-1 rounded-lg border py-2 text-sm ${
                wouldUse === false ? "border-rust bg-rust/10 text-rust" : "border-ink-600 text-parchment/60"
              }`}
            >
              No
            </button>
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Submitting…" : "Submit feedback"}
        </button>
      </form>
    </div>
  );
}
