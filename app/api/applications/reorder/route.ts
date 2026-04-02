import { NextRequest } from "next/server";
import { z } from "zod";
import connectDB from "@/lib/mongodb";
import Application from "@/models/Application";
import { getAuthUser } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/response";

const reorderSchema = z.object({
  applicationId: z.string().min(1),
  newStatus: z.enum(["Applied", "Screening", "Interview", "Offer", "Rejected"]),
});

export async function PATCH(request: NextRequest) {
  try {
    await connectDB();
    const user = await getAuthUser(request);
    if (!user) return errorResponse("Authentication required", 401);

    const body = await request.json();
    const parsed = reorderSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse("Invalid request body", 400);
    }

    const { applicationId, newStatus } = parsed.data;

    const application = await Application.findById(applicationId);
    if (!application) return errorResponse("Application not found", 404);
    if (application.userId.toString() !== user._id.toString()) {
      return errorResponse("Forbidden", 403);
    }

    application.status = newStatus;
    await application.save();

    return successResponse({ message: "Status updated" });
  } catch (error) {
    console.error("Reorder error:", error);
    return errorResponse("Internal server error", 500);
  }
}
