import { NextRequest } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/response";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);

    if (!user) {
      return errorResponse("Authentication required", 401);
    }

    return successResponse({
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar || null,
      notificationPrefs: user.notificationPrefs,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error("Me error:", error);
    return errorResponse("Internal server error", 500);
  }
}
