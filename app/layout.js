import "./globals.css";
import { Google_Sans_Flex } from "next/font/google";
import NextTopLoader from "nextjs-toploader";

const gfonts = Google_Sans_Flex({ subsets: ["latin"] });

export const metadata = {
  title: "Momentum",
  description: "Execution Intelligence System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className={`${gfonts.className} `}>
        <NextTopLoader
          color="#10b981"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px #10b981,0 0 5px #10b981"
        />
        {children}
      </body>
    </html>
  );
}
