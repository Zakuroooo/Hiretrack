import mongoose, { Document, Model, Schema, Types } from "mongoose";

export type ApplicationStatus =
  | "Applied"
  | "Screening"
  | "Interview"
  | "Offer"
  | "Rejected";

export interface IApplication extends Document {
  _id: Types.ObjectId;
  board: Types.ObjectId;
  userId: Types.ObjectId;
  company: string;
  role: string;
  status: ApplicationStatus;
  jobUrl?: string;
  jobDescription?: string;
  salary?: string;
  location?: string;
  notes?: string;
  resumeUrl?: string;
  resumePublicId?: string;
  aiMatchScore?: number;
  aiMatchFeedback?: string;
  appliedDate: Date;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const applicationSchema = new Schema<IApplication>(
  {
    board: {
      type: Schema.Types.ObjectId,
      ref: "Board",
      required: [true, "Board is required"],
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },
    company: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
    },
    role: {
      type: String,
      required: [true, "Role is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["Applied", "Screening", "Interview", "Offer", "Rejected"],
      default: "Applied",
    },
    jobUrl: { type: String },
    jobDescription: {
      type: String,
      maxlength: [5000, "Job description cannot exceed 5000 characters"],
    },
    salary: { type: String },
    location: { type: String },
    notes: {
      type: String,
      maxlength: [2000, "Notes cannot exceed 2000 characters"],
    },
    resumeUrl: { type: String },
    resumePublicId: { type: String },
    aiMatchScore: {
      type: Number,
      min: [0, "Score cannot be less than 0"],
      max: [100, "Score cannot exceed 100"],
    },
    aiMatchFeedback: { type: String },
    appliedDate: { type: Date, default: Date.now },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Compound indexes for efficient queries
applicationSchema.index({ board: 1, status: 1 });
applicationSchema.index({ userId: 1 });
applicationSchema.index({ userId: 1, status: 1 });

const Application: Model<IApplication> =
  (mongoose.models.Application as Model<IApplication>) ||
  mongoose.model<IApplication>("Application", applicationSchema);

export default Application;
