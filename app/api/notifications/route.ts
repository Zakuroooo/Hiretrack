import { NextRequest } from "next/server";
import connectDB from "@/lib/mongodb";
import Notification from "@/models/Notification";
import { getAuthUser } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/response";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const user = await getAuthUser(request);
    if (!user) return errorResponse("Unauthorized", 401);

    const notifications = await Notification.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();
      
    const unreadCount = await Notification.countDocuments({ 
      userId: user._id, 
      read: false 
    });

    return successResponse({ notifications, unreadCount });
  } catch (error) {
    console.error("GET notifications error:", error);
    return errorResponse("Internal server error", 500);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await connectDB();
    const user = await getAuthUser(request);
    if (!user) return errorResponse("Unauthorized", 401);

    const body = await request.json();
    
    if (body.markAllRead) {
      await Notification.updateMany(
        { userId: user._id, read: false },
        { $set: { read: true } }
      );
    } else if (body.notificationId) {
      await Notification.findOneAndUpdate(
        { _id: body.notificationId, userId: user._id },
        { $set: { read: true } }
      );
    }

    return successResponse({ success: true });
  } catch (error) {
    console.error("PATCH notifications error:", error);
    return errorResponse("Internal server error", 500);
  }
}
