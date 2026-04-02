import mongoose, { Document, Model, Schema, Types } from "mongoose";

export type NotificationType =
  | "status_change"
  | "board_invite"
  | "reminder"
  | "ai_complete";

export interface INotification extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  relatedApplication?: Types.ObjectId;
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },
    type: {
      type: String,
      enum: ["status_change", "board_invite", "reminder", "ai_complete"],
      required: [true, "Notification type is required"],
    },
    title: {
      type: String,
      required: [true, "Title is required"],
    },
    message: {
      type: String,
      required: [true, "Message is required"],
    },
    read: {
      type: Boolean,
      default: false,
    },
    relatedApplication: {
      type: Schema.Types.ObjectId,
      ref: "Application",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: false }
);

// Index for fetching a user's unread notifications efficiently
notificationSchema.index({ userId: 1, read: 1 });

const Notification: Model<INotification> =
  (mongoose.models.Notification as Model<INotification>) ||
  mongoose.model<INotification>("Notification", notificationSchema);

export default Notification;
