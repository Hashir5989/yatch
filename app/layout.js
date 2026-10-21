import { Plus_Jakarta_Sans, Montserrat, Cormorant_Garamond, Cinzel } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
});

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata = {
  title: "ASMARATY | Luxury Yachts & Boats UAE",
  description: "Pioneering luxury yacht and high-performance boat manufacturing in the Arabian Gulf. Explore the flagship AS 100, Magellan 32, and custom naval masterpieces.",
  keywords: ["ASMARATY", "ASMARATY Yachts", "Luxury Yachts UAE", "Saxdor inspired", "Superyachts Dubai", "AS 100", "Yacht Builder Middle East"],
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${jakarta.variable} ${montserrat.variable} ${cormorant.variable} ${cinzel.variable} h-full antialiased dark`}
    >
      <body className="min-h-full bg-[#080B10] text-[#E8EAEE] font-sans selection:bg-[#C5A880] selection:text-black antialiased">
        {children}
      </body>
    </html>
  );
}
