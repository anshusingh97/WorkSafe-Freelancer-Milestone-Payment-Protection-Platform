import { Schema, model, Document, Types } from "mongoose";

export type ProjectStatus =
  | "open"
  | "accepted"
  | "in_progress"
  | "completed"
  | "disputed";

export interface IProject extends Document {
  _id: Types.ObjectId;
  title: string;
  description: string;
  clientId: Types.ObjectId;
  freelancerId?: Types.ObjectId;
  category: string;
  budget: number;
  requiredSkills: string[];
  deadline?: Date;
  status: ProjectStatus;
  createdAt: Date;
}

const projectSchema = new Schema<IProject>(
  {
    title: { type: String, required: true, trim: true, maxlength: 140 },
    description: { type: String, required: true, maxlength: 5000 },
    clientId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    freelancerId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    category: { type: String, required: true },
    budget: { type: Number, required: true, min: 0 },
    requiredSkills: { type: [String], default: [] },
    deadline: { type: Date },
    status: {
      type: String,
      enum: ["open", "accepted", "in_progress", "completed", "disputed"],
      default: "open",
      index: true,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Project = model<IProject>("Project", projectSchema);
