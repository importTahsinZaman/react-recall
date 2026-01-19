"use client";

import { ReactRecallProvider } from "react-recall";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
        <ReactRecallProvider>
          <nav style={{ marginBottom: "20px", paddingBottom: "10px", borderBottom: "1px solid #ccc" }}>
            <a href="/" style={{ marginRight: "15px" }}>Home</a>
            <a href="/events" style={{ marginRight: "15px" }}>Events</a>
            <a href="/console" style={{ marginRight: "15px" }}>Console</a>
            <a href="/errors" style={{ marginRight: "15px" }}>Errors</a>
            <a href="/network" style={{ marginRight: "15px" }}>Network</a>
          </nav>
          {children}
        </ReactRecallProvider>
      </body>
    </html>
  );
}
