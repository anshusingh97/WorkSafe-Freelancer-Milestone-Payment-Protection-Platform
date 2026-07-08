import { useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { apiErrorMessage } from "../services/api";

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back");
      navigate("/dashboard");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Could not log in"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <div className="text-center mb-8">
        <ShieldCheck size={32} className="text-brass-400 mx-auto mb-3" />
        <h1 className="font-display text-3xl font-semibold">Welcome back</h1>
        <p className="text-parchment/60 mt-2 text-sm">Log in to manage your projects and escrow.</p>
      </div>

      <div className="glass-card p-6">
        <form onSubmit={onSubmit} className="space-y-4">
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
              placeholder="Your password"
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Logging in…" : "Log in"}
          </button>
        </form>
      </div>

      <p className="text-center text-sm text-parchment/60 mt-6">
        Don't have an account?{" "}
        <Link to="/register" className="text-brass-400 hover:text-brass-300">
          Create one
        </Link>
      </p>
    </div>
  );
}
