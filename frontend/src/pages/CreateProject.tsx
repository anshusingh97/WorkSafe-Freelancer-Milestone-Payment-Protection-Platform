import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { api, apiErrorMessage } from "../services/api";
import { track } from "../services/analytics";

export function CreateProject() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [budget, setBudget] = useState("");
  const [skills, setSkills] = useState("");
  const [deadline, setDeadline] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/projects", {
        title,
        description,
        category,
        budget: Number(budget),
        requiredSkills: skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        deadline: deadline ? new Date(deadline).toISOString() : undefined,
      });
      track("project_created", { projectId: data.project._id });
      toast.success("Project created");
      navigate(`/project/${data.project._id}`);
    } catch (err) {
      toast.error(apiErrorMessage(err, "Could not create project"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="font-display text-3xl font-semibold mb-2">Create a project</h1>
      <p className="text-parchment/60 mb-8">
        Describe the work. You'll add milestones and fund escrow after a freelancer accepts.
      </p>

      <form onSubmit={onSubmit} className="glass-card p-6 space-y-5">
        <div>
          <label className="block text-sm text-parchment/70 mb-1.5">Title</label>
          <input
            className="input-field"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            minLength={3}
            placeholder="Landing page redesign"
          />
        </div>
        <div>
          <label className="block text-sm text-parchment/70 mb-1.5">Description</label>
          <textarea
            className="input-field min-h-[120px] resize-y"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            minLength={10}
            placeholder="What does the freelancer need to deliver?"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-parchment/70 mb-1.5">Category</label>
            <input
              className="input-field"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              placeholder="Design, Development…"
            />
          </div>
          <div>
            <label className="block text-sm text-parchment/70 mb-1.5">Budget (XLM)</label>
            <input
              type="number"
              min={1}
              step="0.01"
              className="input-field"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              required
              placeholder="300"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm text-parchment/70 mb-1.5">
            Required skills <span className="text-parchment/40">(comma separated)</span>
          </label>
          <input
            className="input-field"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            placeholder="React, Figma, Copywriting"
          />
        </div>
        <div>
          <label className="block text-sm text-parchment/70 mb-1.5">
            Deadline <span className="text-parchment/40">(optional)</span>
          </label>
          <input
            type="date"
            className="input-field"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Creating…" : "Create project"}
        </button>
      </form>
    </div>
  );
}
