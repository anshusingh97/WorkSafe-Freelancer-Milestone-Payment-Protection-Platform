import { Schema, model, Document, Types } from "mongoose";

export interface IFeedback extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  rating: number;
  liked?: string;
  problemFaced?: string;
  wouldUse?: boolean;
  message?: string;
  createdAt: Date;
}

const feedbackSchema = new Schema<IFeedback>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    liked: { type: String, maxlength: 1000 },
    problemFaced: { type: String, maxlength: 1000 },
    wouldUse: { type: Boolean },
    message: { type: String, maxlength: 2000 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Feedback = model<IFeedback>("Feedback", feedbackSchema);
