import "./globals.css";

export const metadata = {
  title: "ASMARATY | Luxury Yachts & Boats UAE",
  description: "Discover the distinguished ASMARATY yacht collection. Precision naval architecture, expansive living volumes, and the pinnacle of maritime luxury in the UAE.",
  keywords: ["ASMARATY", "ASMARATY Yachts", "Luxury Yachts UAE", "G-100 Super Yacht", "G-66 Luxury Yacht", "G-50 Luxury Motor Yacht", "G77 Luxury Yacht", "Yacht Builder UAE"],
  icons: {
    icon: [
      { url: "/icon.png?v=metal", sizes: "512x512", type: "image/png" },
      { url: "/favicon.png?v=metal", sizes: "64x64", type: "image/png" },
      { url: "/favicon.ico?v=metal" }
    ],
    shortcut: "/favicon.ico?v=metal",
    apple: "/apple-touch-icon.png?v=metal",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased dark">
      <body className="min-h-full bg-[#080B10] text-[#E8EAEE] font-sans selection:bg-[#C6A155] selection:text-black antialiased">
        {children}
      </body>
    </html>
  );
}
