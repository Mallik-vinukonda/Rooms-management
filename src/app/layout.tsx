import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sri Villa Guest House — Room Management",
  description: "Internal room management system for Devipuram – Sri Villa Guest House. Manage 54 guest rooms, occupancy, maintenance, cleaning, and guest allocation.",
  keywords: "Devipuram, Sri Villa, Room Management, Guest House",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
