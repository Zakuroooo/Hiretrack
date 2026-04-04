import { NextRequest } from "next/server";
import { z } from "zod";
import connectDB from "@/lib/mongodb";
import Application from "@/models/Application";
import Notification from "@/models/Notification";
import User from "@/models/User";
import { getAuthUser } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/response";
import { sendStatusChangeEmail } from "@/lib/email";

// ── GET — Single application ──
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const user = await getAuthUser(request);
    if (!user) return errorResponse("Authentication required", 401);

    const { id } = await params;
    const application = await Application.findById(id).lean();
    if (!application) return errorResponse("Application not found", 404);
    if (application.userId.toString() !== user._id.toString()) {
      return errorResponse("Forbidden", 403);
    }

    return successResponse(application);
  } catch (error) {
    console.error("GET application error:", error);
    return errorResponse("Internal server error", 500);
  }
}

// ── PATCH — Update application ──
const updateSchema = z.object({
  company: z.string().min(1).optional(),
  role: z.string().min(1).optional(),
  status: z
    .enum(["Applied", "Screening", "Interview", "Offer", "Rejected"])
    .optional(),
  jobUrl: z.string().optional(),
  jobDescription: z.string().optional(),
  salary: z.string().optional(),
  location: z.string().optional(),
  notes: z.string().optional(),
  appliedDate: z.string().optional(),
  order: z.number().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const user = await getAuthUser(request);
    if (!user) return errorResponse("Authentication required", 401);

    const { id } = await params;
    const application = await Application.findById(id);
    if (!application) return errorResponse("Application not found", 404);
    if (application.userId.toString() !== user._id.toString()) {
      return errorResponse("Forbidden", 403);
    }

    const body = await request.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      const fieldErrors = parsed.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));
      return errorResponse(fieldErrors[0].message, 400);
    }

    const updateData: Record<string, unknown> = { ...parsed.data };
    if (parsed.data.appliedDate) {
      updateData.appliedDate = new Date(parsed.data.appliedDate);
    }

    const isStatusChanged = updateData.status && updateData.status !== application.status;

    const updated = await Application.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).lean();
    
    if (isStatusChanged && updated) {
      await Notification.create({
        userId: user._id,
        type: 'status_change',
        title: 'Application Updated',
        message: `Your application to ${updated.company} moved to ${updated.status}`,
        relatedApplication: updated._id
      });
      
      const dbUser = await User.findById(user._id);
      if (dbUser && dbUser.notificationPrefs?.emailOnStatusChange) {
        await sendStatusChangeEmail(dbUser.email, dbUser.name, updated.company, updated.role, updated.status as string);
      }
    }

    return successResponse(updated);
  } catch (error) {
    console.error("PATCH application error:", error);
    return errorResponse("Internal server error", 500);
  }
}

// ── DELETE — Remove application ──
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const user = await getAuthUser(request);
    if (!user) return errorResponse("Authentication required", 401);

    const { id } = await params;
    const application = await Application.findById(id);
    if (!application) return errorResponse("Application not found", 404);
    if (application.userId.toString() !== user._id.toString()) {
      return errorResponse("Forbidden", 403);
    }

    await Application.findByIdAndDelete(id);

    return successResponse({ message: "Deleted" });
  } catch (error) {
    console.error("DELETE application error:", error);
    return errorResponse("Internal server error", 500);
  }
}
