import { NextRequest, NextResponse } from "next/server";

const SUPPORTED_LOCALES = ["es", "en"];
const DEFAULT_LOCALE = "es";

export function middleware(request: NextRequest) {
  // Read locale from NEXT_LOCALE cookie, fall back to default
  const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value;
  const locale =
    cookieLocale && SUPPORTED_LOCALES.includes(cookieLocale)
      ? cookieLocale
      : DEFAULT_LOCALE;

  // Pass locale to next-intl via header
  const response = NextResponse.next();
  response.headers.set("x-next-intl-locale", locale);
  return response;
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
