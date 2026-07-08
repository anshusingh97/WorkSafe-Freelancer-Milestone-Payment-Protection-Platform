import { Schema, model, Document, Types } from "mongoose";

export type MilestoneStatus =
  | "created"
  | "funded"
  | "submitted"
  | "approved"
  | "released"
  | "disputed"
  | "refunded";

export interface IMilestone extends Document {
  _id: Types.ObjectId;
  projectId: Types.ObjectId;
  title: string;
  description: string;
  amount: number;
  dueDate?: Date;
  status: MilestoneStatus;
  contractMilestoneId: number; // maps to the on-chain u64 milestone_id
  escrowTxHash?: string;
  releaseTxHash?: string;
  submissionUrl?: string;
  submissionNote?: string;
  createdAt: Date;
}

const milestoneSchema = new Schema<IMilestone>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true, index: true },
    title: { type: String, required: true, maxlength: 140 },
    description: { type: String, maxlength: 3000, default: "" },
    amount: { type: Number, required: true, min: 0 },
    dueDate: { type: Date },
    status: {
      type: String,
      enum: [
        "created",
        "funded",
        "submitted",
        "approved",
        "released",
        "disputed",
        "refunded",
      ],
      default: "created",
      index: true,
    },
    contractMilestoneId: { type: Number, required: true, unique: true },
    escrowTxHash: { type: String },
    releaseTxHash: { type: String },
    submissionUrl: { type: String },
    submissionNote: { type: String, maxlength: 2000 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Milestone = model<IMilestone>("Milestone", milestoneSchema);
