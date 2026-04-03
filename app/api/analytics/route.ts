import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Application from "@/models/Application";
import { getAuthUser } from "@/lib/auth";

const STAGE_COLORS: Record<string, string> = {
  Applied: '#38bdf8',
  Screening: '#f59e0b',
  Interview: '#a78bfa',
  Offer: '#22c55e',
  Rejected: '#ef4444'
};

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });
    }

    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const lastMonthStart = new Date();
    lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);
    lastMonthStart.setDate(1);
    lastMonthStart.setHours(0, 0, 0, 0);

    const lastMonthEnd = new Date();
    lastMonthEnd.setDate(1);
    lastMonthEnd.setHours(0, 0, 0, 0);

    const [
      statusAgg,
      monthlyTrendAgg,
      topCompaniesAgg,
      total,
      thisMonth,
      lastMonth,
    ] = await Promise.all([
      // Query 1 - Status distribution
      Application.aggregate([
        { $match: { userId: user._id } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      // Query 2 - Monthly trend
      Application.aggregate([
        { 
          $match: { 
            userId: user._id,
            createdAt: { 
              $gte: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000) 
            }
          }
        },
        {
          $group: {
            _id: { 
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            applied: { $sum: 1 },
            interviews: { 
              $sum: { 
                $cond: [
                  { $in: ['$status', ['Interview', 'Offer']] }, 
                  1, 0
                ] 
              }
            },
            offers: {
              $sum: {
                $cond: [{ $eq: ['$status', 'Offer'] }, 1, 0]
              }
            }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]),
      // Query 3 - Top companies
      Application.aggregate([
        { $match: { userId: user._id } },
        { $group: { _id: '$company', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ]),
      // Query 4 - Total count
      Application.countDocuments({ userId: user._id }),
      // Query 5 - This month count
      Application.countDocuments({ 
        userId: user._id, 
        createdAt: { $gte: monthStart }
      }),
      // Query 6 - Last month count
      Application.countDocuments({
        userId: user._id,
        createdAt: { $gte: lastMonthStart, $lt: lastMonthEnd }
      }),
    ]);

    const statusDistribution = statusAgg.map(item => ({
      status: item._id,
      count: item.count,
      percentage: total > 0 ? ((item.count / total) * 100).toFixed(1) : "0.0",
      color: STAGE_COLORS[item._id] || '#7096b8'
    }));

    const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const monthlyTrend = monthlyTrendAgg.map(item => ({
      month: monthNames[item._id.month - 1],
      applied: item.applied,
      interviews: item.interviews,
      offers: item.offers
    }));

    const topCompanies = topCompaniesAgg.map(item => ({
      company: item._id,
      count: item.count
    }));

    const offerCount = statusAgg.find(s => s._id === 'Offer')?.count || 0;
    const interviewCount = (statusAgg.find(s => s._id === 'Interview')?.count || 0) + offerCount;

    const successRate = total > 0 ? ((offerCount / total) * 100).toFixed(1) : "0.0";
    
    const monthOverMonthChange = (((thisMonth - lastMonth) / Math.max(lastMonth, 1)) * 100).toFixed(0);

    return NextResponse.json({
      success: true,
      data: {
        statusDistribution,
        monthlyTrend,
        topCompanies,
        total,
        thisMonth,
        lastMonth,
        monthOverMonthChange,
        successRate,
        offerCount,
        interviewCount
      }
    });

  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
