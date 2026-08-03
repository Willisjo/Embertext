import { prisma } from "./prisma";

export async function trackVisitor(ip: string, userAgent: string, referrer: string, pagePath: string) {
  try {
    const { hashIP } = await import("./utils");
    await prisma.visitor.create({
      data: {
        ipHash: hashIP(ip),
        userAgent: userAgent?.slice(0, 200),
        referrer: referrer?.slice(0, 500),
        pagePath,
      },
    });
  } catch (e) {
    console.error("Analytics tracking error:", e);
  }
}

export async function trackToolUsage(toolType: string, mode?: string, wordsProcessed?: number) {
  try {
    await prisma.toolUsage.create({
      data: {
        toolType,
        mode: mode?.slice(0, 50),
        wordsProcessed,
      },
    });
  } catch (e) {
    console.error("Tool usage tracking error:", e);
  }
}

export async function trackReceipt(currencyType: string, amount: number, senderName: string, receiverName: string) {
  try {
    const { generateReceiptNumber } = await import("./utils");
    await prisma.receipt.create({
      data: {
        receiptNumber: generateReceiptNumber(),
        currencyType,
        amount,
        senderName: senderName?.slice(0, 100),
        receiverName: receiverName?.slice(0, 100),
      },
    });
  } catch (e) {
    console.error("Receipt tracking error:", e);
  }
}
