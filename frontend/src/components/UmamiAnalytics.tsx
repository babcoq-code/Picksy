import Script from "next/script";
export function UmamiAnalytics() {
  const url = process.env.NEXT_PUBLIC_UMAMI_URL;
  const id = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
  if (!url || !id) return null;
  return (
    <Script
      async
      src={`${url}/script.js`}
      data-website-id={id}
      strategy="afterInteractive"
    />
  );
}
