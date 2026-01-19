import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      status: "error",
      message: "Internal server error",
      code: "ERR_INTERNAL",
      timestamp: new Date().toISOString(),
    },
    { status: 500 }
  );
}

export async function POST() {
  return NextResponse.json(
    {
      status: "error",
      message: "Internal server error on POST",
      code: "ERR_INTERNAL",
      timestamp: new Date().toISOString(),
    },
    { status: 500 }
  );
}
