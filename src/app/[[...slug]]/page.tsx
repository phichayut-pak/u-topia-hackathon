"use client";
import dynamic from "next/dynamic";

// The dashboard uses client-side routing (history API), so it renders in the browser only.
const App = dynamic(() => import("@/App").then((m) => m.App), { ssr: false });

export default function Page() {
  return <App />;
}
