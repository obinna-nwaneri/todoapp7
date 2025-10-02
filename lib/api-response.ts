import { NextResponse } from "next/server";

export function unauthorized() {
  return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
}

export function forbidden() {
  return NextResponse.json({ message: "Forbidden" }, { status: 403 });
}

export function notFound(message = "Not found") {
  return NextResponse.json({ message }, { status: 404 });
}

export function badRequest(message: string, errors?: unknown) {
  return NextResponse.json({ message, errors }, { status: 400 });
}

export function serverError(error: unknown) {
  console.error(error);
  return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
}
