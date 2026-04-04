import { NextRequest } from "next/server";
import { z } from "zod";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { successResponse, errorResponse } from "@/lib/response";

const resetSchema = z.object({
  token: z.string(),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = resetSchema.safeParse(body);
    
    if (!parsed.success) {
      return errorResponse("Invalid request data", 400);
    }
    
    const { token, newPassword } = parsed.data;
    
    await connectDB();
    
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });
    
    if (!user) {
      return errorResponse("Invalid or expired reset token", 400);
    }
    
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    
    return successResponse({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset password API error:", error);
    return errorResponse("Internal server error", 500);
  }
}
