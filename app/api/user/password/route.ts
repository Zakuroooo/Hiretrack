import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import User from "@/models/User";
import connectDB from "@/lib/mongodb";
import { z } from "zod";

const passwordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6),
});

export async function PATCH(request: NextRequest) {
  try {
    await connectDB();
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = passwordSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Validation error" }, { status: 400 });
    }

    const user = await User.findById(authUser._id).select("+password");
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    const isMatch = await user.comparePassword(parsed.data.currentPassword);
    if (!isMatch) {
      return NextResponse.json({ success: false, error: "Current password is incorrect" }, { status: 400 });
    }

    user.password = parsed.data.newPassword;
    await user.save();

    return NextResponse.json({ success: true, message: 'Password updated' });
  } catch (error) {
    console.error("Password update error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
