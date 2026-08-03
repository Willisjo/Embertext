import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { trackVisitor, trackToolUsage, trackReceipt } from "@/lib/analytics";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, data } = body;

    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const userAgent = request.headers.get("user-agent") || "";

    switch (type) {
      case "visitor": {
        const pagePath = data.pagePath || "";
        if (!pagePath) return NextResponse.json({ error: "pagePath required" }, { status: 400 });

        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        const recent = await prisma.visitor.count({
          where: {
            ipHash: ip,
            pagePath,
            createdAt: { gte: fiveMinutesAgo },
          },
        });

        if (recent === 0) {
          await trackVisitor(ip, userAgent, data.referrer || "", pagePath);
        }
        break;
      }
      case "tool_usage":
        await trackToolUsage(data.toolType, data.mode, data.wordsProcessed);
        break;
      case "receipt":
        await trackReceipt(data.currencyType, data.amount, data.senderName, data.receiverName);
        break;
      default:
        return NextResponse.json({ error: "Invalid tracking type" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Tracking failed" }, { status: 500 });
  }
}
