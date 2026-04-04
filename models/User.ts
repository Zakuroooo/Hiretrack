import mongoose, { Document, Model, Schema, Types } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  avatar?: string;
  notificationPrefs: {
    emailOnStatusChange: boolean;
    weeklySummary: boolean;
    boardInvite: boolean;
  };
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

interface IUserModel extends Model<IUser> {
  findByEmail(email: string): Promise<IUser | null>;
}

const userSchema = new Schema<IUser, IUserModel>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    avatar: {
      type: String,
    },
    notificationPrefs: {
      emailOnStatusChange: { type: Boolean, default: true },
      weeklySummary: { type: Boolean, default: true },
      boardInvite: { type: Boolean, default: true },
    },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
  },
  { timestamps: true }
);

// Hash password before saving — only when modified
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// Instance method: compare a plaintext candidate against the stored hash
userSchema.methods.comparePassword = async function (
  candidate: string
): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

// Static method: look up a user by email
userSchema.statics.findByEmail = function (
  email: string
): Promise<IUser | null> {
  return this.findOne({ email: email.toLowerCase() });
};

const User: IUserModel =
  (mongoose.models.User as IUserModel) ||
  mongoose.model<IUser, IUserModel>("User", userSchema);

export default User;
