import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const response = NextResponse.next();
  const localeCookie = request.cookies.get("fc_locale")?.value;
  if (!localeCookie) {
    const locale = request.headers.get("accept-language")?.split(",")[0] || "en-US";
    response.cookies.set("fc_locale", locale, { httpOnly: false, sameSite: "lax", path: "/" });
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
