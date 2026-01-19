import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const params = Object.fromEntries(url.searchParams.entries());

  return NextResponse.json({
    method: "GET",
    url: request.url,
    queryParams: params,
    headers: Object.fromEntries(request.headers.entries()),
    timestamp: new Date().toISOString(),
  });
}

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") || "";
  console.log("[API] POST /api/echo - Content-Type:", contentType);

  let body: unknown;
  if (contentType.includes("application/json")) {
    body = await request.json().catch(() => null);
    console.log("[API] Echo received JSON body:", body);
  } else if (contentType.includes("multipart/form-data") || contentType.includes("application/x-www-form-urlencoded")) {
    const formData = await request.formData().catch(() => null);
    if (formData) {
      body = Object.fromEntries(formData.entries());
    }
  } else {
    body = await request.text().catch(() => null);
  }

  return NextResponse.json({
    method: "POST",
    url: request.url,
    contentType,
    headers: Object.fromEntries(request.headers.entries()),
    body,
    timestamp: new Date().toISOString(),
  });
}

export async function PUT(request: Request) {
  const body = await request.json().catch(() => ({}));

  return NextResponse.json({
    method: "PUT",
    url: request.url,
    headers: Object.fromEntries(request.headers.entries()),
    body,
    timestamp: new Date().toISOString(),
  });
}

export async function DELETE(request: Request) {
  return NextResponse.json({
    method: "DELETE",
    url: request.url,
    headers: Object.fromEntries(request.headers.entries()),
    timestamp: new Date().toISOString(),
  });
}
