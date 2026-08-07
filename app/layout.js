import { Marcellus, Cormorant_Garamond, Jost } from "next/font/google";
import "./globals.css";

const marcellus = Marcellus({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-marcellus",
});

const cormorant = Cormorant_Garamond({
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-cormorant",
});

const jost = Jost({
  weight: ["300", "400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-jost",
});

export const metadata = {
  title: "Rent A Jewel by Vidhya V — Premium Jewellery Catalog",
  description: "Exquisite handcrafted AD Stone, Kemp Stone, and Temple Finish jewelry sets for rent. Explore our collection of premium necklaces, bangles, earrings, and bridal sets in Chennai.",
  keywords: "jewellery rental, rent a jewel, kemp stones, temple jewellery, bridal sets, chennai jewellery",
  authors: [{ name: "Vidhya V" }],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${marcellus.variable} ${cormorant.variable} ${jost.variable}`}>
      <body>{children}</body>
    </html>
  );
}
