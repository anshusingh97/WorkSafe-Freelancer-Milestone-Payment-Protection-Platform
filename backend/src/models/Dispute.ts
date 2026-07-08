import { Schema, model, Document, Types } from "mongoose";

export type DisputeStatus = "open" | "resolved";
export type DisputeResolution = "release_to_freelancer" | "refund_client";

export interface IDispute extends Document {
  _id: Types.ObjectId;
  projectId: Types.ObjectId;
  milestoneId: Types.ObjectId;
  raisedBy: Types.ObjectId;
  reason: string;
  proofUrl?: string;
  status: DisputeStatus;
  resolution?: DisputeResolution;
  resolvedBy?: Types.ObjectId;
  createdAt: Date;
}

const disputeSchema = new Schema<IDispute>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true, index: true },
    milestoneId: { type: Schema.Types.ObjectId, ref: "Milestone", required: true, index: true },
    raisedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    reason: { type: String, required: true, maxlength: 2000 },
    proofUrl: { type: String },
    status: { type: String, enum: ["open", "resolved"], default: "open", index: true },
    resolution: { type: String, enum: ["release_to_freelancer", "refund_client"] },
    resolvedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Dispute = model<IDispute>("Dispute", disputeSchema);
