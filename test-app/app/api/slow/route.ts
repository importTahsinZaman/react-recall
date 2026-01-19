import { NextResponse } from "next/server";

export async function GET() {
  // Simulate slow response (2 seconds)
  await new Promise((resolve) => setTimeout(resolve, 2000));

  return NextResponse.json({
    status: "success",
    message: "Slow request completed after 2 second delay",
    delay: 2000,
    timestamp: new Date().toISOString(),
  });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));

  // Simulate slow response (2 seconds)
  await new Promise((resolve) => setTimeout(resolve, 2000));

  return NextResponse.json({
    status: "success",
    message: "Slow POST request completed after 2 second delay",
    delay: 2000,
    received: body,
    timestamp: new Date().toISOString(),
  });
}
