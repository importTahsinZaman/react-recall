import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "success",
    message: "Request successful",
    timestamp: new Date().toISOString(),
    data: {
      id: 1,
      name: "Test Item",
      value: 42,
    },
  });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  return NextResponse.json({
    status: "success",
    message: "POST request successful",
    received: body,
    timestamp: new Date().toISOString(),
  });
}
