import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");
    const format = searchParams.get("format") || "csv";

    if (token !== process.env.ADMIN_SECRET_TOKEN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [visitors, toolUsage, receipts] = await Promise.all([
      prisma.visitor.findMany({
        take: 10000,
        orderBy: { createdAt: "desc" },
      }),
      prisma.toolUsage.findMany({
        take: 10000,
        orderBy: { createdAt: "desc" },
      }),
      prisma.receipt.findMany({
        take: 10000,
        orderBy: { createdAt: "desc" },
      }),
    ]);

    if (format === "json") {
      return NextResponse.json({ visitors, toolUsage, receipts });
    }

    // CSV export
    const visitorCSV = [
      "id,ipHash,userAgent,referrer,pagePath,createdAt",
      ...visitors.map(v => `${v.id},${v.ipHash || ""},${(v.userAgent || "").replace(/,/g, ";")},${(v.referrer || "").replace(/,/g, ";")},${v.pagePath},${v.createdAt.toISOString()}`),
    ].join("\n");

    const toolCSV = [
      "id,toolType,mode,wordsProcessed,createdAt",
      ...toolUsage.map(t => `${t.id},${t.toolType},${t.mode || ""},${t.wordsProcessed || 0},${t.createdAt.toISOString()}`),
    ].join("\n");

    const receiptCSV = [
      "id,receiptNumber,currencyType,amount,senderName,receiverName,createdAt",
      ...receipts.map(r => `${r.id},${r.receiptNumber},${r.currencyType},${r.amount},${r.senderName},${r.receiverName},${r.createdAt.toISOString()}`),
    ].join("\n");

    const fullCSV = `# Visitors\n${visitorCSV}\n\n# Tool Usage\n${toolCSV}\n\n# Receipts\n${receiptCSV}`;

    return new NextResponse(fullCSV, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="analytics-export-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
