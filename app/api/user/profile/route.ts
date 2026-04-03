import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import User from "@/models/User";
import connectDB from "@/lib/mongodb";
import { z } from "zod";

const profileSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  avatar: z.string().url().optional(),
  notificationPrefs: z.object({
    emailOnStatusChange: z.boolean(),
    weeklySummary: z.boolean(),
    boardInvite: z.boolean()
  }).optional()
});

export async function PATCH(request: NextRequest) {
  try {
    await connectDB();
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const user = await User.findById(authUser._id);
    if (!user) {
        return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    const body = await request.json();
    const parsed = profileSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Validation error" }, { status: 400 });
    }

    const updates = parsed.data;
    
    if (updates.name) user.name = updates.name;
    if (updates.avatar) user.avatar = updates.avatar;
    if (updates.notificationPrefs) {
      user.notificationPrefs = {
        ...user.notificationPrefs,
        ...updates.notificationPrefs
      };
    }

    await user.save();

    const { password, ...userObj } = user.toObject();

    return NextResponse.json({ success: true, data: userObj });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
