import Script from "next/script"

// Umami Cloud page views, cookieless. Absent in dev, CI and preview
// deployments, where the website id is not set.
export function Analytics() {
  const websiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID
  if (!websiteId) return null
  return (
    <Script
      src="https://cloud.umami.is/script.js"
      data-website-id={websiteId}
      strategy="afterInteractive"
    />
  )
}
