import { useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { ShieldCheck, Briefcase, Hammer } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { apiErrorMessage } from "../services/api";
import type { UserRole } from "../types";

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("client");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await register(name, email, password, role);
      toast.success("Account created");
      navigate("/dashboard");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Could not create account"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <div className="text-center mb-8">
        <ShieldCheck size={32} className="text-brass-400 mx-auto mb-3" />
        <h1 className="font-display text-3xl font-semibold">Create your account</h1>
        <p className="text-parchment/60 mt-2 text-sm">
          Join as a client to hire, or a freelancer to get paid securely.
        </p>
      </div>

      <div className="glass-card p-6">
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            type="button"
            onClick={() => setRole("client")}
            className={`flex flex-col items-center gap-2 rounded-lg border py-4 transition-colors ${
              role === "client"
                ? "border-brass-500 bg-brass-500/10 text-brass-400"
                : "border-ink-600 text-parchment/60 hover:border-ink-500"
            }`}
          >
            <Briefcase size={20} />
            <span className="text-sm font-medium">I'm hiring</span>
          </button>
          <button
            type="button"
            onClick={() => setRole("freelancer")}
            className={`flex flex-col items-center gap-2 rounded-lg border py-4 transition-colors ${
              role === "freelancer"
                ? "border-brass-500 bg-brass-500/10 text-brass-400"
                : "border-ink-600 text-parchment/60 hover:border-ink-500"
            }`}
          >
            <Hammer size={20} />
            <span className="text-sm font-medium">I'm freelancing</span>
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-parchment/70 mb-1.5">Full name</label>
            <input
              className="input-field"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength={2}
              placeholder="Ada Lovelace"
            />
          </div>
          <div>
            <label className="block text-sm text-parchment/70 mb-1.5">Email</label>
            <input
              type="email"
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm text-parchment/70 mb-1.5">Password</label>
            <input
              type="password"
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              placeholder="At least 8 characters"
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>
      </div>

      <p className="text-center text-sm text-parchment/60 mt-6">
        Already have an account?{" "}
        <Link to="/login" className="text-brass-400 hover:text-brass-300">
          Log in
        </Link>
      </p>
    </div>
  );
}
