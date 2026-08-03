import type { Metadata } from "next";
import { DM_Sans, Outfit, Nunito, Manrope,  Lato, Playfair_Display} from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const bodyFont = Nunito({
  subsets: ["latin"],
  // variable: "--font-nunito",

});

// const heading = Lato({
//   subsets: ["latin"],
//   variable: "--font-lato",
// });

//className={`${bodyFont.variable} ${headingFont.variable}`}>

export const metadata: Metadata = {
  title: "MyFamily",
  description: "Private family app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={bodyFont.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
