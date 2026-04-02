import { NextRequest } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { verifyRefreshToken, generateAccessToken } from "@/lib/jwt";
import { successResponse, errorResponse } from "@/lib/response";

export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get("refreshToken")?.value;

    if (!refreshToken) {
      return errorResponse("Refresh token not found", 401);
    }

    const decoded = verifyRefreshToken(refreshToken);

    await connectDB();

    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return errorResponse("User not found", 401);
    }

    const accessToken = generateAccessToken(
      user._id.toString(),
      user.email
    );

    return successResponse({ accessToken });
  } catch (error) {
    console.error("Refresh error:", error);
    return errorResponse("Invalid or expired refresh token", 401);
  }
}
