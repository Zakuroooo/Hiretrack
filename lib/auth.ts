import { NextRequest } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { verifyAccessToken } from "@/lib/jwt";
import { errorResponse } from "@/lib/response";
import type { IUser } from "@/models/User";

export async function getAuthUser(
  request: NextRequest
): Promise<IUser | null> {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }

    const token = authHeader.split(" ")[1];
    if (!token) return null;

    const decoded = verifyAccessToken(token);

    await connectDB();
    const user = await User.findById(decoded.userId).select("-password");

    return user;
  } catch {
    return null;
  }
}

export async function requireAuth(request: NextRequest): Promise<IUser> {
  const user = await getAuthUser(request);
  if (!user) {
    throw errorResponse("Authentication required", 401);
  }
  return user;
}
