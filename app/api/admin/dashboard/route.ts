import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalUniqueVisitors,
      dailyUniqueVisitors,
      weeklyUniqueVisitors,
      monthlyUniqueVisitors,
      totalToolUsage,
      toolBreakdown,
      totalWords,
      totalReceipts,
      recentVisitors,
    ] = await Promise.all([
      prisma.visitor.groupBy({ by: ["ipHash"], _count: { ipHash: true } }),
      prisma.visitor.groupBy({
        by: ["ipHash"],
        where: { createdAt: { gte: dayAgo } },
        _count: { ipHash: true },
      }),
      prisma.visitor.groupBy({
        by: ["ipHash"],
        where: { createdAt: { gte: weekAgo } },
        _count: { ipHash: true },
      }),
      prisma.visitor.groupBy({
        by: ["ipHash"],
        where: { createdAt: { gte: monthAgo } },
        _count: { ipHash: true },
      }),
      prisma.toolUsage.count(),
      prisma.toolUsage.groupBy({ by: ["toolType"], _count: { toolType: true } }),
      prisma.toolUsage.aggregate({ _sum: { wordsProcessed: true } }),
      prisma.receipt.count(),
      prisma.visitor.findMany({ take: 20, orderBy: { createdAt: "desc" } }),
    ]);

    const hourlyData = new Array(24).fill(0);
    recentVisitors.forEach((visitor) => {
      const hour = new Date(visitor.createdAt).getHours();
      const visitorDate = new Date(visitor.createdAt);
      if (visitorDate >= dayAgo) {
        hourlyData[hour]++;
      }
    });

    return NextResponse.json({
      totalVisitors: totalUniqueVisitors.length,
      dailyVisitors: dailyUniqueVisitors.length,
      weeklyVisitors: weeklyUniqueVisitors.length,
      monthlyVisitors: monthlyUniqueVisitors.length,
      totalToolUsage,
      toolBreakdown: toolBreakdown.map((t) => ({ type: t.toolType, count: t._count.toolType })),
      totalWordsProcessed: totalWords._sum.wordsProcessed || 0,
      totalReceipts,
      recentVisitors: recentVisitors.map((v) => ({
        pagePath: v.pagePath,
        createdAt: v.createdAt,
        referrer: v.referrer,
      })),
      hourlyVisitors: hourlyData,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 });
  }
}
