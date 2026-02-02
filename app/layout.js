import "./globals.css";

export const metadata = {
  title: "Bug Tracker MVP",
  description: "Track projects, issues, and comments.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
