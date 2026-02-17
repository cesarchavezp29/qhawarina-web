import { getRequestConfig } from "next-intl/server";
import { headers } from "next/headers";

export const locales = ["en", "es"] as const;
export const defaultLocale = "es" as const;

export default getRequestConfig(async () => {
  // Read locale from middleware-set header (cookie-based switching)
  const headersList = headers();
  const locale = headersList.get("x-next-intl-locale") || defaultLocale;

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
