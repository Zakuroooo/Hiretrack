import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface IBoardMember {
  user: Types.ObjectId;
  role: "collaborator" | "viewer";
  addedAt: Date;
}

export interface IBoard extends Document {
  _id: Types.ObjectId;
  name: string;
  description?: string;
  owner: Types.ObjectId;
  members: IBoardMember[];
  color: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const boardSchema = new Schema<IBoard>(
  {
    name: {
      type: String,
      required: [true, "Board name is required"],
      trim: true,
      maxlength: [100, "Board name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Board owner is required"],
    },
    members: [
      {
        user: { type: Schema.Types.ObjectId, ref: "User" },
        role: {
          type: String,
          enum: ["collaborator", "viewer"],
          default: "viewer",
        },
        addedAt: { type: Date, default: Date.now },
      },
    ],
    color: {
      type: String,
      default: "#7c3aed",
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Board: Model<IBoard> =
  (mongoose.models.Board as Model<IBoard>) ||
  mongoose.model<IBoard>("Board", boardSchema);

export default Board;
