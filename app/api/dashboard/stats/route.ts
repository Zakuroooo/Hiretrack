import { NextRequest } from "next/server";
import connectDB from "@/lib/mongodb";
import Application from "@/models/Application";
import { getAuthUser } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/response";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const user = await getAuthUser(request);
    if (!user) {
      return errorResponse("Authentication required", 401);
    }

    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [totalApplications, statusAgg, thisWeek, recentApplications, weeklyAgg] =
      await Promise.all([
        // Query 1 — Total count
        Application.countDocuments({ userId: user._id }),

        // Query 2 — By status counts
        Application.aggregate([
          { $match: { userId: user._id } },
          { $group: { _id: "$status", count: { $sum: 1 } } },
        ]),

        // Query 3 — This week count
        Application.countDocuments({
          userId: user._id,
          createdAt: { $gte: weekAgo },
        }),

        // Query 4 — Recent 5 applications
        Application.find({ userId: user._id })
          .sort({ createdAt: -1 })
          .limit(5)
          .select("company role status appliedDate location createdAt")
          .lean(),

        // Query 5 — Weekly activity (last 7 days)
        Application.aggregate([
          {
            $match: {
              userId: user._id,
              createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
            },
          },
          {
            $group: {
              _id: { $dayOfWeek: "$createdAt" },
              count: { $sum: 1 },
            },
          },
        ]),
      ]);

    // Build byStatus object with defaults
    const byStatus: Record<string, number> = {
      Applied: 0,
      Screening: 0,
      Interview: 0,
      Offer: 0,
      Rejected: 0,
    };
    for (const item of statusAgg) {
      if (item._id && item._id in byStatus) {
        byStatus[item._id] = item.count;
      }
    }

    // Calculate response rate
    const responseRate =
      totalApplications > 0
        ? ((totalApplications - byStatus.Applied) / totalApplications * 100).toFixed(1)
        : "0.0";

    const interviewCount = byStatus.Interview + byStatus.Offer;

    // Map weekly activity — MongoDB $dayOfWeek: 1=Sun, 2=Mon ... 7=Sat
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const weeklyMap: Record<number, number> = {};
    for (const item of weeklyAgg) {
      weeklyMap[item._id as number] = item.count;
    }
    const weeklyActivity = dayNames.map((day, index) => ({
      day,
      count: weeklyMap[index + 1] || 0,
    }));

    return successResponse({
      totalApplications,
      byStatus,
      thisWeek,
      responseRate,
      interviewCount,
      offerCount: byStatus.Offer,
      recentApplications,
      weeklyActivity,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return errorResponse("Internal server error", 500);
  }
}
