import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (token !== process.env.ADMIN_SECRET_TOKEN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalVisitors,
      dailyVisitors,
      weeklyVisitors,
      monthlyVisitors,
      totalToolUsage,
      toolBreakdown,
      modeBreakdown,
      totalWords,
      totalReceipts,
      recentVisitors,
    ] = await Promise.all([
      prisma.visitor.count(),
      prisma.visitor.count({ where: { createdAt: { gte: dayAgo } } }),
      prisma.visitor.count({ where: { createdAt: { gte: weekAgo } } }),
      prisma.visitor.count({ where: { createdAt: { gte: monthAgo } } }),
      prisma.toolUsage.count(),
      prisma.toolUsage.groupBy({ by: ["toolType"], _count: { toolType: true } }),
      prisma.toolUsage.groupBy({ by: ["mode"], _count: { mode: true }, where: { mode: { not: null } } }),
      prisma.toolUsage.aggregate({ _sum: { wordsProcessed: true } }),
      prisma.receipt.count(),
      prisma.visitor.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        select: { pagePath: true, createdAt: true, referrer: true },
      }),
    ]);

    return NextResponse.json({
      totalVisitors,
      dailyVisitors,
      weeklyVisitors,
      monthlyVisitors,
      totalToolUsage,
      toolBreakdown: toolBreakdown.map(t => ({ type: t.toolType, count: t._count.toolType })),
      modeBreakdown: modeBreakdown.map(m => ({ mode: m.mode, count: m._count.mode })),
      totalWordsProcessed: totalWords._sum.wordsProcessed || 0,
      totalReceipts,
      recentVisitors,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
