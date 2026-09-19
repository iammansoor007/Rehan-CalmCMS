import { NextResponse } from "next/server";

/** An expected failure that should reach the admin UI with a helpful message. */
export class CmsError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function errorResponse(error: unknown, fallback: string) {
  if (error instanceof CmsError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  console.error(fallback, error);
  return NextResponse.json({ error: fallback }, { status: 500 });
}
