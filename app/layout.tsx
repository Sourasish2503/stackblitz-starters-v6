import "./global.css" // Use a relative path for the root layout
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Whop Retention Dashboard",
  description: "Premium customer retention experience",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans antialiased bg-black text-white">
        {children}
      </body>
    </html>
  )
}