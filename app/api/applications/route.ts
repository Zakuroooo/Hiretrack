import { NextRequest } from "next/server";
import { z } from "zod";
import connectDB from "@/lib/mongodb";
import Application from "@/models/Application";
import Board from "@/models/Board";
import { getAuthUser } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/response";

// ── GET — List applications with pagination, search, status filter ──
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const user = await getAuthUser(request);
    if (!user) {
      return errorResponse("Authentication required", 401);
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 100);
    const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);

    // Build filter
    const filter: Record<string, unknown> = { userId: user._id };

    if (status) {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { company: { $regex: search, $options: "i" } },
        { role: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    const [applications, total] = await Promise.all([
      Application.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Application.countDocuments(filter),
    ]);

    return successResponse({
      applications,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("GET applications error:", error);
    return errorResponse("Internal server error", 500);
  }
}

// ── POST — Create a new application ──
const createApplicationSchema = z.object({
  company: z.string().min(1, "Company name is required"),
  role: z.string().min(1, "Role is required"),
  status: z
    .enum(["Applied", "Screening", "Interview", "Offer", "Rejected"])
    .optional(),
  jobUrl: z.string().optional(),
  salary: z.string().optional(),
  location: z.string().optional(),
  notes: z.string().optional(),
  appliedDate: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const user = await getAuthUser(request);
    if (!user) {
      return errorResponse("Authentication required", 401);
    }

    const body = await request.json();
    const parsed = createApplicationSchema.safeParse(body);

    if (!parsed.success) {
      const fieldErrors = parsed.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));
      return errorResponse(fieldErrors[0].message, 400);
    }

    // Find user's default board (or first board)
    let board = await Board.findOne({ owner: user._id, isDefault: true });
    if (!board) {
      board = await Board.findOne({ owner: user._id });
    }

    // If still no board, create a default one
    if (!board) {
      board = await Board.create({
        name: "My Applications",
        owner: user._id,
        isDefault: true,
      });
    }

    const application = await Application.create({
      ...parsed.data,
      userId: user._id,
      board: board._id,
      appliedDate: parsed.data.appliedDate
        ? new Date(parsed.data.appliedDate)
        : new Date(),
    });

    return successResponse(application, 201);
  } catch (error) {
    console.error("POST application error:", error);
    return errorResponse("Internal server error", 500);
  }
}
