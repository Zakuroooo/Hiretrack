import { NextRequest } from "next/server";
import crypto from "crypto";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { sendPasswordResetEmail } from "@/lib/email";
import { successResponse, errorResponse } from "@/lib/response";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return errorResponse("Email is required", 400);
    }
    
    await connectDB();
    
    const user = await User.findOne({ email: email.toLowerCase() });
    
    // Always return success even if user not found to prevent email enumeration
    if (!user) {
      return successResponse({ message: "If that email exists, a reset link was sent" });
    }
    
    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpiry;
    await user.save();
    
    await sendPasswordResetEmail(user.email, user.name, resetToken);
    
    return successResponse({ message: "If that email exists, a reset link was sent" });
  } catch (error) {
    console.error("Forgot password API error:", error);
    return errorResponse("Internal server error", 500);
  }
}
