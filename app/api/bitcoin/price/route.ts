import { NextResponse } from "next/server";
import { getBitcoinPrice } from "@/lib/bitcoin-api";

export async function GET() {
  try {
    const price = await getBitcoinPrice();
    return NextResponse.json(price);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch Bitcoin price" },
      { status: 500 }
    );
  }
}
