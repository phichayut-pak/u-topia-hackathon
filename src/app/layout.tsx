import type { Metadata, Viewport } from "next";
import "../styles.css";
import "../secondary.css";
import "../receive.css";
import "../uready.css";
import "../snap-to-pay/snap.css";
import "../snap-to-pay/scan-page.css";
import "../ubot/ubot.css";
import "../mobile.css";

export const metadata: Metadata = {
  title: "Dashboard | U-Topia",
  description: "U-Topia dashboard with U-Ready: pay any Thai QR from your crypto.",
  icons: { icon: "/assets/logo.png" },
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#056ef6" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div id="root">{children}</div>
      </body>
    </html>
  );
}
