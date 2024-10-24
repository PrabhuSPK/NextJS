// import localFont from "next/font/local";
import "./globals.css";
import {Arima} from "next/font/google";

// const geistSans = localFont({
//   src: "./fonts/GeistVF.woff",
//   variable: "--font-geist-sans",
//   weight: "100 900",
// });
// const geistMono = localFont({
//   src: "./fonts/GeistMonoVF.woff",
//   variable: "--font-geist-mono",
//   weight: "100 900",
// });

const arima = Arima({
  subsets : ["latin"],
  display : "swap",
  weight  : ["300"]
});

export const generateMetadata = () =>{
    return {
      title : "title for static website",
      description : "description for static website",
      openGraph : {
        title : "title testing",
        description : "description testing",
        images : "https://test/jpeg"
      }
    }
};

// export const metadata = {
//   title: "title for static website",
//   description: "description for static website",
// };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      {/* <body className={`${geistSans.variable} ${geistMono.variable}`}> */}
      <body className={arima.className}>
        {children}
      </body>
    </html>
  );
}
